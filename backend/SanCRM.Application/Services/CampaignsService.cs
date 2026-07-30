using Microsoft.EntityFrameworkCore;
using SanCRM.Application.Common;
using SanCRM.Application.DTOs;
using SanCRM.Application.Interfaces;
using SanCRM.Domain.Entities;
using SanCRM.Domain.Enums;
using SanCRM.Infrastructure.Data;

namespace SanCRM.Application.Services;

public class CampaignsService : ICampaignsService
{
    private readonly CrmDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly IAuditService _audit;

    public CampaignsService(CrmDbContext db, ICurrentUserService currentUser, IAuditService audit)
    { _db = db; _currentUser = currentUser; _audit = audit; }

    public async Task<PagedResult<CampaignListDto>> GetAllAsync(CampaignQueryParams q)
    {
        var query = _db.Campaigns.Include(c => c.Stats).Include(c => c.CreatedByUser).AsNoTracking();
        if (!string.IsNullOrWhiteSpace(q.Search)) query = query.Where(c => c.Name.Contains(q.Search));
        if (!string.IsNullOrWhiteSpace(q.Type) && Enum.TryParse<CampaignType>(q.Type, true, out var ct)) query = query.Where(c => c.Type == ct);
        if (!string.IsNullOrWhiteSpace(q.Status) && Enum.TryParse<CampaignStatus>(q.Status, true, out var cs)) query = query.Where(c => c.Status == cs);
        var total = await query.CountAsync();
        var items = await query.OrderByDescending(c => c.CreatedAt).Skip((q.Page - 1) * q.PageSize).Take(q.PageSize).ToListAsync();
        return new PagedResult<CampaignListDto> { Data = items.Select(MapToListDto), Total = total, Page = q.Page, PageSize = q.PageSize };
    }

    public async Task<CampaignDetailDto> GetByIdAsync(int id)
    {
        var c = await _db.Campaigns.Include(x => x.Stats).Include(x => x.CreatedByUser)
            .AsNoTracking().FirstOrDefaultAsync(x => x.Id == id)
            ?? throw new KeyNotFoundException($"Campaign {id} not found.");
        return MapToDetailDto(c);
    }

    public async Task<CampaignDetailDto> CreateAsync(CreateCampaignDto dto)
    {
        var campaign = new Campaign
        {
            Name = dto.Name, Type = Enum.Parse<CampaignType>(dto.Type, true),
            Objective = dto.Objective, AudienceType = dto.AudienceType, Budget = dto.Budget,
            ScheduledAt = dto.ScheduledAt, CreatedBy = _currentUser.UserId
        };
        if (!string.IsNullOrEmpty(dto.StartDate) && DateOnly.TryParse(dto.StartDate, out var sd)) campaign.StartDate = sd;
        if (!string.IsNullOrEmpty(dto.EndDate) && DateOnly.TryParse(dto.EndDate, out var ed)) campaign.EndDate = ed;

        _db.Campaigns.Add(campaign);
        await _db.SaveChangesAsync();
        _db.CampaignStats.Add(new CampaignStats { CampaignId = campaign.Id });
        await _db.SaveChangesAsync();
        await _audit.LogAsync(AuditAction.Create, "Campaign", campaign.Id);
        return await GetByIdAsync(campaign.Id);
    }

    public async Task<CampaignDetailDto> UpdateAsync(int id, UpdateCampaignDto dto)
    {
        var campaign = await _db.Campaigns.FindAsync(id) ?? throw new KeyNotFoundException();
        campaign.Name = dto.Name; campaign.Objective = dto.Objective; campaign.AudienceType = dto.AudienceType;
        campaign.Budget = dto.Budget; campaign.ScheduledAt = dto.ScheduledAt;
        if (!string.IsNullOrWhiteSpace(dto.Status) && Enum.TryParse<CampaignStatus>(dto.Status, true, out var st)) campaign.Status = st;
        if (dto.Spent.HasValue) campaign.Spent = dto.Spent.Value;
        if (dto.Revenue.HasValue) campaign.Revenue = dto.Revenue.Value;
        campaign.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return await GetByIdAsync(id);
    }

    public async Task DeleteAsync(int id)
    {
        var c = await _db.Campaigns.FindAsync(id) ?? throw new KeyNotFoundException();
        if (c.Status == CampaignStatus.Active) throw new InvalidOperationException("Cannot delete an active campaign. Stop it first.");
        _db.Campaigns.Remove(c);
        await _db.SaveChangesAsync();
    }

    public async Task<CampaignDetailDto> LaunchAsync(int id)
    {
        var c = await _db.Campaigns.FindAsync(id) ?? throw new KeyNotFoundException();
        if (c.Status == CampaignStatus.Active) throw new InvalidOperationException("Campaign is already active.");
        c.Status = CampaignStatus.Active; c.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return await GetByIdAsync(id);
    }

    public async Task<CampaignDetailDto> PauseAsync(int id)
    {
        var c = await _db.Campaigns.FindAsync(id) ?? throw new KeyNotFoundException();
        if (c.Status != CampaignStatus.Active) throw new InvalidOperationException("Only active campaigns can be paused.");
        c.Status = CampaignStatus.Paused; c.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return await GetByIdAsync(id);
    }

    public async Task<CampaignDetailDto> ResumeAsync(int id)
    {
        var c = await _db.Campaigns.FindAsync(id) ?? throw new KeyNotFoundException();
        if (c.Status != CampaignStatus.Paused) throw new InvalidOperationException("Only paused campaigns can be resumed.");
        c.Status = CampaignStatus.Active; c.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return await GetByIdAsync(id);
    }

    public async Task<CampaignDetailDto> StopAsync(int id)
    {
        var c = await _db.Campaigns.FindAsync(id) ?? throw new KeyNotFoundException();
        c.Status = CampaignStatus.Cancelled; c.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return await GetByIdAsync(id);
    }

    public async Task<CampaignDetailDto> DuplicateAsync(int id)
    {
        var source = await _db.Campaigns.Include(c => c.Stats).AsNoTracking().FirstOrDefaultAsync(c => c.Id == id)
            ?? throw new KeyNotFoundException();
        var copy = new Campaign
        {
            Name = $"{source.Name} (Copy)", Type = source.Type, Status = CampaignStatus.Draft,
            Objective = source.Objective, AudienceType = source.AudienceType, Budget = source.Budget,
            CreatedBy = _currentUser.UserId
        };
        _db.Campaigns.Add(copy);
        await _db.SaveChangesAsync();
        _db.CampaignStats.Add(new CampaignStats { CampaignId = copy.Id });
        await _db.SaveChangesAsync();
        return await GetByIdAsync(copy.Id);
    }

    public async Task<CampaignDetailDto> GetStatsAsync(int id) => await GetByIdAsync(id);

    public async Task<PagedResult<RecipientDto>> GetRecipientsAsync(int id, QueryParams q)
    {
        var query = _db.CampaignRecipients.Where(r => r.CampaignId == id);
        var total = await query.CountAsync();
        var items = await query.Skip((q.Page - 1) * q.PageSize).Take(q.PageSize).ToListAsync();
        return new PagedResult<RecipientDto>
        {
            Data = items.Select(r => new RecipientDto { Id = r.Id, EntityType = r.EntityType.ToString(), EntityId = r.EntityId, Email = r.Email, Phone = r.Phone, Status = r.Status.ToString(), SentAt = r.SentAt, OpenedAt = r.OpenedAt }),
            Total = total, Page = q.Page, PageSize = q.PageSize
        };
    }

    public async Task AddRecipientsAsync(int id, AddRecipientsDto dto)
    {
        var entityType = Enum.Parse<EntityType>(dto.EntityType, true);
        if (dto.EntityIds != null)
        {
            foreach (var eid in dto.EntityIds)
            {
                if (!await _db.CampaignRecipients.AnyAsync(r => r.CampaignId == id && r.EntityId == eid && r.EntityType == entityType))
                {
                    string? email = entityType == EntityType.Contact
                        ? (await _db.Contacts.FindAsync(eid))?.Email
                        : (await _db.Leads.FindAsync(eid))?.Email;
                    _db.CampaignRecipients.Add(new CampaignRecipient { CampaignId = id, EntityType = entityType, EntityId = eid, Email = email });
                }
            }
        }
        var campaign = await _db.Campaigns.FindAsync(id);
        if (campaign != null) campaign.TotalRecipients = await _db.CampaignRecipients.CountAsync(r => r.CampaignId == id);
        await _db.SaveChangesAsync();
    }

    public Task<IEnumerable<CampaignTemplateDto>> GetTemplatesAsync(string? type)
        => Task.FromResult<IEnumerable<CampaignTemplateDto>>(new List<CampaignTemplateDto>());

    public Task<CampaignTemplateDto> CreateTemplateAsync(CampaignTemplateDto dto)
        => Task.FromResult(dto);

    public Task SendTestEmailAsync(TestEmailDto dto) => Task.CompletedTask;
    public Task SendTestSmsAsync(TestSmsDto dto) => Task.CompletedTask;

    public async Task<object> GetEmailMetricsAsync(int id)
    {
        var stats = await _db.CampaignStats.FirstOrDefaultAsync(s => s.CampaignId == id);
        return new { stats?.Sent, stats?.Delivered, stats?.Opened, stats?.Clicked, stats?.Bounced, OpenRate = stats?.Delivered > 0 ? Math.Round((decimal)stats.Opened / stats.Delivered * 100, 1) : 0 };
    }

    public async Task<object> GetSmsMetricsAsync(int id)
    {
        var stats = await _db.CampaignStats.FirstOrDefaultAsync(s => s.CampaignId == id);
        return new { stats?.Sent, stats?.Delivered, stats?.Failed, DeliveryRate = stats?.Sent > 0 ? Math.Round((decimal)(stats?.Delivered ?? 0) / stats!.Sent * 100, 1) : 0 };
    }

    public async Task<CampaignStatsDto> GetOverallStatsAsync()
    {
        return new CampaignStatsDto
        {
            TotalCampaigns = await _db.Campaigns.CountAsync(),
            ActiveCampaigns = await _db.Campaigns.CountAsync(c => c.Status == CampaignStatus.Active),
            DraftCampaigns = await _db.Campaigns.CountAsync(c => c.Status == CampaignStatus.Draft),
            TotalBudget = await _db.Campaigns.SumAsync(c => (decimal?)c.Budget) ?? 0,
            TotalSpent = await _db.Campaigns.SumAsync(c => (decimal?)c.Spent) ?? 0,
            TotalRevenue = await _db.Campaigns.SumAsync(c => (decimal?)c.Revenue) ?? 0,
            ByType = await _db.Campaigns.GroupBy(c => c.Type).ToDictionaryAsync(g => g.Key.ToString(), g => g.Count()),
            ByStatus = await _db.Campaigns.GroupBy(c => c.Status).ToDictionaryAsync(g => g.Key.ToString(), g => g.Count())
        };
    }

    private static CampaignListDto MapToListDto(Campaign c)
    {
        var s = c.Stats;
        var openRate = s?.Delivered > 0 ? Math.Round((decimal)s.Opened / s.Delivered * 100, 1) : 0;
        var ctr = s?.Opened > 0 ? Math.Round((decimal)s.Clicked / s.Opened * 100, 1) : 0;
        var convRate = s?.Clicked > 0 ? Math.Round((decimal)s.Converted / s.Clicked * 100, 1) : 0;
        return new CampaignListDto
        {
            Id = c.Id, Name = c.Name, Type = c.Type.ToString(), Status = c.Status.ToString(),
            Budget = c.Budget, Spent = c.Spent, StartDate = c.StartDate?.ToString("yyyy-MM-dd"),
            EndDate = c.EndDate?.ToString("yyyy-MM-dd"), TotalRecipients = c.TotalRecipients,
            Sent = s?.Sent ?? 0, Opened = s?.Opened ?? 0, Clicked = s?.Clicked ?? 0,
            Converted = s?.Converted ?? 0, Bounced = s?.Bounced ?? 0,
            OpenRate = openRate, Ctr = ctr, ConversionRate = convRate,
            CreatedBy = c.CreatedByUser?.FullName, CreatedAt = c.CreatedAt
        };
    }

    private static CampaignDetailDto MapToDetailDto(Campaign c)
    {
        var dto = new CampaignDetailDto();
        var s = c.Stats;
        dto.Id = c.Id; dto.Name = c.Name; dto.Type = c.Type.ToString(); dto.Status = c.Status.ToString();
        dto.Budget = c.Budget; dto.Spent = c.Spent; dto.Revenue = c.Revenue;
        dto.Objective = c.Objective; dto.AudienceType = c.AudienceType; dto.ScheduledAt = c.ScheduledAt;
        dto.StartDate = c.StartDate?.ToString("yyyy-MM-dd"); dto.EndDate = c.EndDate?.ToString("yyyy-MM-dd");
        dto.TotalRecipients = c.TotalRecipients; dto.Sent = s?.Sent ?? 0; dto.Delivered = s?.Delivered ?? 0;
        dto.Opened = s?.Opened ?? 0; dto.Clicked = s?.Clicked ?? 0; dto.Converted = s?.Converted ?? 0;
        dto.Bounced = s?.Bounced ?? 0; dto.Unsubscribed = s?.Unsubscribed ?? 0; dto.Failed = s?.Failed ?? 0;
        dto.OpenRate = s?.Delivered > 0 ? Math.Round((decimal)s.Opened / s.Delivered * 100, 1) : 0;
        dto.Ctr = s?.Opened > 0 ? Math.Round((decimal)s.Clicked / s.Opened * 100, 1) : 0;
        dto.ConversionRate = s?.Clicked > 0 ? Math.Round((decimal)s.Converted / s.Clicked * 100, 1) : 0;
        dto.BounceRate = s?.Sent > 0 ? Math.Round((decimal)s.Bounced / s.Sent * 100, 1) : 0;
        dto.CreatedBy = c.CreatedByUser?.FullName; dto.CreatedAt = c.CreatedAt;
        return dto;
    }
}
