namespace SanCRM.Domain.Entities;

public class ParentCompany
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Industry { get; set; }
    public string Country { get; set; } = "India";
    public string? Website { get; set; }
    public decimal? Revenue { get; set; }
    public string Currency { get; set; } = "INR";
    public string Status { get; set; } = "Active";
    public int? CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public User? CreatedByUser { get; set; }
    public ICollection<Company> Companies { get; set; } = new List<Company>();
}
