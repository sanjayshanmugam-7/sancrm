using Microsoft.EntityFrameworkCore;
using SanCRM.Application.Common;
using SanCRM.Application.DTOs;
using SanCRM.Application.Interfaces;
using SanCRM.Domain.Entities;
using SanCRM.Domain.Enums;
using SanCRM.Infrastructure.Data;

namespace SanCRM.Application.Services;

public class ActivitiesService : IActivitiesService
{
    private readonly CrmDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly IAuditService _audit;

    public ActivitiesService(CrmDbContext db, ICurrentUserService currentUser, IAuditService audit)
    { _db = db; _currentUser = currentUser; _audit = audit; }

    public async Task<PagedResult<ActivityListDto>> GetAllAsync(ActivityQueryParams q)
    {
        var callsQ = _db.Calls.Include(c => c.AssignedToUser).AsNoTracking();
        var followsQ = _db.Followups.Include(f => f.AssignedToUser).AsNoTracking();

        if (q.AssignedTo.HasValue)
        { callsQ = callsQ.Where(c => c.AssignedTo == q.AssignedTo.Value); followsQ = followsQ.Where(f => f.AssignedTo == q.AssignedTo.Value); }

        if (!string.IsNullOrWhiteSpace(q.EntityType) && Enum.TryParse<EntityType>(q.EntityType, true, out var et))
        { callsQ = callsQ.Where(c => c.EntityType == et); followsQ = followsQ.Where(f => f.EntityType == et); }

        if (q.EntityId.HasValue)
        { callsQ = callsQ.Where(c => c.EntityId == q.EntityId.Value); followsQ = followsQ.Where(f => f.EntityId == q.EntityId.Value); }

        var callItems = (await callsQ.OrderByDescending(c => c.CallDatetime).Take(q.PageSize).ToListAsync())
            .Select(c => new ActivityListDto { Id = c.Id, Type = "Call", Subject = c.Subject, Status = c.Status.ToString(), ScheduledAt = c.CallDatetime, EntityType = c.EntityType.ToString(), EntityId = c.EntityId, AssignedTo = c.AssignedToUser?.FullName, AssignedToId = c.AssignedTo, CreatedAt = c.CreatedAt });

        var followItems = (await followsQ.OrderBy(f => f.DueDate).Take(q.PageSize).ToListAsync())
            .Select(f => new ActivityListDto { Id = f.Id, Type = "FollowUp", Subject = f.Subject, Status = f.Status.ToString(), Priority = f.Priority.ToString(), ScheduledAt = f.DueDate, EntityType = f.EntityType.ToString(), EntityId = f.EntityId, AssignedTo = f.AssignedToUser?.FullName, AssignedToId = f.AssignedTo, CreatedAt = f.CreatedAt });

        var combined = callItems.Concat(followItems)
            .OrderByDescending(x => x.ScheduledAt ?? x.CreatedAt)
            .Skip((q.Page - 1) * q.PageSize).Take(q.PageSize).ToList();

        return new PagedResult<ActivityListDto> { Data = combined, Total = combined.Count, Page = q.Page, PageSize = q.PageSize };
    }

    public async Task<ActivityDetailDto> GetByIdAsync(int id)
    {
        var call = await _db.Calls.Include(c => c.AssignedToUser).FirstOrDefaultAsync(c => c.Id == id);
        if (call != null)
            return new ActivityDetailDto { Id = call.Id, Type = "Call", Subject = call.Subject, Status = call.Status.ToString(), ScheduledAt = call.CallDatetime, EntityType = call.EntityType.ToString(), EntityId = call.EntityId, Direction = call.Direction.ToString(), Description = call.Description, CreatedAt = call.CreatedAt };

        var followup = await _db.Followups.Include(f => f.AssignedToUser).FirstOrDefaultAsync(f => f.Id == id)
            ?? throw new KeyNotFoundException($"Activity {id} not found.");
        return new ActivityDetailDto { Id = followup.Id, Type = "FollowUp", Subject = followup.Subject, Status = followup.Status.ToString(), Priority = followup.Priority.ToString(), ScheduledAt = followup.DueDate, ReminderAt = followup.ReminderAt, EntityType = followup.EntityType.ToString(), EntityId = followup.EntityId, Description = followup.Notes, CreatedAt = followup.CreatedAt };
    }

    public async Task<ActivityDetailDto> CreateAsync(CreateActivityDto dto)
    {
        var entityType = Enum.Parse<EntityType>(dto.EntityType, true);
        var userId = dto.AssignedTo ?? _currentUser.UserId ?? 1;

        if (dto.Type == "Call")
        {
            var call = new Call
            {
                Subject = dto.Subject, EntityType = entityType, EntityId = dto.EntityId,
                AssignedTo = userId, CallDatetime = dto.ScheduledAt ?? DateTime.UtcNow,
                Direction = dto.Direction != null ? Enum.Parse<CallDirection>(dto.Direction, true) : CallDirection.Outbound,
                Description = dto.Description, CreatedBy = _currentUser.UserId
            };
            _db.Calls.Add(call);
            await _db.SaveChangesAsync();
            return await GetByIdAsync(call.Id);
        }
        else if (dto.Type == "Meeting")
        {
            var meeting = new Meeting
            {
                Title = dto.Subject, EntityType = entityType, EntityId = dto.EntityId,
                StartDatetime = dto.ScheduledAt ?? DateTime.UtcNow,
                EndDatetime = dto.EndDatetime ?? (dto.ScheduledAt ?? DateTime.UtcNow).AddHours(1),
                Location = dto.Location, MeetingUrl = dto.MeetingUrl, Agenda = dto.Agenda,
                CreatedBy = _currentUser.UserId
            };
            _db.Meetings.Add(meeting);
            await _db.SaveChangesAsync();
            return new ActivityDetailDto { Id = meeting.Id, Type = "Meeting", Subject = meeting.Title, Status = meeting.Status.ToString(), ScheduledAt = meeting.StartDatetime, Location = meeting.Location, MeetingUrl = meeting.MeetingUrl, Agenda = meeting.Agenda, EntityType = dto.EntityType, EntityId = dto.EntityId, CreatedAt = meeting.CreatedAt };
        }
        else
        {
            var fType = dto.FollowUpType != null ? Enum.Parse<FollowUpType>(dto.FollowUpType, true) : FollowUpType.Call;
            var fPriority = dto.Priority != null ? Enum.Parse<FollowUpPriority>(dto.Priority, true) : FollowUpPriority.Medium;
            var followup = new Followup
            {
                Subject = dto.Subject, EntityType = entityType, EntityId = dto.EntityId,
                Type = fType, Priority = fPriority, AssignedTo = userId,
                DueDate = dto.ScheduledAt ?? DateTime.UtcNow.AddDays(1),
                Notes = dto.Description, CreatedBy = _currentUser.UserId
            };
            _db.Followups.Add(followup);
            await _db.SaveChangesAsync();
            return await GetByIdAsync(followup.Id);
        }
    }

    public async Task<ActivityDetailDto> UpdateAsync(int id, UpdateActivityDto dto)
    {
        var followup = await _db.Followups.FindAsync(id);
        if (followup != null)
        {
            followup.Subject = dto.Subject;
            if (!string.IsNullOrWhiteSpace(dto.Status) && Enum.TryParse<FollowUpStatus>(dto.Status, true, out var st)) followup.Status = st;
            if (!string.IsNullOrWhiteSpace(dto.Priority) && Enum.TryParse<FollowUpPriority>(dto.Priority, true, out var pr)) followup.Priority = pr;
            if (dto.ScheduledAt.HasValue) followup.DueDate = dto.ScheduledAt.Value;
            followup.Notes = dto.Description; followup.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
        }
        return await GetByIdAsync(id);
    }

    public async Task DeleteAsync(int id)
    {
        var call = await _db.Calls.FindAsync(id);
        if (call != null) { _db.Calls.Remove(call); await _db.SaveChangesAsync(); return; }
        var followup = await _db.Followups.FindAsync(id);
        if (followup != null) { _db.Followups.Remove(followup); await _db.SaveChangesAsync(); }
    }

    public async Task<ActivityDetailDto> CompleteAsync(int id, CompleteActivityDto dto)
    {
        var call = await _db.Calls.FindAsync(id);
        if (call != null)
        {
            call.Status = CallStatus.Completed; call.Outcome = dto.Outcome;
            if (dto.DurationSec.HasValue) call.DurationSec = dto.DurationSec.Value;
            call.UpdatedAt = DateTime.UtcNow; await _db.SaveChangesAsync();
            return await GetByIdAsync(id);
        }
        var followup = await _db.Followups.FindAsync(id);
        if (followup != null)
        {
            followup.Status = FollowUpStatus.Completed; followup.CompletedAt = DateTime.UtcNow;
            followup.Notes = dto.Notes ?? followup.Notes; followup.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
        }
        return await GetByIdAsync(id);
    }

    public async Task<ActivityDetailDto> RescheduleAsync(int id, RescheduleDto dto)
    {
        var call = await _db.Calls.FindAsync(id);
        if (call != null) { call.CallDatetime = dto.ScheduledAt; call.UpdatedAt = DateTime.UtcNow; await _db.SaveChangesAsync(); return await GetByIdAsync(id); }
        var followup = await _db.Followups.FindAsync(id);
        if (followup != null) { followup.DueDate = dto.ScheduledAt; followup.UpdatedAt = DateTime.UtcNow; await _db.SaveChangesAsync(); }
        return await GetByIdAsync(id);
    }

    public async Task SetReminderAsync(int id, SetReminderDto dto)
    {
        var followup = await _db.Followups.FindAsync(id);
        if (followup != null) { followup.ReminderAt = dto.ReminderAt; followup.Notes = dto.Notes ?? followup.Notes; await _db.SaveChangesAsync(); }
    }

    public async Task<PagedResult<ActivityListDto>> GetCallsAsync(ActivityQueryParams q)
    {
        var query = _db.Calls.Include(c => c.AssignedToUser).AsNoTracking();
        if (q.AssignedTo.HasValue) query = query.Where(c => c.AssignedTo == q.AssignedTo.Value);
        if (q.DateFrom.HasValue) query = query.Where(c => c.CallDatetime >= q.DateFrom.Value);
        if (q.DateTo.HasValue) query = query.Where(c => c.CallDatetime <= q.DateTo.Value);
        if (!string.IsNullOrWhiteSpace(q.Status) && Enum.TryParse<CallStatus>(q.Status, true, out var cs)) query = query.Where(c => c.Status == cs);
        var total = await query.CountAsync();
        var items = await query.OrderByDescending(c => c.CallDatetime).Skip((q.Page - 1) * q.PageSize).Take(q.PageSize).ToListAsync();
        return new PagedResult<ActivityListDto>
        {
            Data = items.Select(c => new ActivityListDto { Id = c.Id, Type = "Call", Subject = c.Subject, Status = c.Status.ToString(), ScheduledAt = c.CallDatetime, EntityType = c.EntityType.ToString(), EntityId = c.EntityId, AssignedTo = c.AssignedToUser?.FullName, CreatedAt = c.CreatedAt }),
            Total = total, Page = q.Page, PageSize = q.PageSize
        };
    }

    public async Task<PagedResult<ActivityListDto>> GetMeetingsAsync(ActivityQueryParams q)
    {
        var query = _db.Meetings.AsNoTracking();
        if (q.DateFrom.HasValue) query = query.Where(m => m.StartDatetime >= q.DateFrom.Value);
        var total = await query.CountAsync();
        var items = await query.OrderByDescending(m => m.StartDatetime).Skip((q.Page - 1) * q.PageSize).Take(q.PageSize).ToListAsync();
        return new PagedResult<ActivityListDto>
        {
            Data = items.Select(m => new ActivityListDto { Id = m.Id, Type = "Meeting", Subject = m.Title, Status = m.Status.ToString(), ScheduledAt = m.StartDatetime, EntityType = m.EntityType.ToString(), EntityId = m.EntityId, CreatedAt = m.CreatedAt }),
            Total = total, Page = q.Page, PageSize = q.PageSize
        };
    }

    public async Task<PagedResult<ActivityListDto>> GetEmailsAsync(ActivityQueryParams q)
    {
        var query = _db.EmailLogs.AsNoTracking();
        if (q.DateFrom.HasValue) query = query.Where(e => e.SentAt >= q.DateFrom.Value);
        var total = await query.CountAsync();
        var items = await query.OrderByDescending(e => e.SentAt).Skip((q.Page - 1) * q.PageSize).Take(q.PageSize).ToListAsync();
        return new PagedResult<ActivityListDto>
        {
            Data = items.Select(e => new ActivityListDto { Id = e.Id, Type = "Email", Subject = e.Subject ?? "No subject", Status = e.Status.ToString(), ScheduledAt = e.SentAt, EntityType = e.EntityType.ToString(), EntityId = e.EntityId, CreatedAt = e.CreatedAt }),
            Total = total, Page = q.Page, PageSize = q.PageSize
        };
    }

    public async Task<PagedResult<ActivityListDto>> GetFollowUpsAsync(ActivityQueryParams q)
    {
        var query = _db.Followups.Include(f => f.AssignedToUser).AsNoTracking();
        if (q.AssignedTo.HasValue) query = query.Where(f => f.AssignedTo == q.AssignedTo.Value);
        if (!string.IsNullOrWhiteSpace(q.Status) && Enum.TryParse<FollowUpStatus>(q.Status, true, out var st)) query = query.Where(f => f.Status == st);
        if (q.DateFrom.HasValue) query = query.Where(f => f.DueDate >= q.DateFrom.Value);
        if (q.DateTo.HasValue) query = query.Where(f => f.DueDate <= q.DateTo.Value);
        var total = await query.CountAsync();
        var items = await query.OrderBy(f => f.DueDate).Skip((q.Page - 1) * q.PageSize).Take(q.PageSize).ToListAsync();
        return new PagedResult<ActivityListDto>
        {
            Data = items.Select(f => new ActivityListDto { Id = f.Id, Type = "FollowUp", Subject = f.Subject, Status = f.Status.ToString(), Priority = f.Priority.ToString(), ScheduledAt = f.DueDate, EntityType = f.EntityType.ToString(), EntityId = f.EntityId, AssignedTo = f.AssignedToUser?.FullName, CreatedAt = f.CreatedAt }),
            Total = total, Page = q.Page, PageSize = q.PageSize
        };
    }

    public async Task<IEnumerable<ActivityListDto>> GetPendingRemindersAsync()
    {
        var now = DateTime.UtcNow;
        return await _db.Followups
            .Where(f => f.ReminderAt.HasValue && f.ReminderAt.Value <= now.AddHours(1) && f.Status == FollowUpStatus.Pending)
            .Select(f => new ActivityListDto { Id = f.Id, Type = "FollowUp", Subject = f.Subject, Status = f.Status.ToString(), Priority = f.Priority.ToString(), ScheduledAt = f.DueDate, EntityType = f.EntityType.ToString(), EntityId = f.EntityId, CreatedAt = f.CreatedAt })
            .ToListAsync();
    }

    public async Task<IEnumerable<CalendarEventDto>> GetCalendarAsync(DateTime from, DateTime to)
    {
        var calls = await _db.Calls.Where(c => c.CallDatetime >= from && c.CallDatetime <= to)
            .Select(c => new CalendarEventDto { Id = c.Id, Type = "Call", Title = c.Subject, Start = c.CallDatetime, Status = c.Status.ToString(), EntityType = c.EntityType.ToString(), EntityId = c.EntityId, Color = "#1976d2" }).ToListAsync();
        var meetings = await _db.Meetings.Where(m => m.StartDatetime >= from && m.StartDatetime <= to)
            .Select(m => new CalendarEventDto { Id = m.Id, Type = "Meeting", Title = m.Title, Start = m.StartDatetime, End = m.EndDatetime, Status = m.Status.ToString(), Color = "#388e3c" }).ToListAsync();
        var followups = await _db.Followups.Where(f => f.DueDate >= from && f.DueDate <= to)
            .Select(f => new CalendarEventDto { Id = f.Id, Type = "FollowUp", Title = f.Subject, Start = f.DueDate, Status = f.Status.ToString(), Color = f.Priority == FollowUpPriority.Urgent ? "#d32f2f" : "#f57c00" }).ToListAsync();
        return calls.Cast<CalendarEventDto>().Concat(meetings).Concat(followups).OrderBy(e => e.Start);
    }

    public async Task<ActivityStatsDto> GetStatsAsync()
    {
        var now = DateTime.UtcNow;
        var weekStart = now.Date.AddDays(-(int)now.DayOfWeek);
        return new ActivityStatsDto
        {
            TotalActivities = await _db.Calls.CountAsync() + await _db.Followups.CountAsync() + await _db.Meetings.CountAsync(),
            CompletedToday = await _db.Calls.CountAsync(c => c.Status == CallStatus.Completed && c.CallDatetime >= now.Date),
            PendingFollowups = await _db.Followups.CountAsync(f => f.Status == FollowUpStatus.Pending),
            OverdueFollowups = await _db.Followups.CountAsync(f => f.Status == FollowUpStatus.Pending && f.DueDate < now),
            CallsThisWeek = await _db.Calls.CountAsync(c => c.CallDatetime >= weekStart),
            MeetingsThisWeek = await _db.Meetings.CountAsync(m => m.StartDatetime >= weekStart),
            EmailsSentThisWeek = await _db.EmailLogs.CountAsync(e => e.SentAt >= weekStart && e.Direction == Direction.Outbound)
        };
    }

    public async Task<ActivityDetailDto> SendEmailAsync(SendEmailDto dto)
    {
        var et = Enum.Parse<EntityType>(dto.EntityType, true);
        var log = new EmailLog
        {
            EntityType = et, EntityId = dto.EntityId, Direction = Direction.Outbound,
            FromEmail = "crm@sancrm.com", ToEmail = dto.ToEmail, Cc = dto.Cc,
            Subject = dto.Subject, Body = dto.Body, Status = EmailStatus.Sent,
            SentAt = DateTime.UtcNow, CreatedBy = _currentUser.UserId
        };
        _db.EmailLogs.Add(log);
        _db.CommunicationHistories.Add(new CommunicationHistory
        {
            EntityType = et, EntityId = dto.EntityId, Channel = CommunicationChannel.Email,
            Direction = Direction.Outbound, Subject = dto.Subject, Status = "Sent",
            HandledBy = _currentUser.UserId, OccurredAt = DateTime.UtcNow
        });
        await _db.SaveChangesAsync();
        return new ActivityDetailDto { Id = log.Id, Type = "Email", Subject = log.Subject ?? "", Status = "Sent", EntityType = dto.EntityType, EntityId = dto.EntityId, CreatedAt = log.CreatedAt };
    }

    public async Task<ActivityDetailDto> LogCallAsync(LogCallDto dto)
    {
        var et = Enum.Parse<EntityType>(dto.EntityType, true);
        var call = new Call
        {
            Subject = dto.Subject, EntityType = et, EntityId = dto.EntityId,
            Direction = Enum.Parse<CallDirection>(dto.Direction, true),
            Status = Enum.Parse<CallStatus>(dto.Status, true),
            CallDatetime = dto.CallDatetime, DurationSec = dto.DurationSec ?? 0,
            Outcome = dto.Outcome, Description = dto.Description,
            AssignedTo = _currentUser.UserId ?? 1, CreatedBy = _currentUser.UserId
        };
        _db.Calls.Add(call);
        _db.CommunicationHistories.Add(new CommunicationHistory
        {
            EntityType = et, EntityId = dto.EntityId, Channel = CommunicationChannel.Call,
            Direction = Enum.Parse<Direction>(dto.Direction, true), Subject = dto.Subject,
            DurationSec = dto.DurationSec, Status = dto.Status,
            HandledBy = _currentUser.UserId, OccurredAt = dto.CallDatetime
        });
        await _db.SaveChangesAsync();
        return await GetByIdAsync(call.Id);
    }
}
