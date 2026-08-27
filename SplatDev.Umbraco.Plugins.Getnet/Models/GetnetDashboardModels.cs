namespace SplatDev.Umbraco.Plugins.Getnet.Models;

/// <summary>Headline figures for the chosen period, plus the comparison the cards show.</summary>
public record GetnetSummary(
    int TotalCount,
    int SettledCount,
    int FailedCount,
    int PendingCount,
    int RefundedCount,
    long SettledMinor,
    long RefundedMinor,
    long AverageTicketMinor,
    double ApprovalRate,
    string Currency,
    long PreviousSettledMinor);

/// <summary>One day of the volume chart.</summary>
public record GetnetTimelinePoint(string Date, int Count, long SettledMinor);

/// <summary>One slice of a breakdown - by status, or by payment method.</summary>
public record GetnetBreakdownSlice(string Key, int Count, long SettledMinor);

/// <summary>A page of the transactions table.</summary>
public record GetnetTransactionPage(IReadOnlyList<GetnetTransactionRow> Items, int Total, int Page, int PageSize);

/// <summary>
/// A transaction as the table shows it.
/// </summary>
/// <remarks>
/// Deliberately not the entity: the entity may grow fields that should not leave the server,
/// and a record mapped by hand makes that a decision rather than an oversight.
/// </remarks>
public record GetnetTransactionRow(
    int Id,
    string OrderRef,
    string? PaymentId,
    long AmountMinor,
    long RefundedMinor,
    string Currency,
    string Status,
    string? PaymentMethod,
    string? CardBrand,
    string? CardLast4,
    int Installments,
    string? CustomerName,
    string? AuthorizationCode,
    string? ErrorMessage,
    DateTime CreatedAt,
    DateTime? UpdatedAt);

/// <summary>
/// What the settings tab may show about the gateway connection.
/// </summary>
/// <remarks>
/// Presence rather than value for everything secret. A dashboard needs to answer "is this
/// configured?", which a boolean does; returning the client secret so a screen can grey out a
/// field would put it in the browser, in the network log, and in anyone's screenshot.
/// </remarks>
public record GetnetConnectionStatus(
    string Environment,
    string BaseUrl,
    bool HasSellerId,
    bool HasClientId,
    bool HasClientSecret,
    bool MockEnabled,
    string? SellerIdMasked);
