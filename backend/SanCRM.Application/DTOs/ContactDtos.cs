namespace SanCRM.Application.DTOs;

public class CreateContactDto
{
    public int? CompanyId { get; set; }
    public int? BranchId { get; set; }
    public string ContactType { get; set; } = "Individual";
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
    public string? DateOfBirth { get; set; }
    public string? Anniversary { get; set; }
    public int? GroupId { get; set; }
    public int? AssignedTo { get; set; }
    public string? Source { get; set; }
    public string? Notes { get; set; }
    public bool DoNotContact { get; set; } = false;
}

public class UpdateContactDto : CreateContactDto
{
    public string? Status { get; set; }
}

public class ContactListDto
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string ContactType { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Mobile { get; set; }
    public string? Designation { get; set; }
    public bool DecisionMaker { get; set; }
    public string? CompanyName { get; set; }
    public int? CompanyId { get; set; }
    public string? GroupName { get; set; }
    public string? AssignedTo { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class ContactDetailDto : ContactListDto
{
    public string? Salutation { get; set; }
    public string? LastName { get; set; }
    public string? FirstName { get; set; }
    public string? EmailAlt { get; set; }
    public string? PhoneAlt { get; set; }
    public string? Whatsapp { get; set; }
    public string? Department { get; set; }
    public string? LinkedIn { get; set; }
    public string? Facebook { get; set; }
    public string? Instagram { get; set; }
    public string? Twitter { get; set; }
    public string? DateOfBirth { get; set; }
    public string? Anniversary { get; set; }
    public string? AvatarUrl { get; set; }
    public string? Source { get; set; }
    public bool DoNotContact { get; set; }
    public string? Notes { get; set; }
}

public class CustomerGroupDto
{
    public int? Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Color { get; set; } = "#1976d2";
    public int MemberCount { get; set; }
    public string? CreatedBy { get; set; }
}

public class ContactStatsDto
{
    public int Total { get; set; }
    public int Active { get; set; }
    public int DecisionMakers { get; set; }
    public int NewThisMonth { get; set; }
    public Dictionary<string, int> ByType { get; set; } = new();
}
