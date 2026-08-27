using SplatDev.Umbraco.Plugins.Getnet.Models;

namespace SplatDev.Umbraco.Plugins.Getnet.Services;

/// <summary>
/// The local ledger of Getnet payment attempts, and the reporting the backoffice reads from it.
/// </summary>
/// <remarks>
/// Getnet answers about one payment at a time and offers this site no history to page through,
/// so everything the dashboard shows comes from what the site recorded as it went. A consuming
/// application calls <see cref="RecordAsync"/> when it starts a payment and
/// <see cref="UpdateStatusAsync"/> when the gateway or a webhook says what happened.
/// </remarks>
public interface IGetnetTransactionService
{
    Task<GetnetTransaction> RecordAsync(GetnetTransaction transaction, CancellationToken ct = default);

    /// <summary>Moves a transaction on, matched by Getnet's payment id or the site's order ref.</summary>
    Task<bool> UpdateStatusAsync(
        string reference,
        string status,
        string? authorizationCode = null,
        string? errorMessage = null,
        long? refundedMinor = null,
        CancellationToken ct = default);

    Task<GetnetSummary> GetSummaryAsync(DateTime fromUtc, DateTime toUtc, CancellationToken ct = default);

    Task<IReadOnlyList<GetnetTimelinePoint>> GetTimelineAsync(DateTime fromUtc, DateTime toUtc, CancellationToken ct = default);

    Task<IReadOnlyList<GetnetBreakdownSlice>> GetStatusBreakdownAsync(DateTime fromUtc, DateTime toUtc, CancellationToken ct = default);

    Task<IReadOnlyList<GetnetBreakdownSlice>> GetMethodBreakdownAsync(DateTime fromUtc, DateTime toUtc, CancellationToken ct = default);

    Task<GetnetTransactionPage> ListAsync(
        DateTime fromUtc,
        DateTime toUtc,
        string? status,
        string? method,
        string? search,
        int page,
        int pageSize,
        CancellationToken ct = default);
}
