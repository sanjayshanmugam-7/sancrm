namespace SanCRM.Domain.Entities;

public class CustomerGroup
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Color { get; set; } = "#1976d2";
    public int? CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User? CreatedByUser { get; set; }
    public ICollection<ContactGroupMember> Members { get; set; } = new List<ContactGroupMember>();
}

public class ContactGroupMember
{
    public int ContactId { get; set; }
    public int GroupId { get; set; }
    public DateTime AddedAt { get; set; } = DateTime.UtcNow;

    public Contact Contact { get; set; } = null!;
    public CustomerGroup Group { get; set; } = null!;
}
