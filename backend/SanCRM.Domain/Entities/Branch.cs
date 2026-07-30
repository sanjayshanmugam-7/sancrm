using SanCRM.Domain.Enums;

namespace SanCRM.Domain.Entities;

public class Branch
{
    public int Id { get; set; }
    public int CompanyId { get; set; }
    public string Name { get; set; } = string.Empty;
    public BranchType BranchType { get; set; } = BranchType.Branch;
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Gstin { get; set; }
    public bool IsPrimary { get; set; } = false;
    public string Status { get; set; } = "Active";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public Company Company { get; set; } = null!;
    public ICollection<GstDetail> GstDetails { get; set; } = new List<GstDetail>();
}
