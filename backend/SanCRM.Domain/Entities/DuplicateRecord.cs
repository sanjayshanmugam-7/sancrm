using SanCRM.Domain.Enums;

namespace SanCRM.Domain.Entities;

public class DuplicateRecord
{
    public int Id { get; set; }
    public EntityType EntityType { get; set; }
    public int RecordId { get; set; }
    public int DuplicateOfId { get; set; }
    public decimal? MatchScore { get; set; }
    public string? MatchFields { get; set; }  // JSON as NVARCHAR(MAX)
    public DuplicateStatus Status { get; set; } = DuplicateStatus.Pending;
    public int? ResolvedBy { get; set; }
    public DateTime? ResolvedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User? ResolvedByUser { get; set; }
}
