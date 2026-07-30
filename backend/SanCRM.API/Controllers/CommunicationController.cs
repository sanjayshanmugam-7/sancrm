using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SanCRM.Application.Common;
using SanCRM.Application.DTOs;
using SanCRM.Application.Interfaces;
using SanCRM.Domain.Entities;
using SanCRM.Domain.Enums;
using SanCRM.Infrastructure.Data;

namespace SanCRM.API.Controllers;

/// <summary>
/// Communication — notes, attachments, history, relationship mapping
/// </summary>
[ApiController]
[Route("api/v1/communication")]
[Authorize]
[Produces("application/json")]
public class CommunicationController : ControllerBase
{
    private readonly CrmDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CommunicationController(CrmDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    // ── Communication History ──────────────────────────────────────────

    /// <summary>Get all communication history (last 30 days, paginated)</summary>
    [HttpGet("history")]
    [ProducesResponseType(typeof(ApiResponse<PagedResult<CommunicationHistoryDto>>), 200)]
    public async Task<IActionResult> GetHistory(
        [FromQuery] string? entityType,
        [FromQuery] int? entityId,
        [FromQuery] string? channel,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = _db.CommunicationHistories
            .Include(h => h.HandledByUser)
            .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(entityType) && Enum.TryParse<EntityType>(entityType, true, out var et))
            query = query.Where(h => h.EntityType == et);

        if (entityId.HasValue)
            query = query.Where(h => h.EntityId == entityId.Value);

        if (!string.IsNullOrWhiteSpace(channel) && Enum.TryParse<CommunicationChannel>(channel, true, out var ch))
            query = query.Where(h => h.Channel == ch);

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(h => h.OccurredAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(h => new CommunicationHistoryDto
            {
                Id = h.Id,
                Channel = h.Channel.ToString(),
                Direction = h.Direction.ToString(),
                Subject = h.Subject,
                Content = h.Content,
                Status = h.Status,
                DurationSec = h.DurationSec,
                HandledBy = h.HandledByUser != null
                    ? h.HandledByUser.FirstName + " " + h.HandledByUser.LastName
                    : null,
                OccurredAt = h.OccurredAt
            })
            .ToListAsync();

        return Ok(ApiResponse<PagedResult<CommunicationHistoryDto>>.Ok(new PagedResult<CommunicationHistoryDto>
        {
            Data = items, Total = total, Page = page, PageSize = pageSize
        }));
    }

    /// <summary>Get channel breakdown stats (last 30 days)</summary>
    [HttpGet("history/stats")]
    public async Task<IActionResult> GetHistoryStats()
    {
        var since = DateTime.UtcNow.AddDays(-30);
        var data = await _db.CommunicationHistories
            .Where(h => h.OccurredAt >= since)
            .GroupBy(h => h.Channel)
            .Select(g => new
            {
                Channel = g.Key.ToString(),
                Total = g.Count(),
                Inbound = g.Count(h => h.Direction == Direction.Inbound),
                Outbound = g.Count(h => h.Direction == Direction.Outbound)
            })
            .OrderByDescending(x => x.Total)
            .ToListAsync();

        return Ok(ApiResponse<object>.Ok(data));
    }

    // ── Notes ──────────────────────────────────────────────────────────

    /// <summary>Get notes with optional entity filter</summary>
    [HttpGet("notes")]
    [ProducesResponseType(typeof(ApiResponse<PagedResult<NoteDto>>), 200)]
    public async Task<IActionResult> GetNotes(
        [FromQuery] string? entityType,
        [FromQuery] int? entityId,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = _db.Notes.Include(n => n.CreatedByUser).AsNoTracking();

        if (!string.IsNullOrWhiteSpace(entityType) && Enum.TryParse<EntityType>(entityType, true, out var et))
            query = query.Where(n => n.EntityType == et);

        if (entityId.HasValue)
            query = query.Where(n => n.EntityId == entityId.Value);

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(n =>
                (n.Title != null && n.Title.Contains(search)) ||
                n.Content.Contains(search));

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(n => n.IsPinned)
            .ThenByDescending(n => n.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(n => new NoteDto
            {
                Id = n.Id, Title = n.Title, Content = n.Content,
                IsPinned = n.IsPinned,
                CreatedBy = n.CreatedByUser != null
                    ? n.CreatedByUser.FirstName + " " + n.CreatedByUser.LastName
                    : null,
                CreatedById = n.CreatedBy,
                CreatedAt = n.CreatedAt, UpdatedAt = n.UpdatedAt
            })
            .ToListAsync();

        return Ok(ApiResponse<PagedResult<NoteDto>>.Ok(new PagedResult<NoteDto>
        { Data = items, Total = total, Page = page, PageSize = pageSize }));
    }

    /// <summary>Create a note</summary>
    [HttpPost("notes")]
    public async Task<IActionResult> CreateNote(
        [FromQuery] string entityType,
        [FromQuery] int entityId,
        [FromBody] CreateNoteDto dto)
    {
        if (!Enum.TryParse<EntityType>(entityType, true, out var et))
            return BadRequest(ApiResponse.Fail("Invalid entity type"));

        var note = new Note
        {
            EntityType = et, EntityId = entityId,
            Title = dto.Title, Content = dto.Content,
            IsPinned = dto.IsPinned, CreatedBy = _currentUser.UserId
        };
        _db.Notes.Add(note);
        await _db.SaveChangesAsync();

        return Ok(ApiResponse<NoteDto>.Ok(new NoteDto
        {
            Id = note.Id, Title = note.Title, Content = note.Content,
            IsPinned = note.IsPinned, CreatedById = note.CreatedBy,
            CreatedAt = note.CreatedAt, UpdatedAt = note.UpdatedAt
        }));
    }

    /// <summary>Update a note</summary>
    [HttpPut("notes/{id:int}")]
    public async Task<IActionResult> UpdateNote(int id, [FromBody] CreateNoteDto dto)
    {
        var note = await _db.Notes.FindAsync(id);
        if (note == null) return NotFound(ApiResponse.Fail("Note not found"));

        if (note.CreatedBy != _currentUser.UserId &&
            !User.IsInRole("Admin") && !User.IsInRole("Manager"))
            return Forbid();

        note.Title = dto.Title;
        note.Content = dto.Content;
        note.IsPinned = dto.IsPinned;
        note.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(ApiResponse<NoteDto>.Ok(new NoteDto
        {
            Id = note.Id, Title = note.Title, Content = note.Content,
            IsPinned = note.IsPinned, CreatedAt = note.CreatedAt, UpdatedAt = note.UpdatedAt
        }));
    }

    /// <summary>Delete a note</summary>
    [HttpDelete("notes/{id:int}")]
    public async Task<IActionResult> DeleteNote(int id)
    {
        var note = await _db.Notes.FindAsync(id);
        if (note == null) return NotFound(ApiResponse.Fail("Note not found"));

        if (note.CreatedBy != _currentUser.UserId && !User.IsInRole("Admin"))
            return Forbid();

        _db.Notes.Remove(note);
        await _db.SaveChangesAsync();
        return Ok(ApiResponse.Ok("Note deleted"));
    }

    // ── Attachments ────────────────────────────────────────────────────

    /// <summary>Get attachments with optional entity filter</summary>
    [HttpGet("attachments")]
    public async Task<IActionResult> GetAttachments(
        [FromQuery] string? entityType,
        [FromQuery] int? entityId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = _db.Attachments.Include(a => a.UploadedByUser).AsNoTracking();

        if (!string.IsNullOrWhiteSpace(entityType) && Enum.TryParse<EntityType>(entityType, true, out var et))
            query = query.Where(a => a.EntityType == et);

        if (entityId.HasValue)
            query = query.Where(a => a.EntityId == entityId.Value);

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(a => a.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(a => new AttachmentDto
            {
                Id = a.Id, FileName = a.FileName, FileSize = a.FileSize,
                MimeType = a.MimeType, Category = a.Category,
                UploadedBy = a.UploadedByUser != null
                    ? a.UploadedByUser.FirstName + " " + a.UploadedByUser.LastName
                    : null,
                CreatedAt = a.CreatedAt,
                DownloadUrl = $"/api/v1/attachments/{a.Id}/download"
            })
            .ToListAsync();

        return Ok(ApiResponse<PagedResult<AttachmentDto>>.Ok(new PagedResult<AttachmentDto>
        { Data = items, Total = total, Page = page, PageSize = pageSize }));
    }

    /// <summary>Download attachment by ID</summary>
    [HttpGet("attachments/{id:int}/download")]
    public async Task<IActionResult> DownloadAttachment(int id)
    {
        var att = await _db.Attachments.FindAsync(id);
        if (att == null) return NotFound();

        if (!System.IO.File.Exists(att.FilePath))
            return NotFound(ApiResponse.Fail("File not found on server"));

        var bytes = await System.IO.File.ReadAllBytesAsync(att.FilePath);
        return File(bytes, att.MimeType ?? "application/octet-stream", att.FileName);
    }

    /// <summary>Delete attachment</summary>
    [HttpDelete("attachments/{id:int}")]
    public async Task<IActionResult> DeleteAttachment(int id)
    {
        var att = await _db.Attachments.FindAsync(id);
        if (att == null) return NotFound();

        if (System.IO.File.Exists(att.FilePath))
            System.IO.File.Delete(att.FilePath);

        _db.Attachments.Remove(att);
        await _db.SaveChangesAsync();
        return Ok(ApiResponse.Ok("Attachment deleted"));
    }

    // ── Relationship Mapping ───────────────────────────────────────────

    /// <summary>Get all active relationships</summary>
    [HttpGet("relationships")]
    public async Task<IActionResult> GetRelationships(
        [FromQuery] string? sourceType,
        [FromQuery] int? sourceId)
    {
        var query = _db.Relationships.Where(r => r.IsActive).AsNoTracking();

        if (!string.IsNullOrWhiteSpace(sourceType) &&
            Enum.TryParse<RelationSourceType>(sourceType, true, out var st))
        {
            query = query.Where(r =>
                (r.SourceType == st && (!sourceId.HasValue || r.SourceId == sourceId.Value)) ||
                (r.TargetType == st && (!sourceId.HasValue || r.TargetId == sourceId.Value)));
        }

        var items = await query
            .Select(r => new RelationshipDto
            {
                Id = r.Id, SourceType = r.SourceType.ToString(), SourceId = r.SourceId,
                RelationType = r.RelationType, TargetType = r.TargetType.ToString(),
                TargetId = r.TargetId, IsActive = r.IsActive
            })
            .ToListAsync();

        return Ok(ApiResponse<IEnumerable<RelationshipDto>>.Ok(items));
    }

    /// <summary>Create a relationship</summary>
    [HttpPost("relationships")]
    public async Task<IActionResult> CreateRelationship([FromBody] CreateRelationshipDto dto)
    {
        if (!Enum.TryParse<RelationSourceType>(dto.SourceType, true, out var srcType))
            return BadRequest(ApiResponse.Fail("Invalid source type"));

        if (!Enum.TryParse<RelationSourceType>(dto.TargetType, true, out var tgtType))
            return BadRequest(ApiResponse.Fail("Invalid target type"));

        // Prevent duplicate
        var existing = await _db.Relationships.FirstOrDefaultAsync(r =>
            r.SourceType == srcType && r.SourceId == dto.SourceId &&
            r.TargetType == tgtType && r.TargetId == dto.TargetId &&
            r.RelationType == dto.RelationType && r.IsActive);

        if (existing != null)
            return BadRequest(ApiResponse.Fail("This relationship already exists"));

        var rel = new Relationship
        {
            SourceType = srcType, SourceId = dto.SourceId,
            RelationType = dto.RelationType, TargetType = tgtType,
            TargetId = dto.TargetId, IsActive = true, CreatedBy = _currentUser.UserId
        };
        _db.Relationships.Add(rel);
        await _db.SaveChangesAsync();

        return Ok(ApiResponse<RelationshipDto>.Ok(new RelationshipDto
        {
            Id = rel.Id, SourceType = rel.SourceType.ToString(), SourceId = rel.SourceId,
            RelationType = rel.RelationType, TargetType = rel.TargetType.ToString(),
            TargetId = rel.TargetId, IsActive = rel.IsActive
        }));
    }

    /// <summary>Delete (deactivate) a relationship</summary>
    [HttpDelete("relationships/{id:int}")]
    public async Task<IActionResult> DeleteRelationship(int id)
    {
        var rel = await _db.Relationships.FindAsync(id);
        if (rel == null) return NotFound(ApiResponse.Fail("Relationship not found"));

        rel.IsActive = false;
        await _db.SaveChangesAsync();
        return Ok(ApiResponse.Ok("Relationship removed"));
    }
}
