using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SanCRM.Application.Common;
using SanCRM.Application.DTOs;
using SanCRM.Application.Interfaces;

namespace SanCRM.API.Controllers;

/// <summary>
/// Account / Company Management — companies, branches, GST, credit limits
/// </summary>
[ApiController]
[Route("api/v1/accounts")]
[Authorize]
[Produces("application/json")]
public class AccountsController : ControllerBase
{
    private readonly IAccountsService _service;
    public AccountsController(IAccountsService service) => _service = service;

    /// <summary>Get paginated accounts list</summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PagedResult<AccountListDto>>), 200)]
    public async Task<IActionResult> GetAll([FromQuery] AccountQueryParams q)
        => Ok(ApiResponse<PagedResult<AccountListDto>>.Ok(await _service.GetAllAsync(q)));

    /// <summary>Get account stats</summary>
    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
        => Ok(ApiResponse<AccountStatsDto>.Ok(await _service.GetStatsAsync()));

    /// <summary>Get full company hierarchy</summary>
    [HttpGet("hierarchy")]
    public async Task<IActionResult> GetHierarchy()
        => Ok(ApiResponse<IEnumerable<CompanyHierarchyDto>>.Ok(await _service.GetHierarchyAsync()));

    /// <summary>Get customer categories</summary>
    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories()
        => Ok(ApiResponse<IEnumerable<CustomerCategoryDto>>.Ok(await _service.GetCategoriesAsync()));

    /// <summary>Validate GST number</summary>
    [HttpPost("validate-gst")]
    public async Task<IActionResult> ValidateGst([FromBody] ValidateGstDto dto)
        => Ok(ApiResponse<GstValidationResult>.Ok(await _service.ValidateGstAsync(dto.GstNumber)));

    /// <summary>Export accounts to CSV</summary>
    [HttpGet("export")]
    public async Task<IActionResult> Export([FromQuery] AccountQueryParams q)
    {
        var bytes = await _service.ExportAsync(q);
        return File(bytes, "text/csv", $"accounts_{DateTime.UtcNow:yyyyMMdd}.csv");
    }

    /// <summary>Get single account</summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<AccountDetailDto>), 200)]
    public async Task<IActionResult> GetById(int id)
    {
        try { return Ok(ApiResponse<AccountDetailDto>.Ok(await _service.GetByIdAsync(id))); }
        catch (KeyNotFoundException ex) { return NotFound(ApiResponse.Fail(ex.Message)); }
    }

    /// <summary>Create account</summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateAccountDto dto)
        => Ok(ApiResponse<AccountDetailDto>.Ok(await _service.CreateAsync(dto)));

    /// <summary>Update account</summary>
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateAccountDto dto)
    {
        try { return Ok(ApiResponse<AccountDetailDto>.Ok(await _service.UpdateAsync(id, dto))); }
        catch (KeyNotFoundException ex) { return NotFound(ApiResponse.Fail(ex.Message)); }
    }

    /// <summary>Delete account</summary>
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        await _service.DeleteAsync(id);
        return Ok(ApiResponse.Ok("Account deleted"));
    }

    /// <summary>Get branches of an account</summary>
    [HttpGet("{id:int}/branches")]
    public async Task<IActionResult> GetBranches(int id)
        => Ok(ApiResponse<IEnumerable<BranchDto>>.Ok(await _service.GetBranchesAsync(id)));

    /// <summary>Create branch under account</summary>
    [HttpPost("{id:int}/branches")]
    public async Task<IActionResult> CreateBranch(int id, [FromBody] CreateBranchDto dto)
        => Ok(ApiResponse<BranchDto>.Ok(await _service.CreateBranchAsync(id, dto)));

    /// <summary>Get contacts of an account</summary>
    [HttpGet("{id:int}/contacts")]
    public async Task<IActionResult> GetContacts(int id)
        => Ok(ApiResponse<IEnumerable<ContactListDto>>.Ok(await _service.GetContactsAsync(id)));

    /// <summary>Get opportunities of an account</summary>
    [HttpGet("{id:int}/opportunities")]
    public async Task<IActionResult> GetOpportunities(int id)
        => Ok(ApiResponse<IEnumerable<OpportunityListDto>>.Ok(await _service.GetOpportunitiesAsync(id)));

    /// <summary>Get documents of an account</summary>
    [HttpGet("{id:int}/documents")]
    public async Task<IActionResult> GetDocuments(int id)
        => Ok(ApiResponse<IEnumerable<DocumentListDto>>.Ok(await _service.GetDocumentsAsync(id)));

    /// <summary>Get activities of an account</summary>
    [HttpGet("{id:int}/activities")]
    public async Task<IActionResult> GetActivities(int id)
        => Ok(ApiResponse<IEnumerable<ActivityListDto>>.Ok(await _service.GetActivitiesAsync(id)));

    /// <summary>Get notes of an account</summary>
    [HttpGet("{id:int}/notes")]
    public async Task<IActionResult> GetNotes(int id)
        => Ok(ApiResponse<IEnumerable<NoteDto>>.Ok(await _service.GetNotesAsync(id)));

    /// <summary>Add note to account</summary>
    [HttpPost("{id:int}/notes")]
    public async Task<IActionResult> AddNote(int id, [FromBody] CreateNoteDto dto)
        => Ok(ApiResponse<NoteDto>.Ok(await _service.AddNoteAsync(id, dto)));

    /// <summary>Update credit limit for account</summary>
    [HttpPut("{id:int}/credit-limit")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> UpdateCreditLimit(int id, [FromBody] UpdateCreditLimitDto dto)
    {
        await _service.UpdateCreditLimitAsync(id, dto);
        return Ok(ApiResponse.Ok("Credit limit updated"));
    }
}
