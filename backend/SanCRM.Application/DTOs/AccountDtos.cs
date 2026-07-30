namespace SanCRM.Application.DTOs;

public class CreateAccountDto
{
    public int? ParentCompanyId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = "Prospect";
    public string? Industry { get; set; }
    public string? Website { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public int? EmployeeCount { get; set; }
    public decimal? AnnualRevenue { get; set; }
    public string? Gstin { get; set; }
    public string? Pan { get; set; }
    public int? CategoryId { get; set; }
    public int? AssignedTo { get; set; }
    public string? Description { get; set; }
    public AddressInputDto? BillingAddress { get; set; }
    public AddressInputDto? ShippingAddress { get; set; }
}

public class UpdateAccountDto : CreateAccountDto
{
    public string? Status { get; set; }
}

public class AccountListDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string? Industry { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Gstin { get; set; }
    public string Status { get; set; } = string.Empty;
    public decimal? AnnualRevenue { get; set; }
    public string? ParentCompany { get; set; }
    public string? Category { get; set; }
    public string? CategoryPriority { get; set; }
    public decimal? CreditLimit { get; set; }
    public decimal? CreditUsed { get; set; }
    public string? CreditStatus { get; set; }
    public string? AssignedTo { get; set; }
    public int BranchCount { get; set; }
    public int ContactCount { get; set; }
    public int OpenOpportunities { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class AccountDetailDto : AccountListDto
{
    public int? ParentCompanyId { get; set; }
    public string? Website { get; set; }
    public int? EmployeeCount { get; set; }
    public string? Pan { get; set; }
    public string? Description { get; set; }
    public int? CategoryId { get; set; }
    public decimal? CategoryDiscountPct { get; set; }
    public int? CategorySlaHours { get; set; }
    public decimal? CreditOverdue { get; set; }
    public AddressDto? BillingAddress { get; set; }
    public AddressDto? ShippingAddress { get; set; }
    public List<BranchDto> Branches { get; set; } = new();
    public List<GstDetailDto> GstDetails { get; set; } = new();
}

public class CreateBranchDto
{
    public string Name { get; set; } = string.Empty;
    public string BranchType { get; set; } = "Branch";
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Gstin { get; set; }
    public bool IsPrimary { get; set; } = false;
    public AddressInputDto? Address { get; set; }
}

public class BranchDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string BranchType { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Gstin { get; set; }
    public bool IsPrimary { get; set; }
    public string Status { get; set; } = string.Empty;
}

public class GstDetailDto
{
    public int Id { get; set; }
    public string Gstin { get; set; } = string.Empty;
    public string? LegalName { get; set; }
    public string? TradeName { get; set; }
    public string? State { get; set; }
    public string RegistrationType { get; set; } = string.Empty;
    public bool IsVerified { get; set; }
}

public class UpdateCreditLimitDto
{
    public decimal Limit { get; set; }
    public string? Notes { get; set; }
}

public class ValidateGstDto
{
    public string GstNumber { get; set; } = string.Empty;
}

public class GstValidationResult
{
    public bool IsValid { get; set; }
    public string? LegalName { get; set; }
    public string? TradeName { get; set; }
    public string? State { get; set; }
    public string? RegistrationType { get; set; }
    public string? Message { get; set; }
}

public class AccountStatsDto
{
    public int Total { get; set; }
    public int Active { get; set; }
    public int Customers { get; set; }
    public int Prospects { get; set; }
    public decimal TotalRevenue { get; set; }
    public Dictionary<string, int> ByIndustry { get; set; } = new();
    public Dictionary<string, int> ByType { get; set; } = new();
}

public class CustomerCategoryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public decimal DiscountPct { get; set; }
    public decimal CreditLimit { get; set; }
    public int SlaHours { get; set; }
    public string Color { get; set; } = string.Empty;
    public int TotalAccounts { get; set; }
}

public class CompanyHierarchyDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Industry { get; set; }
    public List<CompanyNodeDto> Companies { get; set; } = new();
}

public class CompanyNodeDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public List<BranchDto> Branches { get; set; } = new();
}
