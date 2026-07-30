using Microsoft.AspNetCore.Http;
using SanCRM.Application.Common;
using SanCRM.Application.DTOs;

namespace SanCRM.Application.Interfaces;

public interface ILeadsService
{
    Task<PagedResult<LeadListDto>> GetAllAsync(LeadQueryParams q);
    Task<LeadDetailDto> GetByIdAsync(int id);
    Task<LeadDetailDto> CreateAsync(CreateLeadDto dto);
    Task<LeadDetailDto> UpdateAsync(int id, UpdateLeadDto dto);
    Task DeleteAsync(int id);
    Task BulkDeleteAsync(List<int> ids);
    Task<BulkImportResultDto> BulkImportAsync(IFormFile file);
    Task<byte[]> ExportAsync(LeadQueryParams q);
    Task<IEnumerable<LeadListDto>> DetectDuplicatesAsync();
    Task MergeDuplicatesAsync(int primaryId, int duplicateId);
    Task BulkAssignAsync(BulkAssignDto dto);
    Task<LeadConvertResultDto> ConvertAsync(int id, LeadConvertDto dto);
    Task<IEnumerable<NoteDto>> GetNotesAsync(int id);
    Task<NoteDto> AddNoteAsync(int id, CreateNoteDto dto);
    Task<IEnumerable<AttachmentDto>> GetAttachmentsAsync(int id);
    Task<AttachmentDto> AddAttachmentAsync(int id, IFormFile file, string? category);
    Task<IEnumerable<ActivityListDto>> GetActivitiesAsync(int id);
    Task<IEnumerable<CommunicationHistoryDto>> GetCommunicationHistoryAsync(int id);
    Task<AiScoreDto> UpdateAiScoreAsync(int id);
    Task<LeadStatsDto> GetStatsAsync();
    Task<IEnumerable<LeadSourceBreakdownDto>> GetSourceBreakdownAsync();
    Task<IEnumerable<AssignmentRuleDto>> GetAssignmentRulesAsync();
    Task<AssignmentRuleDto> CreateAssignmentRuleAsync(AssignmentRuleDto dto);
    Task<AssignmentRuleDto> UpdateAssignmentRuleAsync(int ruleId, AssignmentRuleDto dto);
    Task DeleteAssignmentRuleAsync(int ruleId);
}
