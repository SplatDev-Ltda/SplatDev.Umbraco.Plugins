using System.Net;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using SplatDev.Umbraco.Plugins.Analytics.Configuration;
using SplatDev.Umbraco.Plugins.Analytics.Data;
using SplatDev.Umbraco.Plugins.Analytics.Models;

namespace SplatDev.Umbraco.Plugins.Analytics.Services;

public class AnalyticsService : IAnalyticsService
{
    private readonly AnalyticsDbContext _db;
    private readonly AnalyticsOptions _options;
    private readonly IGeoLookup _geo;

    private static readonly JsonSerializerOptions JsonOptions =
        new(JsonSerializerDefaults.Web);

    private readonly IVisitorIdentity _identity;

    public AnalyticsService(AnalyticsDbContext db, IOptions<AnalyticsOptions> options, IGeoLookup geo, IVisitorIdentity identity)
    {
        _db = db;
        _options = options.Value;
        _geo = geo;
        _identity = identity;
    }

    public async Task<AnalyticsVisit> RecordVisitAsync(
        RecordVisitRequest request, string ipAddress, string? userAgent, bool isBot, CancellationToken ct = default)
    {
        // Recurring detection keys off the hashed id, not the address, so it still works
        // when nothing of the address is kept.
        var visitorId = _identity.Compute(ipAddress, userAgent);
        var recurring = await AlreadyVisitedAsync(request.NodeId, visitorId, ct);

        var visit = new AnalyticsVisit
        {
            VisitorId = visitorId,
            IpAddress = _identity.StorableAddress(ipAddress),
            Referrer = Trim(request.Referrer, 1024),
            Browser = Trim(UserAgentParser.Browser(userAgent), 64),
            OperatingSystem = Trim(UserAgentParser.OperatingSystem(userAgent), 64),
            Device = Trim(UserAgentParser.Device(userAgent), 16),
            ContentNodeId = request.NodeId,
            EntryUrl = Trim(request.EntryUrl, 2048),
            Resolution = Trim(request.Resolution, 32),
            UserAgent = Trim(userAgent, 256),
            BrowserInfo = request.Browser is null ? null : Trim(JsonSerializer.Serialize(request.Browser, JsonOptions), 4000),
            VisitStarted = DateTime.UtcNow,
            RecurringVisit = recurring,
            IsBot = isBot,
        };

        // Geo is best-effort: an unconfigured or failing lookup must not cost the visit.
        var mapping = await _geo.LookupAsync(ipAddress, ct);
        if (mapping is not null)
        {
            visit.Country = Trim(mapping.Country, 64);
            visit.CountryCode = Trim(mapping.CountryCode, 8);
            visit.Region = Trim(mapping.Region, 128);
            visit.City = Trim(mapping.City, 128);
        }

        _db.Visits.Add(visit);
        await _db.SaveChangesAsync(ct);
        return visit;
    }

    public async Task<bool> RecordExitAsync(RecordExitRequest request, CancellationToken ct = default)
    {
        var visit = await _db.Visits.FirstOrDefaultAsync(v => v.Id == request.VisitId, ct);
        if (visit is null)
            return false;

        visit.ExitUrl = Trim(request.ExitUrl, 2048);
        visit.VisitFinished = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
        return true;
    }

    public Task<bool> AlreadyVisitedAsync(int nodeId, string visitorId, CancellationToken ct = default) =>
        _db.Visits.AsNoTracking().AnyAsync(v => v.ContentNodeId == nodeId && v.VisitorId == visitorId, ct);

    public Task<AnalyticsVisit?> GetCurrentVisitAsync(int nodeId, string visitorId, CancellationToken ct = default) =>
        _db.Visits.Where(v => v.ContentNodeId == nodeId && v.VisitorId == visitorId && v.VisitFinished == null)
                  .OrderByDescending(v => v.VisitStarted)
                  .FirstOrDefaultAsync(ct);

    private IQueryable<AnalyticsVisit> Query(bool includeBots) =>
        includeBots ? _db.Visits.AsNoTracking() : _db.Visits.AsNoTracking().Where(v => !v.IsBot);

    public Task<int> GetTotalVisitsAsync(bool includeBots = false, CancellationToken ct = default) =>
        Query(includeBots).CountAsync(ct);

    public async Task<int> GetUniqueVisitorsAsync(bool includeBots = false, CancellationToken ct = default) =>
        await Query(includeBots).Select(v => v.VisitorId).Distinct().CountAsync(ct);

    public Task<int> GetRecurringVisitsAsync(bool includeBots = false, CancellationToken ct = default) =>
        Query(includeBots).CountAsync(v => v.RecurringVisit, ct);

    public Task<int> GetRealTimeVisitsAsync(CancellationToken ct = default)
    {
        var since = DateTime.UtcNow.AddMinutes(-Math.Max(1, _options.RealTimeWindowMinutes));
        return Query(includeBots: false).CountAsync(v => v.VisitStarted >= since, ct);
    }

    public Task<int> GetBotVisitsAsync(CancellationToken ct = default) =>
        _db.Visits.AsNoTracking().CountAsync(v => v.IsBot, ct);

    public Task<int> GetVisitCountAsync(int nodeId, CancellationToken ct = default) =>
        Query(includeBots: false).CountAsync(v => v.ContentNodeId == nodeId, ct);

    public async Task<DailyCount> GetResultsByDateAsync(DateOnly date, CancellationToken ct = default)
    {
        var start = date.ToDateTime(TimeOnly.MinValue);
        var end = start.AddDays(1);
        var count = await Query(includeBots: false).CountAsync(v => v.VisitStarted >= start && v.VisitStarted < end, ct);
        return new DailyCount { Date = date, Count = count };
    }

    public async Task<DailyCount[]> GetResultsForDaysAsync(int days, CancellationToken ct = default)
    {
        days = Math.Clamp(days, 1, 365);
        var from = DateTime.UtcNow.Date.AddDays(-(days - 1));

        // Grouped in one query rather than one per day: the v8 build looped and issued a
        // query per date, which is fine for 7 and not for 365.
        var grouped = await Query(includeBots: false)
            .Where(v => v.VisitStarted >= from)
            .GroupBy(v => v.VisitStarted.Date)
            .Select(g => new { Day = g.Key, Count = g.Count() })
            .ToListAsync(ct);

        var byDay = grouped.ToDictionary(x => DateOnly.FromDateTime(x.Day), x => x.Count);

        // Days with no visits still need a point, or the chart draws a line between
        // non-adjacent dates and reads as steady traffic.
        return Enumerable.Range(0, days)
            .Select(offset =>
            {
                var date = DateOnly.FromDateTime(from.AddDays(offset));
                return new DailyCount { Date = date, Count = byDay.GetValueOrDefault(date) };
            })
            .ToArray();
    }

    public Task<VisitFilter[]> GetVisitsByEntryUrlAsync(int take = 20, CancellationToken ct = default) =>
        TopBy(v => v.EntryUrl, take, ct);

    public Task<VisitFilter[]> GetVisitsByExitUrlAsync(int take = 20, CancellationToken ct = default) =>
        TopBy(v => v.ExitUrl, take, ct);

    public Task<VisitFilter[]> GetResultsByAsync(string filter, int take = 20, CancellationToken ct = default) =>
        (filter ?? string.Empty).ToLowerInvariant() switch
        {
            "entryurl" or "entry" => GetVisitsByEntryUrlAsync(take, ct),
            "exiturl" or "exit" => GetVisitsByExitUrlAsync(take, ct),
            "country" => TopBy(v => v.Country, take, ct),
            "city" => TopBy(v => v.City, take, ct),
            "resolution" => TopBy(v => v.Resolution, take, ct),
            "referrer" => TopBy(v => v.Referrer, take, ct),
            "browser" => TopBy(v => v.Browser, take, ct),
            "os" or "operatingsystem" => TopBy(v => v.OperatingSystem, take, ct),
            "device" => TopBy(v => v.Device, take, ct),
            "visitor" => TopBy(v => v.VisitorId, take, ct),
            _ => Task.FromResult(Array.Empty<VisitFilter>()),
        };

    private async Task<VisitFilter[]> TopBy(
        System.Linq.Expressions.Expression<Func<AnalyticsVisit, string?>> selector, int take, CancellationToken ct) =>
        await Query(includeBots: false)
            .Select(selector)
            .Where(value => value != null && value != "")
            .GroupBy(value => value!)
            .Select(g => new VisitFilter { Filter = g.Key, Count = g.Count() })
            .OrderByDescending(x => x.Count)
            .Take(Math.Clamp(take, 1, 200))
            .ToArrayAsync(ct);

    public async Task<AnalyticsVisitDto[]> GetVisitsByNodeIdAsync(int nodeId, int take = 100, CancellationToken ct = default)
    {
        var visits = await Query(includeBots: false)
            .Where(v => v.ContentNodeId == nodeId)
            .OrderByDescending(v => v.VisitStarted)
            .Take(Math.Clamp(take, 1, 500))
            .ToListAsync(ct);

        return visits.Select(ToDto).ToArray();
    }

    public async Task<PagedResults<AnalyticsVisitDto>> GetPagedResultsAsync(
        int page = 1, int pageSize = 20, string? ipAddress = null, bool includeBots = false, CancellationToken ct = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 200);

        var query = Query(includeBots);
        if (!string.IsNullOrWhiteSpace(ipAddress))
            query = query.Where(v => v.VisitorId.Contains(ipAddress) || (v.IpAddress != null && v.IpAddress.Contains(ipAddress)));

        var found = await query.CountAsync(ct);
        var rows = await query
            .OrderByDescending(v => v.VisitStarted)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return new PagedResults<AnalyticsVisitDto>
        {
            Results = rows.Select(ToDto).ToList(),
            PageNumber = page,
            PageSize = pageSize,
            Found = found,
            Query = ipAddress,
        };
    }

    public async Task<AnalyticsSummary> GetSummaryAsync(int days = 30, CancellationToken ct = default) => new()
    {
        TotalVisits = await GetTotalVisitsAsync(false, ct),
        UniqueVisitors = await GetUniqueVisitorsAsync(false, ct),
        RecurringVisits = await GetRecurringVisitsAsync(false, ct),
        RealTimeVisits = await GetRealTimeVisitsAsync(ct),
        BotVisits = await GetBotVisitsAsync(ct),
        Daily = await GetResultsForDaysAsync(days, ct),
    };

    public async Task<int> PurgeExpiredAsync(CancellationToken ct = default)
    {
        if (_options.RetentionDays <= 0)
            return 0;

        var cutoff = DateTime.UtcNow.AddDays(-_options.RetentionDays);
        var expired = await _db.Visits.Where(v => v.VisitStarted < cutoff).ToListAsync(ct);
        if (expired.Count == 0)
            return 0;

        _db.Visits.RemoveRange(expired);
        await _db.SaveChangesAsync(ct);
        return expired.Count;
    }

    private static AnalyticsVisitDto ToDto(AnalyticsVisit v) => new()
    {
        Id = v.Id,
        ContentNodeId = v.ContentNodeId,
        VisitorId = v.VisitorId,
        IpAddress = v.IpAddress,
        Referrer = v.Referrer,
        Browser = v.Browser,
        OperatingSystem = v.OperatingSystem,
        Device = v.Device,
        EntryUrl = v.EntryUrl,
        ExitUrl = v.ExitUrl,
        Resolution = v.Resolution,
        UserAgent = v.UserAgent,
        Country = v.Country,
        CountryCode = v.CountryCode,
        City = v.City,
        VisitStarted = v.VisitStarted,
        VisitFinished = v.VisitFinished,
        RecurringVisit = v.RecurringVisit,
        IsBot = v.IsBot,
        BrowserDetails = Deserialise(v.BrowserInfo),
        VisitLength = Duration(v.VisitStarted, v.VisitFinished),
    };

    private static BrowserInfo? Deserialise(string? json)
    {
        if (string.IsNullOrWhiteSpace(json))
            return null;
        try { return JsonSerializer.Deserialize<BrowserInfo>(json, JsonOptions); }
        catch (JsonException) { return null; }
    }

    private static string? Duration(DateTime started, DateTime? finished)
    {
        if (finished is null)
            return null;
        var span = finished.Value - started;
        return span < TimeSpan.Zero ? null : span.ToString(span.TotalHours >= 1 ? @"h\:mm\:ss" : @"m\:ss");
    }

    private static string? Trim(string? value, int max) =>
        string.IsNullOrEmpty(value) || value.Length <= max ? value : value[..max];

}
