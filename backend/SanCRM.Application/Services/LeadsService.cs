using System.Text;
using System.Text.Json;
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

public class LeadsService : ILeadsService
{
    private readonly CrmDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly IAuditService _audit;
    private readonly IConfiguration _config;

    public LeadsService(CrmDbContext db, ICurrentUserService currentUser,
                        IAuditService audit, IConfiguration config)
    {
        _db = db;
        _currentUser = currentUser;
        _audit = audit;
        _config = config;
    }

    public async Task<PagedResult<LeadListDto>> GetAllAsync(LeadQueryParams q)
    {
        var query = _db.Leads
            .Include(l => l.AssignedToUser)
            .Include(l => l.AiLeadScore)
            .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(q.Search))
            query = query.Where(l =>
                l.FirstName.Contains(q.Search) ||
                (l.LastName != null && l.LastName.Contains(q.Search)) ||
                (l.Email != null && l.Email.Contains(q.Search)) ||
                (l.Phone != null && l.Phone.Contains(q.Search)) ||
                (l.CompanyName != null && l.CompanyName.Contains(q.Search)));

        if (!string.IsNullOrWhiteSpace(q.Status) &&
            Enum.TryParse<LeadStatus>(q.Status, true, out var status))
            query = query.Where(l => l.Status == status);

        if (!string.IsNullOrWhiteSpace(q.Source) &&
            Enum.TryParse<LeadSource>(q.Source, true, out var source))
            query = query.Where(l => l.Source == source);

        if (q.AssignedTo.HasValue)
            query = query.Where(l => l.AssignedTo == q.AssignedTo.Value);

        if (!string.IsNullOrWhiteSpace(q.Rating) &&
            Enum.TryParse<LeadRating>(q.Rating, true, out var rating))
            query = query.Where(l => l.Rating == rating);

        if (q.DateFrom.HasValue) query = query.Where(l => l.CreatedAt >= q.DateFrom.Value);
        if (q.DateTo.HasValue) query = query.Where(l => l.CreatedAt <= q.DateTo.Value);

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(l => l.AiLeadScore != null ? l.AiLeadScore.Score : 0)
            .ThenByDescending(l => l.CreatedAt)
            .Skip((q.Page - 1) * q.PageSize)
            .Take(q.PageSize)
            .ToListAsync();

        return new PagedResult<LeadListDto>
        {
            Data = items.Select(MapToListDto),
            Total = total, Page = q.Page, PageSize = q.PageSize
        };
    }

    public async Task<LeadDetailDto> GetByIdAsync(int id)
    {
        var lead = await _db.Leads
            .Include(l => l.AssignedToUser)
            .Include(l => l.AiLeadScore)
            .AsNoTracking()
            .FirstOrDefaultAsync(l => l.Id == id)
            ?? throw new KeyNotFoundException($"Lead {id} not found.");
        return MapToDetailDto(lead);
    }

    public async Task<LeadDetailDto> CreateAsync(CreateLeadDto dto)
    {
        var leadNo = await GenerateLeadNoAsync();
        var lead = new Lead
        {
            LeadNo = leadNo,
            Salutation = dto.Salutation,
            FirstName = dto.FirstName.Trim(),
            LastName = dto.LastName?.Trim(),
            CompanyName = dto.CompanyName?.Trim(),
            Email = dto.Email?.Trim().ToLowerInvariant(),
            Phone = dto.Phone?.Trim(),
            Mobile = dto.Mobile?.Trim(),
            Whatsapp = dto.Whatsapp?.Trim(),
            Designation = dto.Designation,
            Source = Enum.Parse<LeadSource>(dto.Source, true),
            Rating = Enum.Parse<LeadRating>(dto.Rating, true),
            SourceCampaign = dto.SourceCampaign,
            AssignedTo = dto.AssignedTo ?? _currentUser.UserId,
            Industry = dto.Industry,
            AnnualRevenue = dto.AnnualRevenue,
            EmployeeCount = dto.EmployeeCount,
            Website = dto.Website,
            Description = dto.Description,
            CreatedBy = _currentUser.UserId
        };
        _db.Leads.Add(lead);
        await _db.SaveChangesAsync();

        // Auto-compute AI score
        await ComputeAndSaveAiScoreAsync(lead);
        await _audit.LogAsync(AuditAction.Create, "Lead", lead.Id, null, new { lead.LeadNo, lead.Email });
        return await GetByIdAsync(lead.Id);
    }

    public async Task<LeadDetailDto> UpdateAsync(int id, UpdateLeadDto dto)
    {
        var lead = await _db.Leads.FindAsync(id)
            ?? throw new KeyNotFoundException($"Lead {id} not found.");
        var oldValues = new { lead.Status, lead.Rating, lead.AssignedTo };

        lead.Salutation = dto.Salutation;
        lead.FirstName = dto.FirstName.Trim();
        lead.LastName = dto.LastName?.Trim();
        lead.CompanyName = dto.CompanyName?.Trim();
        lead.Email = dto.Email?.Trim().ToLowerInvariant();
        lead.Phone = dto.Phone?.Trim();
        lead.Mobile = dto.Mobile?.Trim();
        lead.Whatsapp = dto.Whatsapp?.Trim();
        lead.Designation = dto.Designation;
        lead.Source = Enum.Parse<LeadSource>(dto.Source, true);
        lead.Rating = Enum.Parse<LeadRating>(dto.Rating, true);
        lead.AssignedTo = dto.AssignedTo;
        lead.Industry = dto.Industry;
        lead.AnnualRevenue = dto.AnnualRevenue;
        lead.EmployeeCount = dto.EmployeeCount;
        lead.Website = dto.Website;
        lead.Description = dto.Description;
        lead.LostReason = dto.LostReason;
        if (!string.IsNullOrWhiteSpace(dto.Status))
            lead.Status = Enum.Parse<LeadStatus>(dto.Status, true);
        lead.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        await _audit.LogAsync(AuditAction.Update, "Lead", id, oldValues, new { lead.Status });
        return await GetByIdAsync(id);
    }

    public async Task DeleteAsync(int id)
    {
        var lead = await _db.Leads.FindAsync(id)
            ?? throw new KeyNotFoundException($"Lead {id} not found.");
        _db.Leads.Remove(lead);
        await _db.SaveChangesAsync();
        await _audit.LogAsync(AuditAction.Delete, "Lead", id);
    }

    public async Task BulkDeleteAsync(List<int> ids)
    {
        var leads = await _db.Leads.Where(l => ids.Contains(l.Id)).ToListAsync();
        _db.Leads.RemoveRange(leads);
        await _db.SaveChangesAsync();
    }

    public async Task<byte[]> ExportAsync(LeadQueryParams q)
    {
        q.PageSize = 10000;
        var result = await GetAllAsync(q);
        var sb = new StringBuilder();
        sb.AppendLine("LeadNo,FullName,Company,Email,Phone,Source,Status,Rating,AiScore,AssignedTo,CreatedAt");
        foreach (var l in result.Data)
            sb.AppendLine($"{l.LeadNo},{l.FullName},{l.CompanyName},{l.Email},{l.Phone},{l.Source},{l.Status},{l.Rating},{l.AiScore},{l.AssignedTo},{l.CreatedAt:yyyy-MM-dd}");
        return Encoding.UTF8.GetBytes(sb.ToString());
    }

    public async Task<IEnumerable<LeadListDto>> DetectDuplicatesAsync()
    {
        var byEmail = await _db.Leads
            .Where(l => l.Email != null && l.Email != "")
            .GroupBy(l => l.Email!)
            .Where(g => g.Count() > 1)
            .SelectMany(g => g)
            .Include(l => l.AiLeadScore)
            .AsNoTracking()
            .ToListAsync();

        var byPhone = await _db.Leads
            .Where(l => l.Phone != null && l.Phone != "")
            .GroupBy(l => l.Phone!)
            .Where(g => g.Count() > 1)
            .SelectMany(g => g)
            .Include(l => l.AiLeadScore)
            .AsNoTracking()
            .ToListAsync();

        return byEmail.Union(byPhone).DistinctBy(l => l.Id).Select(MapToListDto);
    }

    public async Task MergeDuplicatesAsync(int primaryId, int duplicateId)
    {
        var primary = await _db.Leads.FindAsync(primaryId)
            ?? throw new KeyNotFoundException("Primary lead not found.");
        var duplicate = await _db.Leads.FindAsync(duplicateId)
            ?? throw new KeyNotFoundException("Duplicate lead not found.");

        // Transfer notes and attachments to primary
        await _db.Notes.Where(n => n.EntityType == EntityType.Lead && n.EntityId == duplicateId)
            .ExecuteUpdateAsync(s => s.SetProperty(n => n.EntityId, primaryId));
        await _db.Attachments.Where(a => a.EntityType == EntityType.Lead && a.EntityId == duplicateId)
            .ExecuteUpdateAsync(s => s.SetProperty(a => a.EntityId, primaryId));

        duplicate.IsDuplicate = true;
        duplicate.DuplicateOf = primaryId;
        duplicate.Status = LeadStatus.Lost;
        duplicate.UpdatedAt = DateTime.UtcNow;

        var record = new DuplicateRecord
        {
            EntityType = EntityType.Lead,
            RecordId = duplicateId,
            DuplicateOfId = primaryId,
            MatchScore = 100,
            Status = DuplicateStatus.Merged,
            ResolvedBy = _currentUser.UserId,
            ResolvedAt = DateTime.UtcNow
        };
        _db.DuplicateRecords.Add(record);
        await _db.SaveChangesAsync();
    }

    public async Task BulkAssignAsync(BulkAssignDto dto)
    {
        await _db.Leads.Where(l => dto.LeadIds.Contains(l.Id))
            .ExecuteUpdateAsync(s => s
                .SetProperty(l => l.AssignedTo, dto.AssignTo)
                .SetProperty(l => l.UpdatedAt, DateTime.UtcNow));
    }

    public async Task<LeadConvertResultDto> ConvertAsync(int id, LeadConvertDto dto)
    {
        var lead = await _db.Leads.FindAsync(id)
            ?? throw new KeyNotFoundException($"Lead {id} not found.");
        if (lead.Status == LeadStatus.Converted)
            throw new InvalidOperationException("Lead is already converted.");

        var result = new LeadConvertResultDto();

        await using var tx = await _db.Database.BeginTransactionAsync();
        try
        {
            int companyId = dto.ExistingCompanyId ?? 0;
            if (dto.CreateCompany && dto.ExistingCompanyId == null)
            {
                var company = new Company
                {
                    Name = lead.CompanyName ?? lead.FullName,
                    Type = CompanyType.Customer,
                    Industry = lead.Industry,
                    Email = lead.Email,
                    Phone = lead.Phone,
                    AnnualRevenue = lead.AnnualRevenue,
                    EmployeeCount = lead.EmployeeCount,
                    Website = lead.Website,
                    AssignedTo = lead.AssignedTo,
                    CreatedBy = _currentUser.UserId
                };
                _db.Companies.Add(company);
                await _db.SaveChangesAsync();
                companyId = company.Id;
                result.CompanyId = companyId;
            }

            if (dto.CreateContact)
            {
                var contact = new Contact
                {
                    CompanyId = companyId > 0 ? companyId : null,
                    FirstName = lead.FirstName,
                    LastName = lead.LastName,
                    Email = lead.Email,
                    Phone = lead.Phone,
                    Mobile = lead.Mobile,
                    Designation = lead.Designation,
                    AssignedTo = lead.AssignedTo,
                    CreatedBy = _currentUser.UserId
                };
                _db.Contacts.Add(contact);
                await _db.SaveChangesAsync();
                result.ContactId = contact.Id;
            }

            if (dto.CreateOpportunity && companyId > 0)
            {
                var oppNo = await GenerateOppNoAsync();
                DateOnly? expClose = null;
                if (!string.IsNullOrEmpty(dto.ExpectedClose) && DateOnly.TryParse(dto.ExpectedClose, out var d))
                    expClose = d;
                var opp = new Opportunity
                {
                    OppNo = oppNo,
                    Title = dto.OpportunityTitle ?? $"Opportunity from {lead.FullName}",
                    CompanyId = companyId,
                    ContactId = result.ContactId,
                    LeadId = lead.Id,
                    AssignedTo = lead.AssignedTo,
                    Amount = dto.OpportunityAmount ?? 0,
                    ExpectedClose = expClose,
                    CreatedBy = _currentUser.UserId
                };
                _db.Opportunities.Add(opp);
                await _db.SaveChangesAsync();
                result.OpportunityId = opp.Id;
            }

            lead.Status = LeadStatus.Converted;
            lead.ConvertedAt = DateTime.UtcNow;
            lead.ConvertedToContact = result.ContactId;
            lead.ConvertedToCompany = result.CompanyId;
            lead.ConvertedToOpportunity = result.OpportunityId;
            lead.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
            await tx.CommitAsync();

            await _audit.LogAsync(AuditAction.Update, "Lead", id, null, new { action = "converted", result });
        }
        catch
        {
            await tx.RollbackAsync();
            throw;
        }
        return result;
    }

    public async Task<IEnumerable<NoteDto>> GetNotesAsync(int id)
    {
        var notes = await _db.Notes
            .Include(n => n.CreatedByUser)
            .Where(n => n.EntityType == EntityType.Lead && n.EntityId == id)
            .OrderByDescending(n => n.IsPinned).ThenByDescending(n => n.CreatedAt)
            .AsNoTracking().ToListAsync();
        return notes.Select(n => new NoteDto
        {
            Id = n.Id, Title = n.Title, Content = n.Content,
            IsPinned = n.IsPinned, CreatedBy = n.CreatedByUser?.FullName,
            CreatedById = n.CreatedBy, CreatedAt = n.CreatedAt, UpdatedAt = n.UpdatedAt
        });
    }

    public async Task<NoteDto> AddNoteAsync(int id, CreateNoteDto dto)
    {
        var note = new Note
        {
            EntityType = EntityType.Lead, EntityId = id,
            Title = dto.Title, Content = dto.Content, IsPinned = dto.IsPinned,
            CreatedBy = _currentUser.UserId
        };
        _db.Notes.Add(note);
        await _db.SaveChangesAsync();
        return new NoteDto { Id = note.Id, Title = note.Title, Content = note.Content, IsPinned = note.IsPinned, CreatedAt = note.CreatedAt, UpdatedAt = note.UpdatedAt };
    }

    public async Task<IEnumerable<AttachmentDto>> GetAttachmentsAsync(int id)
    {
        var list = await _db.Attachments
            .Include(a => a.UploadedByUser)
            .Where(a => a.EntityType == EntityType.Lead && a.EntityId == id)
            .OrderByDescending(a => a.CreatedAt).AsNoTracking().ToListAsync();
        return list.Select(a => new AttachmentDto
        {
            Id = a.Id, FileName = a.FileName, FileSize = a.FileSize,
            MimeType = a.MimeType, Category = a.Category,
            UploadedBy = a.UploadedByUser?.FullName, CreatedAt = a.CreatedAt,
            DownloadUrl = $"/api/v1/attachments/{a.Id}/download"
        });
    }

    public async Task<AttachmentDto> AddAttachmentAsync(int id, IFormFile file, string? category)
    {
        var uploadPath = _config["FileStorage:UploadPath"] ?? "uploads";
        var dir = Path.Combine(uploadPath, "leads", id.ToString());
        Directory.CreateDirectory(dir);
        var fileName = $"{Guid.NewGuid()}_{Path.GetFileName(file.FileName)}";
        var fullPath = Path.Combine(dir, fileName);
        await using var stream = new FileStream(fullPath, FileMode.Create);
        await file.CopyToAsync(stream);
        var att = new Attachment
        {
            EntityType = EntityType.Lead, EntityId = id,
            FileName = file.FileName, FilePath = fullPath,
            FileSize = file.Length, MimeType = file.ContentType,
            Category = category, UploadedBy = _currentUser.UserId
        };
        _db.Attachments.Add(att);
        await _db.SaveChangesAsync();
        return new AttachmentDto { Id = att.Id, FileName = att.FileName, FileSize = att.FileSize, MimeType = att.MimeType, Category = att.Category, CreatedAt = att.CreatedAt, DownloadUrl = $"/api/v1/attachments/{att.Id}/download" };
    }

    public async Task<IEnumerable<ActivityListDto>> GetActivitiesAsync(int id)
    {
        var calls = await _db.Calls
            .Where(c => c.EntityType == EntityType.Lead && c.EntityId == id)
            .OrderByDescending(c => c.CallDatetime).AsNoTracking().ToListAsync();
        var followups = await _db.Followups
            .Where(f => f.EntityType == EntityType.Lead && f.EntityId == id)
            .OrderByDescending(f => f.DueDate).AsNoTracking().ToListAsync();
        var result = new List<ActivityListDto>();
        result.AddRange(calls.Select(c => new ActivityListDto { Id = c.Id, Type = "Call", Subject = c.Subject, Status = c.Status.ToString(), ScheduledAt = c.CallDatetime, EntityType = "Lead", EntityId = id, CreatedAt = c.CreatedAt }));
        result.AddRange(followups.Select(f => new ActivityListDto { Id = f.Id, Type = "FollowUp", Subject = f.Subject, Status = f.Status.ToString(), Priority = f.Priority.ToString(), ScheduledAt = f.DueDate, EntityType = "Lead", EntityId = id, CreatedAt = f.CreatedAt }));
        return result.OrderByDescending(a => a.ScheduledAt ?? a.CreatedAt);
    }

    public async Task<IEnumerable<CommunicationHistoryDto>> GetCommunicationHistoryAsync(int id)
    {
        var history = await _db.CommunicationHistories
            .Include(h => h.HandledByUser)
            .Where(h => h.EntityType == EntityType.Lead && h.EntityId == id)
            .OrderByDescending(h => h.OccurredAt).AsNoTracking().ToListAsync();
        return history.Select(h => new CommunicationHistoryDto
        {
            Id = h.Id, Channel = h.Channel.ToString(), Direction = h.Direction.ToString(),
            Subject = h.Subject, Content = h.Content, Status = h.Status,
            DurationSec = h.DurationSec, HandledBy = h.HandledByUser?.FullName, OccurredAt = h.OccurredAt
        });
    }

    public async Task<AiScoreDto> UpdateAiScoreAsync(int id)
    {
        var lead = await _db.Leads.FindAsync(id)
            ?? throw new KeyNotFoundException($"Lead {id} not found.");
        return await ComputeAndSaveAiScoreAsync(lead);
    }

    public async Task<LeadStatsDto> GetStatsAsync()
    {
        var now = DateTime.UtcNow;
        var monthStart = new DateTime(now.Year, now.Month, 1);
        return new LeadStatsDto
        {
            TotalLeads = await _db.Leads.CountAsync(),
            NewThisMonth = await _db.Leads.CountAsync(l => l.CreatedAt >= monthStart),
            ConvertedThisMonth = await _db.Leads.CountAsync(l => l.Status == LeadStatus.Converted && l.ConvertedAt >= monthStart),
            HotLeads = await _db.Leads.CountAsync(l => l.Rating == LeadRating.Hot && l.Status != LeadStatus.Converted && l.Status != LeadStatus.Lost),
            OverdueFollowups = await _db.Followups.CountAsync(f => f.EntityType == EntityType.Lead && f.Status == FollowUpStatus.Pending && f.DueDate < now),
            AvgAiScore = await _db.AiLeadScores.AverageAsync(s => (decimal?)s.Score) ?? 0,
            ByStatus = await _db.Leads.GroupBy(l => l.Status).ToDictionaryAsync(g => g.Key.ToString(), g => g.Count()),
            BySource = await _db.Leads.GroupBy(l => l.Source).ToDictionaryAsync(g => g.Key.ToString(), g => g.Count())
        };
    }

    public async Task<IEnumerable<LeadSourceBreakdownDto>> GetSourceBreakdownAsync()
    {
        var data = await _db.Leads
            .GroupBy(l => l.Source)
            .Select(g => new LeadSourceBreakdownDto
            {
                Source = g.Key.ToString(),
                Total = g.Count(),
                Qualified = g.Count(l => l.Status == LeadStatus.Qualified),
                Converted = g.Count(l => l.Status == LeadStatus.Converted)
            }).ToListAsync();
        foreach (var d in data)
            d.ConversionRate = d.Total > 0 ? Math.Round((decimal)d.Converted / d.Total * 100, 1) : 0;
        return data;
    }

    public async Task<IEnumerable<AssignmentRuleDto>> GetAssignmentRulesAsync()
    {
        return await _db.LeadAssignmentRules.Include(r => r.AssignToUser)
            .OrderBy(r => r.Priority).AsNoTracking()
            .Select(r => new AssignmentRuleDto
            {
                Id = r.Id, RuleName = r.RuleName, Priority = r.Priority,
                AssignTo = r.AssignTo, AssignToName = r.AssignToUser.FirstName + " " + r.AssignToUser.LastName,
                RoundRobin = r.RoundRobin, IsActive = r.IsActive
            }).ToListAsync();
    }

    public async Task<AssignmentRuleDto> CreateAssignmentRuleAsync(AssignmentRuleDto dto)
    {
        var rule = new LeadAssignmentRule
        {
            RuleName = dto.RuleName, Priority = dto.Priority,
            Conditions = System.Text.Json.JsonSerializer.Serialize(dto.Conditions),
            AssignTo = dto.AssignTo, RoundRobin = dto.RoundRobin,
            IsActive = dto.IsActive, CreatedBy = _currentUser.UserId
        };
        _db.LeadAssignmentRules.Add(rule);
        await _db.SaveChangesAsync();
        dto.Id = rule.Id;
        return dto;
    }

    public async Task<AssignmentRuleDto> UpdateAssignmentRuleAsync(int ruleId, AssignmentRuleDto dto)
    {
        var rule = await _db.LeadAssignmentRules.FindAsync(ruleId)
            ?? throw new KeyNotFoundException("Assignment rule not found.");
        rule.RuleName = dto.RuleName;
        rule.Priority = dto.Priority;
        rule.Conditions = System.Text.Json.JsonSerializer.Serialize(dto.Conditions);
        rule.AssignTo = dto.AssignTo;
        rule.RoundRobin = dto.RoundRobin;
        rule.IsActive = dto.IsActive;
        await _db.SaveChangesAsync();
        dto.Id = ruleId;
        return dto;
    }

    public async Task DeleteAssignmentRuleAsync(int ruleId)
    {
        var rule = await _db.LeadAssignmentRules.FindAsync(ruleId)
            ?? throw new KeyNotFoundException("Assignment rule not found.");
        _db.LeadAssignmentRules.Remove(rule);
        await _db.SaveChangesAsync();
    }

    public async Task<BulkImportResultDto> BulkImportAsync(IFormFile file)
    {
        var import = new BulkImport { ImportType = ImportType.Lead, FileName = file.FileName, ImportedBy = _currentUser.UserId, Status = ImportStatus.Processing, StartedAt = DateTime.UtcNow };
        _db.BulkImports.Add(import);
        await _db.SaveChangesAsync();
        using var reader = new System.IO.StreamReader(file.OpenReadStream());
        var lines = new List<string>();
        while (!reader.EndOfStream) lines.Add(await reader.ReadLineAsync() ?? "");
        import.TotalRows = Math.Max(0, lines.Count - 1);
        foreach (var line in lines.Skip(1))
        {
            var cols = line.Split(',');
            if (cols.Length < 3) { import.Failed++; continue; }
            var lead = new Lead { LeadNo = await GenerateLeadNoAsync(), FirstName = cols[0].Trim(), LastName = cols.Length > 1 ? cols[1].Trim() : null, Email = cols.Length > 2 ? cols[2].Trim() : null, CreatedBy = _currentUser.UserId };
            _db.Leads.Add(lead);
            import.Imported++;
        }
        import.Status = ImportStatus.Completed;
        import.CompletedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return new BulkImportResultDto { Id = import.Id, TotalRows = import.TotalRows, Imported = import.Imported, Failed = import.Failed, Duplicates = import.Duplicates, Status = import.Status.ToString() };
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private async Task<string> GenerateLeadNoAsync()
    {
        var year = DateTime.UtcNow.Year;
        var count = await _db.Leads.CountAsync(l => l.CreatedAt.Year == year);
        return $"LEAD-{year}-{(count + 1):D4}";
    }

    private async Task<string> GenerateOppNoAsync()
    {
        var year = DateTime.UtcNow.Year;
        var count = await _db.Opportunities.CountAsync(o => o.CreatedAt.Year == year);
        return $"OPP-{year}-{(count + 1):D4}";
    }

    private async Task<AiScoreDto> ComputeAndSaveAiScoreAsync(Lead lead)
    {
        // Scoring factors (max 100)
        int score = 0;
        var factors = new Dictionary<string, int>();

        // Source quality (0-25)
        var sourceScores = new Dictionary<LeadSource, int>
        {
            [LeadSource.Referral] = 25, [LeadSource.LinkedIn] = 20,
            [LeadSource.Website] = 18, [LeadSource.GoogleAds] = 15,
            [LeadSource.Facebook] = 12, [LeadSource.Email] = 10,
            [LeadSource.TradeShow] = 18, [LeadSource.WalkIn] = 22
        };
        var srcScore = sourceScores.GetValueOrDefault(lead.Source, 8);
        factors["source"] = srcScore;
        score += srcScore;

        // Data completeness (0-20)
        int completeness = 0;
        if (!string.IsNullOrEmpty(lead.Email)) completeness += 5;
        if (!string.IsNullOrEmpty(lead.Phone)) completeness += 4;
        if (!string.IsNullOrEmpty(lead.CompanyName)) completeness += 4;
        if (!string.IsNullOrEmpty(lead.Designation)) completeness += 4;
        if (!string.IsNullOrEmpty(lead.Industry)) completeness += 3;
        factors["completeness"] = completeness;
        score += completeness;

        // Rating (0-20)
        int ratingScore = lead.Rating switch { LeadRating.Hot => 20, LeadRating.Warm => 12, _ => 5 };
        factors["rating"] = ratingScore;
        score += ratingScore;

        // Company size / revenue signals (0-15)
        int bizScore = 0;
        if (lead.AnnualRevenue.HasValue) bizScore += lead.AnnualRevenue.Value > 10_000_000 ? 15 : lead.AnnualRevenue.Value > 1_000_000 ? 10 : 5;
        if (lead.EmployeeCount.HasValue) bizScore = Math.Max(bizScore, lead.EmployeeCount.Value > 200 ? 12 : 6);
        factors["business_size"] = bizScore;
        score += bizScore;

        // Recency (0-20)
        var daysSince = (DateTime.UtcNow - lead.CreatedAt).TotalDays;
        int recency = daysSince < 3 ? 20 : daysSince < 7 ? 16 : daysSince < 14 ? 12 : daysSince < 30 ? 8 : 4;
        factors["recency"] = recency;
        score += recency;

        score = Math.Min(100, score);
        var grade = score >= 80 ? AiGrade.A : score >= 60 ? AiGrade.B : score >= 40 ? AiGrade.C : AiGrade.D;

        var existing = await _db.AiLeadScores.FirstOrDefaultAsync(s => s.LeadId == lead.Id);
        if (existing == null)
        {
            existing = new AiLeadScore { LeadId = lead.Id };
            _db.AiLeadScores.Add(existing);
        }
        existing.Score = (byte)score;
        existing.Grade = grade;
        existing.Factors = System.Text.Json.JsonSerializer.Serialize(factors);
        existing.ModelVersion = "1.0";
        existing.PredictedAt = DateTime.UtcNow;

        lead.AiScore = (byte)score;
        await _db.SaveChangesAsync();

        return new AiScoreDto { Score = (byte)score, Grade = grade.ToString(), Factors = factors.ToDictionary(k => k.Key, v => (object)v.Value), PredictedAt = existing.PredictedAt };
    }

    private static LeadListDto MapToListDto(Lead l) => new()
    {
        Id = l.Id, LeadNo = l.LeadNo, FullName = l.FullName,
        CompanyName = l.CompanyName, Email = l.Email, Phone = l.Phone,
        Source = l.Source.ToString(), Status = l.Status.ToString(), Rating = l.Rating.ToString(),
        AiScore = l.AiLeadScore?.Score ?? l.AiScore,
        AiGrade = l.AiLeadScore?.Grade.ToString(),
        AssignedTo = l.AssignedToUser?.FullName, AssignedToId = l.AssignedTo,
        CreatedAt = l.CreatedAt, UpdatedAt = l.UpdatedAt
    };

    private static LeadDetailDto MapToDetailDto(Lead l) => new()
    {
        Id = l.Id, LeadNo = l.LeadNo, FullName = l.FullName,
        CompanyName = l.CompanyName, Email = l.Email, Phone = l.Phone,
        Source = l.Source.ToString(), Status = l.Status.ToString(), Rating = l.Rating.ToString(),
        AiScore = l.AiLeadScore?.Score ?? l.AiScore,
        AiGrade = l.AiLeadScore?.Grade.ToString(),
        AssignedTo = l.AssignedToUser?.FullName, AssignedToId = l.AssignedTo,
        CreatedAt = l.CreatedAt, UpdatedAt = l.UpdatedAt,
        Salutation = l.Salutation, Mobile = l.Mobile, Whatsapp = l.Whatsapp,
        Designation = l.Designation, Industry = l.Industry,
        AnnualRevenue = l.AnnualRevenue, EmployeeCount = l.EmployeeCount,
        Website = l.Website, Description = l.Description, LostReason = l.LostReason,
        IsDuplicate = l.IsDuplicate, ConvertedAt = l.ConvertedAt,
        ConvertedToContact = l.ConvertedToContact,
        ConvertedToCompany = l.ConvertedToCompany,
        ConvertedToOpportunity = l.ConvertedToOpportunity,
        AiScoreDetails = l.AiLeadScore == null ? null : new AiScoreDto
        {
            Score = l.AiLeadScore.Score, Grade = l.AiLeadScore.Grade.ToString(),
            PredictedAt = l.AiLeadScore.PredictedAt
        }
    };
}
