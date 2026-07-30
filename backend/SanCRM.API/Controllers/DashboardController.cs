using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SanCRM.Application.Common;
using SanCRM.Application.DTOs;
using SanCRM.Domain.Enums;
using SanCRM.Infrastructure.Data;

namespace SanCRM.API.Controllers;

/// <summary>
/// Dashboard — KPI stats, revenue trends, pipeline summary, activity counts
/// </summary>
[ApiController]
[Route("api/v1/dashboard")]
[Authorize]
[Produces("application/json")]
public class DashboardController : ControllerBase
{
    private readonly CrmDbContext _db;
    public DashboardController(CrmDbContext db) => _db = db;

    /// <summary>Get all dashboard KPI numbers</summary>
    [HttpGet("stats")]
    [ProducesResponseType(typeof(ApiResponse<DashboardStatsDto>), 200)]
    public async Task<IActionResult> GetStats()
    {
        var now = DateTime.UtcNow;
        var monthStart = new DateTime(now.Year, now.Month, 1);
        var today = now.Date;

        var stats = new DashboardStatsDto
        {
            NewLeadsThisMonth = await _db.Leads
                .CountAsync(l => l.CreatedAt >= monthStart),

            ConversionsThisMonth = await _db.Leads
                .CountAsync(l => l.Status == LeadStatus.Converted && l.ConvertedAt >= monthStart),

            OpenOpportunities = await _db.Opportunities
                .CountAsync(o => o.Stage != OpportunityStage.ClosedWon && o.Stage != OpportunityStage.ClosedLost),

            WeightedPipeline = (decimal)(await _db.Opportunities
                .Where(o => o.Stage != OpportunityStage.ClosedWon && o.Stage != OpportunityStage.ClosedLost)
                .SumAsync(o => (double?)(o.Amount * o.Probability / 100)) ?? 0),

            RevenueThisMonth = await _db.Opportunities
                .Where(o => o.Stage == OpportunityStage.ClosedWon && o.ActualClose >= DateOnly.FromDateTime(monthStart))
                .SumAsync(o => (decimal?)o.Amount) ?? 0,

            OverdueFollowups = await _db.Followups
                .CountAsync(f => f.Status == FollowUpStatus.Pending && f.DueDate < now),

            ActiveCampaigns = await _db.Campaigns
                .CountAsync(c => c.Status == CampaignStatus.Active),

            PendingSignatures = await _db.DocumentSignatures
                .CountAsync(s => s.Status == SignatureStatus.Pending),

            CallsToday = await _db.Calls
                .CountAsync(c => c.CallDatetime >= today && c.CallDatetime < today.AddDays(1)),

            MeetingsToday = await _db.Meetings
                .CountAsync(m => m.StartDatetime >= today && m.StartDatetime < today.AddDays(1)),

            FollowupsToday = await _db.Followups
                .CountAsync(f => f.DueDate >= today && f.DueDate < today.AddDays(1) && f.Status == FollowUpStatus.Pending),

            EmailsSentToday = await _db.EmailLogs
                .CountAsync(e => e.SentAt >= today && e.SentAt < today.AddDays(1) && e.Direction == Direction.Outbound)
        };

        return Ok(ApiResponse<DashboardStatsDto>.Ok(stats));
    }

    /// <summary>Get monthly revenue trend for last 12 months</summary>
    [HttpGet("revenue-trend")]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<RevenueTrendDto>>), 200)]
    public async Task<IActionResult> GetRevenueTrend()
    {
        var since = DateOnly.FromDateTime(DateTime.UtcNow.AddMonths(-12));
        var data = await _db.Opportunities
            .Where(o => o.Stage == OpportunityStage.ClosedWon && o.ActualClose >= since)
            .GroupBy(o => new { o.ActualClose!.Value.Year, o.ActualClose!.Value.Month })
            .Select(g => new RevenueTrendDto
            {
                Month = $"{g.Key.Year}-{g.Key.Month:D2}",
                DealsClosed = g.Count(),
                Revenue = g.Sum(x => x.Amount)
            })
            .OrderBy(x => x.Month)
            .ToListAsync();

        return Ok(ApiResponse<IEnumerable<RevenueTrendDto>>.Ok(data));
    }

    /// <summary>Get lead source performance for last 90 days</summary>
    [HttpGet("lead-sources")]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<object>>), 200)]
    public async Task<IActionResult> GetLeadSources()
    {
        var since = DateTime.UtcNow.AddDays(-90);
        var data = await _db.Leads
            .Where(l => l.CreatedAt >= since)
            .GroupBy(l => l.Source)
            .Select(g => new
            {
                Source = g.Key.ToString(),
                Total = g.Count(),
                Converted = g.Count(l => l.Status == LeadStatus.Converted),
                AvgAiScore = g.Average(l => (double?)l.AiScore) ?? 0
            })
            .OrderByDescending(x => x.Total)
            .ToListAsync();

        return Ok(ApiResponse<IEnumerable<object>>.Ok(data));
    }

    /// <summary>Get pipeline summary by stage</summary>
    [HttpGet("pipeline-summary")]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<PipelineSummaryDto>>), 200)]
    public async Task<IActionResult> GetPipelineSummary()
    {
        var data = await _db.Opportunities
            .Where(o => o.Stage != OpportunityStage.ClosedWon && o.Stage != OpportunityStage.ClosedLost)
            .GroupBy(o => o.Stage)
            .Select(g => new PipelineSummaryDto
            {
                Stage = g.Key.ToString(),
                DealCount = g.Count(),
                TotalValue = g.Sum(o => o.Amount),
                WeightedValue = g.Sum(o => o.Amount * o.Probability / 100),
                AvgProbability = (decimal)(g.Average(o => (double?)o.Probability) ?? 0)
            })
            .ToListAsync();

        return Ok(ApiResponse<IEnumerable<PipelineSummaryDto>>.Ok(data));
    }

    /// <summary>Get today's activity counts</summary>
    [HttpGet("recent-activities")]
    [ProducesResponseType(typeof(ApiResponse<object>), 200)]
    public async Task<IActionResult> GetRecentActivities()
    {
        var since = DateTime.UtcNow.AddDays(-7);
        var calls = await _db.Calls
            .Include(c => c.AssignedToUser)
            .Where(c => c.CreatedAt >= since)
            .OrderByDescending(c => c.CallDatetime)
            .Take(10)
            .Select(c => new
            {
                Type = "Call",
                Subject = c.Subject,
                c.Status,
                When = c.CallDatetime,
                User = c.AssignedToUser!.FirstName + " " + c.AssignedToUser.LastName
            }).ToListAsync();

        var meetings = await _db.Meetings
            .Where(m => m.StartDatetime >= since)
            .OrderByDescending(m => m.StartDatetime)
            .Take(10)
            .Select(m => new
            {
                Type = "Meeting",
                Subject = m.Title,
                m.Status,
                When = m.StartDatetime,
                User = ""
            }).ToListAsync();

        var combined = calls.Cast<object>()
            .Concat(meetings.Cast<object>())
            .Take(15);

        return Ok(ApiResponse<object>.Ok(combined));
    }
}
