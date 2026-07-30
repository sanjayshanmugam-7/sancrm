namespace SanCRM.Application.DTOs;

public class CreateLeadDto
{
    public string? Salutation { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string? LastName { get; set; }
    public string? CompanyName { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Mobile { get; set; }
    public string? Whatsapp { get; set; }
    public string? Designation { get; set; }
    public string Source { get; set; } = "Website";
    public int? SourceCampaign { get; set; }
    public string Rating { get; set; } = "Warm";
    public int? AssignedTo { get; set; }
    public string? Industry { get; set; }
    public decimal? AnnualRevenue { get; set; }
    public int? EmployeeCount { get; set; }
    public string? Website { get; set; }
    public string? Description { get; set; }
}

public class UpdateLeadDto : CreateLeadDto
{
    public string? Status { get; set; }
    public string? LostReason { get; set; }
}

public class LeadListDto
{
    public int Id { get; set; }
    public string LeadNo { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? CompanyName { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string Source { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Rating { get; set; } = string.Empty;
    public byte AiScore { get; set; }
    public string? AiGrade { get; set; }
    public string? AssignedTo { get; set; }
    public int? AssignedToId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class LeadDetailDto : LeadListDto
{
    public string? Salutation { get; set; }
    public string? Mobile { get; set; }
    public string? Whatsapp { get; set; }
    public string? Designation { get; set; }
    public string? Industry { get; set; }
    public decimal? AnnualRevenue { get; set; }
    public int? EmployeeCount { get; set; }
    public string? Website { get; set; }
    public string? Description { get; set; }
    public string? LostReason { get; set; }
    public bool IsDuplicate { get; set; }
    public DateTime? ConvertedAt { get; set; }
    public int? ConvertedToContact { get; set; }
    public int? ConvertedToCompany { get; set; }
    public int? ConvertedToOpportunity { get; set; }
    public AiScoreDto? AiScoreDetails { get; set; }
}

public class AiScoreDto
{
    public byte Score { get; set; }
    public string Grade { get; set; } = string.Empty;
    public Dictionary<string, object>? Factors { get; set; }
    public DateTime PredictedAt { get; set; }
}

public class LeadStatsDto
{
    public int TotalLeads { get; set; }
    public int NewThisMonth { get; set; }
    public int ConvertedThisMonth { get; set; }
    public int HotLeads { get; set; }
    public int OverdueFollowups { get; set; }
    public decimal AvgAiScore { get; set; }
    public Dictionary<string, int> ByStatus { get; set; } = new();
    public Dictionary<string, int> BySource { get; set; } = new();
}

public class LeadSourceBreakdownDto
{
    public string Source { get; set; } = string.Empty;
    public int Total { get; set; }
    public int Qualified { get; set; }
    public int Converted { get; set; }
    public decimal ConversionRate { get; set; }
    public decimal AvgAiScore { get; set; }
}

public class BulkAssignDto
{
    public List<int> LeadIds { get; set; } = new();
    public int AssignTo { get; set; }
}

public class LeadConvertDto
{
    public bool CreateContact { get; set; } = true;
    public bool CreateCompany { get; set; } = true;
    public bool CreateOpportunity { get; set; } = false;
    public string? OpportunityTitle { get; set; }
    public decimal? OpportunityAmount { get; set; }
    public string? ExpectedClose { get; set; }
    public int? ExistingCompanyId { get; set; }
}

public class LeadConvertResultDto
{
    public int? ContactId { get; set; }
    public int? CompanyId { get; set; }
    public int? OpportunityId { get; set; }
}

public class AssignmentRuleDto
{
    public int? Id { get; set; }
    public string RuleName { get; set; } = string.Empty;
    public int Priority { get; set; } = 1;
    public object Conditions { get; set; } = new();
    public int AssignTo { get; set; }
    public string? AssignToName { get; set; }
    public bool RoundRobin { get; set; } = false;
    public bool IsActive { get; set; } = true;
}

public class BulkImportResultDto
{
    public int Id { get; set; }
    public int TotalRows { get; set; }
    public int Imported { get; set; }
    public int Failed { get; set; }
    public int Duplicates { get; set; }
    public string Status { get; set; } = string.Empty;
}
