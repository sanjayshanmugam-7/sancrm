using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SanCRM.Application.Common;
using SanCRM.Application.DTOs;
using SanCRM.Application.Interfaces;

namespace SanCRM.API.Controllers;

/// <summary>
/// Campaign Management — email, SMS, WhatsApp, social, push notifications
/// </summary>
[ApiController]
[Route("api/v1/campaigns")]
[Authorize]
[Produces("application/json")]
public class CampaignsController : ControllerBase
{
    private readonly ICampaignsService _service;
    public CampaignsController(ICampaignsService service) => _service = service;

    /// <summary>Get paginated campaigns list</summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PagedResult<CampaignListDto>>), 200)]
    public async Task<IActionResult> GetAll([FromQuery] CampaignQueryParams q)
        => Ok(ApiResponse<PagedResult<CampaignListDto>>.Ok(await _service.GetAllAsync(q)));

    /// <summary>Get overall campaign stats</summary>
    [HttpGet("stats")]
    public async Task<IActionResult> GetOverallStats()
        => Ok(ApiResponse<CampaignStatsDto>.Ok(await _service.GetOverallStatsAsync()));

    /// <summary>Get campaign templates by type</summary>
    [HttpGet("templates")]
    public async Task<IActionResult> GetTemplates([FromQuery] string? type)
        => Ok(ApiResponse<IEnumerable<CampaignTemplateDto>>.Ok(await _service.GetTemplatesAsync(type)));

    /// <summary>Create campaign template</summary>
    [HttpPost("templates")]
    public async Task<IActionResult> CreateTemplate([FromBody] CampaignTemplateDto dto)
        => Ok(ApiResponse<CampaignTemplateDto>.Ok(await _service.CreateTemplateAsync(dto)));

    /// <summary>Send test email</summary>
    [HttpPost("test-email")]
    public async Task<IActionResult> SendTestEmail([FromBody] TestEmailDto dto)
    {
        await _service.SendTestEmailAsync(dto);
        return Ok(ApiResponse.Ok("Test email sent"));
    }

    /// <summary>Send test SMS</summary>
    [HttpPost("test-sms")]
    public async Task<IActionResult> SendTestSms([FromBody] TestSmsDto dto)
    {
        await _service.SendTestSmsAsync(dto);
        return Ok(ApiResponse.Ok("Test SMS sent"));
    }

    /// <summary>Get single campaign</summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<CampaignDetailDto>), 200)]
    public async Task<IActionResult> GetById(int id)
    {
        try { return Ok(ApiResponse<CampaignDetailDto>.Ok(await _service.GetByIdAsync(id))); }
        catch (KeyNotFoundException ex) { return NotFound(ApiResponse.Fail(ex.Message)); }
    }

    /// <summary>Create campaign</summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCampaignDto dto)
        => Ok(ApiResponse<CampaignDetailDto>.Ok(await _service.CreateAsync(dto)));

    /// <summary>Update campaign</summary>
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateCampaignDto dto)
    {
        try { return Ok(ApiResponse<CampaignDetailDto>.Ok(await _service.UpdateAsync(id, dto))); }
        catch (KeyNotFoundException ex) { return NotFound(ApiResponse.Fail(ex.Message)); }
    }

    /// <summary>Delete campaign</summary>
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> Delete(int id)
    {
        await _service.DeleteAsync(id);
        return Ok(ApiResponse.Ok("Campaign deleted"));
    }

    /// <summary>Launch campaign</summary>
    [HttpPost("{id:int}/launch")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> Launch(int id)
        => Ok(ApiResponse<CampaignDetailDto>.Ok(await _service.LaunchAsync(id)));

    /// <summary>Pause active campaign</summary>
    [HttpPost("{id:int}/pause")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> Pause(int id)
        => Ok(ApiResponse<CampaignDetailDto>.Ok(await _service.PauseAsync(id)));

    /// <summary>Resume paused campaign</summary>
    [HttpPost("{id:int}/resume")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> Resume(int id)
        => Ok(ApiResponse<CampaignDetailDto>.Ok(await _service.ResumeAsync(id)));

    /// <summary>Stop / cancel campaign</summary>
    [HttpPost("{id:int}/stop")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> Stop(int id)
        => Ok(ApiResponse<CampaignDetailDto>.Ok(await _service.StopAsync(id)));

    /// <summary>Duplicate a campaign</summary>
    [HttpPost("{id:int}/duplicate")]
    public async Task<IActionResult> Duplicate(int id)
        => Ok(ApiResponse<CampaignDetailDto>.Ok(await _service.DuplicateAsync(id)));

    /// <summary>Get campaign-specific stats</summary>
    [HttpGet("{id:int}/stats")]
    public async Task<IActionResult> GetStats(int id)
        => Ok(ApiResponse<CampaignDetailDto>.Ok(await _service.GetStatsAsync(id)));

    /// <summary>Get campaign recipients with pagination</summary>
    [HttpGet("{id:int}/recipients")]
    public async Task<IActionResult> GetRecipients(int id, [FromQuery] QueryParams q)
        => Ok(ApiResponse<PagedResult<RecipientDto>>.Ok(await _service.GetRecipientsAsync(id, q)));

    /// <summary>Add recipients to campaign</summary>
    [HttpPost("{id:int}/recipients")]
    public async Task<IActionResult> AddRecipients(int id, [FromBody] AddRecipientsDto dto)
    {
        await _service.AddRecipientsAsync(id, dto);
        return Ok(ApiResponse.Ok("Recipients added"));
    }

    /// <summary>Get email open/click metrics</summary>
    [HttpGet("{id:int}/email-metrics")]
    public async Task<IActionResult> GetEmailMetrics(int id)
        => Ok(ApiResponse<object>.Ok(await _service.GetEmailMetricsAsync(id)));

    /// <summary>Get SMS delivery metrics</summary>
    [HttpGet("{id:int}/sms-metrics")]
    public async Task<IActionResult> GetSmsMetrics(int id)
        => Ok(ApiResponse<object>.Ok(await _service.GetSmsMetricsAsync(id)));
}
