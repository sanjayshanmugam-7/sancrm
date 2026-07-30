using SanCRM.Domain.Enums;

namespace SanCRM.Domain.Entities;

public class Opportunity
{
    public int Id { get; set; }
    public string OppNo { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public int CompanyId { get; set; }
    public int? ContactId { get; set; }
    public int? LeadId { get; set; }
    public int? AssignedTo { get; set; }
    public OpportunityStage Stage { get; set; } = OpportunityStage.Prospecting;
    public decimal Amount { get; set; } = 0;
    public string Currency { get; set; } = "INR";
    public byte Probability { get; set; } = 0;
    public DateOnly? ExpectedClose { get; set; }
    public DateOnly? ActualClose { get; set; }
    public string? LostReason { get; set; }
    public string? LostTo { get; set; }
    public string? Source { get; set; }
    public string? Type { get; set; }
    public string? Description { get; set; }
    public string? NextStep { get; set; }
    public decimal? AiPrediction { get; set; }
    public int? CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public Company Company { get; set; } = null!;
    public Contact? Contact { get; set; }
    public Lead? Lead { get; set; }
    public User? AssignedToUser { get; set; }
    public User? CreatedByUser { get; set; }
    public ICollection<OpportunityStageHistory> StageHistory { get; set; } = new List<OpportunityStageHistory>();
    public ICollection<Document> Documents { get; set; } = new List<Document>();
    public ICollection<Note> Notes { get; set; } = new List<Note>();
}

public class OpportunityStageHistory
{
    public int Id { get; set; }
    public int OpportunityId { get; set; }
    public string? FromStage { get; set; }
    public string ToStage { get; set; } = string.Empty;
    public int? ChangedBy { get; set; }
    public string? Notes { get; set; }
    public DateTime ChangedAt { get; set; } = DateTime.UtcNow;

    public Opportunity Opportunity { get; set; } = null!;
    public User? ChangedByUser { get; set; }
}
