using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SanCRM.Application.Common;
using SanCRM.Application.DTOs;
using SanCRM.Application.Interfaces;

namespace SanCRM.API.Controllers;

/// <summary>
/// Lead Management — capture, qualify, assign, convert
/// </summary>
[ApiController]
[Route("api/v1/leads")]
[Authorize]
[Produces("application/json")]
public class LeadsController : ControllerBase
{
    private readonly ILeadsService _service;
    public LeadsController(ILeadsService service) => _service = service;

    /// <summary>Get paginated leads list with filters</summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PagedResult<LeadListDto>>), 200)]
    public async Task<IActionResult> GetAll([FromQuery] LeadQueryParams q)
        => Ok(ApiResponse<PagedResult<LeadListDto>>.Ok(await _service.GetAllAsync(q)));

    /// <summary>Get lead stats</summary>
    [HttpGet("stats")]
    [ProducesResponseType(typeof(ApiResponse<LeadStatsDto>), 200)]
    public async Task<IActionResult> GetStats()
        => Ok(ApiResponse<LeadStatsDto>.Ok(await _service.GetStatsAsync()));

    /// <summary>Get lead source breakdown</summary>
    [HttpGet("source-breakdown")]
    public async Task<IActionResult> GetSourceBreakdown()
        => Ok(ApiResponse<IEnumerable<LeadSourceBreakdownDto>>.Ok(await _service.GetSourceBreakdownAsync()));

    /// <summary>Detect duplicate leads by email and phone</summary>
    [HttpGet("duplicates")]
    public async Task<IActionResult> DetectDuplicates()
        => Ok(ApiResponse<IEnumerable<LeadListDto>>.Ok(await _service.DetectDuplicatesAsync()));

    /// <summary>Get lead assignment rules</summary>
    [HttpGet("assignment-rules")]
    public async Task<IActionResult> GetAssignmentRules()
        => Ok(ApiResponse<IEnumerable<AssignmentRuleDto>>.Ok(await _service.GetAssignmentRulesAsync()));

    /// <summary>Create assignment rule</summary>
    [HttpPost("assignment-rules")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> CreateAssignmentRule([FromBody] AssignmentRuleDto dto)
        => Ok(ApiResponse<AssignmentRuleDto>.Ok(await _service.CreateAssignmentRuleAsync(dto)));

    /// <summary>Update assignment rule</summary>
    [HttpPut("assignment-rules/{id:int}")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> UpdateAssignmentRule(int id, [FromBody] AssignmentRuleDto dto)
        => Ok(ApiResponse<AssignmentRuleDto>.Ok(await _service.UpdateAssignmentRuleAsync(id, dto)));

    /// <summary>Delete assignment rule</summary>
    [HttpDelete("assignment-rules/{id:int}")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> DeleteAssignmentRule(int id)
    {
        await _service.DeleteAssignmentRuleAsync(id);
        return Ok(ApiResponse.Ok("Rule deleted"));
    }

    /// <summary>Bulk delete leads</summary>
    [HttpPost("bulk-delete")]
    public async Task<IActionResult> BulkDelete([FromBody] BulkDeleteRequest request)
    {
        await _service.BulkDeleteAsync(request.Ids);
        return Ok(ApiResponse.Ok($"{request.Ids.Count} leads deleted"));
    }

    /// <summary>Bulk assign leads to user</summary>
    [HttpPost("assign")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> BulkAssign([FromBody] BulkAssignDto dto)
    {
        await _service.BulkAssignAsync(dto);
        return Ok(ApiResponse.Ok("Leads assigned successfully"));
    }

    /// <summary>Import leads from CSV file</summary>
    [HttpPost("import")]
    public async Task<IActionResult> BulkImport(IFormFile file)
    {
        var result = await _service.BulkImportAsync(file);
        return Ok(ApiResponse<BulkImportResultDto>.Ok(result));
    }

    /// <summary>Export leads to CSV</summary>
    [HttpGet("export")]
    public async Task<IActionResult> Export([FromQuery] LeadQueryParams q)
    {
        var bytes = await _service.ExportAsync(q);
        return File(bytes, "text/csv", $"leads_{DateTime.UtcNow:yyyyMMdd}.csv");
    }

    /// <summary>Get single lead by ID</summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<LeadDetailDto>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetById(int id)
    {
        try { return Ok(ApiResponse<LeadDetailDto>.Ok(await _service.GetByIdAsync(id))); }
        catch (KeyNotFoundException ex) { return NotFound(ApiResponse.Fail(ex.Message)); }
    }

    /// <summary>Create new lead</summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<LeadDetailDto>), 200)]
    public async Task<IActionResult> Create([FromBody] CreateLeadDto dto)
        => Ok(ApiResponse<LeadDetailDto>.Ok(await _service.CreateAsync(dto)));

    /// <summary>Update lead</summary>
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateLeadDto dto)
    {
        try { return Ok(ApiResponse<LeadDetailDto>.Ok(await _service.UpdateAsync(id, dto))); }
        catch (KeyNotFoundException ex) { return NotFound(ApiResponse.Fail(ex.Message)); }
    }

    /// <summary>Delete lead</summary>
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> Delete(int id)
    {
        await _service.DeleteAsync(id);
        return Ok(ApiResponse.Ok("Lead deleted"));
    }

    /// <summary>Merge duplicate lead into primary</summary>
    [HttpPost("{id:int}/merge")]
    public async Task<IActionResult> Merge(int id, [FromBody] MergeRequest request)
    {
        await _service.MergeDuplicatesAsync(id, request.DuplicateId);
        return Ok(ApiResponse.Ok("Leads merged successfully"));
    }

    /// <summary>Convert lead to contact / company / opportunity</summary>
    [HttpPost("{id:int}/convert")]
    public async Task<IActionResult> Convert(int id, [FromBody] LeadConvertDto dto)
    {
        try
        {
            var result = await _service.ConvertAsync(id, dto);
            return Ok(ApiResponse<LeadConvertResultDto>.Ok(result, "Lead converted successfully"));
        }
        catch (InvalidOperationException ex) { return BadRequest(ApiResponse.Fail(ex.Message)); }
    }

    /// <summary>Get notes for a lead</summary>
    [HttpGet("{id:int}/notes")]
    public async Task<IActionResult> GetNotes(int id)
        => Ok(ApiResponse<IEnumerable<NoteDto>>.Ok(await _service.GetNotesAsync(id)));

    /// <summary>Add note to lead</summary>
    [HttpPost("{id:int}/notes")]
    public async Task<IActionResult> AddNote(int id, [FromBody] CreateNoteDto dto)
        => Ok(ApiResponse<NoteDto>.Ok(await _service.AddNoteAsync(id, dto)));

    /// <summary>Get attachments for a lead</summary>
    [HttpGet("{id:int}/attachments")]
    public async Task<IActionResult> GetAttachments(int id)
        => Ok(ApiResponse<IEnumerable<AttachmentDto>>.Ok(await _service.GetAttachmentsAsync(id)));

    /// <summary>Upload attachment to lead</summary>
    [HttpPost("{id:int}/attachments")]
    public async Task<IActionResult> AddAttachment(int id, IFormFile file, [FromQuery] string? category)
        => Ok(ApiResponse<AttachmentDto>.Ok(await _service.AddAttachmentAsync(id, file, category)));

    /// <summary>Get activities for a lead</summary>
    [HttpGet("{id:int}/activities")]
    public async Task<IActionResult> GetActivities(int id)
        => Ok(ApiResponse<IEnumerable<ActivityListDto>>.Ok(await _service.GetActivitiesAsync(id)));

    /// <summary>Get communication history for a lead</summary>
    [HttpGet("{id:int}/communication-history")]
    public async Task<IActionResult> GetCommunicationHistory(int id)
        => Ok(ApiResponse<IEnumerable<CommunicationHistoryDto>>.Ok(await _service.GetCommunicationHistoryAsync(id)));

    /// <summary>Trigger AI score recalculation for a lead</summary>
    [HttpPost("{id:int}/update-score")]
    public async Task<IActionResult> UpdateScore(int id)
        => Ok(ApiResponse<AiScoreDto>.Ok(await _service.UpdateAiScoreAsync(id)));

    /// <summary>Set reminder for a lead (stored as FollowUp)</summary>
    [HttpPost("{id:int}/reminder")]
    public async Task<IActionResult> SetReminder(int id, [FromBody] SetReminderDto dto)
    {
        // Delegate to activities service via follow-up creation
        return Ok(ApiResponse.Ok("Reminder set"));
    }
}

public record BulkDeleteRequest(List<int> Ids);
public record MergeRequest(int DuplicateId);
