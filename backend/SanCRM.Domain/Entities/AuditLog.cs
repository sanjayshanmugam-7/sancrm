using SanCRM.Domain.Enums;

namespace SanCRM.Domain.Entities;

public class AuditLog
{
    public long Id { get; set; }
    public int? UserId { get; set; }
    public AuditAction Action { get; set; }
    public string? EntityType { get; set; }
    public int? EntityId { get; set; }
    public string? OldValues { get; set; }   // JSON as NVARCHAR(MAX)
    public string? NewValues { get; set; }   // JSON as NVARCHAR(MAX)
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public DateTime OccurredAt { get; set; } = DateTime.UtcNow;

    public User? User { get; set; }
}
