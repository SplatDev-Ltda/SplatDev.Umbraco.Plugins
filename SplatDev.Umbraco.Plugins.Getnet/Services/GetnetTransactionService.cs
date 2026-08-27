using Microsoft.EntityFrameworkCore;
using SplatDev.Umbraco.Plugins.Getnet.Models;

namespace SplatDev.Umbraco.Plugins.Getnet.Services;

/// <inheritdoc />
public class GetnetTransactionService(IDbContextFactory<GetnetDbContext> factory) : IGetnetTransactionService
{
    public async Task<GetnetTransaction> RecordAsync(GetnetTransaction transaction, CancellationToken ct = default)
    {
        await using var db = await factory.CreateDbContextAsync(ct);
        transaction.CreatedAt = transaction.CreatedAt == default ? DateTime.UtcNow : transaction.CreatedAt;
        db.Transactions.Add(transaction);
        await db.SaveChangesAsync(ct);
        return transaction;
    }

    public async Task<bool> UpdateStatusAsync(
        string reference,
        string status,
        string? authorizationCode = null,
        string? errorMessage = null,
        long? refundedMinor = null,
        CancellationToken ct = default)
    {
        await using var db = await factory.CreateDbContextAsync(ct);

        // Either identifier: the site knows its order ref from the start, and Getnet's payment
        // id only exists once the gateway has accepted the request - so a webhook and a
        // synchronous response arrive keyed differently.
        var row = await db.Transactions
            .FirstOrDefaultAsync(t => t.PaymentId == reference || t.OrderRef == reference, ct);

        if (row is null)
        {
            return false;
        }

        row.Status = status;
        row.UpdatedAt = DateTime.UtcNow;
        if (authorizationCode is not null) row.AuthorizationCode = authorizationCode;
        if (errorMessage is not null) row.ErrorMessage = errorMessage;
        if (refundedMinor is not null) row.RefundedMinor = refundedMinor.Value;

        await db.SaveChangesAsync(ct);
        return true;
    }

    public async Task<GetnetSummary> GetSummaryAsync(DateTime fromUtc, DateTime toUtc, CancellationToken ct = default)
    {
        await using var db = await factory.CreateDbContextAsync(ct);
        var rows = db.Transactions.Where(t => t.CreatedAt >= fromUtc && t.CreatedAt < toUtc);

        var total = await rows.CountAsync(ct);
        var settled = await rows.Where(t => t.Status == GetnetTransactionStatus.Confirmed).ToListAsync(ct);
        var failed = await rows.CountAsync(t =>
            t.Status == GetnetTransactionStatus.Denied ||
            t.Status == GetnetTransactionStatus.Canceled ||
            t.Status == GetnetTransactionStatus.Error, ct);
        var pending = await rows.CountAsync(t =>
            t.Status == GetnetTransactionStatus.Pending ||
            t.Status == GetnetTransactionStatus.Authorized, ct);
        var refunded = await rows.CountAsync(t => t.Status == GetnetTransactionStatus.Refunded, ct);

        var settledMinor = settled.Sum(t => t.AmountMinor);
        var refundedMinor = await rows.SumAsync(t => (long?)t.RefundedMinor, ct) ?? 0;

        // The previous window of the same length, so the cards can say whether this period is
        // up or down without the client having to ask twice.
        var span = toUtc - fromUtc;
        var previousSettled = await db.Transactions
            .Where(t => t.CreatedAt >= fromUtc - span && t.CreatedAt < fromUtc)
            .Where(t => t.Status == GetnetTransactionStatus.Confirmed)
            .SumAsync(t => (long?)t.AmountMinor, ct) ?? 0;

        // Approval is measured against attempts that actually concluded. Counting pending ones
        // as failures would make the rate sag purely because a payment is still in flight.
        var concluded = settled.Count + failed;

        return new GetnetSummary(
            TotalCount: total,
            SettledCount: settled.Count,
            FailedCount: failed,
            PendingCount: pending,
            RefundedCount: refunded,
            SettledMinor: settledMinor,
            RefundedMinor: refundedMinor,
            AverageTicketMinor: settled.Count == 0 ? 0 : settledMinor / settled.Count,
            ApprovalRate: concluded == 0 ? 0 : Math.Round((double)settled.Count / concluded, 4),
            Currency: settled.FirstOrDefault()?.Currency ?? "BRL",
            PreviousSettledMinor: previousSettled);
    }

    public async Task<IReadOnlyList<GetnetTimelinePoint>> GetTimelineAsync(DateTime fromUtc, DateTime toUtc, CancellationToken ct = default)
    {
        await using var db = await factory.CreateDbContextAsync(ct);

        var grouped = await db.Transactions
            .Where(t => t.CreatedAt >= fromUtc && t.CreatedAt < toUtc)
            .GroupBy(t => t.CreatedAt.Date)
            .Select(g => new
            {
                Day = g.Key,
                Count = g.Count(),
                Settled = g.Where(t => t.Status == GetnetTransactionStatus.Confirmed)
                           .Sum(t => (long?)t.AmountMinor) ?? 0,
            })
            .ToListAsync(ct);

        var byDay = grouped.ToDictionary(x => x.Day, x => x);

        // Every day in the range, including the empty ones: a chart that silently omits days
        // with no activity draws a straight line between distant points and reads as steady
        // trade through a week when nothing happened.
        var points = new List<GetnetTimelinePoint>();
        for (var day = fromUtc.Date; day < toUtc.Date; day = day.AddDays(1))
        {
            byDay.TryGetValue(day, out var hit);
            points.Add(new GetnetTimelinePoint(
                day.ToString("yyyy-MM-dd"),
                hit?.Count ?? 0,
                hit?.Settled ?? 0));
        }

        return points;
    }

    public Task<IReadOnlyList<GetnetBreakdownSlice>> GetStatusBreakdownAsync(DateTime fromUtc, DateTime toUtc, CancellationToken ct = default)
        => BreakdownAsync(t => t.Status, fromUtc, toUtc, ct);

    public Task<IReadOnlyList<GetnetBreakdownSlice>> GetMethodBreakdownAsync(DateTime fromUtc, DateTime toUtc, CancellationToken ct = default)
        => BreakdownAsync(t => t.PaymentMethod ?? "unknown", fromUtc, toUtc, ct);

    private async Task<IReadOnlyList<GetnetBreakdownSlice>> BreakdownAsync(
        Func<GetnetTransaction, string> key, DateTime fromUtc, DateTime toUtc, CancellationToken ct)
    {
        await using var db = await factory.CreateDbContextAsync(ct);

        // Grouped in memory rather than in SQL: the selector is a delegate so the two callers
        // can share this, and a period's worth of transactions is a small set to pull back.
        var rows = await db.Transactions
            .Where(t => t.CreatedAt >= fromUtc && t.CreatedAt < toUtc)
            .ToListAsync(ct);

        return rows
            .GroupBy(key)
            .Select(g => new GetnetBreakdownSlice(
                g.Key,
                g.Count(),
                g.Where(t => t.Status == GetnetTransactionStatus.Confirmed).Sum(t => t.AmountMinor)))
            .OrderByDescending(s => s.Count)
            .ToList();
    }

    public async Task<GetnetTransactionPage> ListAsync(
        DateTime fromUtc,
        DateTime toUtc,
        string? status,
        string? method,
        string? search,
        int page,
        int pageSize,
        CancellationToken ct = default)
    {
        await using var db = await factory.CreateDbContextAsync(ct);

        var query = db.Transactions.Where(t => t.CreatedAt >= fromUtc && t.CreatedAt < toUtc);

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(t => t.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(method))
        {
            query = query.Where(t => t.PaymentMethod == method);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();
            query = query.Where(t =>
                t.OrderRef.Contains(term) ||
                (t.PaymentId != null && t.PaymentId.Contains(term)) ||
                (t.CustomerName != null && t.CustomerName.Contains(term)) ||
                (t.CustomerEmail != null && t.CustomerEmail.Contains(term)));
        }

        var total = await query.CountAsync(ct);

        // Clamped rather than trusted: pageSize arrives from a query string, and an unbounded
        // one turns a table into a way to pull the whole ledger in a single request.
        pageSize = Math.Clamp(pageSize, 1, 200);
        page = Math.Max(page, 1);

        var items = await query
            .OrderByDescending(t => t.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(t => new GetnetTransactionRow(
                t.Id, t.OrderRef, t.PaymentId, t.AmountMinor, t.RefundedMinor, t.Currency,
                t.Status, t.PaymentMethod, t.CardBrand, t.CardLast4, t.Installments,
                t.CustomerName, t.AuthorizationCode, t.ErrorMessage, t.CreatedAt, t.UpdatedAt))
            .ToListAsync(ct);

        return new GetnetTransactionPage(items, total, page, pageSize);
    }
}
