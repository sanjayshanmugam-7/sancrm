using SanCRM.Domain.Enums;

namespace SanCRM.Domain.Entities;

public class CustomerCategory
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Color { get; set; } = "#1976d2";
    public CategoryPriority Priority { get; set; } = CategoryPriority.Silver;
    public decimal DiscountPct { get; set; } = 0;
    public decimal CreditLimit { get; set; } = 0;
    public int SlaHours { get; set; } = 24;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Company> Companies { get; set; } = new List<Company>();
}
