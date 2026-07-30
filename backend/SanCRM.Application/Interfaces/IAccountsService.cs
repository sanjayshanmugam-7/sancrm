using SanCRM.Application.Common;
using SanCRM.Application.DTOs;

namespace SanCRM.Application.Interfaces;

public interface IAccountsService
{
    Task<PagedResult<AccountListDto>> GetAllAsync(AccountQueryParams q);
    Task<AccountDetailDto> GetByIdAsync(int id);
    Task<AccountDetailDto> CreateAsync(CreateAccountDto dto);
    Task<AccountDetailDto> UpdateAsync(int id, UpdateAccountDto dto);
    Task DeleteAsync(int id);
    Task<IEnumerable<BranchDto>> GetBranchesAsync(int id);
    Task<BranchDto> CreateBranchAsync(int companyId, CreateBranchDto dto);
    Task<IEnumerable<CompanyHierarchyDto>> GetHierarchyAsync();
    Task<IEnumerable<ContactListDto>> GetContactsAsync(int id);
    Task<IEnumerable<OpportunityListDto>> GetOpportunitiesAsync(int id);
    Task<IEnumerable<DocumentListDto>> GetDocumentsAsync(int id);
    Task<IEnumerable<ActivityListDto>> GetActivitiesAsync(int id);
    Task<IEnumerable<NoteDto>> GetNotesAsync(int id);
    Task<NoteDto> AddNoteAsync(int id, CreateNoteDto dto);
    Task UpdateCreditLimitAsync(int id, UpdateCreditLimitDto dto);
    Task<GstValidationResult> ValidateGstAsync(string gstNumber);
    Task<IEnumerable<CustomerCategoryDto>> GetCategoriesAsync();
    Task<AccountStatsDto> GetStatsAsync();
    Task<byte[]> ExportAsync(AccountQueryParams q);
}
