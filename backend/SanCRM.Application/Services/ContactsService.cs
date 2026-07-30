using System.Text;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using SanCRM.Application.Common;
using SanCRM.Application.DTOs;
using SanCRM.Application.Interfaces;
using SanCRM.Domain.Entities;
using SanCRM.Domain.Enums;
using SanCRM.Infrastructure.Data;

namespace SanCRM.Application.Services;

public class ContactsService : IContactsService
{
    private readonly CrmDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly IAuditService _audit;
    private readonly IConfiguration _config;

    public ContactsService(CrmDbContext db, ICurrentUserService currentUser,
                           IAuditService audit, IConfiguration config)
    { _db = db; _currentUser = currentUser; _audit = audit; _config = config; }

    public async Task<PagedResult<ContactListDto>> GetAllAsync(ContactQueryParams q)
    {
        var query = _db.Contacts
            .Include(c => c.Company).Include(c => c.Group)
            .Include(c => c.AssignedToUser).AsNoTracking();

        if (!string.IsNullOrWhiteSpace(q.Search))
            query = query.Where(c =>
                c.FirstName.Contains(q.Search) ||
                (c.LastName != null && c.LastName.Contains(q.Search)) ||
                (c.Email != null && c.Email.Contains(q.Search)) ||
                (c.Phone != null && c.Phone.Contains(q.Search)));

        if (!string.IsNullOrWhiteSpace(q.Type) && Enum.TryParse<ContactType>(q.Type, true, out var ct))
            query = query.Where(c => c.ContactType == ct);

        if (!string.IsNullOrWhiteSpace(q.Status) && Enum.TryParse<ContactStatus>(q.Status, true, out var cs))
            query = query.Where(c => c.Status == cs);

        if (q.CompanyId.HasValue) query = query.Where(c => c.CompanyId == q.CompanyId.Value);
        if (q.GroupId.HasValue) query = query.Where(c => c.GroupId == q.GroupId.Value);

        var total = await query.CountAsync();
        var items = await query.OrderBy(c => c.FirstName).ThenBy(c => c.LastName)
            .Skip((q.Page - 1) * q.PageSize).Take(q.PageSize).ToListAsync();

        return new PagedResult<ContactListDto>
        { Data = items.Select(MapToListDto), Total = total, Page = q.Page, PageSize = q.PageSize };
    }

    public async Task<ContactDetailDto> GetByIdAsync(int id)
    {
        var c = await _db.Contacts
            .Include(x => x.Company).Include(x => x.Group).Include(x => x.AssignedToUser)
            .AsNoTracking().FirstOrDefaultAsync(x => x.Id == id)
            ?? throw new KeyNotFoundException($"Contact {id} not found.");
        return MapToDetailDto(c);
    }

    public async Task<ContactDetailDto> CreateAsync(CreateContactDto dto)
    {
        var contact = new Contact
        {
            CompanyId = dto.CompanyId, BranchId = dto.BranchId,
            ContactType = Enum.Parse<ContactType>(dto.ContactType, true),
            Salutation = dto.Salutation, FirstName = dto.FirstName.Trim(),
            LastName = dto.LastName?.Trim(), Email = dto.Email?.Trim().ToLowerInvariant(),
            EmailAlt = dto.EmailAlt, Phone = dto.Phone?.Trim(), PhoneAlt = dto.PhoneAlt,
            Mobile = dto.Mobile, Whatsapp = dto.Whatsapp, Designation = dto.Designation,
            Department = dto.Department, DecisionMaker = dto.DecisionMaker,
            LinkedIn = dto.LinkedIn, Facebook = dto.Facebook, Instagram = dto.Instagram,
            Twitter = dto.Twitter, GroupId = dto.GroupId, AssignedTo = dto.AssignedTo ?? _currentUser.UserId,
            Source = dto.Source, Notes = dto.Notes, DoNotContact = dto.DoNotContact,
            CreatedBy = _currentUser.UserId
        };
        if (!string.IsNullOrEmpty(dto.DateOfBirth) && DateOnly.TryParse(dto.DateOfBirth, out var dob))
            contact.DateOfBirth = dob;
        if (!string.IsNullOrEmpty(dto.Anniversary) && DateOnly.TryParse(dto.Anniversary, out var ann))
            contact.Anniversary = ann;

        _db.Contacts.Add(contact);
        await _db.SaveChangesAsync();
        await _audit.LogAsync(AuditAction.Create, "Contact", contact.Id);
        return await GetByIdAsync(contact.Id);
    }

    public async Task<ContactDetailDto> UpdateAsync(int id, UpdateContactDto dto)
    {
        var contact = await _db.Contacts.FindAsync(id)
            ?? throw new KeyNotFoundException($"Contact {id} not found.");

        contact.CompanyId = dto.CompanyId; contact.BranchId = dto.BranchId;
        contact.ContactType = Enum.Parse<ContactType>(dto.ContactType, true);
        contact.Salutation = dto.Salutation; contact.FirstName = dto.FirstName.Trim();
        contact.LastName = dto.LastName?.Trim(); contact.Email = dto.Email?.Trim().ToLowerInvariant();
        contact.Phone = dto.Phone; contact.Mobile = dto.Mobile; contact.Whatsapp = dto.Whatsapp;
        contact.Designation = dto.Designation; contact.Department = dto.Department;
        contact.DecisionMaker = dto.DecisionMaker; contact.LinkedIn = dto.LinkedIn;
        contact.GroupId = dto.GroupId; contact.AssignedTo = dto.AssignedTo;
        contact.Source = dto.Source; contact.Notes = dto.Notes;
        contact.DoNotContact = dto.DoNotContact;
        if (!string.IsNullOrWhiteSpace(dto.Status) && Enum.TryParse<ContactStatus>(dto.Status, true, out var st))
            contact.Status = st;
        contact.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        await _audit.LogAsync(AuditAction.Update, "Contact", id);
        return await GetByIdAsync(id);
    }

    public async Task DeleteAsync(int id)
    {
        var c = await _db.Contacts.FindAsync(id) ?? throw new KeyNotFoundException();
        _db.Contacts.Remove(c);
        await _db.SaveChangesAsync();
        await _audit.LogAsync(AuditAction.Delete, "Contact", id);
    }

    public async Task BulkDeleteAsync(List<int> ids)
    {
        var contacts = await _db.Contacts.Where(c => ids.Contains(c.Id)).ToListAsync();
        _db.Contacts.RemoveRange(contacts);
        await _db.SaveChangesAsync();
    }

    public async Task<byte[]> ExportAsync(ContactQueryParams q)
    {
        q.PageSize = 10000;
        var result = await GetAllAsync(q);
        var sb = new StringBuilder();
        sb.AppendLine("FullName,Email,Phone,Company,Designation,Status,CreatedAt");
        foreach (var c in result.Data)
            sb.AppendLine($"{c.FullName},{c.Email},{c.Phone},{c.CompanyName},{c.Designation},{c.Status},{c.CreatedAt:yyyy-MM-dd}");
        return Encoding.UTF8.GetBytes(sb.ToString());
    }

    public async Task<IEnumerable<CustomerGroupDto>> GetGroupsAsync()
    {
        return await _db.CustomerGroups
            .Select(g => new CustomerGroupDto
            {
                Id = g.Id, Name = g.Name, Description = g.Description, Color = g.Color,
                MemberCount = g.Members.Count
            }).ToListAsync();
    }

    public async Task<CustomerGroupDto> GetGroupByIdAsync(int id)
    {
        var g = await _db.CustomerGroups.Include(x => x.Members)
            .FirstOrDefaultAsync(x => x.Id == id)
            ?? throw new KeyNotFoundException();
        return new CustomerGroupDto { Id = g.Id, Name = g.Name, Description = g.Description, Color = g.Color, MemberCount = g.Members.Count };
    }

    public async Task<CustomerGroupDto> CreateGroupAsync(CustomerGroupDto dto)
    {
        var group = new CustomerGroup { Name = dto.Name, Description = dto.Description, Color = dto.Color, CreatedBy = _currentUser.UserId };
        _db.CustomerGroups.Add(group);
        await _db.SaveChangesAsync();
        dto.Id = group.Id;
        return dto;
    }

    public async Task<CustomerGroupDto> UpdateGroupAsync(int id, CustomerGroupDto dto)
    {
        var group = await _db.CustomerGroups.FindAsync(id) ?? throw new KeyNotFoundException();
        group.Name = dto.Name; group.Description = dto.Description; group.Color = dto.Color;
        await _db.SaveChangesAsync();
        dto.Id = id;
        return dto;
    }

    public async Task DeleteGroupAsync(int id)
    {
        var group = await _db.CustomerGroups.FindAsync(id) ?? throw new KeyNotFoundException();
        _db.CustomerGroups.Remove(group);
        await _db.SaveChangesAsync();
    }

    public async Task AddToGroupAsync(int groupId, List<int> contactIds)
    {
        foreach (var cid in contactIds)
        {
            if (!await _db.ContactGroupMembers.AnyAsync(m => m.GroupId == groupId && m.ContactId == cid))
                _db.ContactGroupMembers.Add(new ContactGroupMember { GroupId = groupId, ContactId = cid });
        }
        await _db.SaveChangesAsync();
    }

    public async Task RemoveFromGroupAsync(int groupId, int contactId)
    {
        var member = await _db.ContactGroupMembers
            .FirstOrDefaultAsync(m => m.GroupId == groupId && m.ContactId == contactId);
        if (member != null) { _db.ContactGroupMembers.Remove(member); await _db.SaveChangesAsync(); }
    }

    public async Task<IEnumerable<ActivityListDto>> GetActivitiesAsync(int id)
    {
        var calls = await _db.Calls.Where(c => c.EntityType == EntityType.Contact && c.EntityId == id).AsNoTracking().ToListAsync();
        var followups = await _db.Followups.Where(f => f.EntityType == EntityType.Contact && f.EntityId == id).AsNoTracking().ToListAsync();
        var result = new List<ActivityListDto>();
        result.AddRange(calls.Select(c => new ActivityListDto { Id = c.Id, Type = "Call", Subject = c.Subject, Status = c.Status.ToString(), ScheduledAt = c.CallDatetime, EntityType = "Contact", EntityId = id, CreatedAt = c.CreatedAt }));
        result.AddRange(followups.Select(f => new ActivityListDto { Id = f.Id, Type = "FollowUp", Subject = f.Subject, Status = f.Status.ToString(), Priority = f.Priority.ToString(), ScheduledAt = f.DueDate, EntityType = "Contact", EntityId = id, CreatedAt = f.CreatedAt }));
        return result.OrderByDescending(a => a.ScheduledAt ?? a.CreatedAt);
    }

    public async Task<IEnumerable<NoteDto>> GetNotesAsync(int id)
    {
        return await _db.Notes.Include(n => n.CreatedByUser)
            .Where(n => n.EntityType == EntityType.Contact && n.EntityId == id)
            .OrderByDescending(n => n.IsPinned).ThenByDescending(n => n.CreatedAt).AsNoTracking()
            .Select(n => new NoteDto { Id = n.Id, Title = n.Title, Content = n.Content, IsPinned = n.IsPinned, CreatedBy = n.CreatedByUser!.FirstName + " " + n.CreatedByUser.LastName, CreatedAt = n.CreatedAt, UpdatedAt = n.UpdatedAt })
            .ToListAsync();
    }

    public async Task<NoteDto> AddNoteAsync(int id, CreateNoteDto dto)
    {
        var note = new Note { EntityType = EntityType.Contact, EntityId = id, Title = dto.Title, Content = dto.Content, IsPinned = dto.IsPinned, CreatedBy = _currentUser.UserId };
        _db.Notes.Add(note);
        await _db.SaveChangesAsync();
        return new NoteDto { Id = note.Id, Title = note.Title, Content = note.Content, IsPinned = note.IsPinned, CreatedAt = note.CreatedAt, UpdatedAt = note.UpdatedAt };
    }

    public async Task<IEnumerable<AttachmentDto>> GetAttachmentsAsync(int id)
    {
        return await _db.Attachments.Include(a => a.UploadedByUser)
            .Where(a => a.EntityType == EntityType.Contact && a.EntityId == id)
            .AsNoTracking()
            .Select(a => new AttachmentDto { Id = a.Id, FileName = a.FileName, FileSize = a.FileSize, MimeType = a.MimeType, Category = a.Category, UploadedBy = a.UploadedByUser!.FirstName, CreatedAt = a.CreatedAt, DownloadUrl = $"/api/v1/attachments/{a.Id}/download" })
            .ToListAsync();
    }

    public async Task<AttachmentDto> AddAttachmentAsync(int id, IFormFile file, string? category)
    {
        var uploadPath = _config["FileStorage:UploadPath"] ?? "uploads";
        var dir = Path.Combine(uploadPath, "contacts", id.ToString());
        Directory.CreateDirectory(dir);
        var fileName = $"{Guid.NewGuid()}_{Path.GetFileName(file.FileName)}";
        var fullPath = Path.Combine(dir, fileName);
        await using var stream = new FileStream(fullPath, FileMode.Create);
        await file.CopyToAsync(stream);
        var att = new Attachment { EntityType = EntityType.Contact, EntityId = id, FileName = file.FileName, FilePath = fullPath, FileSize = file.Length, MimeType = file.ContentType, Category = category, UploadedBy = _currentUser.UserId };
        _db.Attachments.Add(att);
        await _db.SaveChangesAsync();
        return new AttachmentDto { Id = att.Id, FileName = att.FileName, FileSize = att.FileSize, MimeType = att.MimeType, CreatedAt = att.CreatedAt, DownloadUrl = $"/api/v1/attachments/{att.Id}/download" };
    }

    public async Task<IEnumerable<CommunicationHistoryDto>> GetCommunicationHistoryAsync(int id)
    {
        return await _db.CommunicationHistories.Include(h => h.HandledByUser)
            .Where(h => h.EntityType == EntityType.Contact && h.EntityId == id)
            .OrderByDescending(h => h.OccurredAt).AsNoTracking()
            .Select(h => new CommunicationHistoryDto { Id = h.Id, Channel = h.Channel.ToString(), Direction = h.Direction.ToString(), Subject = h.Subject, Status = h.Status, OccurredAt = h.OccurredAt })
            .ToListAsync();
    }

    public async Task<IEnumerable<RelationshipDto>> GetRelationshipsAsync(int id)
    {
        return await _db.Relationships
            .Where(r => r.IsActive && ((r.SourceType == RelationSourceType.Contact && r.SourceId == id) || (r.TargetType == RelationSourceType.Contact && r.TargetId == id)))
            .AsNoTracking()
            .Select(r => new RelationshipDto { Id = r.Id, SourceType = r.SourceType.ToString(), SourceId = r.SourceId, RelationType = r.RelationType, TargetType = r.TargetType.ToString(), TargetId = r.TargetId, IsActive = r.IsActive })
            .ToListAsync();
    }

    public async Task<ContactStatsDto> GetStatsAsync()
    {
        var now = DateTime.UtcNow;
        return new ContactStatsDto
        {
            Total = await _db.Contacts.CountAsync(),
            Active = await _db.Contacts.CountAsync(c => c.Status == ContactStatus.Active),
            DecisionMakers = await _db.Contacts.CountAsync(c => c.DecisionMaker),
            NewThisMonth = await _db.Contacts.CountAsync(c => c.CreatedAt >= new DateTime(now.Year, now.Month, 1)),
            ByType = await _db.Contacts.GroupBy(c => c.ContactType).ToDictionaryAsync(g => g.Key.ToString(), g => g.Count())
        };
    }

    private static ContactListDto MapToListDto(Contact c) => new()
    {
        Id = c.Id, FullName = c.FullName, ContactType = c.ContactType.ToString(),
        Email = c.Email, Phone = c.Phone, Mobile = c.Mobile, Designation = c.Designation,
        DecisionMaker = c.DecisionMaker, CompanyName = c.Company?.Name, CompanyId = c.CompanyId,
        GroupName = c.Group?.Name, AssignedTo = c.AssignedToUser?.FullName, Status = c.Status.ToString(),
        CreatedAt = c.CreatedAt
    };

    private static ContactDetailDto MapToDetailDto(Contact c) => new()
    {
        Id = c.Id, FullName = c.FullName, ContactType = c.ContactType.ToString(),
        Email = c.Email, Phone = c.Phone, Mobile = c.Mobile, Designation = c.Designation,
        DecisionMaker = c.DecisionMaker, CompanyName = c.Company?.Name, CompanyId = c.CompanyId,
        GroupName = c.Group?.Name, AssignedTo = c.AssignedToUser?.FullName, Status = c.Status.ToString(),
        CreatedAt = c.CreatedAt, Salutation = c.Salutation, FirstName = c.FirstName, LastName = c.LastName,
        EmailAlt = c.EmailAlt, PhoneAlt = c.PhoneAlt, Whatsapp = c.Whatsapp, Department = c.Department,
        LinkedIn = c.LinkedIn, Facebook = c.Facebook, Instagram = c.Instagram, Twitter = c.Twitter,
        DateOfBirth = c.DateOfBirth?.ToString("yyyy-MM-dd"), Anniversary = c.Anniversary?.ToString("yyyy-MM-dd"),
        AvatarUrl = c.AvatarUrl, Source = c.Source, DoNotContact = c.DoNotContact, Notes = c.Notes
    };
}
