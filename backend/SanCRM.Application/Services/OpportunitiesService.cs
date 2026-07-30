using System.Text;
using Microsoft.EntityFrameworkCore;
using SanCRM.Application.Common;
using SanCRM.Application.DTOs;
using SanCRM.Application.Interfaces;
using SanCRM.Domain.Entities;
using SanCRM.Domain.Enums;
using SanCRM.Infrastructure.Data;

namespace SanCRM.Application.Services;

public class OpportunitiesService : IOpportunitiesService
{
    private readonly CrmDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly IAuditService _audit;

    public OpportunitiesService(CrmDbContext db, ICurrentUserService currentUser, IAuditService audit)
    { _db = db; _currentUser = currentUser; _audit = audit; }

    public async Task<PagedResult<OpportunityListDto>> GetAllAsync(OpportunityQueryParams q)
    {
        var query = _db.Opportunities
            .Include(o => o.Company).Include(o => o.Contact).Include(o => o.AssignedToUser)
            .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(q.Search))
            query = query.Where(o => o.Title.Contains(q.Search) || o.OppNo.Contains(q.Search) || o.Company.Name.Contains(q.Search));

        if (!string.IsNullOrWhiteSpace(q.Stage) && Enum.TryParse<OpportunityStage>(q.Stage.Replace(" ", ""), true, out var stage))
            query = query.Where(o => o.Stage == stage);

        if (q.AssignedTo.HasValue) query = query.Where(o => o.AssignedTo == q.AssignedTo.Value);
        if (q.CompanyId.HasValue) query = query.Where(o => o.CompanyId == q.CompanyId.Value);
        if (q.CloseDateFrom.HasValue) query = query.Where(o => o.ExpectedClose >= DateOnly.FromDateTime(q.CloseDateFrom.Value));
        if (q.CloseDateTo.HasValue) query = query.Where(o => o.ExpectedClose <= DateOnly.FromDateTime(q.CloseDateTo.Value));

        var total = await query.CountAsync();
        var items = await query.OrderBy(o => o.ExpectedClose)
            .Skip((q.Page - 1) * q.PageSize).Take(q.PageSize).ToListAsync();

        return new PagedResult<OpportunityListDto>
        { Data = items.Select(MapToListDto), Total = total, Page = q.Page, PageSize = q.PageSize };
    }

    public async Task<OpportunityDetailDto> GetByIdAsync(int id)
    {
        var o = await _db.Opportunities
            .Include(x => x.Company).Include(x => x.Contact).Include(x => x.AssignedToUser)
            .Include(x => x.StageHistory).ThenInclude(h => h.ChangedByUser)
            .AsNoTracking().FirstOrDefaultAsync(x => x.Id == id)
            ?? throw new KeyNotFoundException($"Opportunity {id} not found.");

        var dto = new OpportunityDetailDto
        {
            Id = o.Id, OppNo = o.OppNo, Title = o.Title, Stage = o.Stage.ToString(),
            Amount = o.Amount, Currency = o.Currency, Probability = o.Probability,
            WeightedValue = Math.Round(o.Amount * o.Probability / 100, 2),
            ExpectedClose = o.ExpectedClose?.ToString("yyyy-MM-dd"),
            ActualClose = o.ActualClose?.ToString("yyyy-MM-dd"),
            Company = o.Company?.Name, CompanyId = o.CompanyId,
            ContactName = o.Contact?.FullName, ContactId = o.ContactId, LeadId = o.LeadId,
            AssignedTo = o.AssignedToUser?.FullName, AssignedToId = o.AssignedTo,
            LostReason = o.LostReason, LostTo = o.LostTo, Source = o.Source,
            Type = o.Type, Description = o.Description, NextStep = o.NextStep,
            AiPrediction = o.AiPrediction, CreatedAt = o.CreatedAt,
            StageHistory = o.StageHistory.Select(h => new StageHistoryDto
            {
                FromStage = h.FromStage, ToStage = h.ToStage,
                ChangedBy = h.ChangedByUser?.FullName, Notes = h.Notes, ChangedAt = h.ChangedAt
            }).OrderByDescending(h => h.ChangedAt).ToList()
        };
        return dto;
    }

    public async Task<OpportunityDetailDto> CreateAsync(CreateOpportunityDto dto)
    {
        var oppNo = await GenerateOppNoAsync();
        DateOnly? expClose = null;
        if (!string.IsNullOrEmpty(dto.ExpectedClose) && DateOnly.TryParse(dto.ExpectedClose, out var d)) expClose = d;

        var opp = new Opportunity
        {
            OppNo = oppNo, Title = dto.Title, CompanyId = dto.CompanyId,
            ContactId = dto.ContactId, LeadId = dto.LeadId,
            AssignedTo = dto.AssignedTo ?? _currentUser.UserId,
            Stage = Enum.Parse<OpportunityStage>(dto.Stage.Replace(" ", ""), true),
            Amount = dto.Amount, Currency = dto.Currency, Probability = dto.Probability,
            ExpectedClose = expClose, Source = dto.Source, Type = dto.Type,
            Description = dto.Description, NextStep = dto.NextStep,
            CreatedBy = _currentUser.UserId
        };
        _db.Opportunities.Add(opp);
        await _db.SaveChangesAsync();

        _db.OpportunityStageHistories.Add(new OpportunityStageHistory
        {
            OpportunityId = opp.Id, FromStage = null, ToStage = opp.Stage.ToString(),
            ChangedBy = _currentUser.UserId, Notes = "Created"
        });
        await _db.SaveChangesAsync();

        await _audit.LogAsync(AuditAction.Create, "Opportunity", opp.Id);
        return await GetByIdAsync(opp.Id);
    }

    public async Task<OpportunityDetailDto> UpdateAsync(int id, UpdateOpportunityDto dto)
    {
        var opp = await _db.Opportunities.FindAsync(id) ?? throw new KeyNotFoundException();
        var oldStage = opp.Stage;

        opp.Title = dto.Title; opp.CompanyId = dto.CompanyId; opp.ContactId = dto.ContactId;
        opp.AssignedTo = dto.AssignedTo; opp.Amount = dto.Amount; opp.Currency = dto.Currency;
        opp.Probability = dto.Probability; opp.Source = dto.Source; opp.Type = dto.Type;
        opp.Description = dto.Description; opp.NextStep = dto.NextStep;
        opp.LostReason = dto.LostReason; opp.LostTo = dto.LostTo;

        if (!string.IsNullOrWhiteSpace(dto.ExpectedClose) && DateOnly.TryParse(dto.ExpectedClose, out var ec)) opp.ExpectedClose = ec;
        if (!string.IsNullOrWhiteSpace(dto.ActualClose) && DateOnly.TryParse(dto.ActualClose, out var ac)) opp.ActualClose = ac;

        var newStage = Enum.Parse<OpportunityStage>(dto.Stage.Replace(" ", ""), true);
        if (newStage != oldStage)
        {
            opp.Stage = newStage;
            _db.OpportunityStageHistories.Add(new OpportunityStageHistory
            {
                OpportunityId = id, FromStage = oldStage.ToString(), ToStage = newStage.ToString(),
                ChangedBy = _currentUser.UserId
            });
        }
        opp.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        await _audit.LogAsync(AuditAction.Update, "Opportunity", id);
        return await GetByIdAsync(id);
    }

    public async Task DeleteAsync(int id)
    {
        var o = await _db.Opportunities.FindAsync(id) ?? throw new KeyNotFoundException();
        _db.Opportunities.Remove(o);
        await _db.SaveChangesAsync();
        await _audit.LogAsync(AuditAction.Delete, "Opportunity", id);
    }

    public async Task<OpportunityDetailDto> UpdateStageAsync(int id, UpdateStageDto dto)
    {
        var opp = await _db.Opportunities.FindAsync(id) ?? throw new KeyNotFoundException();
        var oldStage = opp.Stage;
        var newStage = Enum.Parse<OpportunityStage>(dto.Stage.Replace(" ", ""), true);

        opp.Stage = newStage;
        if (newStage == OpportunityStage.ClosedLost) { opp.LostReason = dto.LostReason; opp.LostTo = dto.LostTo; opp.ActualClose = DateOnly.FromDateTime(DateTime.UtcNow); }
        if (newStage == OpportunityStage.ClosedWon) opp.ActualClose = DateOnly.FromDateTime(DateTime.UtcNow);
        opp.UpdatedAt = DateTime.UtcNow;

        _db.OpportunityStageHistories.Add(new OpportunityStageHistory
        {
            OpportunityId = id, FromStage = oldStage.ToString(), ToStage = newStage.ToString(),
            ChangedBy = _currentUser.UserId, Notes = dto.Notes
        });
        await _db.SaveChangesAsync();
        return await GetByIdAsync(id);
    }

    public async Task<IEnumerable<ActivityListDto>> GetActivitiesAsync(int id)
    {
        var calls = await _db.Calls.Where(c => c.EntityType == EntityType.Opportunity && c.EntityId == id)
            .Select(c => new ActivityListDto { Id = c.Id, Type = "Call", Subject = c.Subject, Status = c.Status.ToString(), ScheduledAt = c.CallDatetime, EntityType = "Opportunity", EntityId = id, CreatedAt = c.CreatedAt }).ToListAsync();
        var followups = await _db.Followups.Where(f => f.EntityType == EntityType.Opportunity && f.EntityId == id)
            .Select(f => new ActivityListDto { Id = f.Id, Type = "FollowUp", Subject = f.Subject, Status = f.Status.ToString(), ScheduledAt = f.DueDate, EntityType = "Opportunity", EntityId = id, CreatedAt = f.CreatedAt }).ToListAsync();
        return calls.Concat(followups).OrderByDescending(a => a.ScheduledAt ?? a.CreatedAt);
    }

    public async Task<IEnumerable<NoteDto>> GetNotesAsync(int id)
    {
        return await _db.Notes.Where(n => n.EntityType == EntityType.Opportunity && n.EntityId == id)
            .OrderByDescending(n => n.IsPinned).ThenByDescending(n => n.CreatedAt).AsNoTracking()
            .Select(n => new NoteDto { Id = n.Id, Title = n.Title, Content = n.Content, IsPinned = n.IsPinned, CreatedAt = n.CreatedAt, UpdatedAt = n.UpdatedAt })
            .ToListAsync();
    }

    public async Task<NoteDto> AddNoteAsync(int id, CreateNoteDto dto)
    {
        var note = new Note { EntityType = EntityType.Opportunity, EntityId = id, Title = dto.Title, Content = dto.Content, IsPinned = dto.IsPinned, CreatedBy = _currentUser.UserId };
        _db.Notes.Add(note);
        await _db.SaveChangesAsync();
        return new NoteDto { Id = note.Id, Title = note.Title, Content = note.Content, CreatedAt = note.CreatedAt, UpdatedAt = note.UpdatedAt };
    }

    public async Task<IEnumerable<DocumentListDto>> GetDocumentsAsync(int id)
    {
        return await _db.Documents.Where(d => d.OpportunityId == id)
            .Select(d => new DocumentListDto { Id = d.Id, DocNo = d.DocNo, DocType = d.DocType.ToString(), Title = d.Title, Status = d.Status.ToString(), Value = d.Value, CreatedAt = d.CreatedAt })
            .ToListAsync();
    }

    public async Task<IEnumerable<object>> GetTimelineAsync(int id)
    {
        var history = await _db.OpportunityStageHistories
            .Where(h => h.OpportunityId == id).Include(h => h.ChangedByUser)
            .OrderByDescending(h => h.ChangedAt).AsNoTracking()
            .Select(h => (object)new { Type = "StageChange", h.FromStage, h.ToStage, By = h.ChangedByUser!.FirstName, h.Notes, At = h.ChangedAt })
            .ToListAsync();
        var notes = await _db.Notes.Where(n => n.EntityType == EntityType.Opportunity && n.EntityId == id)
            .AsNoTracking().Select(n => (object)new { Type = "Note", n.Title, n.Content, At = n.CreatedAt })
            .ToListAsync();
        return history.Concat(notes).OrderByDescending(x => ((dynamic)x).At);
    }

    public async Task<PipelineStatsDto> GetPipelineStatsAsync()
    {
        var open = await _db.Opportunities
            .Where(o => o.Stage != OpportunityStage.ClosedWon && o.Stage != OpportunityStage.ClosedLost)
            .GroupBy(o => o.Stage)
            .Select(g => new PipelineStageSummaryDto
            {
                Stage = g.Key.ToString(), Count = g.Count(),
                TotalValue = g.Sum(o => o.Amount),
                WeightedValue = g.Sum(o => o.Amount * o.Probability / 100),
                AvgProbability = (decimal)(g.Average(o => (double?)o.Probability) ?? 0)
            }).ToListAsync();

        var wonQ = await _db.Opportunities.Where(o => o.Stage == OpportunityStage.ClosedWon || o.Stage == OpportunityStage.ClosedLost).CountAsync();
        var won = await _db.Opportunities.CountAsync(o => o.Stage == OpportunityStage.ClosedWon);

        return new PipelineStatsDto
        {
            Stages = open,
            TotalPipelineValue = open.Sum(s => s.TotalValue),
            WeightedPipelineValue = open.Sum(s => s.WeightedValue),
            TotalDeals = open.Sum(s => s.Count),
            WinRate = wonQ > 0 ? Math.Round((decimal)won / wonQ * 100, 1) : 0,
            AvgDealSize = open.Sum(s => s.Count) > 0 ? Math.Round(open.Sum(s => s.TotalValue) / open.Sum(s => s.Count), 2) : 0
        };
    }

    public async Task<AiPredictionDto> GetAiPredictionAsync(int id)
    {
        var opp = await _db.Opportunities.FindAsync(id) ?? throw new KeyNotFoundException();
        // Simple heuristic model
        var baseProbability = (decimal)opp.Probability;
        var factors = new List<string>();
        if (opp.Amount > 1_000_000) factors.Add("High value deal — needs executive sponsor");
        if (opp.ExpectedClose.HasValue && opp.ExpectedClose.Value < DateOnly.FromDateTime(DateTime.UtcNow.AddDays(30)))
            factors.Add("Closing soon — prioritize follow-up");
        if (opp.Stage == OpportunityStage.Proposal) { baseProbability += 5; factors.Add("Proposal stage shows intent"); }
        if (opp.Stage == OpportunityStage.Negotiation) { baseProbability += 10; factors.Add("In negotiation — high chance"); }
        baseProbability = Math.Min(99, Math.Max(1, baseProbability));

        return new AiPredictionDto
        {
            WinProbability = baseProbability,
            ExpectedRevenue = Math.Round(opp.Amount * baseProbability / 100, 2),
            Recommendation = baseProbability >= 70 ? "Strong opportunity — prioritize resources" : baseProbability >= 40 ? "Moderate probability — schedule discovery call" : "Low probability — reassess qualification criteria",
            KeyFactors = factors.Count > 0 ? factors : new List<string> { "Standard opportunity — follow sales process" }
        };
    }

    public async Task<ForecastDto> GetForecastAsync(OpportunityQueryParams q)
    {
        var opps = await _db.Opportunities.Include(o => o.Company).Include(o => o.AssignedToUser)
            .Where(o => o.Stage != OpportunityStage.ClosedWon && o.Stage != OpportunityStage.ClosedLost)
            .AsNoTracking().ToListAsync();

        return new ForecastDto
        {
            Period = $"{DateTime.UtcNow:yyyy-MM}",
            CommittedRevenue = opps.Where(o => o.Probability >= 90).Sum(o => o.Amount),
            BestCase = opps.Where(o => o.Probability >= 60).Sum(o => o.Amount),
            Pipeline = opps.Sum(o => o.Amount * o.Probability / 100),
            Deals = opps.Select(o => new ForecastItemDto
            {
                Id = o.Id, Title = o.Title, Company = o.Company?.Name ?? "", Amount = o.Amount,
                Probability = o.Probability, WeightedValue = Math.Round(o.Amount * o.Probability / 100, 2),
                Stage = o.Stage.ToString(), ExpectedClose = o.ExpectedClose?.ToString("yyyy-MM-dd"),
                AssignedTo = o.AssignedToUser?.FullName
            }).ToList()
        };
    }

    public async Task<byte[]> ExportAsync(OpportunityQueryParams q)
    {
        q.PageSize = 10000;
        var result = await GetAllAsync(q);
        var sb = new StringBuilder();
        sb.AppendLine("OppNo,Title,Company,Stage,Amount,Probability,WeightedValue,ExpectedClose,AssignedTo");
        foreach (var o in result.Data)
            sb.AppendLine($"{o.OppNo},{o.Title},{o.Company},{o.Stage},{o.Amount},{o.Probability},{o.WeightedValue},{o.ExpectedClose},{o.AssignedTo}");
        return Encoding.UTF8.GetBytes(sb.ToString());
    }

    public async Task<OpportunityStatsDto> GetStatsAsync()
    {
        var now = DateOnly.FromDateTime(DateTime.UtcNow);
        var monthStart = new DateOnly(now.Year, now.Month, 1);
        var total = await _db.Opportunities.CountAsync();
        var won = await _db.Opportunities.CountAsync(o => o.Stage == OpportunityStage.ClosedWon);
        var lost = await _db.Opportunities.CountAsync(o => o.Stage == OpportunityStage.ClosedLost);
        var closedTotal = won + lost;
        return new OpportunityStatsDto
        {
            Total = total,
            Open = total - won - lost,
            ClosedWon = won,
            ClosedLost = lost,
            TotalRevenue = await _db.Opportunities.Where(o => o.Stage == OpportunityStage.ClosedWon).SumAsync(o => (decimal?)o.Amount) ?? 0,
            WeightedPipeline = (decimal)(await _db.Opportunities.Where(o => o.Stage != OpportunityStage.ClosedWon && o.Stage != OpportunityStage.ClosedLost).SumAsync(o => (double?)(o.Amount * o.Probability / 100)) ?? 0),
            WinRate = closedTotal > 0 ? Math.Round((decimal)won / closedTotal * 100, 1) : 0
        };
    }

    public async Task<IEnumerable<StageHistoryDto>> GetStageHistoryAsync(int id)
    {
        return await _db.OpportunityStageHistories
            .Where(h => h.OpportunityId == id).Include(h => h.ChangedByUser)
            .OrderBy(h => h.ChangedAt).AsNoTracking()
            .Select(h => new StageHistoryDto { FromStage = h.FromStage, ToStage = h.ToStage, ChangedBy = h.ChangedByUser!.FirstName + " " + h.ChangedByUser.LastName, Notes = h.Notes, ChangedAt = h.ChangedAt })
            .ToListAsync();
    }

    private async Task<string> GenerateOppNoAsync()
    {
        var year = DateTime.UtcNow.Year;
        var count = await _db.Opportunities.CountAsync(o => o.CreatedAt.Year == year);
        return $"OPP-{year}-{(count + 1):D4}";
    }

    private static OpportunityListDto MapToListDto(Opportunity o) => new()
    {
        Id = o.Id, OppNo = o.OppNo, Title = o.Title, Stage = o.Stage.ToString(),
        Amount = o.Amount, Currency = o.Currency, Probability = o.Probability,
        WeightedValue = Math.Round(o.Amount * o.Probability / 100, 2),
        ExpectedClose = o.ExpectedClose?.ToString("yyyy-MM-dd"),
        Company = o.Company?.Name, CompanyId = o.CompanyId,
        ContactName = o.Contact?.FullName,
        AssignedTo = o.AssignedToUser?.FullName, AssignedToId = o.AssignedTo,
        CreatedAt = o.CreatedAt
    };
}
