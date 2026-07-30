namespace SanCRM.Application.Common;

public class QueryParams
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public string? Search { get; set; }
    public string? SortBy { get; set; }
    public string? SortDir { get; set; } = "asc";
}

public class LeadQueryParams : QueryParams
{
    public string? Status { get; set; }
    public string? Source { get; set; }
    public int? AssignedTo { get; set; }
    public string? Rating { get; set; }
    public DateTime? DateFrom { get; set; }
    public DateTime? DateTo { get; set; }
}

public class ContactQueryParams : QueryParams
{
    public string? Type { get; set; }
    public int? GroupId { get; set; }
    public string? Status { get; set; }
    public int? CompanyId { get; set; }
}

public class AccountQueryParams : QueryParams
{
    public string? Type { get; set; }
    public int? CategoryId { get; set; }
    public string? Status { get; set; }
    public string? Industry { get; set; }
}

public class OpportunityQueryParams : QueryParams
{
    public string? Stage { get; set; }
    public int? AssignedTo { get; set; }
    public int? CompanyId { get; set; }
    public DateTime? CloseDateFrom { get; set; }
    public DateTime? CloseDateTo { get; set; }
}

public class ActivityQueryParams : QueryParams
{
    public string? Type { get; set; }
    public string? Status { get; set; }
    public int? AssignedTo { get; set; }
    public DateTime? DateFrom { get; set; }
    public DateTime? DateTo { get; set; }
    public string? EntityType { get; set; }
    public int? EntityId { get; set; }
}

public class CampaignQueryParams : QueryParams
{
    public string? Type { get; set; }
    public string? Status { get; set; }
}

public class DocumentQueryParams : QueryParams
{
    public string? DocType { get; set; }
    public string? Status { get; set; }
    public int? OpportunityId { get; set; }
}
