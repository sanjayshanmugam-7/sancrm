using SanCRM.Domain.Enums;

namespace SanCRM.Domain.Entities;

public class GstDetail
{
    public int Id { get; set; }
    public int CompanyId { get; set; }
    public int? BranchId { get; set; }
    public string Gstin { get; set; } = string.Empty;
    public string? LegalName { get; set; }
    public string? TradeName { get; set; }
    public string? GstStateCode { get; set; }
    public string? State { get; set; }
    public GstRegistrationType RegistrationType { get; set; } = GstRegistrationType.Regular;
    public bool IsVerified { get; set; } = false;
    public DateTime? VerifiedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Company Company { get; set; } = null!;
    public Branch? Branch { get; set; }
}
