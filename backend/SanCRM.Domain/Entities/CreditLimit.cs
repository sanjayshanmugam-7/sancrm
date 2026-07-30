using SanCRM.Domain.Enums;

namespace SanCRM.Domain.Entities;

public class CreditLimit
{
    public int Id { get; set; }
    public int CompanyId { get; set; }
    public decimal Limit { get; set; } = 0;
    public decimal UsedAmount { get; set; } = 0;
    public decimal OverdueAmount { get; set; } = 0;
    public CreditStatus Status { get; set; } = CreditStatus.Good;
    public DateOnly? LastReview { get; set; }
    public DateOnly? NextReview { get; set; }
    public int? ReviewedBy { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public Company Company { get; set; } = null!;
    public User? ReviewedByUser { get; set; }
}
