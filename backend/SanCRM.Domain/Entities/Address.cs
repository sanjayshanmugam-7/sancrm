using SanCRM.Domain.Enums;

namespace SanCRM.Domain.Entities;

public class Address
{
    public int Id { get; set; }
    public EntityType EntityType { get; set; }
    public int EntityId { get; set; }
    public AddressType AddressType { get; set; } = AddressType.Billing;
    public string? AddressLine1 { get; set; }
    public string? AddressLine2 { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? Pincode { get; set; }
    public string Country { get; set; } = "India";
    public string? Gstin { get; set; }
    public bool IsDefault { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
