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
        return Task.FromResult(new AnalyticsSettings { Enabled = section.GetValue("Enabled", true) });
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
        var query = db.Visits.AsNoTracking().Where(x => x.VisitedAtUtc >= cutoff);

        var totalVisits = await query.LongCountAsync(cancellationToken);
        var uniqueVisitors = await query.Select(x => x.VisitorId).Distinct().LongCountAsync(cancellationToken);
        var browsers = await GroupAsync(query, x => x.Browser, cancellationToken);
        var countries = await GroupAsync(query, x => x.Country, cancellationToken);
        var paths = await GroupAsync(query, x => x.Path, cancellationToken);
        var daily = await query.GroupBy(x => x.VisitedAtUtc.Date)
            .OrderBy(x => x.Key)
            .Select(x => new AnalyticsDay(x.Key, x.LongCount()))
            .ToListAsync(cancellationToken);

        return new AnalyticsSummary(totalVisits, uniqueVisitors, browsers, countries, paths, daily);
    }

    private static Task<List<AnalyticsBucket>> GroupAsync(
        IQueryable<AnalyticsVisit> query,
        System.Linq.Expressions.Expression<Func<AnalyticsVisit, string?>> selector,
        CancellationToken cancellationToken) => query.GroupBy(selector)
        .Where(x => x.Key != null && x.Key != "")
        .OrderByDescending(x => x.LongCount())
        .Take(10)
        .Select(x => new AnalyticsBucket(x.Key!, x.LongCount()))
        .ToListAsync(cancellationToken);
}
