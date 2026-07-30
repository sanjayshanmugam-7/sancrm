namespace SanCRM.Application.DTOs;

public class NoteDto
{
    public int Id { get; set; }
    public string? Title { get; set; }
    public string Content { get; set; } = string.Empty;
    public bool IsPinned { get; set; }
    public string? Tags { get; set; }
    public string? CreatedBy { get; set; }
    public int? CreatedById { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateNoteDto
{
    public string? Title { get; set; }
    public string Content { get; set; } = string.Empty;
    public bool IsPinned { get; set; } = false;
    public List<string>? Tags { get; set; }
}

public class AttachmentDto
{
    public int Id { get; set; }
    public string FileName { get; set; } = string.Empty;
    public long? FileSize { get; set; }
    public string? MimeType { get; set; }
    public string? Category { get; set; }
    public string? UploadedBy { get; set; }
    public DateTime CreatedAt { get; set; }
    public string DownloadUrl { get; set; } = string.Empty;
}

public class CommunicationHistoryDto
{
    public int Id { get; set; }
    public string Channel { get; set; } = string.Empty;
    public string Direction { get; set; } = string.Empty;
    public string? Subject { get; set; }
    public string? Content { get; set; }
    public string? Status { get; set; }
    public int? DurationSec { get; set; }
    public string? HandledBy { get; set; }
    public DateTime OccurredAt { get; set; }
}

public class RelationshipDto
{
    public int Id { get; set; }
    public string SourceType { get; set; } = string.Empty;
    public int SourceId { get; set; }
    public string RelationType { get; set; } = string.Empty;
    public string TargetType { get; set; } = string.Empty;
    public int TargetId { get; set; }
    public string? TargetName { get; set; }
    public bool IsActive { get; set; }
}

public class CreateRelationshipDto
{
    public string SourceType { get; set; } = string.Empty;
    public int SourceId { get; set; }
    public string RelationType { get; set; } = string.Empty;
    public string TargetType { get; set; } = string.Empty;
    public int TargetId { get; set; }
}

public class AddressDto
{
    public int? Id { get; set; }
    public string AddressType { get; set; } = string.Empty;
    public string? AddressLine1 { get; set; }
    public string? AddressLine2 { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? Pincode { get; set; }
    public string Country { get; set; } = "India";
    public string? Gstin { get; set; }
    public bool IsDefault { get; set; }
}

public class AddressInputDto
{
    public string? AddressLine1 { get; set; }
    public string? AddressLine2 { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? Pincode { get; set; }
    public string Country { get; set; } = "India";
    public string? Gstin { get; set; }
}

public class DashboardStatsDto
{
    public int NewLeadsThisMonth { get; set; }
    public int ConversionsThisMonth { get; set; }
    public int OpenOpportunities { get; set; }
    public decimal WeightedPipeline { get; set; }
    public decimal RevenueThisMonth { get; set; }
    public int OverdueFollowups { get; set; }
    public int ActiveCampaigns { get; set; }
    public int PendingSignatures { get; set; }
    public int CallsToday { get; set; }
    public int MeetingsToday { get; set; }
    public int FollowupsToday { get; set; }
    public int EmailsSentToday { get; set; }
}

public class RevenueTrendDto
{
    public string Month { get; set; } = string.Empty;
    public int DealsClosed { get; set; }
    public decimal Revenue { get; set; }
}

public class PipelineSummaryDto
{
    public string Stage { get; set; } = string.Empty;
    public int DealCount { get; set; }
    public decimal TotalValue { get; set; }
    public decimal WeightedValue { get; set; }
    public decimal AvgProbability { get; set; }
}
