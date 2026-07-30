using System.Text;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using SanCRM.Application.Common;
using SanCRM.Application.DTOs;
using SanCRM.Application.Interfaces;
using SanCRM.Domain.Entities;
using SanCRM.Domain.Enums;
using SanCRM.Infrastructure.Data;

namespace SanCRM.Application.Services;

public class DocumentsService : IDocumentsService
{
    private readonly CrmDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly IAuditService _audit;
    private readonly IConfiguration _config;

    public DocumentsService(CrmDbContext db, ICurrentUserService currentUser,
                            IAuditService audit, IConfiguration config)
    { _db = db; _currentUser = currentUser; _audit = audit; _config = config; }

    public async Task<PagedResult<DocumentListDto>> GetAllAsync(DocumentQueryParams q)
    {
        var query = _db.Documents.Include(d => d.CreatedByUser).Include(d => d.Opportunity).AsNoTracking();
        if (!string.IsNullOrWhiteSpace(q.Search)) query = query.Where(d => d.Title.Contains(q.Search) || d.DocNo.Contains(q.Search));
        if (!string.IsNullOrWhiteSpace(q.DocType) && Enum.TryParse<DocumentType>(q.DocType, true, out var dt)) query = query.Where(d => d.DocType == dt);
        if (!string.IsNullOrWhiteSpace(q.Status) && Enum.TryParse<DocumentStatus>(q.Status, true, out var ds)) query = query.Where(d => d.Status == ds);
        if (q.OpportunityId.HasValue) query = query.Where(d => d.OpportunityId == q.OpportunityId.Value);
        var total = await query.CountAsync();
        var items = await query.OrderByDescending(d => d.CreatedAt).Skip((q.Page - 1) * q.PageSize).Take(q.PageSize).ToListAsync();
        return new PagedResult<DocumentListDto>
        {
            Data = items.Select(d => new DocumentListDto { Id = d.Id, DocNo = d.DocNo, DocType = d.DocType.ToString(), Title = d.Title, Status = d.Status.ToString(), Value = d.Value, ValidUntil = d.ValidUntil?.ToString("yyyy-MM-dd"), EntityType = d.EntityType?.ToString(), EntityId = d.EntityId, OpportunityTitle = d.Opportunity?.Title, CreatedBy = d.CreatedByUser?.FullName, CreatedAt = d.CreatedAt }),
            Total = total, Page = q.Page, PageSize = q.PageSize
        };
    }

    public async Task<DocumentDetailDto> GetByIdAsync(int id)
    {
        var d = await _db.Documents.Include(x => x.LineItems).Include(x => x.Signatures)
            .Include(x => x.CreatedByUser).Include(x => x.Opportunity).AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id)
            ?? throw new KeyNotFoundException($"Document {id} not found.");

        var subtotal = d.LineItems.Sum(li => li.Quantity * li.UnitPrice * (1 - li.DiscountPct / 100));
        var totalTax = d.LineItems.Sum(li => li.Quantity * li.UnitPrice * (1 - li.DiscountPct / 100) * li.TaxRate / 100);

        return new DocumentDetailDto
        {
            Id = d.Id, DocNo = d.DocNo, DocType = d.DocType.ToString(), Title = d.Title,
            Status = d.Status.ToString(), Value = d.Value, ValidUntil = d.ValidUntil?.ToString("yyyy-MM-dd"),
            Currency = d.Currency, EntityType = d.EntityType?.ToString(), EntityId = d.EntityId,
            OpportunityId = d.OpportunityId, OpportunityTitle = d.Opportunity?.Title,
            Notes = d.Notes, Terms = d.Terms, FilePath = d.FilePath, FileSize = d.FileSize,
            SentAt = d.SentAt, SignedAt = d.SignedAt, ExpiresAt = d.ExpiresAt,
            CreatedBy = d.CreatedByUser?.FullName, CreatedAt = d.CreatedAt,
            LineItems = d.LineItems.OrderBy(li => li.SortOrder).Select(li => new DocumentLineItemDto
            {
                Id = li.Id, SortOrder = li.SortOrder, ItemCode = li.ItemCode, Description = li.Description,
                Quantity = li.Quantity, Unit = li.Unit, UnitPrice = li.UnitPrice,
                DiscountPct = li.DiscountPct, TaxRate = li.TaxRate
            }).ToList(),
            Signatures = d.Signatures.Select(s => new SignatureStatusDto { Id = s.Id, SignerName = s.SignerName, SignerEmail = s.SignerEmail, SignerRole = s.SignerRole, SignOrder = s.SignOrder, Status = s.Status.ToString(), ViewedAt = s.ViewedAt, SignedAt = s.SignedAt }).ToList(),
            Subtotal = subtotal, TotalTax = totalTax, GrandTotal = subtotal + totalTax
        };
    }

    public async Task<DocumentDetailDto> CreateAsync(CreateDocumentDto dto)
    {
        var docNo = await GenerateDocNoAsync(dto.DocType);
        DateOnly? validUntil = null;
        if (!string.IsNullOrEmpty(dto.ValidUntil) && DateOnly.TryParse(dto.ValidUntil, out var vu)) validUntil = vu;

        var doc = new Document
        {
            DocNo = docNo, DocType = Enum.Parse<DocumentType>(dto.DocType, true), Title = dto.Title,
            EntityType = dto.EntityType != null ? Enum.Parse<EntityType>(dto.EntityType, true) : null,
            EntityId = dto.EntityId, OpportunityId = dto.OpportunityId, Value = dto.Value,
            Currency = dto.Currency, ValidUntil = validUntil, Notes = dto.Notes, Terms = dto.Terms,
            TemplateId = dto.TemplateId, CreatedBy = _currentUser.UserId
        };
        _db.Documents.Add(doc);
        await _db.SaveChangesAsync();

        if (dto.LineItems != null)
        {
            foreach (var li in dto.LineItems)
            {
                var lineItem = new DocumentLineItem
                {
                    DocumentId = doc.Id, SortOrder = li.SortOrder, ItemCode = li.ItemCode,
                    Description = li.Description, Quantity = li.Quantity, Unit = li.Unit,
                    UnitPrice = li.UnitPrice, DiscountPct = li.DiscountPct, TaxRate = li.TaxRate,
                    Amount = li.Quantity * li.UnitPrice * (1 - li.DiscountPct / 100)
                };
                _db.DocumentLineItems.Add(lineItem);
            }
            await _db.SaveChangesAsync();
        }

        await _audit.LogAsync(AuditAction.Create, "Document", doc.Id);
        return await GetByIdAsync(doc.Id);
    }

    public async Task<DocumentDetailDto> UpdateAsync(int id, UpdateDocumentDto dto)
    {
        var doc = await _db.Documents.FindAsync(id) ?? throw new KeyNotFoundException();
        doc.Title = dto.Title;
        if (!string.IsNullOrWhiteSpace(dto.Status) && Enum.TryParse<DocumentStatus>(dto.Status, true, out var st)) doc.Status = st;
        doc.Value = dto.Value; doc.Notes = dto.Notes; doc.Terms = dto.Terms;
        if (!string.IsNullOrEmpty(dto.ValidUntil) && DateOnly.TryParse(dto.ValidUntil, out var vu)) doc.ValidUntil = vu;
        doc.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        await _audit.LogAsync(AuditAction.Update, "Document", id);
        return await GetByIdAsync(id);
    }

    public async Task DeleteAsync(int id)
    {
        var d = await _db.Documents.FindAsync(id) ?? throw new KeyNotFoundException();
        _db.Documents.Remove(d);
        await _db.SaveChangesAsync();
        await _audit.LogAsync(AuditAction.Delete, "Document", id);
    }

    public async Task<(byte[] data, string contentType, string fileName)> DownloadAsync(int id)
    {
        var doc = await _db.Documents.FindAsync(id) ?? throw new KeyNotFoundException();
        if (!string.IsNullOrEmpty(doc.FilePath) && System.IO.File.Exists(doc.FilePath))
        {
            var data = await System.IO.File.ReadAllBytesAsync(doc.FilePath);
            return (data, "application/octet-stream", Path.GetFileName(doc.FilePath));
        }
        // Return placeholder PDF content
        var content = Encoding.UTF8.GetBytes($"Document: {doc.Title}\nStatus: {doc.Status}");
        return (content, "application/pdf", $"{doc.DocNo}.pdf");
    }

    public async Task<AttachmentDto> UploadAsync(IFormFile file, string? entityType, int? entityId)
    {
        var uploadPath = _config["FileStorage:UploadPath"] ?? "uploads";
        var dir = Path.Combine(uploadPath, "documents");
        Directory.CreateDirectory(dir);
        var fileName = $"{Guid.NewGuid()}_{Path.GetFileName(file.FileName)}";
        var fullPath = Path.Combine(dir, fileName);
        await using var stream = new FileStream(fullPath, FileMode.Create);
        await file.CopyToAsync(stream);

        var att = new Attachment
        {
            EntityType = entityType != null ? Enum.Parse<EntityType>(entityType, true) : EntityType.Document,
            EntityId = entityId ?? 0, FileName = file.FileName, FilePath = fullPath,
            FileSize = file.Length, MimeType = file.ContentType, UploadedBy = _currentUser.UserId
        };
        _db.Attachments.Add(att);
        await _db.SaveChangesAsync();
        return new AttachmentDto { Id = att.Id, FileName = att.FileName, FileSize = att.FileSize, MimeType = att.MimeType, CreatedAt = att.CreatedAt, DownloadUrl = $"/api/v1/attachments/{att.Id}/download" };
    }

    public async Task<SignatureStatusDto> SendForSignatureAsync(int id, SendSignatureDto dto)
    {
        var doc = await _db.Documents.FindAsync(id) ?? throw new KeyNotFoundException();
        var token = Convert.ToBase64String(Guid.NewGuid().ToByteArray()).Replace("+", "-").Replace("/", "_").TrimEnd('=');
        var sig = new DocumentSignature
        {
            DocumentId = id, SignerName = dto.SignerName ?? "Signer",
            SignerEmail = dto.Email ?? string.Empty, SignerRole = dto.SignerRole,
            Token = token, Status = SignatureStatus.Pending
        };
        _db.DocumentSignatures.Add(sig);
        doc.Status = DocumentStatus.Sent; doc.SentAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        // In production: send email with signature link /sign/{token}
        return new SignatureStatusDto { Id = sig.Id, SignerName = sig.SignerName, SignerEmail = sig.SignerEmail, SignerRole = sig.SignerRole, SignOrder = sig.SignOrder, Status = sig.Status.ToString() };
    }

    public async Task<IEnumerable<SignatureStatusDto>> GetSignatureStatusAsync(int id)
    {
        return await _db.DocumentSignatures.Where(s => s.DocumentId == id)
            .Select(s => new SignatureStatusDto { Id = s.Id, SignerName = s.SignerName, SignerEmail = s.SignerEmail, SignerRole = s.SignerRole, SignOrder = s.SignOrder, Status = s.Status.ToString(), ViewedAt = s.ViewedAt, SignedAt = s.SignedAt })
            .ToListAsync();
    }

    public async Task<OcrResultDto> ProcessOcrAsync(IFormFile file)
    {
        var uploadPath = _config["FileStorage:UploadPath"] ?? "uploads";
        var dir = Path.Combine(uploadPath, "ocr");
        Directory.CreateDirectory(dir);
        var fileName = $"{Guid.NewGuid()}_{Path.GetFileName(file.FileName)}";
        var fullPath = Path.Combine(dir, fileName);
        await using var stream = new FileStream(fullPath, FileMode.Create);
        await file.CopyToAsync(stream);

        var ocr = new OcrDocument
        {
            OriginalFile = fullPath, FileName = file.FileName, Status = OcrStatus.Queued,
            UploadedBy = _currentUser.UserId
        };
        _db.OcrDocuments.Add(ocr);
        await _db.SaveChangesAsync();
        // In production: queue background OCR job
        return new OcrResultDto { Id = ocr.Id, Status = ocr.Status.ToString(), Confidence = 0 };
    }

    public async Task<IEnumerable<DocumentListDto>> GetVersionsAsync(int id)
    {
        var doc = await _db.Documents.FindAsync(id) ?? throw new KeyNotFoundException();
        return await _db.Documents.Where(d => d.Title == doc.Title && d.DocType == doc.DocType)
            .Select(d => new DocumentListDto { Id = d.Id, DocNo = d.DocNo, DocType = d.DocType.ToString(), Title = d.Title, Status = d.Status.ToString(), CreatedAt = d.CreatedAt })
            .ToListAsync();
    }

    public async Task<DocumentListDto> CreateVersionAsync(int id, IFormFile file)
    {
        var source = await _db.Documents.AsNoTracking().FirstOrDefaultAsync(d => d.Id == id) ?? throw new KeyNotFoundException();
        var uploadPath = _config["FileStorage:UploadPath"] ?? "uploads";
        var dir = Path.Combine(uploadPath, "documents");
        Directory.CreateDirectory(dir);
        var fn = $"{Guid.NewGuid()}_{Path.GetFileName(file.FileName)}";
        var fullPath = Path.Combine(dir, fn);
        await using var stream = new FileStream(fullPath, FileMode.Create);
        await file.CopyToAsync(stream);

        var newDoc = new Document
        {
            DocNo = await GenerateDocNoAsync(source.DocType.ToString()), DocType = source.DocType,
            Title = source.Title, EntityType = source.EntityType, EntityId = source.EntityId,
            OpportunityId = source.OpportunityId, Value = source.Value, Currency = source.Currency,
            FilePath = fullPath, FileSize = file.Length, Notes = source.Notes, Terms = source.Terms,
            CreatedBy = _currentUser.UserId
        };
        _db.Documents.Add(newDoc);
        await _db.SaveChangesAsync();
        return new DocumentListDto { Id = newDoc.Id, DocNo = newDoc.DocNo, DocType = newDoc.DocType.ToString(), Title = newDoc.Title, Status = newDoc.Status.ToString(), CreatedAt = newDoc.CreatedAt };
    }

    public Task<IEnumerable<DocumentTemplateDto>> GetTemplatesAsync(string? type)
        => Task.FromResult<IEnumerable<DocumentTemplateDto>>(new List<DocumentTemplateDto>());

    public Task<DocumentTemplateDto> CreateTemplateAsync(DocumentTemplateDto dto)
        => Task.FromResult(dto);

    public async Task<(byte[] data, string contentType)> GeneratePdfAsync(int id)
    {
        var doc = await GetByIdAsync(id);
        var sb = new StringBuilder();
        sb.AppendLine($"Document: {doc.Title}");
        sb.AppendLine($"Doc No: {doc.DocNo}");
        sb.AppendLine($"Status: {doc.Status}");
        sb.AppendLine($"Total: {doc.GrandTotal:C}");
        foreach (var li in doc.LineItems)
            sb.AppendLine($"  {li.Description} x{li.Quantity} @ {li.UnitPrice:C} = {li.Quantity * li.UnitPrice:C}");
        return (Encoding.UTF8.GetBytes(sb.ToString()), "application/pdf");
    }

    public async Task ShareAsync(int id, ShareDocumentDto dto)
    {
        var doc = await _db.Documents.FindAsync(id) ?? throw new KeyNotFoundException();
        // In production: send emails to dto.Emails
        await Task.CompletedTask;
    }

    public async Task<DocumentStatsDto> GetStatsAsync()
    {
        return new DocumentStatsDto
        {
            Total = await _db.Documents.CountAsync(),
            Signed = await _db.Documents.CountAsync(d => d.Status == DocumentStatus.Signed),
            PendingSignature = await _db.DocumentSignatures.CountAsync(s => s.Status == SignatureStatus.Pending),
            Expired = await _db.Documents.CountAsync(d => d.Status == DocumentStatus.Expired),
            TotalValue = await _db.Documents.SumAsync(d => (decimal?)d.Value) ?? 0,
            ByType = await _db.Documents.GroupBy(d => d.DocType).ToDictionaryAsync(g => g.Key.ToString(), g => g.Count()),
            ByStatus = await _db.Documents.GroupBy(d => d.Status).ToDictionaryAsync(g => g.Key.ToString(), g => g.Count())
        };
    }

    private async Task<string> GenerateDocNoAsync(string docType)
    {
        var prefix = docType.ToUpperInvariant() switch
        {
            "PROPOSAL" => "PROP",
            "QUOTATION" => "QUOT",
            "AGREEMENT" => "AGRM",
            _ => "DOC"
        };
        var year = DateTime.UtcNow.Year;
        var count = await _db.Documents.CountAsync(d => d.CreatedAt.Year == year);
        return $"{prefix}-{year}-{(count + 1):D4}";
    }
}
