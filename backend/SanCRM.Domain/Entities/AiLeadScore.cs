using SanCRM.Domain.Enums;

namespace SanCRM.Domain.Entities;

public class AiLeadScore
{
    public int Id { get; set; }
    public int LeadId { get; set; }
    public byte Score { get; set; }
    public AiGrade Grade { get; set; }
    public string? Factors { get; set; }   // JSON as NVARCHAR(MAX)
    public string? ModelVersion { get; set; }
    public DateTime PredictedAt { get; set; } = DateTime.UtcNow;

    public Lead Lead { get; set; } = null!;
}
