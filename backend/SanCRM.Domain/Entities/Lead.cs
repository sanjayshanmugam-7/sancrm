using SanCRM.Domain.Enums;

namespace SanCRM.Domain.Entities;

public class Lead
{
    public int Id { get; set; }
    public string LeadNo { get; set; } = string.Empty;
    public string? Salutation { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string? LastName { get; set; }
    public string? CompanyName { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Mobile { get; set; }
    public string? Whatsapp { get; set; }
    public string? Designation { get; set; }
    public LeadSource Source { get; set; } = LeadSource.Website;
    public int? SourceCampaign { get; set; }
    public LeadStatus Status { get; set; } = LeadStatus.New;
    public LeadRating Rating { get; set; } = LeadRating.Warm;
    public byte AiScore { get; set; } = 0;
    public int? AssignedTo { get; set; }
    public string? Industry { get; set; }
    public decimal? AnnualRevenue { get; set; }
    public int? EmployeeCount { get; set; }
    public string? Website { get; set; }
    public string? Description { get; set; }
    public string? LostReason { get; set; }
    public bool IsDuplicate { get; set; } = false;
    public int? DuplicateOf { get; set; }
    public DateTime? ConvertedAt { get; set; }
    public int? ConvertedToContact { get; set; }
    public int? ConvertedToCompany { get; set; }
    public int? ConvertedToOpportunity { get; set; }
    public int? CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public string FullName => $"{FirstName} {LastName}".Trim();

    public User? AssignedToUser { get; set; }
    public User? CreatedByUser { get; set; }
    public AiLeadScore? AiLeadScore { get; set; }
    public ICollection<Note> Notes { get; set; } = new List<Note>();
    public ICollection<Attachment> Attachments { get; set; } = new List<Attachment>();
}
