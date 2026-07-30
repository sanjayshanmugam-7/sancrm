using SanCRM.Application.Common;
using SanCRM.Application.DTOs;

namespace SanCRM.Application.Interfaces;

public interface ICampaignsService
{
    Task<PagedResult<CampaignListDto>> GetAllAsync(CampaignQueryParams q);
    Task<CampaignDetailDto> GetByIdAsync(int id);
    Task<CampaignDetailDto> CreateAsync(CreateCampaignDto dto);
    Task<CampaignDetailDto> UpdateAsync(int id, UpdateCampaignDto dto);
    Task DeleteAsync(int id);
    Task<CampaignDetailDto> LaunchAsync(int id);
    Task<CampaignDetailDto> PauseAsync(int id);
    Task<CampaignDetailDto> ResumeAsync(int id);
    Task<CampaignDetailDto> StopAsync(int id);
    Task<CampaignDetailDto> DuplicateAsync(int id);
    Task<CampaignDetailDto> GetStatsAsync(int id);
    Task<PagedResult<RecipientDto>> GetRecipientsAsync(int id, QueryParams q);
    Task AddRecipientsAsync(int id, AddRecipientsDto dto);
    Task<IEnumerable<CampaignTemplateDto>> GetTemplatesAsync(string? type);
    Task<CampaignTemplateDto> CreateTemplateAsync(CampaignTemplateDto dto);
    Task SendTestEmailAsync(TestEmailDto dto);
    Task SendTestSmsAsync(TestSmsDto dto);
    Task<object> GetEmailMetricsAsync(int id);
    Task<object> GetSmsMetricsAsync(int id);
    Task<CampaignStatsDto> GetOverallStatsAsync();
}
