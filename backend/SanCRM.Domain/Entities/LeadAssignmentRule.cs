using SanCRM.Domain.Enums;

namespace SanCRM.Domain.Entities;

public class LeadAssignmentRule
{
    public int Id { get; set; }
    public string RuleName { get; set; } = string.Empty;
    public int Priority { get; set; } = 1;
    public string Conditions { get; set; } = "[]";   // JSON as NVARCHAR(MAX)
    public int AssignTo { get; set; }
    public bool RoundRobin { get; set; } = false;
    public bool IsActive { get; set; } = true;
    public int? CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User AssignToUser { get; set; } = null!;
    public User? CreatedByUser { get; set; }
}
