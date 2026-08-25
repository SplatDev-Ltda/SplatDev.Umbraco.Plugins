using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Logging;

namespace SplatDev.Payments.Stripe.Data;

public class StripeAuditInterceptor(ILogger<StripeAuditInterceptor> logger) : SaveChangesInterceptor
{
    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData, InterceptionResult<int> result, CancellationToken ct = default)
    {
        LogChanges(eventData.Context);
        return base.SavingChangesAsync(eventData, result, ct);
    }

    private void LogChanges(DbContext? context)
    {
        if (context is null) return;

        var entries = context.ChangeTracker.Entries()
            .Where(e => e.State is EntityState.Added or EntityState.Modified or EntityState.Deleted)
            .ToList();

        if (entries.Count == 0) return;

        foreach (var entry in entries)
        {
            var entityName = entry.Entity.GetType().Name;
            var operation = entry.State switch
            {
                EntityState.Added => "INSERT",
                EntityState.Modified => "UPDATE",
                EntityState.Deleted => "DELETE",
                _ => "UNKNOWN"
            };

            var key = entry.Properties
                .FirstOrDefault(p => p.Metadata.IsPrimaryKey())
                ?.CurrentValue?.ToString() ?? "NEW";

            var changes = entry.State switch
            {
                EntityState.Added => JsonSerializer.Serialize(
                    entry.Properties.ToDictionary(p => p.Metadata.Name, p => p.CurrentValue)),
                _ => null
            };

            logger.LogInformation(
                "[AUDIT] {Operation} {Entity} (Key={Key}) Changes={Changes}",
                operation, entityName, key, changes ?? "N/A");
        }
    }
}
