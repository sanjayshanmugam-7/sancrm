using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using SanCRM.Application.Interfaces;
using SanCRM.Domain.Entities;
using SanCRM.Domain.Enums;
using SanCRM.Infrastructure.Data;

namespace SanCRM.Application.Services;

public class AuditService : IAuditService
{
    private readonly CrmDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public AuditService(CrmDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task LogAsync(AuditAction action, string? entityType, int? entityId,
                               object? oldValues = null, object? newValues = null)
    {
        var log = new AuditLog
        {
            UserId = _currentUser.UserId,
            Action = action,
            EntityType = entityType,
            EntityId = entityId,
            IpAddress = _currentUser.IpAddress,
            OccurredAt = DateTime.UtcNow
        };

        if (oldValues != null)
            log.OldValues = JsonSerializer.Serialize(oldValues);
        if (newValues != null)
            log.NewValues = JsonSerializer.Serialize(newValues);

        _db.AuditLogs.Add(log);
        await _db.SaveChangesAsync();
    }
}
