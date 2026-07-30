using SanCRM.Domain.Enums;

namespace SanCRM.Application.Interfaces;

public interface IAuditService
{
    Task LogAsync(AuditAction action, string? entityType, int? entityId,
                  object? oldValues = null, object? newValues = null);
}
