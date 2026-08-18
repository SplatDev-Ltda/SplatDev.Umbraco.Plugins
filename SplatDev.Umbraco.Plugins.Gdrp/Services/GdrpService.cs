using Microsoft.EntityFrameworkCore;
using SplatDev.Umbraco.Plugins.Gdrp.Models;

namespace SplatDev.Umbraco.Plugins.Gdrp.Services;

public class GdrpService : IGdrpService
{
    private readonly GdrpDbContext _db;

    public GdrpService(GdrpDbContext db) => _db = db;

    // ── consent ──────────────────────────────────────────────────────────────

    public async Task<ConsentRecord> RecordConsent(
        string sessionId, string consentType, string? ip, string? userAgent)
    {
        // Append, never overwrite. See IGdrpService for why: an overwrite destroys the
        // evidence that consent was ever given, which is the one thing both the GDPR and
        // the LGPD require a controller to be able to produce.
        var record = new ConsentRecord
        {
            SessionId = sessionId,
            ConsentType = consentType,
            ConsentDate = DateTime.UtcNow,
            IpAddress = ip,
            UserAgent = userAgent,
        };

        await _db.ConsentRecords.AddAsync(record);
        await _db.SaveChangesAsync();
        return record;
    }

    public async Task<ConsentRecord?> GetConsent(string sessionId) =>
        await _db.ConsentRecords
            .Where(c => c.SessionId == sessionId)
            .OrderByDescending(c => c.ConsentDate)
            .ThenByDescending(c => c.Id)
            .FirstOrDefaultAsync();

    public async Task<List<ConsentRecord>> GetConsentHistory(string sessionId) =>
        await _db.ConsentRecords
            .Where(c => c.SessionId == sessionId)
            .OrderByDescending(c => c.ConsentDate)
            .ThenByDescending(c => c.Id)
            .ToListAsync();

    public async Task<ConsentSummary> GetConsentSummary()
    {
        var records = await _db.ConsentRecords
            .OrderByDescending(c => c.ConsentDate)
            .ThenByDescending(c => c.Id)
            .ToListAsync();

        // One session can now hold several records, so the summary counts each session
        // once, by its most recent decision — otherwise a visitor who changed their mind
        // three times would be counted three times and the totals would exceed the audience.
        var current = records
            .GroupBy(c => c.SessionId)
            .Select(g => g.First().ConsentType)
            .ToList();

        var pending = await _db.DataRequests.CountAsync(r => r.Status == "pending");

        return new ConsentSummary
        {
            Sessions = current.Count,
            All = current.Count(t => t == "all"),
            Essential = current.Count(t => t == "essential"),
            None = current.Count(t => t == "none"),
            RecordsHeld = records.Count,
            OldestRecordUtc = records.Count == 0 ? null : records[^1].ConsentDate,
            PendingRequests = pending,
        };
    }

    public async Task<int> PurgeConsentBefore(DateTime cutoffUtc)
    {
        var stale = await _db.ConsentRecords
            .Where(c => c.ConsentDate < cutoffUtc)
            .ToListAsync();

        if (stale.Count == 0) return 0;

        _db.ConsentRecords.RemoveRange(stale);
        await _db.SaveChangesAsync();
        return stale.Count;
    }

    // ── data subject requests ────────────────────────────────────────────────

    public async Task<DataRequest> SubmitDataRequest(string email, string requestType)
    {
        var request = new DataRequest
        {
            Email = email,
            RequestType = requestType,
            Status = "pending",
            RequestedAt = DateTime.UtcNow,
        };

        await _db.DataRequests.AddAsync(request);
        await _db.SaveChangesAsync();
        return request;
    }

    public async Task<List<DataRequest>> GetDataRequests(string? status = null)
    {
        var query = _db.DataRequests.AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(r => r.Status == status);

        return await query.OrderByDescending(r => r.RequestedAt).ToListAsync();
    }

    public async Task<CompleteResult> CompleteDataRequest(int id)
    {
        var request = await _db.DataRequests.FindAsync(id);

        // It previously called Update on whatever came back and saved, so completing a
        // request that had been deleted threw, and completing one twice silently moved the
        // completion date — neither of which the caller could tell apart from success.
        if (request is null)
            return CompleteResult.Fail("That request no longer exists.");

        if (request.Status == "completed")
            return CompleteResult.Ok($"Already completed on {request.CompletedAt:yyyy-MM-dd}.");

        request.Status = "completed";
        request.CompletedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return CompleteResult.Ok($"{request.RequestType} request for {request.Email} marked complete.");
    }
}
