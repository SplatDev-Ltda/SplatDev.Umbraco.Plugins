using SplatDev.Umbraco.Plugins.Gdrp.Models;

namespace SplatDev.Umbraco.Plugins.Gdrp.Services;

public interface IGdrpService
{
    // ── consent ──────────────────────────────────────────────────────────────

    /// <summary>
    /// Records a consent decision, appending to the session's history.
    /// </summary>
    /// <remarks>
    /// This used to overwrite the session's single row. Both the GDPR (art. 7(1)) and the
    /// LGPD (art. 8) require the controller to be able to <em>demonstrate</em> that consent
    /// was given, which an overwrite makes impossible: a visitor who accepted everything and
    /// later withdrew left one record saying "none", with nothing to show they had ever
    /// consented or when that changed. Consent is now append-only and the current decision
    /// is the most recent record.
    /// </remarks>
    Task<ConsentRecord> RecordConsent(string sessionId, string consentType, string? ip, string? userAgent);

    /// <summary>The session's current decision — the most recent record.</summary>
    Task<ConsentRecord?> GetConsent(string sessionId);

    /// <summary>Everything recorded for a session, newest first. The demonstrable trail.</summary>
    Task<List<ConsentRecord>> GetConsentHistory(string sessionId);

    /// <summary>Current consent across all sessions, for the dashboard.</summary>
    Task<ConsentSummary> GetConsentSummary();

    /// <summary>
    /// Deletes consent records older than a cut-off.
    /// </summary>
    /// <remarks>
    /// Consent rows carry an IP address and a user agent, which are personal data. Storing
    /// them indefinitely conflicts with storage limitation (GDPR art. 5(1)(e), LGPD art.
    /// 6 V), and there was previously no way to remove them at all.
    /// </remarks>
    Task<int> PurgeConsentBefore(DateTime cutoffUtc);

    // ── data subject requests ────────────────────────────────────────────────

    Task<DataRequest> SubmitDataRequest(string email, string requestType);

    /// <summary>Requests, optionally filtered by status.</summary>
    Task<List<DataRequest>> GetDataRequests(string? status = null);

    /// <summary>Marks a request completed. Reports failure when it does not exist.</summary>
    Task<CompleteResult> CompleteDataRequest(int id);
}

/// <summary>Current consent across all sessions.</summary>
public sealed class ConsentSummary
{
    public int Sessions { get; set; }
    public int All { get; set; }
    public int Essential { get; set; }
    public int None { get; set; }

    /// <summary>Total rows held, which is what retention applies to.</summary>
    public int RecordsHeld { get; set; }

    public DateTime? OldestRecordUtc { get; set; }
    public int PendingRequests { get; set; }
}

public sealed class CompleteResult
{
    public bool Success { get; init; }
    public string Message { get; init; } = string.Empty;

    public static CompleteResult Ok(string m) => new() { Success = true, Message = m };
    public static CompleteResult Fail(string m) => new() { Success = false, Message = m };
}
