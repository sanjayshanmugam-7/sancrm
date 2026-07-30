using SanCRM.Domain.Enums;

namespace SanCRM.Domain.Entities;

public class Campaign
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public CampaignType Type { get; set; }
    public CampaignStatus Status { get; set; } = CampaignStatus.Draft;
    public string? Objective { get; set; }
    public string? AudienceType { get; set; }
    public int TotalRecipients { get; set; } = 0;
    public decimal Budget { get; set; } = 0;
    public decimal Spent { get; set; } = 0;
    public decimal Revenue { get; set; } = 0;
    public DateOnly? StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public DateTime? ScheduledAt { get; set; }
    public int? CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public User? CreatedByUser { get; set; }
    public CampaignStats? Stats { get; set; }
    public ICollection<CampaignRecipient> Recipients { get; set; } = new List<CampaignRecipient>();
}

public class CampaignStats
{
    public int Id { get; set; }
    public int CampaignId { get; set; }
    public int Sent { get; set; } = 0;
    public int Delivered { get; set; } = 0;
    public int Opened { get; set; } = 0;
    public int Clicked { get; set; } = 0;
    public int Converted { get; set; } = 0;
    public int Bounced { get; set; } = 0;
    public int Unsubscribed { get; set; } = 0;
    public int Failed { get; set; } = 0;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public Campaign Campaign { get; set; } = null!;
}

public class CampaignRecipient
{
    public int Id { get; set; }
    public int CampaignId { get; set; }
    public EntityType EntityType { get; set; }
    public int EntityId { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public RecipientStatus Status { get; set; } = RecipientStatus.Queued;
    public DateTime? SentAt { get; set; }
    public DateTime? OpenedAt { get; set; }
    public DateTime? ClickedAt { get; set; }

    public Campaign Campaign { get; set; } = null!;
}
