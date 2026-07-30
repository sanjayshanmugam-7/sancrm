using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SanCRM.Application.Common;
using SanCRM.Application.DTOs;
using SanCRM.Application.Interfaces;

namespace SanCRM.API.Controllers;

/// <summary>
/// Opportunity / Deal Management — pipeline, stage tracking, forecasting
/// </summary>
[ApiController]
[Route("api/v1/opportunities")]
[Authorize]
[Produces("application/json")]
public class OpportunitiesController : ControllerBase
{
    private readonly IOpportunitiesService _service;
    public OpportunitiesController(IOpportunitiesService service) => _service = service;

    /// <summary>Get paginated opportunities</summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PagedResult<OpportunityListDto>>), 200)]
    public async Task<IActionResult> GetAll([FromQuery] OpportunityQueryParams q)
        => Ok(ApiResponse<PagedResult<OpportunityListDto>>.Ok(await _service.GetAllAsync(q)));

    /// <summary>Get opportunity stats</summary>
    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
        => Ok(ApiResponse<OpportunityStatsDto>.Ok(await _service.GetStatsAsync()));

    /// <summary>Get pipeline stage summary for Kanban board</summary>
    [HttpGet("pipeline-stats")]
    public async Task<IActionResult> GetPipelineStats()
        => Ok(ApiResponse<PipelineStatsDto>.Ok(await _service.GetPipelineStatsAsync()));

    /// <summary>Get revenue forecast</summary>
    [HttpGet("forecast")]
    public async Task<IActionResult> GetForecast([FromQuery] OpportunityQueryParams q)
        => Ok(ApiResponse<ForecastDto>.Ok(await _service.GetForecastAsync(q)));

    /// <summary>Export opportunities to CSV</summary>
    [HttpGet("export")]
    public async Task<IActionResult> Export([FromQuery] OpportunityQueryParams q)
    {
        var bytes = await _service.ExportAsync(q);
        return File(bytes, "text/csv", $"opportunities_{DateTime.UtcNow:yyyyMMdd}.csv");
    }

    /// <summary>Get single opportunity</summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<OpportunityDetailDto>), 200)]
    public async Task<IActionResult> GetById(int id)
    {
        try { return Ok(ApiResponse<OpportunityDetailDto>.Ok(await _service.GetByIdAsync(id))); }
        catch (KeyNotFoundException ex) { return NotFound(ApiResponse.Fail(ex.Message)); }
    }

    /// <summary>Create opportunity</summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateOpportunityDto dto)
        => Ok(ApiResponse<OpportunityDetailDto>.Ok(await _service.CreateAsync(dto)));

    /// <summary>Update opportunity</summary>
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateOpportunityDto dto)
    {
        try { return Ok(ApiResponse<OpportunityDetailDto>.Ok(await _service.UpdateAsync(id, dto))); }
        catch (KeyNotFoundException ex) { return NotFound(ApiResponse.Fail(ex.Message)); }
    }

    /// <summary>Delete opportunity</summary>
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> Delete(int id)
    {
        await _service.DeleteAsync(id);
        return Ok(ApiResponse.Ok("Opportunity deleted"));
    }

    /// <summary>Move opportunity to a new pipeline stage</summary>
    [HttpPut("{id:int}/stage")]
    public async Task<IActionResult> UpdateStage(int id, [FromBody] UpdateStageDto dto)
        => Ok(ApiResponse<OpportunityDetailDto>.Ok(await _service.UpdateStageAsync(id, dto)));

    /// <summary>Get activities for opportunity</summary>
    [HttpGet("{id:int}/activities")]
    public async Task<IActionResult> GetActivities(int id)
        => Ok(ApiResponse<IEnumerable<ActivityListDto>>.Ok(await _service.GetActivitiesAsync(id)));

    /// <summary>Get notes for opportunity</summary>
    [HttpGet("{id:int}/notes")]
    public async Task<IActionResult> GetNotes(int id)
        => Ok(ApiResponse<IEnumerable<NoteDto>>.Ok(await _service.GetNotesAsync(id)));

    /// <summary>Add note to opportunity</summary>
    [HttpPost("{id:int}/notes")]
    public async Task<IActionResult> AddNote(int id, [FromBody] CreateNoteDto dto)
        => Ok(ApiResponse<NoteDto>.Ok(await _service.AddNoteAsync(id, dto)));

    /// <summary>Get documents linked to opportunity</summary>
    [HttpGet("{id:int}/documents")]
    public async Task<IActionResult> GetDocuments(int id)
        => Ok(ApiResponse<IEnumerable<DocumentListDto>>.Ok(await _service.GetDocumentsAsync(id)));

    /// <summary>Get full activity timeline for opportunity</summary>
    [HttpGet("{id:int}/timeline")]
    public async Task<IActionResult> GetTimeline(int id)
        => Ok(ApiResponse<IEnumerable<object>>.Ok(await _service.GetTimelineAsync(id)));

    /// <summary>Get stage change history for opportunity</summary>
    [HttpGet("{id:int}/stage-history")]
    public async Task<IActionResult> GetStageHistory(int id)
        => Ok(ApiResponse<IEnumerable<StageHistoryDto>>.Ok(await _service.GetStageHistoryAsync(id)));

    /// <summary>Get AI win probability prediction for opportunity</summary>
    [HttpGet("{id:int}/ai-prediction")]
    public async Task<IActionResult> GetAiPrediction(int id)
        => Ok(ApiResponse<AiPredictionDto>.Ok(await _service.GetAiPredictionAsync(id)));
}
