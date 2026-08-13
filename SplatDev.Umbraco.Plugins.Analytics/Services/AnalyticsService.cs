using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using SplatDev.Umbraco.Plugins.Analytics.Models;

namespace SplatDev.Umbraco.Plugins.Analytics.Services;

public sealed class AnalyticsService(AnalyticsDbContext db, IConfiguration configuration) : IAnalyticsService
{
    private const string SectionKey = "Analytics";

    public Task<AnalyticsSettings> GetSettingsAsync(CancellationToken cancellationToken = default)
    {
        var section = configuration.GetSection(SectionKey);
        return Task.FromResult(new AnalyticsSettings
        {
            MeasurementId = string.Empty,
            Enabled = section.GetValue("Enabled", true)
        });
    }

    public Task SaveSettingsAsync(AnalyticsSettings settings, CancellationToken cancellationToken = default)
    {
        // Configuration is intentionally read-only at runtime. Persist settings in the host's
        // normal configuration provider (or replace this service with an approved settings store).
        return Task.CompletedTask;
    }

    public async Task RecordVisitAsync(AnalyticsVisit visit, CancellationToken cancellationToken = default)
    {
        db.Visits.Add(visit);
        await db.SaveChangesAsync(cancellationToken);
    }

    public async Task<AnalyticsSummary> GetSummaryAsync(int days = 30, CancellationToken cancellationToken = default)
    {
        days = Math.Clamp(days, 1, 365);
        var cutoff = DateTime.UtcNow.Date.AddDays(-days + 1);
        var visits = db.Visits.AsNoTracking().Where(x => x.VisitedAtUtc >= cutoff);
        var rows = await visits.ToListAsync(cancellationToken);
        static IReadOnlyList<AnalyticsBucket> Buckets(IEnumerable<string?> values) => values.Where(x => !string.IsNullOrWhiteSpace(x)).GroupBy(x => x!).OrderByDescending(x => x.Count()).Take(10).Select(x => new AnalyticsBucket(x.Key, x.LongCount())).ToArray();
        var daily = rows.GroupBy(x => x.VisitedAtUtc.Date).OrderBy(x => x.Key).Select(x => new AnalyticsDay(x.Key, x.LongCount())).ToArray();
        return new AnalyticsSummary(rows.Count, rows.Select(x => x.VisitorId).Distinct(StringComparer.Ordinal).LongCount(), Buckets(rows.Select(x => x.Browser)), Buckets(rows.Select(x => x.Country)), Buckets(rows.Select(x => x.Path)), daily);
    }
}
