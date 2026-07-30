using SanCRM.Domain.Enums;

namespace SanCRM.Domain.Entities;

public class Note
{
    public int Id { get; set; }
    public EntityType EntityType { get; set; }
    public int EntityId { get; set; }
    public string? Title { get; set; }
    public string Content { get; set; } = string.Empty;
    public string? Tags { get; set; }   // JSON as NVARCHAR(MAX)
    public bool IsPinned { get; set; } = false;
    public int? CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public User? CreatedByUser { get; set; }
}

public class Attachment
{
    public int Id { get; set; }
    public EntityType EntityType { get; set; }
    public int EntityId { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public long? FileSize { get; set; }
    public string? MimeType { get; set; }
    public string? Category { get; set; }
    public int? UploadedBy { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User? UploadedByUser { get; set; }
}

public class CommunicationHistory
{
    public int Id { get; set; }
    public EntityType EntityType { get; set; }
    public int EntityId { get; set; }
    public CommunicationChannel Channel { get; set; }
    public Direction Direction { get; set; } = Direction.Outbound;
    public string? Subject { get; set; }
    public string? Content { get; set; }
    public string? Status { get; set; }
    public int? DurationSec { get; set; }
    public int? RefId { get; set; }
    public string? RefType { get; set; }
    public int? HandledBy { get; set; }
    public DateTime OccurredAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User? HandledByUser { get; set; }
}

public class Relationship
{
    public int Id { get; set; }
    public RelationSourceType SourceType { get; set; }
    public int SourceId { get; set; }
    public string RelationType { get; set; } = string.Empty;
    public RelationSourceType TargetType { get; set; }
    public int TargetId { get; set; }
    public bool IsActive { get; set; } = true;
    public int? CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User? CreatedByUser { get; set; }
}
