namespace SanCRM.Application.DTOs;

public class CreateCampaignDto
{
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string? Objective { get; set; }
    public string? AudienceType { get; set; }
    public decimal Budget { get; set; } = 0;
    public string? StartDate { get; set; }
    public string? EndDate { get; set; }
    public DateTime? ScheduledAt { get; set; }
    public string? TemplateData { get; set; }
}

public class UpdateCampaignDto : CreateCampaignDto
{
    public string? Status { get; set; }
    public decimal? Spent { get; set; }
    public decimal? Revenue { get; set; }
}

public class CampaignListDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public decimal Budget { get; set; }
    public decimal Spent { get; set; }
    public string? StartDate { get; set; }
    public string? EndDate { get; set; }
    public int TotalRecipients { get; set; }
    public int Sent { get; set; }
    public int Opened { get; set; }
    public int Clicked { get; set; }
    public int Converted { get; set; }
    public int Bounced { get; set; }
    public decimal OpenRate { get; set; }
    public decimal Ctr { get; set; }
    public decimal ConversionRate { get; set; }
    public string? CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CampaignDetailDto : CampaignListDto
{
    public string? Objective { get; set; }
    public string? AudienceType { get; set; }
    public decimal Revenue { get; set; }
    public DateTime? ScheduledAt { get; set; }
    public int Delivered { get; set; }
    public int Unsubscribed { get; set; }
    public int Failed { get; set; }
    public decimal BounceRate { get; set; }
}

public class CampaignStatsDto
{
    public int TotalCampaigns { get; set; }
    public int ActiveCampaigns { get; set; }
    public int DraftCampaigns { get; set; }
    public decimal TotalBudget { get; set; }
    public decimal TotalSpent { get; set; }
    public decimal TotalRevenue { get; set; }
    public Dictionary<string, int> ByType { get; set; } = new();
    public Dictionary<string, int> ByStatus { get; set; } = new();
}

public class AddRecipientsDto
{
    public string EntityType { get; set; } = "Contact"; // Lead or Contact
    public List<int>? EntityIds { get; set; }
    public int? GroupId { get; set; }
}

public class RecipientDto
{
    public int Id { get; set; }
    public string EntityType { get; set; } = string.Empty;
    public int EntityId { get; set; }
    public string? Name { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime? SentAt { get; set; }
    public DateTime? OpenedAt { get; set; }
}

public class CampaignTemplateDto
{
    public int? Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string? Subject { get; set; }
}

public class TestEmailDto
{
    public string ToEmail { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
}

public class TestSmsDto
{
    public string ToPhone { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}
