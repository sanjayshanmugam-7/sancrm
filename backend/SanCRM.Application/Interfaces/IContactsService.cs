using Microsoft.AspNetCore.Http;
using SanCRM.Application.Common;
using SanCRM.Application.DTOs;

namespace SanCRM.Application.Interfaces;

public interface IContactsService
{
    Task<PagedResult<ContactListDto>> GetAllAsync(ContactQueryParams q);
    Task<ContactDetailDto> GetByIdAsync(int id);
    Task<ContactDetailDto> CreateAsync(CreateContactDto dto);
    Task<ContactDetailDto> UpdateAsync(int id, UpdateContactDto dto);
    Task DeleteAsync(int id);
    Task BulkDeleteAsync(List<int> ids);
    Task<byte[]> ExportAsync(ContactQueryParams q);
    Task<IEnumerable<CustomerGroupDto>> GetGroupsAsync();
    Task<CustomerGroupDto> GetGroupByIdAsync(int id);
    Task<CustomerGroupDto> CreateGroupAsync(CustomerGroupDto dto);
    Task<CustomerGroupDto> UpdateGroupAsync(int id, CustomerGroupDto dto);
    Task DeleteGroupAsync(int id);
    Task AddToGroupAsync(int groupId, List<int> contactIds);
    Task RemoveFromGroupAsync(int groupId, int contactId);
    Task<IEnumerable<ActivityListDto>> GetActivitiesAsync(int id);
    Task<IEnumerable<NoteDto>> GetNotesAsync(int id);
    Task<NoteDto> AddNoteAsync(int id, CreateNoteDto dto);
    Task<IEnumerable<AttachmentDto>> GetAttachmentsAsync(int id);
    Task<AttachmentDto> AddAttachmentAsync(int id, IFormFile file, string? category);
    Task<IEnumerable<CommunicationHistoryDto>> GetCommunicationHistoryAsync(int id);
    Task<IEnumerable<RelationshipDto>> GetRelationshipsAsync(int id);
    Task<ContactStatsDto> GetStatsAsync();
}
