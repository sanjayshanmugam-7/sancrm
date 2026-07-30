using SanCRM.Domain.Enums;

namespace SanCRM.Domain.Entities;

public class Call
{
    public int Id { get; set; }
    public string Subject { get; set; } = string.Empty;
    public CallDirection Direction { get; set; } = CallDirection.Outbound;
    public CallStatus Status { get; set; } = CallStatus.Scheduled;
    public EntityType EntityType { get; set; }
    public int EntityId { get; set; }
    public int AssignedTo { get; set; }
    public DateTime CallDatetime { get; set; }
    public int DurationSec { get; set; } = 0;
    public string? RecordingUrl { get; set; }
    public string? Description { get; set; }
    public string? Outcome { get; set; }
    public int? CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public User AssignedToUser { get; set; } = null!;
    public User? CreatedByUser { get; set; }
}

public class Meeting
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public MeetingStatus Status { get; set; } = MeetingStatus.Scheduled;
    public EntityType EntityType { get; set; }
    public int EntityId { get; set; }
    public string? Location { get; set; }
    public string? MeetingUrl { get; set; }
    public DateTime StartDatetime { get; set; }
    public DateTime EndDatetime { get; set; }
    public string? Agenda { get; set; }
    public string? Minutes { get; set; }
    public string? Outcome { get; set; }
    public int? CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public User? CreatedByUser { get; set; }
    public ICollection<MeetingAttendee> Attendees { get; set; } = new List<MeetingAttendee>();
}

public class MeetingAttendee
{
    public int MeetingId { get; set; }
    public int? UserId { get; set; }
    public int? ContactId { get; set; }
    public AttendeeResponse Response { get; set; } = AttendeeResponse.NoResponse;

    public Meeting Meeting { get; set; } = null!;
    public User? User { get; set; }
    public Contact? Contact { get; set; }
}

public class EmailLog
{
    public int Id { get; set; }
    public EntityType EntityType { get; set; }
    public int EntityId { get; set; }
    public Direction Direction { get; set; } = Direction.Outbound;
    public string? FromEmail { get; set; }
    public string? ToEmail { get; set; }
    public string? Cc { get; set; }
    public string? Subject { get; set; }
    public string? Body { get; set; }
    public EmailStatus Status { get; set; } = EmailStatus.Draft;
    public DateTime? OpenedAt { get; set; }
    public DateTime? RepliedAt { get; set; }
    public DateTime? SentAt { get; set; }
    public int? CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public User? CreatedByUser { get; set; }
}

public class Followup
{
    public int Id { get; set; }
    public string Subject { get; set; } = string.Empty;
    public EntityType EntityType { get; set; }
    public int EntityId { get; set; }
    public FollowUpType Type { get; set; } = FollowUpType.Call;
    public FollowUpPriority Priority { get; set; } = FollowUpPriority.Medium;
    public FollowUpStatus Status { get; set; } = FollowUpStatus.Pending;
    public DateTime DueDate { get; set; }
    public DateTime? CompletedAt { get; set; }
    public DateTime? ReminderAt { get; set; }
    public string? Notes { get; set; }
    public int AssignedTo { get; set; }
    public int? CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public User AssignedToUser { get; set; } = null!;
    public User? CreatedByUser { get; set; }
}
