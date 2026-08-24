using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using SplatDev.Umbraco.Plugins.Analytics.Configuration;
using SplatDev.Umbraco.Plugins.Analytics.Data;
using SplatDev.Umbraco.Plugins.Analytics.Models;
using SplatDev.Umbraco.Plugins.Analytics.Services;
using Xunit;

namespace SplatDev.Umbraco.Plugins.Analytics.Tests;

/// <summary>
/// Exercises the service against a real SQLite database rather than a mocked context, so
/// the queries are actually executed and the schema comes from the same model the
/// migration generates its DDL from.
/// </summary>
public class AnalyticsServiceTests : IDisposable
{
    private readonly SqliteConnection _connection;
    private readonly AnalyticsDbContext _db;

    public AnalyticsServiceTests()
    {
        // A shared in-memory connection: EnsureCreated builds the schema from the model,
        // which is the same source the migration uses.
        _connection = new SqliteConnection("DataSource=:memory:");
        _connection.Open();
        var options = new DbContextOptionsBuilder<AnalyticsDbContext>().UseSqlite(_connection).Options;
        _db = new AnalyticsDbContext(options);
        _db.Database.EnsureCreated();
    }

    public void Dispose()
    {
        _db.Dispose();
        _connection.Dispose();
        GC.SuppressFinalize(this);
    }

    private AnalyticsService Build(Action<AnalyticsOptions>? configure = null)
    {
        var options = new AnalyticsOptions();
        configure?.Invoke(options);
        // A fixed salt keeps visitor ids stable across the service instances a test builds.
        options.VisitorIdSalt ??= "test-salt";
        var opts = Options.Create(options);
        return new AnalyticsService(_db, opts, new NoGeoLookup(), new VisitorIdentity(opts));
    }

    private sealed class NoGeoLookup : IGeoLookup
    {
        public Task<IpMapping?> LookupAsync(string ipAddress, CancellationToken ct = default) =>
            Task.FromResult<IpMapping?>(null);
    }

    private static RecordVisitRequest Visit(int nodeId = 1, string url = "/") =>
        new() { NodeId = nodeId, EntryUrl = url, Resolution = "1920x1080" };

    [Fact]
    public async Task RecordVisit_StoresTheVisit()
    {
        var service = Build();
        var visit = await service.RecordVisitAsync(Visit(), "203.0.113.5", "Mozilla/5.0", isBot: false);

        Assert.True(visit.Id > 0);
        // The address is not stored by default — the hashed visitor id stands in for it.
        Assert.Null(visit.IpAddress);
        Assert.False(string.IsNullOrWhiteSpace(visit.VisitorId));
        Assert.False(visit.RecurringVisit);
        Assert.Equal(1, await service.GetTotalVisitsAsync());
    }

    [Fact]
    public async Task SecondVisitFromTheSameAddress_IsMarkedRecurring()
    {
        var service = Build();
        await service.RecordVisitAsync(Visit(), "203.0.113.5", "Mozilla/5.0", isBot: false);
        var second = await service.RecordVisitAsync(Visit(), "203.0.113.5", "Mozilla/5.0", isBot: false);

        Assert.True(second.RecurringVisit);
        Assert.Equal(1, await service.GetRecurringVisitsAsync());
    }

    [Fact]
    public async Task ByDefault_NoAddressIsStoredAtAll()
    {
        var service = Build();
        var visit = await service.RecordVisitAsync(Visit(), "203.0.113.45", "Mozilla/5.0", isBot: false);

        Assert.Null(visit.IpAddress);
        Assert.False(string.IsNullOrWhiteSpace(visit.VisitorId));
        // The id must not be the address, nor contain it.
        Assert.DoesNotContain("203.0.113", visit.VisitorId);
    }

    [Fact]
    public async Task AnonymisedAddress_DropsTheHostPart()
    {
        var service = Build(o => o.StoreIpAddress = IpStorage.Anonymised);
        var visit = await service.RecordVisitAsync(Visit(), "203.0.113.45", "Mozilla/5.0", isBot: false);

        Assert.Equal("203.0.113.0", visit.IpAddress);
    }

    [Fact]
    public async Task FullAddress_IsKeptOnlyWhenAskedFor()
    {
        var service = Build(o => o.StoreIpAddress = IpStorage.Full);
        var visit = await service.RecordVisitAsync(Visit(), "203.0.113.45", "Mozilla/5.0", isBot: false);

        Assert.Equal("203.0.113.45", visit.IpAddress);
    }

    [Fact]
    public async Task SameVisitor_GetsTheSameIdAndDifferentVisitorsDoNot()
    {
        var service = Build();
        var a1 = await service.RecordVisitAsync(Visit(), "203.0.113.1", "Mozilla/5.0", isBot: false);
        var a2 = await service.RecordVisitAsync(Visit(nodeId: 2), "203.0.113.1", "Mozilla/5.0", isBot: false);
        var b = await service.RecordVisitAsync(Visit(), "203.0.113.2", "Mozilla/5.0", isBot: false);

        Assert.Equal(a1.VisitorId, a2.VisitorId);
        Assert.NotEqual(a1.VisitorId, b.VisitorId);
    }

    [Fact]
    public async Task UserAgent_IsParsedIntoBrowserOsAndDevice()
    {
        var service = Build();
        var visit = await service.RecordVisitAsync(Visit(),
            "203.0.113.1",
            "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile Safari/604.1",
            isBot: false);

        Assert.Equal("Safari", visit.Browser);
        Assert.Equal("iOS", visit.OperatingSystem);
        Assert.Equal("Mobile", visit.Device);
    }

    [Fact]
    public async Task Referrer_IsRecordedAndCanBeGroupedOn()
    {
        var service = Build();
        var r = Visit();
        r.Referrer = "https://example.com/blog";
        await service.RecordVisitAsync(r, "203.0.113.1", "Mozilla/5.0", isBot: false);

        var byReferrer = await service.GetResultsByAsync("referrer");
        Assert.Equal("https://example.com/blog", Assert.Single(byReferrer).Filter);
    }

    [Fact]
    public async Task BotVisits_AreExcludedFromTheFigures()
    {
        var service = Build();
        await service.RecordVisitAsync(Visit(), "203.0.113.5", "Mozilla/5.0", isBot: false);
        await service.RecordVisitAsync(Visit(), "66.249.66.1", "Googlebot/2.1", isBot: true);

        // The point of flagging rather than discarding: the count is still reportable.
        Assert.Equal(1, await service.GetTotalVisitsAsync());
        Assert.Equal(2, await service.GetTotalVisitsAsync(includeBots: true));
        Assert.Equal(1, await service.GetBotVisitsAsync());
    }

    [Fact]
    public async Task RecordExit_ClosesTheVisitAndTimesIt()
    {
        var service = Build();
        var visit = await service.RecordVisitAsync(Visit(), "203.0.113.5", "Mozilla/5.0", isBot: false);

        Assert.True(await service.RecordExitAsync(new RecordExitRequest { VisitId = visit.Id, ExitUrl = "/contact" }));

        var page = await service.GetPagedResultsAsync();
        var stored = Assert.Single(page.Results);
        Assert.Equal("/contact", stored.ExitUrl);
        Assert.NotNull(stored.VisitFinished);
        Assert.NotNull(stored.VisitLength);
    }

    [Fact]
    public async Task RecordExit_ForAnUnknownVisit_ReportsFailureRatherThanThrowing()
    {
        var service = Build();
        Assert.False(await service.RecordExitAsync(new RecordExitRequest { VisitId = 9999, ExitUrl = "/x" }));
    }

    [Fact]
    public async Task DailySeries_IncludesDaysWithNoVisits()
    {
        var service = Build();
        await service.RecordVisitAsync(Visit(), "203.0.113.5", "Mozilla/5.0", isBot: false);

        var daily = await service.GetResultsForDaysAsync(7);

        // A gap-free series matters: without it the chart draws a line between
        // non-adjacent dates and reads as steady traffic.
        Assert.Equal(7, daily.Length);
        Assert.Equal(1, daily[^1].Count);
        Assert.All(daily[..^1], d => Assert.Equal(0, d.Count));
    }

    [Fact]
    public async Task Breakdowns_GroupAndRank()
    {
        var service = Build();
        await service.RecordVisitAsync(Visit(url: "/a"), "203.0.113.1", "Mozilla/5.0", isBot: false);
        await service.RecordVisitAsync(Visit(url: "/a"), "203.0.113.2", "Mozilla/5.0", isBot: false);
        await service.RecordVisitAsync(Visit(url: "/b"), "203.0.113.3", "Mozilla/5.0", isBot: false);

        var entry = await service.GetVisitsByEntryUrlAsync();
        Assert.Equal("/a", entry[0].Filter);
        Assert.Equal(2, entry[0].Count);
        Assert.Equal("/b", entry[1].Filter);
    }

    [Fact]
    public async Task UniqueVisitors_CountsAddressesNotVisits()
    {
        var service = Build();
        await service.RecordVisitAsync(Visit(), "203.0.113.1", "Mozilla/5.0", isBot: false);
        await service.RecordVisitAsync(Visit(), "203.0.113.1", "Mozilla/5.0", isBot: false);
        await service.RecordVisitAsync(Visit(), "203.0.113.2", "Mozilla/5.0", isBot: false);

        Assert.Equal(3, await service.GetTotalVisitsAsync());
        Assert.Equal(2, await service.GetUniqueVisitorsAsync());
    }

    [Fact]
    public async Task Retention_RemovesOnlyExpiredVisitsAndIsOffByDefault()
    {
        var service = Build();
        var old = await service.RecordVisitAsync(Visit(), "203.0.113.1", "Mozilla/5.0", isBot: false);
        old.VisitStarted = DateTime.UtcNow.AddDays(-100);
        await _db.SaveChangesAsync();
        await service.RecordVisitAsync(Visit(), "203.0.113.2", "Mozilla/5.0", isBot: false);

        Assert.Equal(0, await service.PurgeExpiredAsync());   // retention off: nothing goes

        var withRetention = Build(o => o.RetentionDays = 30);
        Assert.Equal(1, await withRetention.PurgeExpiredAsync());
        Assert.Equal(1, await service.GetTotalVisitsAsync());
    }

    [Fact]
    public async Task Summary_ReportsEveryHeadlineFigureInOneCall()
    {
        var service = Build();
        await service.RecordVisitAsync(Visit(), "203.0.113.1", "Mozilla/5.0", isBot: false);
        await service.RecordVisitAsync(Visit(), "203.0.113.1", "Mozilla/5.0", isBot: false);
        await service.RecordVisitAsync(Visit(), "66.249.66.1", "Googlebot/2.1", isBot: true);

        var summary = await service.GetSummaryAsync(30);

        Assert.Equal(2, summary.TotalVisits);
        Assert.Equal(1, summary.UniqueVisitors);
        Assert.Equal(1, summary.RecurringVisits);
        Assert.Equal(2, summary.RealTimeVisits);
        Assert.Equal(1, summary.BotVisits);
        Assert.Equal(30, summary.Daily.Length);
    }
}

public class BotDetectorTests
{
    [Theory]
    [InlineData("Googlebot/2.1 (+http://www.google.com/bot.html)")]
    [InlineData("Mozilla/5.0 (compatible; bingbot/2.0)")]
    [InlineData("curl/8.4.0")]
    [InlineData("python-requests/2.31.0")]
    [InlineData("Mozilla/5.0 (compatible; AhrefsBot/7.0)")]
    [InlineData("HeadlessChrome/121.0.0.0")]
    [InlineData("")]
    public void RecognisesAutomatedTraffic(string userAgent) =>
        Assert.True(BotDetector.IsBot(userAgent));

    [Theory]
    [InlineData("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/121.0 Safari/537.36")]
    [InlineData("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile Safari/604.1")]
    public void LeavesRealBrowsersAlone(string userAgent) =>
        Assert.False(BotDetector.IsBot(userAgent));
}

public class UserAgentParserTests
{
    [Theory]
    [InlineData("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/121.0 Safari/537.36", "Chrome", "Windows", "Desktop")]
    [InlineData("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/17.0 Safari/605.1.15", "Safari", "macOS", "Desktop")]
    [InlineData("Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/121.0 Mobile Safari/537.36", "Chrome", "Android", "Mobile")]
    [InlineData("Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Safari/604.1", "Safari", "iOS", "Tablet")]
    [InlineData("Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 Chrome/121.0 Safari/537.36 Edg/121.0", "Edge", "Windows", "Desktop")]
    [InlineData("Mozilla/5.0 (Windows NT 10.0; rv:121.0) Gecko/20100101 Firefox/121.0", "Firefox", "Windows", "Desktop")]
    public void ParsesTheCommonAgents(string ua, string browser, string os, string device)
    {
        // Order matters in the parser: Edge and Opera also say Chrome, Chrome also says
        // Safari, and every Android agent also says Linux.
        Assert.Equal(browser, UserAgentParser.Browser(ua));
        Assert.Equal(os, UserAgentParser.OperatingSystem(ua));
        Assert.Equal(device, UserAgentParser.Device(ua));
    }

    [Fact]
    public void HandlesAnEmptyAgent()
    {
        Assert.Null(UserAgentParser.Browser(null));
        Assert.Null(UserAgentParser.OperatingSystem(""));
        Assert.Null(UserAgentParser.Device(null));
    }
}
