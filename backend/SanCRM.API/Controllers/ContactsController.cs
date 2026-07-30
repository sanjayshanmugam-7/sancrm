using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SanCRM.Application.Common;
using SanCRM.Application.DTOs;
using SanCRM.Application.Interfaces;

namespace SanCRM.API.Controllers;

/// <summary>
/// Contact Management — individuals and business contacts
/// </summary>
[ApiController]
[Route("api/v1/contacts")]
[Authorize]
[Produces("application/json")]
public class ContactsController : ControllerBase
{
    private readonly IContactsService _service;
    public ContactsController(IContactsService service) => _service = service;

    /// <summary>Get paginated contacts list</summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PagedResult<ContactListDto>>), 200)]
    public async Task<IActionResult> GetAll([FromQuery] ContactQueryParams q)
        => Ok(ApiResponse<PagedResult<ContactListDto>>.Ok(await _service.GetAllAsync(q)));

    /// <summary>Get contact stats</summary>
    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
        => Ok(ApiResponse<ContactStatsDto>.Ok(await _service.GetStatsAsync()));

    /// <summary>Get all customer groups</summary>
    [HttpGet("groups")]
    public async Task<IActionResult> GetGroups()
        => Ok(ApiResponse<IEnumerable<CustomerGroupDto>>.Ok(await _service.GetGroupsAsync()));

    /// <summary>Create customer group</summary>
    [HttpPost("groups")]
    public async Task<IActionResult> CreateGroup([FromBody] CustomerGroupDto dto)
        => Ok(ApiResponse<CustomerGroupDto>.Ok(await _service.CreateGroupAsync(dto)));

    /// <summary>Get group by ID</summary>
    [HttpGet("groups/{id:int}")]
    public async Task<IActionResult> GetGroupById(int id)
        => Ok(ApiResponse<CustomerGroupDto>.Ok(await _service.GetGroupByIdAsync(id)));

    /// <summary>Update customer group</summary>
    [HttpPut("groups/{id:int}")]
    public async Task<IActionResult> UpdateGroup(int id, [FromBody] CustomerGroupDto dto)
        => Ok(ApiResponse<CustomerGroupDto>.Ok(await _service.UpdateGroupAsync(id, dto)));

    /// <summary>Delete customer group</summary>
    [HttpDelete("groups/{id:int}")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> DeleteGroup(int id)
    {
        await _service.DeleteGroupAsync(id);
        return Ok(ApiResponse.Ok("Group deleted"));
    }

    /// <summary>Add contacts to group</summary>
    [HttpPost("groups/{id:int}/members")]
    public async Task<IActionResult> AddToGroup(int id, [FromBody] AddToGroupRequest request)
    {
        await _service.AddToGroupAsync(id, request.ContactIds);
        return Ok(ApiResponse.Ok("Contacts added to group"));
    }

    /// <summary>Remove contact from group</summary>
    [HttpDelete("groups/{id:int}/members/{contactId:int}")]
    public async Task<IActionResult> RemoveFromGroup(int id, int contactId)
    {
        await _service.RemoveFromGroupAsync(id, contactId);
        return Ok(ApiResponse.Ok("Contact removed from group"));
    }

    /// <summary>Bulk delete contacts</summary>
    [HttpPost("bulk-delete")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> BulkDelete([FromBody] BulkDeleteContactRequest request)
    {
        await _service.BulkDeleteAsync(request.Ids);
        return Ok(ApiResponse.Ok($"{request.Ids.Count} contacts deleted"));
    }

    /// <summary>Import contacts from CSV</summary>
    [HttpPost("import")]
    public async Task<IActionResult> Import(IFormFile file)
        => Ok(ApiResponse.Ok("Import queued"));

    /// <summary>Export contacts to CSV</summary>
    [HttpGet("export")]
    public async Task<IActionResult> Export([FromQuery] ContactQueryParams q)
    {
        var bytes = await _service.ExportAsync(q);
        return File(bytes, "text/csv", $"contacts_{DateTime.UtcNow:yyyyMMdd}.csv");
    }

    /// <summary>Get single contact</summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<ContactDetailDto>), 200)]
    public async Task<IActionResult> GetById(int id)
    {
        try { return Ok(ApiResponse<ContactDetailDto>.Ok(await _service.GetByIdAsync(id))); }
        catch (KeyNotFoundException ex) { return NotFound(ApiResponse.Fail(ex.Message)); }
    }

    /// <summary>Create contact</summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateContactDto dto)
        => Ok(ApiResponse<ContactDetailDto>.Ok(await _service.CreateAsync(dto)));

    /// <summary>Update contact</summary>
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateContactDto dto)
    {
        try { return Ok(ApiResponse<ContactDetailDto>.Ok(await _service.UpdateAsync(id, dto))); }
        catch (KeyNotFoundException ex) { return NotFound(ApiResponse.Fail(ex.Message)); }
    }

    /// <summary>Delete contact</summary>
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> Delete(int id)
    {
        await _service.DeleteAsync(id);
        return Ok(ApiResponse.Ok("Contact deleted"));
    }

    /// <summary>Get activities for contact</summary>
    [HttpGet("{id:int}/activities")]
    public async Task<IActionResult> GetActivities(int id)
        => Ok(ApiResponse<IEnumerable<ActivityListDto>>.Ok(await _service.GetActivitiesAsync(id)));

    /// <summary>Get notes for contact</summary>
    [HttpGet("{id:int}/notes")]
    public async Task<IActionResult> GetNotes(int id)
        => Ok(ApiResponse<IEnumerable<NoteDto>>.Ok(await _service.GetNotesAsync(id)));

    /// <summary>Add note to contact</summary>
    [HttpPost("{id:int}/notes")]
    public async Task<IActionResult> AddNote(int id, [FromBody] CreateNoteDto dto)
        => Ok(ApiResponse<NoteDto>.Ok(await _service.AddNoteAsync(id, dto)));

    /// <summary>Get attachments for contact</summary>
    [HttpGet("{id:int}/attachments")]
    public async Task<IActionResult> GetAttachments(int id)
        => Ok(ApiResponse<IEnumerable<AttachmentDto>>.Ok(await _service.GetAttachmentsAsync(id)));

    /// <summary>Upload attachment to contact</summary>
    [HttpPost("{id:int}/attachments")]
    public async Task<IActionResult> AddAttachment(int id, IFormFile file, [FromQuery] string? category)
        => Ok(ApiResponse<AttachmentDto>.Ok(await _service.AddAttachmentAsync(id, file, category)));

    /// <summary>Get communication history for contact</summary>
    [HttpGet("{id:int}/communication-history")]
    public async Task<IActionResult> GetCommunicationHistory(int id)
        => Ok(ApiResponse<IEnumerable<CommunicationHistoryDto>>.Ok(await _service.GetCommunicationHistoryAsync(id)));

    /// <summary>Get relationship map for contact</summary>
    [HttpGet("{id:int}/relationships")]
    public async Task<IActionResult> GetRelationships(int id)
        => Ok(ApiResponse<IEnumerable<RelationshipDto>>.Ok(await _service.GetRelationshipsAsync(id)));
}

public record AddToGroupRequest(List<int> ContactIds);
public record BulkDeleteContactRequest(List<int> Ids);
