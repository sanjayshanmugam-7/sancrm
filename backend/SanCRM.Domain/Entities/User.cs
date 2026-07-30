namespace SanCRM.Domain.Entities;

public class User
{
    public int Id { get; set; }
    public int RoleId { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string PasswordHash { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public string? Designation { get; set; }
    public string? Department { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime? LastLogin { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public string FullName => $"{FirstName} {LastName}".Trim();

    public Role Role { get; set; } = null!;
    public ICollection<Lead> AssignedLeads { get; set; } = new List<Lead>();
    public ICollection<Contact> AssignedContacts { get; set; } = new List<Contact>();
    public ICollection<Company> AssignedCompanies { get; set; } = new List<Company>();
    public ICollection<Opportunity> AssignedOpportunities { get; set; } = new List<Opportunity>();
}
