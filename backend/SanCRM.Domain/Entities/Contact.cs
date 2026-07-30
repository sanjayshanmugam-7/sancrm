using SanCRM.Domain.Enums;

namespace SanCRM.Domain.Entities;

public class Contact
{
    public int Id { get; set; }
    public int? CompanyId { get; set; }
    public int? BranchId { get; set; }
    public ContactType ContactType { get; set; } = ContactType.Individual;
    public string? Salutation { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string? LastName { get; set; }
    public string? Email { get; set; }
    public string? EmailAlt { get; set; }
    public string? Phone { get; set; }
    public string? PhoneAlt { get; set; }
    public string? Mobile { get; set; }
    public string? Whatsapp { get; set; }
    public string? Designation { get; set; }
    public string? Department { get; set; }
    public bool DecisionMaker { get; set; } = false;
    public string? LinkedIn { get; set; }
    public string? Facebook { get; set; }
    public string? Instagram { get; set; }
    public string? Twitter { get; set; }
    public DateOnly? DateOfBirth { get; set; }
    public DateOnly? Anniversary { get; set; }
    public string? AvatarUrl { get; set; }
    public int? GroupId { get; set; }
    public int? AssignedTo { get; set; }
    public string? Source { get; set; }
    public ContactStatus Status { get; set; } = ContactStatus.Active;
    public bool DoNotContact { get; set; } = false;
    public string? Notes { get; set; }
    public int? CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public string FullName => $"{Salutation} {FirstName} {LastName}".Trim();

    public Company? Company { get; set; }
    public Branch? Branch { get; set; }
    public User? AssignedToUser { get; set; }
    public User? CreatedByUser { get; set; }
    public CustomerGroup? Group { get; set; }
    public ICollection<ContactGroupMember> GroupMemberships { get; set; } = new List<ContactGroupMember>();
}
