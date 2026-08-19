using Microsoft.EntityFrameworkCore;
using SplatDev.Umbraco.Plugins.Gdrp.Models;
using SplatDev.Umbraco.Plugins.Gdrp.Services;
using Xunit;

namespace SplatDev.Umbraco.Plugins.Gdrp.Tests;

public class GdrpServiceTests
{
    private static GdrpDbContext NewDb() =>
        new(new DbContextOptionsBuilder<GdrpDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);

    // ── the compliance defect ────────────────────────────────────────────────

    /// <summary>
    /// The headline fix. RecordConsent overwrote the session's single row, so a visitor who
    /// accepted everything and later withdrew left one record saying "none" — nothing to
    /// show they had ever consented, or when that changed. Both the GDPR (art. 7(1)) and
    /// the LGPD (art. 8) require the controller to be able to demonstrate consent.
    /// </summary>
    [Fact]
    public async Task Changing_consent_keeps_the_earlier_decision_on_record()
    {
        using var db = NewDb();
        var svc = new GdrpService(db);

        await svc.RecordConsent("session-1", "all", "203.0.113.5", "Firefox");
        await svc.RecordConsent("session-1", "none", "203.0.113.5", "Firefox");

        var history = await svc.GetConsentHistory("session-1");

        Assert.Equal(2, history.Count);
        Assert.Equal("none", history[0].ConsentType);   // newest first
        Assert.Equal("all", history[1].ConsentType);    // the withdrawn consent survives
    }

    [Fact]
    public async Task Current_consent_is_the_most_recent_decision()
    {
        using var db = NewDb();
        var svc = new GdrpService(db);

        await svc.RecordConsent("session-1", "all", null, null);
        await svc.RecordConsent("session-1", "essential", null, null);

        Assert.Equal("essential", (await svc.GetConsent("session-1"))!.ConsentType);
    }

    [Fact]
    public async Task A_session_is_counted_once_however_often_it_changed_its_mind()
    {
        // Otherwise a visitor who reconsidered three times inflates the totals past the
        // size of the audience, which makes the summary worse than useless for a report.
        using var db = NewDb();
        var svc = new GdrpService(db);

        await svc.RecordConsent("a", "all", null, null);
        await svc.RecordConsent("a", "none", null, null);
        await svc.RecordConsent("a", "essential", null, null);
        await svc.RecordConsent("b", "all", null, null);

        var s = await svc.GetConsentSummary();

        Assert.Equal(2, s.Sessions);
        Assert.Equal(1, s.Essential);
        Assert.Equal(1, s.All);
        Assert.Equal(0, s.None);
        Assert.Equal(4, s.RecordsHeld);   // retention applies to rows, not sessions
    }

    // ── retention ────────────────────────────────────────────────────────────

    [Fact]
    public async Task Old_consent_records_can_be_purged()
    {
        using var db = NewDb();
        var svc = new GdrpService(db);

        db.ConsentRecords.Add(new ConsentRecord
        {
            SessionId = "old", ConsentType = "all",
            ConsentDate = DateTime.UtcNow.AddDays(-400), IpAddress = "203.0.113.9",
        });
        await db.SaveChangesAsync();
        await svc.RecordConsent("fresh", "all", null, null);

        var removed = await svc.PurgeConsentBefore(DateTime.UtcNow.AddDays(-365));

        Assert.Equal(1, removed);
        Assert.Equal(1, (await svc.GetConsentSummary()).RecordsHeld);
    }

    [Fact]
    public async Task Purging_when_nothing_is_old_enough_removes_nothing()
    {
        using var db = NewDb();
        var svc = new GdrpService(db);
        await svc.RecordConsent("fresh", "all", null, null);

        Assert.Equal(0, await svc.PurgeConsentBefore(DateTime.UtcNow.AddDays(-365)));
    }

    // ── data subject requests ────────────────────────────────────────────────

    [Fact]
    public async Task Completing_a_request_that_does_not_exist_reports_failure()
    {
        // It previously called Update on whatever came back, so this threw.
        using var db = NewDb();
        var r = await new GdrpService(db).CompleteDataRequest(404);

        Assert.False(r.Success);
        Assert.Contains("no longer exists", r.Message);
    }

    [Fact]
    public async Task Completing_a_request_twice_does_not_move_the_completion_date()
    {
        using var db = NewDb();
        var svc = new GdrpService(db);
        var req = await svc.SubmitDataRequest("a@b.com", "erasure");

        await svc.CompleteDataRequest(req.Id);
        var first = (await svc.GetDataRequests()).Single().CompletedAt;

        var second = await svc.CompleteDataRequest(req.Id);

        Assert.True(second.Success);
        Assert.Contains("Already completed", second.Message);
        Assert.Equal(first, (await svc.GetDataRequests()).Single().CompletedAt);
    }

    [Fact]
    public async Task Requests_can_be_filtered_by_status()
    {
        using var db = NewDb();
        var svc = new GdrpService(db);

        var done = await svc.SubmitDataRequest("done@b.com", "export");
        await svc.SubmitDataRequest("waiting@b.com", "erasure");
        await svc.CompleteDataRequest(done.Id);

        Assert.Single(await svc.GetDataRequests("pending"));
        Assert.Single(await svc.GetDataRequests("completed"));
        Assert.Equal(2, (await svc.GetDataRequests()).Count);
    }

    [Fact]
    public async Task The_summary_counts_pending_requests()
    {
        using var db = NewDb();
        var svc = new GdrpService(db);
        await svc.SubmitDataRequest("a@b.com", "export");

        Assert.Equal(1, (await svc.GetConsentSummary()).PendingRequests);
    }
}
