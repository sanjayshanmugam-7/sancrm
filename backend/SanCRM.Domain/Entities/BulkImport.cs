using SanCRM.Domain.Enums;

namespace SanCRM.Domain.Entities;

public class BulkImport
{
    public int Id { get; set; }
    public ImportType ImportType { get; set; }
    public string? FileName { get; set; }
    public string? FilePath { get; set; }
    public int TotalRows { get; set; } = 0;
    public int Imported { get; set; } = 0;
    public int Skipped { get; set; } = 0;
    public int Failed { get; set; } = 0;
    public int Duplicates { get; set; } = 0;
    public ImportStatus Status { get; set; } = ImportStatus.Pending;
    public string? ErrorLog { get; set; }   // JSON as NVARCHAR(MAX)
    public int? ImportedBy { get; set; }
    public DateTime? StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User? ImportedByUser { get; set; }
}
