using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SanCRM.Application.Common;
using SanCRM.Application.DTOs;
using SanCRM.Application.Interfaces;

namespace SanCRM.API.Controllers;

/// <summary>
/// Activity Management — calls, meetings, emails, follow-ups, calendar
/// </summary>
[ApiController]
[Route("api/v1/activities")]
[Authorize]
[Produces("application/json")]
public class ActivitiesController : ControllerBase
{
    private readonly IActivitiesService _service;
    public ActivitiesController(IActivitiesService service) => _service = service;

    /// <summary>Get all activities with filters</summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PagedResult<ActivityListDto>>), 200)]
    public async Task<IActionResult> GetAll([FromQuery] ActivityQueryParams q)
        => Ok(ApiResponse<PagedResult<ActivityListDto>>.Ok(await _service.GetAllAsync(q)));

    /// <summary>Get activity stats</summary>
    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
        => Ok(ApiResponse<ActivityStatsDto>.Ok(await _service.GetStatsAsync()));

    /// <summary>Get calls list</summary>
    [HttpGet("calls")]
    public async Task<IActionResult> GetCalls([FromQuery] ActivityQueryParams q)
        => Ok(ApiResponse<PagedResult<ActivityListDto>>.Ok(await _service.GetCallsAsync(q)));

    /// <summary>Get meetings list</summary>
    [HttpGet("meetings")]
    public async Task<IActionResult> GetMeetings([FromQuery] ActivityQueryParams q)
        => Ok(ApiResponse<PagedResult<ActivityListDto>>.Ok(await _service.GetMeetingsAsync(q)));

    /// <summary>Get email logs list</summary>
    [HttpGet("emails")]
    public async Task<IActionResult> GetEmails([FromQuery] ActivityQueryParams q)
        => Ok(ApiResponse<PagedResult<ActivityListDto>>.Ok(await _service.GetEmailsAsync(q)));

    /// <summary>Get follow-ups list</summary>
    [HttpGet("follow-ups")]
    public async Task<IActionResult> GetFollowUps([FromQuery] ActivityQueryParams q)
        => Ok(ApiResponse<PagedResult<ActivityListDto>>.Ok(await _service.GetFollowUpsAsync(q)));

    /// <summary>Get pending reminders</summary>
    [HttpGet("reminders/pending")]
    public async Task<IActionResult> GetPendingReminders()
        => Ok(ApiResponse<IEnumerable<ActivityListDto>>.Ok(await _service.GetPendingRemindersAsync()));

    /// <summary>Get calendar events for a date range</summary>
    [HttpGet("calendar")]
    public async Task<IActionResult> GetCalendar([FromQuery] DateTime? from, [FromQuery] DateTime? to)
    {
        var start = from ?? DateTime.UtcNow.Date;
        var end = to ?? start.AddMonths(1);
        return Ok(ApiResponse<IEnumerable<CalendarEventDto>>.Ok(await _service.GetCalendarAsync(start, end)));
    }

    /// <summary>Send email and log it</summary>
    [HttpPost("send-email")]
    public async Task<IActionResult> SendEmail([FromBody] SendEmailDto dto)
        => Ok(ApiResponse<ActivityDetailDto>.Ok(await _service.SendEmailAsync(dto)));

    /// <summary>Log a call manually</summary>
    [HttpPost("log-call")]
    public async Task<IActionResult> LogCall([FromBody] LogCallDto dto)
        => Ok(ApiResponse<ActivityDetailDto>.Ok(await _service.LogCallAsync(dto)));

    /// <summary>Get single activity</summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<ActivityDetailDto>), 200)]
    public async Task<IActionResult> GetById(int id)
    {
        try { return Ok(ApiResponse<ActivityDetailDto>.Ok(await _service.GetByIdAsync(id))); }
        catch (KeyNotFoundException ex) { return NotFound(ApiResponse.Fail(ex.Message)); }
    }

    /// <summary>Create activity</summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateActivityDto dto)
        => Ok(ApiResponse<ActivityDetailDto>.Ok(await _service.CreateAsync(dto)));

    /// <summary>Update activity</summary>
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateActivityDto dto)
    {
        try { return Ok(ApiResponse<ActivityDetailDto>.Ok(await _service.UpdateAsync(id, dto))); }
        catch (KeyNotFoundException ex) { return NotFound(ApiResponse.Fail(ex.Message)); }
    }

    /// <summary>Delete activity</summary>
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _service.DeleteAsync(id);
        return Ok(ApiResponse.Ok("Activity deleted"));
    }

    /// <summary>Mark activity as completed</summary>
    [HttpPost("{id:int}/complete")]
    public async Task<IActionResult> Complete(int id, [FromBody] CompleteActivityDto dto)
        => Ok(ApiResponse<ActivityDetailDto>.Ok(await _service.CompleteAsync(id, dto)));

    /// <summary>Reschedule an activity</summary>
    [HttpPut("{id:int}/reschedule")]
    public async Task<IActionResult> Reschedule(int id, [FromBody] RescheduleDto dto)
        => Ok(ApiResponse<ActivityDetailDto>.Ok(await _service.RescheduleAsync(id, dto)));

    /// <summary>Set reminder for activity</summary>
    [HttpPost("{id:int}/reminder")]
    public async Task<IActionResult> SetReminder(int id, [FromBody] SetReminderDto dto)
    {
        await _service.SetReminderAsync(id, dto);
        return Ok(ApiResponse.Ok("Reminder set"));
    }
}
