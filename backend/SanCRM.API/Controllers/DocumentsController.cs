using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SanCRM.Application.Common;
using SanCRM.Application.DTOs;
using SanCRM.Application.Interfaces;

namespace SanCRM.API.Controllers;

/// <summary>
/// Document Management — proposals, quotations, agreements, OCR, digital signatures
/// </summary>
[ApiController]
[Route("api/v1/documents")]
[Authorize]
[Produces("application/json")]
public class DocumentsController : ControllerBase
{
    private readonly IDocumentsService _service;
    public DocumentsController(IDocumentsService service) => _service = service;

    /// <summary>Get paginated documents list</summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PagedResult<DocumentListDto>>), 200)]
    public async Task<IActionResult> GetAll([FromQuery] DocumentQueryParams q)
        => Ok(ApiResponse<PagedResult<DocumentListDto>>.Ok(await _service.GetAllAsync(q)));

    /// <summary>Get document stats</summary>
    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
        => Ok(ApiResponse<DocumentStatsDto>.Ok(await _service.GetStatsAsync()));

    /// <summary>Get document templates by type</summary>
    [HttpGet("templates")]
    public async Task<IActionResult> GetTemplates([FromQuery] string? type)
        => Ok(ApiResponse<IEnumerable<DocumentTemplateDto>>.Ok(await _service.GetTemplatesAsync(type)));

    /// <summary>Create document template</summary>
    [HttpPost("templates")]
    public async Task<IActionResult> CreateTemplate([FromBody] DocumentTemplateDto dto)
        => Ok(ApiResponse<DocumentTemplateDto>.Ok(await _service.CreateTemplateAsync(dto)));

    /// <summary>Upload document file</summary>
    [HttpPost("upload")]
    [ProducesResponseType(typeof(ApiResponse<AttachmentDto>), 200)]
    public async Task<IActionResult> Upload(IFormFile file,
        [FromQuery] string? entityType, [FromQuery] int? entityId)
        => Ok(ApiResponse<AttachmentDto>.Ok(await _service.UploadAsync(file, entityType, entityId)));

    /// <summary>Process OCR on uploaded document</summary>
    [HttpPost("ocr")]
    public async Task<IActionResult> ProcessOcr(IFormFile file)
        => Ok(ApiResponse<OcrResultDto>.Ok(await _service.ProcessOcrAsync(file)));

    /// <summary>Get single document</summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<DocumentDetailDto>), 200)]
    public async Task<IActionResult> GetById(int id)
    {
        try { return Ok(ApiResponse<DocumentDetailDto>.Ok(await _service.GetByIdAsync(id))); }
        catch (KeyNotFoundException ex) { return NotFound(ApiResponse.Fail(ex.Message)); }
    }

    /// <summary>Create document (proposal/quotation/agreement)</summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateDocumentDto dto)
        => Ok(ApiResponse<DocumentDetailDto>.Ok(await _service.CreateAsync(dto)));

    /// <summary>Update document</summary>
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateDocumentDto dto)
    {
        try { return Ok(ApiResponse<DocumentDetailDto>.Ok(await _service.UpdateAsync(id, dto))); }
        catch (KeyNotFoundException ex) { return NotFound(ApiResponse.Fail(ex.Message)); }
    }

    /// <summary>Delete document</summary>
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> Delete(int id)
    {
        await _service.DeleteAsync(id);
        return Ok(ApiResponse.Ok("Document deleted"));
    }

    /// <summary>Download document file</summary>
    [HttpGet("{id:int}/download")]
    public async Task<IActionResult> Download(int id)
    {
        var (data, contentType, fileName) = await _service.DownloadAsync(id);
        return File(data, contentType, fileName);
    }

    /// <summary>Generate PDF for document</summary>
    [HttpPost("{id:int}/generate-pdf")]
    public async Task<IActionResult> GeneratePdf(int id)
    {
        var (data, contentType) = await _service.GeneratePdfAsync(id);
        return File(data, contentType, $"document_{id}.pdf");
    }

    /// <summary>Send document for e-signature</summary>
    [HttpPost("{id:int}/send-signature")]
    public async Task<IActionResult> SendForSignature(int id, [FromBody] SendSignatureDto dto)
        => Ok(ApiResponse<SignatureStatusDto>.Ok(await _service.SendForSignatureAsync(id, dto)));

    /// <summary>Get signature status for document</summary>
    [HttpGet("{id:int}/signature-status")]
    public async Task<IActionResult> GetSignatureStatus(int id)
        => Ok(ApiResponse<IEnumerable<SignatureStatusDto>>.Ok(await _service.GetSignatureStatusAsync(id)));

    /// <summary>Share document with recipients via email</summary>
    [HttpPost("{id:int}/share")]
    public async Task<IActionResult> Share(int id, [FromBody] ShareDocumentDto dto)
    {
        await _service.ShareAsync(id, dto);
        return Ok(ApiResponse.Ok("Document shared"));
    }

    /// <summary>Get version history for document</summary>
    [HttpGet("{id:int}/versions")]
    public async Task<IActionResult> GetVersions(int id)
        => Ok(ApiResponse<IEnumerable<DocumentListDto>>.Ok(await _service.GetVersionsAsync(id)));

    /// <summary>Upload new version of document</summary>
    [HttpPost("{id:int}/versions")]
    public async Task<IActionResult> CreateVersion(int id, IFormFile file)
        => Ok(ApiResponse<DocumentListDto>.Ok(await _service.CreateVersionAsync(id, file)));
}
