using SanCRM.Domain.Enums;

namespace SanCRM.Domain.Entities;

public class Company
{
    public int Id { get; set; }
    public int? ParentCompanyId { get; set; }
    public string Name { get; set; } = string.Empty;
    public CompanyType Type { get; set; } = CompanyType.Prospect;
    public string? Industry { get; set; }
    public string? Website { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public int? EmployeeCount { get; set; }
    public decimal? AnnualRevenue { get; set; }
    public string Currency { get; set; } = "INR";
    public string? Gstin { get; set; }
    public string? Pan { get; set; }
    public int? CategoryId { get; set; }
    public int? AssignedTo { get; set; }
    public CompanyStatus Status { get; set; } = CompanyStatus.Active;
    public string? Description { get; set; }
    public int? CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ParentCompany? ParentCompany { get; set; }
    public CustomerCategory? Category { get; set; }
    public User? AssignedToUser { get; set; }
    public User? CreatedByUser { get; set; }
    public ICollection<Branch> Branches { get; set; } = new List<Branch>();
    public ICollection<Contact> Contacts { get; set; } = new List<Contact>();
    public ICollection<Opportunity> Opportunities { get; set; } = new List<Opportunity>();
    public CreditLimit? CreditLimit { get; set; }
    public ICollection<GstDetail> GstDetails { get; set; } = new List<GstDetail>();
    public ICollection<Address> Addresses { get; set; } = new List<Address>();
}
