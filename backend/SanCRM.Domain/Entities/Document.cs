using SanCRM.Domain.Enums;

namespace SanCRM.Domain.Entities;

public class Document
{
    public int Id { get; set; }
    public string DocNo { get; set; } = string.Empty;
    public DocumentType DocType { get; set; }
    public string Title { get; set; } = string.Empty;
    public DocumentStatus Status { get; set; } = DocumentStatus.Draft;
    public EntityType? EntityType { get; set; }
    public int? EntityId { get; set; }
    public int? OpportunityId { get; set; }
    public decimal? Value { get; set; }
    public string Currency { get; set; } = "INR";
    public DateOnly? ValidUntil { get; set; }
    public string? FilePath { get; set; }
    public long? FileSize { get; set; }
    public int? TemplateId { get; set; }
    public DateTime? SentAt { get; set; }
    public DateTime? SignedAt { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public string? Notes { get; set; }
    public string? Terms { get; set; }
    public int? CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public Opportunity? Opportunity { get; set; }
    public User? CreatedByUser { get; set; }
    public ICollection<DocumentLineItem> LineItems { get; set; } = new List<DocumentLineItem>();
    public ICollection<DocumentSignature> Signatures { get; set; } = new List<DocumentSignature>();
}

public class DocumentLineItem
{
    public int Id { get; set; }
    public int DocumentId { get; set; }
    public short SortOrder { get; set; } = 0;
    public string? ItemCode { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Quantity { get; set; } = 1;
    public string Unit { get; set; } = "Unit";
    public decimal UnitPrice { get; set; } = 0;
    public decimal DiscountPct { get; set; } = 0;
    public decimal TaxRate { get; set; } = 18;
    // amount = quantity * unit_price * (1 - discount_pct/100) — computed in service
    public decimal Amount { get; set; } = 0;

    public Document Document { get; set; } = null!;
}

public class DocumentSignature
{
    public int Id { get; set; }
    public int DocumentId { get; set; }
    public string SignerName { get; set; } = string.Empty;
    public string SignerEmail { get; set; } = string.Empty;
    public string? SignerRole { get; set; }
    public byte SignOrder { get; set; } = 1;
    public SignatureStatus Status { get; set; } = SignatureStatus.Pending;
    public string? Token { get; set; }
    public DateTime? ViewedAt { get; set; }
    public DateTime? SignedAt { get; set; }
    public string? IpAddress { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Document Document { get; set; } = null!;
}

public class OcrDocument
{
    public int Id { get; set; }
    public string OriginalFile { get; set; } = string.Empty;
    public string? FileName { get; set; }
    public string? DocType { get; set; }
    public OcrStatus Status { get; set; } = OcrStatus.Queued;
    public decimal Confidence { get; set; } = 0;
    public string? ExtractedData { get; set; }
    public string? RawText { get; set; }
    public int? UploadedBy { get; set; }
    public DateTime? ProcessedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User? UploadedByUser { get; set; }
}
