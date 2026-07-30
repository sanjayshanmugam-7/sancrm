namespace SanCRM.Application.DTOs;

public class CreateDocumentDto
{
    public string DocType { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? EntityType { get; set; }
    public int? EntityId { get; set; }
    public int? OpportunityId { get; set; }
    public decimal? Value { get; set; }
    public string Currency { get; set; } = "INR";
    public string? ValidUntil { get; set; }
    public string? Notes { get; set; }
    public string? Terms { get; set; }
    public int? TemplateId { get; set; }
    public List<DocumentLineItemDto>? LineItems { get; set; }
}

public class UpdateDocumentDto : CreateDocumentDto
{
    public string? Status { get; set; }
}

public class DocumentLineItemDto
{
    public int? Id { get; set; }
    public short SortOrder { get; set; } = 0;
    public string? ItemCode { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Quantity { get; set; } = 1;
    public string Unit { get; set; } = "Unit";
    public decimal UnitPrice { get; set; } = 0;
    public decimal DiscountPct { get; set; } = 0;
    public decimal TaxRate { get; set; } = 18;
}

public class DocumentListDto
{
    public int Id { get; set; }
    public string DocNo { get; set; } = string.Empty;
    public string DocType { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public decimal? Value { get; set; }
    public string? ValidUntil { get; set; }
    public string? EntityType { get; set; }
    public int? EntityId { get; set; }
    public string? OpportunityTitle { get; set; }
    public string? CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class DocumentDetailDto : DocumentListDto
{
    public int? OpportunityId { get; set; }
    public string Currency { get; set; } = "INR";
    public string? Notes { get; set; }
    public string? Terms { get; set; }
    public string? FilePath { get; set; }
    public long? FileSize { get; set; }
    public DateTime? SentAt { get; set; }
    public DateTime? SignedAt { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public List<DocumentLineItemDto> LineItems { get; set; } = new();
    public List<SignatureStatusDto> Signatures { get; set; } = new();
    public decimal Subtotal { get; set; }
    public decimal TotalTax { get; set; }
    public decimal GrandTotal { get; set; }
}

public class SignatureStatusDto
{
    public int Id { get; set; }
    public string SignerName { get; set; } = string.Empty;
    public string SignerEmail { get; set; } = string.Empty;
    public string? SignerRole { get; set; }
    public byte SignOrder { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime? ViewedAt { get; set; }
    public DateTime? SignedAt { get; set; }
}

public class SendSignatureDto
{
    public string? Email { get; set; }
    public string? SignerName { get; set; }
    public string? SignerRole { get; set; }
}

public class ShareDocumentDto
{
    public List<string> Emails { get; set; } = new();
    public string? Message { get; set; }
}

public class DocumentStatsDto
{
    public int Total { get; set; }
    public int Signed { get; set; }
    public int PendingSignature { get; set; }
    public int Expired { get; set; }
    public decimal TotalValue { get; set; }
    public Dictionary<string, int> ByType { get; set; } = new();
    public Dictionary<string, int> ByStatus { get; set; } = new();
}

public class DocumentTemplateDto
{
    public int? Id { get; set; }
    public string DocType { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Content { get; set; }
    public string? Terms { get; set; }
}

public class OcrResultDto
{
    public int Id { get; set; }
    public string? DocType { get; set; }
    public string Status { get; set; } = string.Empty;
    public decimal Confidence { get; set; }
    public Dictionary<string, object>? ExtractedData { get; set; }
}
