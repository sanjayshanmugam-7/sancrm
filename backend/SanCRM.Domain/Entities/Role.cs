using System.Text.Json;

namespace SanCRM.Domain.Entities;

public class Role
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Permissions { get; set; }   // JSON stored as NVARCHAR(MAX)
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<User> Users { get; set; } = new List<User>();
}
