using Microsoft.AspNetCore.Http;
using SanCRM.Application.Common;
using SanCRM.Application.DTOs;

namespace SanCRM.Application.Interfaces;

public interface IDocumentsService
{
    Task<PagedResult<DocumentListDto>> GetAllAsync(DocumentQueryParams q);
    Task<DocumentDetailDto> GetByIdAsync(int id);
    Task<DocumentDetailDto> CreateAsync(CreateDocumentDto dto);
    Task<DocumentDetailDto> UpdateAsync(int id, UpdateDocumentDto dto);
    Task DeleteAsync(int id);
    Task<(byte[] data, string contentType, string fileName)> DownloadAsync(int id);
    Task<AttachmentDto> UploadAsync(IFormFile file, string? entityType, int? entityId);
    Task<SignatureStatusDto> SendForSignatureAsync(int id, SendSignatureDto dto);
    Task<IEnumerable<SignatureStatusDto>> GetSignatureStatusAsync(int id);
    Task<OcrResultDto> ProcessOcrAsync(IFormFile file);
    Task<IEnumerable<DocumentListDto>> GetVersionsAsync(int id);
    Task<DocumentListDto> CreateVersionAsync(int id, IFormFile file);
    Task<IEnumerable<DocumentTemplateDto>> GetTemplatesAsync(string? type);
    Task<DocumentTemplateDto> CreateTemplateAsync(DocumentTemplateDto dto);
    Task<(byte[] data, string contentType)> GeneratePdfAsync(int id);
    Task ShareAsync(int id, ShareDocumentDto dto);
    Task<DocumentStatsDto> GetStatsAsync();
}
