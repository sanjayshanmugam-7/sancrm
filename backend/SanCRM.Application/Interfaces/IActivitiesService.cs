using SanCRM.Application.Common;
using SanCRM.Application.DTOs;

namespace SanCRM.Application.Interfaces;

public interface IActivitiesService
{
    Task<PagedResult<ActivityListDto>> GetAllAsync(ActivityQueryParams q);
    Task<ActivityDetailDto> GetByIdAsync(int id);
    Task<ActivityDetailDto> CreateAsync(CreateActivityDto dto);
    Task<ActivityDetailDto> UpdateAsync(int id, UpdateActivityDto dto);
    Task DeleteAsync(int id);
    Task<ActivityDetailDto> CompleteAsync(int id, CompleteActivityDto dto);
    Task<ActivityDetailDto> RescheduleAsync(int id, RescheduleDto dto);
    Task SetReminderAsync(int id, SetReminderDto dto);
    Task<PagedResult<ActivityListDto>> GetCallsAsync(ActivityQueryParams q);
    Task<PagedResult<ActivityListDto>> GetMeetingsAsync(ActivityQueryParams q);
    Task<PagedResult<ActivityListDto>> GetEmailsAsync(ActivityQueryParams q);
    Task<PagedResult<ActivityListDto>> GetFollowUpsAsync(ActivityQueryParams q);
    Task<IEnumerable<ActivityListDto>> GetPendingRemindersAsync();
    Task<IEnumerable<CalendarEventDto>> GetCalendarAsync(DateTime from, DateTime to);
    Task<ActivityStatsDto> GetStatsAsync();
    Task<ActivityDetailDto> SendEmailAsync(SendEmailDto dto);
    Task<ActivityDetailDto> LogCallAsync(LogCallDto dto);
}
