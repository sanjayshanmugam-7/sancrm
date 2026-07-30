using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using SanCRM.Application.Common;
using SanCRM.Application.DTOs;
using SanCRM.Application.Interfaces;
using SanCRM.Domain.Entities;
using SanCRM.Domain.Enums;
using SanCRM.Infrastructure.Data;

namespace SanCRM.Application.Services;

public class AccountsService : IAccountsService
{
    private readonly CrmDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly IAuditService _audit;
    private readonly IConfiguration _config;

    public AccountsService(CrmDbContext db, ICurrentUserService currentUser,
                           IAuditService audit, IConfiguration config)
    { _db = db; _currentUser = currentUser; _audit = audit; _config = config; }

    public async Task<PagedResult<AccountListDto>> GetAllAsync(AccountQueryParams q)
    {
        var query = _db.Companies
            .Include(c => c.ParentCompany).Include(c => c.Category)
            .Include(c => c.AssignedToUser).Include(c => c.CreditLimit)
            .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(q.Search))
            query = query.Where(c => c.Name.Contains(q.Search) ||
                (c.Email != null && c.Email.Contains(q.Search)) ||
                (c.Gstin != null && c.Gstin.Contains(q.Search)));

        if (!string.IsNullOrWhiteSpace(q.Type) && Enum.TryParse<CompanyType>(q.Type, true, out var ct))
            query = query.Where(c => c.Type == ct);

        if (!string.IsNullOrWhiteSpace(q.Status) && Enum.TryParse<CompanyStatus>(q.Status, true, out var cs))
            query = query.Where(c => c.Status == cs);

        if (q.CategoryId.HasValue) query = query.Where(c => c.CategoryId == q.CategoryId.Value);

        if (!string.IsNullOrWhiteSpace(q.Industry))
            query = query.Where(c => c.Industry != null && c.Industry.Contains(q.Industry));

        var total = await query.CountAsync();
        var items = await query.OrderBy(c => c.Name)
            .Skip((q.Page - 1) * q.PageSize).Take(q.PageSize).ToListAsync();

        // Counts
        var ids = items.Select(i => i.Id).ToList();
        var branchCounts = await _db.Branches.Where(b => ids.Contains(b.CompanyId))
            .GroupBy(b => b.CompanyId).ToDictionaryAsync(g => g.Key, g => g.Count());
        var contactCounts = await _db.Contacts.Where(c => c.CompanyId != null && ids.Contains(c.CompanyId!.Value))
            .GroupBy(c => c.CompanyId!.Value).ToDictionaryAsync(g => g.Key, g => g.Count());
        var oppCounts = await _db.Opportunities
            .Where(o => ids.Contains(o.CompanyId) && o.Stage != OpportunityStage.ClosedWon && o.Stage != OpportunityStage.ClosedLost)
            .GroupBy(o => o.CompanyId).ToDictionaryAsync(g => g.Key, g => g.Count());

        return new PagedResult<AccountListDto>
        {
            Data = items.Select(c => MapToListDto(c,
                branchCounts.GetValueOrDefault(c.Id),
                contactCounts.GetValueOrDefault(c.Id),
                oppCounts.GetValueOrDefault(c.Id))),
            Total = total, Page = q.Page, PageSize = q.PageSize
        };
    }

    public async Task<AccountDetailDto> GetByIdAsync(int id)
    {
        var c = await _db.Companies
            .Include(x => x.ParentCompany).Include(x => x.Category)
            .Include(x => x.AssignedToUser).Include(x => x.CreditLimit)
            .Include(x => x.Branches).Include(x => x.GstDetails)
            .AsNoTracking().FirstOrDefaultAsync(x => x.Id == id)
            ?? throw new KeyNotFoundException($"Account {id} not found.");

        var billing = await _db.Addresses.FirstOrDefaultAsync(a =>
            a.EntityType == EntityType.Company && a.EntityId == id &&
            (a.AddressType == AddressType.Billing || a.AddressType == AddressType.Both));
        var shipping = await _db.Addresses.FirstOrDefaultAsync(a =>
            a.EntityType == EntityType.Company && a.EntityId == id &&
            (a.AddressType == AddressType.Shipping || a.AddressType == AddressType.Both));

        var dto = new AccountDetailDto
        {
            Id = c.Id, Name = c.Name, Type = c.Type.ToString(), Industry = c.Industry,
            Email = c.Email, Phone = c.Phone, Gstin = c.Gstin, Status = c.Status.ToString(),
            AnnualRevenue = c.AnnualRevenue, ParentCompany = c.ParentCompany?.Name,
            ParentCompanyId = c.ParentCompanyId, Category = c.Category?.Name,
            CategoryPriority = c.Category?.Priority.ToString(),
            CategoryId = c.CategoryId, CategoryDiscountPct = c.Category?.DiscountPct,
            CategorySlaHours = c.Category?.SlaHours, Website = c.Website,
            EmployeeCount = c.EmployeeCount, Pan = c.Pan, Description = c.Description,
            CreditLimit = c.CreditLimit?.Limit, CreditUsed = c.CreditLimit?.UsedAmount,
            CreditOverdue = c.CreditLimit?.OverdueAmount, CreditStatus = c.CreditLimit?.Status.ToString(),
            AssignedTo = c.AssignedToUser?.FullName, CreatedAt = c.CreatedAt,
            BillingAddress = billing == null ? null : MapAddress(billing),
            ShippingAddress = shipping == null ? null : MapAddress(shipping),
            Branches = c.Branches.Select(b => new BranchDto { Id = b.Id, Name = b.Name, BranchType = b.BranchType.ToString(), Email = b.Email, Phone = b.Phone, Gstin = b.Gstin, IsPrimary = b.IsPrimary, Status = b.Status }).ToList(),
            GstDetails = c.GstDetails.Select(g => new GstDetailDto { Id = g.Id, Gstin = g.Gstin, LegalName = g.LegalName, TradeName = g.TradeName, State = g.State, RegistrationType = g.RegistrationType.ToString(), IsVerified = g.IsVerified }).ToList()
        };
        return dto;
    }

    public async Task<AccountDetailDto> CreateAsync(CreateAccountDto dto)
    {
        var company = new Company
        {
            ParentCompanyId = dto.ParentCompanyId, Name = dto.Name.Trim(),
            Type = Enum.Parse<CompanyType>(dto.Type, true),
            Industry = dto.Industry, Website = dto.Website, Email = dto.Email?.Trim().ToLowerInvariant(),
            Phone = dto.Phone, EmployeeCount = dto.EmployeeCount, AnnualRevenue = dto.AnnualRevenue,
            Gstin = dto.Gstin, Pan = dto.Pan, CategoryId = dto.CategoryId,
            AssignedTo = dto.AssignedTo ?? _currentUser.UserId, Description = dto.Description,
            CreatedBy = _currentUser.UserId
        };
        _db.Companies.Add(company);
        await _db.SaveChangesAsync();

        if (dto.BillingAddress != null)
            _db.Addresses.Add(NewAddress(EntityType.Company, company.Id, AddressType.Billing, dto.BillingAddress));
        if (dto.ShippingAddress != null)
            _db.Addresses.Add(NewAddress(EntityType.Company, company.Id, AddressType.Shipping, dto.ShippingAddress));

        await _db.SaveChangesAsync();
        await _audit.LogAsync(AuditAction.Create, "Company", company.Id);
        return await GetByIdAsync(company.Id);
    }

    public async Task<AccountDetailDto> UpdateAsync(int id, UpdateAccountDto dto)
    {
        var company = await _db.Companies.FindAsync(id) ?? throw new KeyNotFoundException();
        company.Name = dto.Name.Trim(); company.Type = Enum.Parse<CompanyType>(dto.Type, true);
        company.Industry = dto.Industry; company.Website = dto.Website;
        company.Email = dto.Email?.Trim().ToLowerInvariant(); company.Phone = dto.Phone;
        company.EmployeeCount = dto.EmployeeCount; company.AnnualRevenue = dto.AnnualRevenue;
        company.Gstin = dto.Gstin; company.Pan = dto.Pan; company.CategoryId = dto.CategoryId;
        company.AssignedTo = dto.AssignedTo; company.Description = dto.Description;
        company.ParentCompanyId = dto.ParentCompanyId;
        if (!string.IsNullOrWhiteSpace(dto.Status) && Enum.TryParse<CompanyStatus>(dto.Status, true, out var st))
            company.Status = st;
        company.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        await _audit.LogAsync(AuditAction.Update, "Company", id);
        return await GetByIdAsync(id);
    }

    public async Task DeleteAsync(int id)
    {
        var c = await _db.Companies.FindAsync(id) ?? throw new KeyNotFoundException();
        _db.Companies.Remove(c);
        await _db.SaveChangesAsync();
        await _audit.LogAsync(AuditAction.Delete, "Company", id);
    }

    public async Task<IEnumerable<BranchDto>> GetBranchesAsync(int id)
    {
        return await _db.Branches.Where(b => b.CompanyId == id)
            .Select(b => new BranchDto { Id = b.Id, Name = b.Name, BranchType = b.BranchType.ToString(), Email = b.Email, Phone = b.Phone, Gstin = b.Gstin, IsPrimary = b.IsPrimary, Status = b.Status })
            .ToListAsync();
    }

    public async Task<BranchDto> CreateBranchAsync(int companyId, CreateBranchDto dto)
    {
        var branch = new Branch
        {
            CompanyId = companyId, Name = dto.Name,
            BranchType = Enum.Parse<BranchType>(dto.BranchType, true),
            Email = dto.Email, Phone = dto.Phone, Gstin = dto.Gstin, IsPrimary = dto.IsPrimary
        };
        _db.Branches.Add(branch);
        await _db.SaveChangesAsync();
        if (dto.Address != null)
            _db.Addresses.Add(NewAddress(EntityType.Branch, branch.Id, AddressType.Both, dto.Address));
        await _db.SaveChangesAsync();
        return new BranchDto { Id = branch.Id, Name = branch.Name, BranchType = branch.BranchType.ToString(), Email = branch.Email, Phone = branch.Phone, Gstin = branch.Gstin, IsPrimary = branch.IsPrimary, Status = branch.Status };
    }

    public async Task<IEnumerable<CompanyHierarchyDto>> GetHierarchyAsync()
    {
        var parents = await _db.ParentCompanies.Include(p => p.Companies)
            .ThenInclude(c => c.Branches).AsNoTracking().ToListAsync();
        return parents.Select(p => new CompanyHierarchyDto
        {
            Id = p.Id, Name = p.Name, Industry = p.Industry,
            Companies = p.Companies.Select(c => new CompanyNodeDto
            {
                Id = c.Id, Name = c.Name, Type = c.Type.ToString(),
                Branches = c.Branches.Select(b => new BranchDto { Id = b.Id, Name = b.Name, BranchType = b.BranchType.ToString(), IsPrimary = b.IsPrimary }).ToList()
            }).ToList()
        });
    }

    public async Task<IEnumerable<ContactListDto>> GetContactsAsync(int id)
    {
        return await _db.Contacts.Where(c => c.CompanyId == id)
            .Select(c => new ContactListDto { Id = c.Id, FullName = c.FirstName + " " + c.LastName, Email = c.Email, Phone = c.Phone, Designation = c.Designation, DecisionMaker = c.DecisionMaker, Status = c.Status.ToString(), CompanyId = id, CreatedAt = c.CreatedAt })
            .ToListAsync();
    }

    public async Task<IEnumerable<OpportunityListDto>> GetOpportunitiesAsync(int id)
    {
        return await _db.Opportunities.Where(o => o.CompanyId == id)
            .Select(o => new OpportunityListDto { Id = o.Id, OppNo = o.OppNo, Title = o.Title, Stage = o.Stage.ToString(), Amount = o.Amount, Probability = o.Probability, CompanyId = id, CreatedAt = o.CreatedAt })
            .ToListAsync();
    }

    public async Task<IEnumerable<DocumentListDto>> GetDocumentsAsync(int id)
    {
        return await _db.Documents.Where(d => d.EntityType == EntityType.Company && d.EntityId == id)
            .Select(d => new DocumentListDto { Id = d.Id, DocNo = d.DocNo, DocType = d.DocType.ToString(), Title = d.Title, Status = d.Status.ToString(), Value = d.Value, CreatedAt = d.CreatedAt })
            .ToListAsync();
    }

    public async Task<IEnumerable<ActivityListDto>> GetActivitiesAsync(int id)
    {
        var calls = await _db.Calls.Where(c => c.EntityType == EntityType.Company && c.EntityId == id)
            .Select(c => new ActivityListDto { Id = c.Id, Type = "Call", Subject = c.Subject, Status = c.Status.ToString(), ScheduledAt = c.CallDatetime, EntityType = "Company", EntityId = id, CreatedAt = c.CreatedAt }).ToListAsync();
        var followups = await _db.Followups.Where(f => f.EntityType == EntityType.Company && f.EntityId == id)
            .Select(f => new ActivityListDto { Id = f.Id, Type = "FollowUp", Subject = f.Subject, Status = f.Status.ToString(), Priority = f.Priority.ToString(), ScheduledAt = f.DueDate, EntityType = "Company", EntityId = id, CreatedAt = f.CreatedAt }).ToListAsync();
        return calls.Concat(followups).OrderByDescending(a => a.ScheduledAt ?? a.CreatedAt);
    }

    public async Task<IEnumerable<NoteDto>> GetNotesAsync(int id)
    {
        return await _db.Notes.Where(n => n.EntityType == EntityType.Company && n.EntityId == id)
            .OrderByDescending(n => n.IsPinned).ThenByDescending(n => n.CreatedAt).AsNoTracking()
            .Select(n => new NoteDto { Id = n.Id, Title = n.Title, Content = n.Content, IsPinned = n.IsPinned, CreatedAt = n.CreatedAt, UpdatedAt = n.UpdatedAt })
            .ToListAsync();
    }

    public async Task<NoteDto> AddNoteAsync(int id, CreateNoteDto dto)
    {
        var note = new Note { EntityType = EntityType.Company, EntityId = id, Title = dto.Title, Content = dto.Content, IsPinned = dto.IsPinned, CreatedBy = _currentUser.UserId };
        _db.Notes.Add(note);
        await _db.SaveChangesAsync();
        return new NoteDto { Id = note.Id, Title = note.Title, Content = note.Content, CreatedAt = note.CreatedAt, UpdatedAt = note.UpdatedAt };
    }

    public async Task UpdateCreditLimitAsync(int id, UpdateCreditLimitDto dto)
    {
        var cl = await _db.CreditLimits.FirstOrDefaultAsync(x => x.CompanyId == id);
        if (cl == null)
        {
            cl = new CreditLimit { CompanyId = id };
            _db.CreditLimits.Add(cl);
        }
        cl.Limit = dto.Limit;
        cl.Notes = dto.Notes;
        cl.ReviewedBy = _currentUser.UserId;
        cl.LastReview = DateOnly.FromDateTime(DateTime.UtcNow);
        cl.UpdatedAt = DateTime.UtcNow;
        cl.Status = cl.UsedAmount >= cl.Limit ? CreditStatus.Exceeded
                  : cl.UsedAmount >= cl.Limit * 0.8m ? CreditStatus.Warning
                  : CreditStatus.Good;
        await _db.SaveChangesAsync();
    }

    public Task<GstValidationResult> ValidateGstAsync(string gstNumber)
    {
        // GSTIN format: 2-digit state code + 10-digit PAN + 1 digit entity + Z + check digit
        var isValid = System.Text.RegularExpressions.Regex.IsMatch(
            gstNumber.Trim().ToUpperInvariant(),
            @"^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$");

        return Task.FromResult(new GstValidationResult
        {
            IsValid = isValid,
            Message = isValid ? "GSTIN format is valid" : "Invalid GSTIN format"
        });
    }

    public async Task<IEnumerable<CustomerCategoryDto>> GetCategoriesAsync()
    {
        return await _db.CustomerCategories
            .Select(cat => new CustomerCategoryDto
            {
                Id = cat.Id, Name = cat.Name, Priority = cat.Priority.ToString(),
                DiscountPct = cat.DiscountPct, CreditLimit = cat.CreditLimit,
                SlaHours = cat.SlaHours, Color = cat.Color,
                TotalAccounts = cat.Companies.Count
            }).ToListAsync();
    }

    public async Task<AccountStatsDto> GetStatsAsync()
    {
        var now = DateTime.UtcNow;
        return new AccountStatsDto
        {
            Total = await _db.Companies.CountAsync(),
            Active = await _db.Companies.CountAsync(c => c.Status == CompanyStatus.Active),
            Customers = await _db.Companies.CountAsync(c => c.Type == CompanyType.Customer),
            Prospects = await _db.Companies.CountAsync(c => c.Type == CompanyType.Prospect),
            TotalRevenue = await _db.Companies.SumAsync(c => (decimal?)c.AnnualRevenue) ?? 0,
            ByIndustry = await _db.Companies.Where(c => c.Industry != null).GroupBy(c => c.Industry!).ToDictionaryAsync(g => g.Key, g => g.Count()),
            ByType = await _db.Companies.GroupBy(c => c.Type).ToDictionaryAsync(g => g.Key.ToString(), g => g.Count())
        };
    }

    public async Task<byte[]> ExportAsync(AccountQueryParams q)
    {
        q.PageSize = 10000;
        var result = await GetAllAsync(q);
        var sb = new StringBuilder();
        sb.AppendLine("Name,Type,Industry,Email,Phone,GSTIN,Status,AnnualRevenue,CreditLimit,AssignedTo");
        foreach (var c in result.Data)
            sb.AppendLine($"{c.Name},{c.Type},{c.Industry},{c.Email},{c.Phone},{c.Gstin},{c.Status},{c.AnnualRevenue},{c.CreditLimit},{c.AssignedTo}");
        return Encoding.UTF8.GetBytes(sb.ToString());
    }

    private static Address NewAddress(EntityType et, int eid, AddressType at, AddressInputDto d) => new()
    {
        EntityType = et, EntityId = eid, AddressType = at, IsDefault = true,
        AddressLine1 = d.AddressLine1, AddressLine2 = d.AddressLine2,
        City = d.City, State = d.State, Pincode = d.Pincode, Country = d.Country, Gstin = d.Gstin
    };

    private static AddressDto MapAddress(Address a) => new()
    {
        Id = a.Id, AddressType = a.AddressType.ToString(), AddressLine1 = a.AddressLine1,
        AddressLine2 = a.AddressLine2, City = a.City, State = a.State, Pincode = a.Pincode,
        Country = a.Country, Gstin = a.Gstin, IsDefault = a.IsDefault
    };

    private static AccountListDto MapToListDto(Company c, int branches, int contacts, int opps) => new()
    {
        Id = c.Id, Name = c.Name, Type = c.Type.ToString(), Industry = c.Industry,
        Email = c.Email, Phone = c.Phone, Gstin = c.Gstin, Status = c.Status.ToString(),
        AnnualRevenue = c.AnnualRevenue, ParentCompany = c.ParentCompany?.Name,
        Category = c.Category?.Name, CategoryPriority = c.Category?.Priority.ToString(),
        CreditLimit = c.CreditLimit?.Limit, CreditUsed = c.CreditLimit?.UsedAmount,
        CreditStatus = c.CreditLimit?.Status.ToString(),
        AssignedTo = c.AssignedToUser?.FullName, BranchCount = branches,
        ContactCount = contacts, OpenOpportunities = opps, CreatedAt = c.CreatedAt
    };
}
