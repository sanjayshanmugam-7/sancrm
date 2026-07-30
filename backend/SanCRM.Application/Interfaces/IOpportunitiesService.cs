using SanCRM.Application.Common;
using SanCRM.Application.DTOs;

namespace SanCRM.Application.Interfaces;

public interface IOpportunitiesService
{
    Task<PagedResult<OpportunityListDto>> GetAllAsync(OpportunityQueryParams q);
    Task<OpportunityDetailDto> GetByIdAsync(int id);
    Task<OpportunityDetailDto> CreateAsync(CreateOpportunityDto dto);
    Task<OpportunityDetailDto> UpdateAsync(int id, UpdateOpportunityDto dto);
    Task DeleteAsync(int id);
    Task<OpportunityDetailDto> UpdateStageAsync(int id, UpdateStageDto dto);
    Task<IEnumerable<ActivityListDto>> GetActivitiesAsync(int id);
    Task<IEnumerable<NoteDto>> GetNotesAsync(int id);
    Task<NoteDto> AddNoteAsync(int id, CreateNoteDto dto);
    Task<IEnumerable<DocumentListDto>> GetDocumentsAsync(int id);
    Task<IEnumerable<object>> GetTimelineAsync(int id);
    Task<PipelineStatsDto> GetPipelineStatsAsync();
    Task<AiPredictionDto> GetAiPredictionAsync(int id);
    Task<ForecastDto> GetForecastAsync(OpportunityQueryParams q);
    Task<byte[]> ExportAsync(OpportunityQueryParams q);
    Task<OpportunityStatsDto> GetStatsAsync();
    Task<IEnumerable<StageHistoryDto>> GetStageHistoryAsync(int id);
}
