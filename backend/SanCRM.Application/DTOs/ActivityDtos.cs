namespace SanCRM.Application.DTOs;

public class CreateActivityDto
{
    public string Type { get; set; } = "Call"; // Call, Meeting, Email, FollowUp
    public string Subject { get; set; } = string.Empty;
    public string EntityType { get; set; } = string.Empty;
    public int EntityId { get; set; }
    public int? AssignedTo { get; set; }
    public DateTime? ScheduledAt { get; set; }
    public string? Description { get; set; }
    public string? Priority { get; set; }
    // Meeting-specific
    public DateTime? EndDatetime { get; set; }
    public string? Location { get; set; }
    public string? MeetingUrl { get; set; }
    public string? Agenda { get; set; }
    public List<int>? AttendeeUserIds { get; set; }
    public List<int>? AttendeeContactIds { get; set; }
    // Call-specific
    public string? Direction { get; set; }
    // FollowUp-specific
    public string? FollowUpType { get; set; }
}

public class UpdateActivityDto : CreateActivityDto
{
    public string? Status { get; set; }
    public string? Outcome { get; set; }
}

public class CompleteActivityDto
{
    public string? Outcome { get; set; }
    public string? Notes { get; set; }
    public int? DurationSec { get; set; }
}

public class RescheduleDto
{
    public DateTime ScheduledAt { get; set; }
    public string? Reason { get; set; }
}

public class ActivityListDto
{
    public int Id { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? Priority { get; set; }
    public DateTime? ScheduledAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public int? DurationSec { get; set; }
    public string? Outcome { get; set; }
    public string EntityType { get; set; } = string.Empty;
    public int EntityId { get; set; }
    public string? EntityName { get; set; }
    public string? AssignedTo { get; set; }
    public int? AssignedToId { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class ActivityDetailDto : ActivityListDto
{
    public string? Description { get; set; }
    public string? Direction { get; set; }
    public string? Location { get; set; }
    public string? MeetingUrl { get; set; }
    public string? Agenda { get; set; }
    public string? Minutes { get; set; }
    public string? RecordingUrl { get; set; }
    public DateTime? ReminderAt { get; set; }
    public List<AttendeeDto>? Attendees { get; set; }
}

public class AttendeeDto
{
    public int? UserId { get; set; }
    public int? ContactId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty; // "User" or "Contact"
    public string Response { get; set; } = string.Empty;
}

public class LogCallDto
{
    public string Subject { get; set; } = string.Empty;
    public string Direction { get; set; } = "Outbound";
    public string EntityType { get; set; } = string.Empty;
    public int EntityId { get; set; }
    public DateTime CallDatetime { get; set; }
    public int? DurationSec { get; set; }
    public string? Outcome { get; set; }
    public string? Description { get; set; }
    public string Status { get; set; } = "Completed";
}

public class SendEmailDto
{
    public string EntityType { get; set; } = string.Empty;
    public int EntityId { get; set; }
    public string ToEmail { get; set; } = string.Empty;
    public string? Cc { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
}

public class SetReminderDto
{
    public DateTime ReminderAt { get; set; }
    public string? Notes { get; set; }
}

public class ActivityStatsDto
{
    public int TotalActivities { get; set; }
    public int CompletedToday { get; set; }
    public int PendingFollowups { get; set; }
    public int OverdueFollowups { get; set; }
    public int CallsThisWeek { get; set; }
    public int MeetingsThisWeek { get; set; }
    public int EmailsSentThisWeek { get; set; }
    public Dictionary<string, int> ByType { get; set; } = new();
}

public class CalendarEventDto
{
    public int Id { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public DateTime Start { get; set; }
    public DateTime? End { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? EntityType { get; set; }
    public int? EntityId { get; set; }
    public string? AssignedTo { get; set; }
    public string Color { get; set; } = "#1976d2";
}
