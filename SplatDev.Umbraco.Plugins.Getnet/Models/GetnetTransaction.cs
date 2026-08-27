using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SplatDev.Umbraco.Plugins.Getnet.Models;

/// <summary>
/// One payment attempt against Getnet, as this site saw it.
/// </summary>
/// <remarks>
/// Getnet's own API answers about a single payment at a time and keeps no history this site
/// can page through, so the reporting in the backoffice has to come from what the site
/// recorded as it went. This is that record - not a cache of Getnet's state, but the local
/// ledger the dashboard reads.
///
/// Amounts are stored in the currency's minor unit (centavos for BRL) because that is what
/// Getnet's API exchanges, and converting on the way in is how rounding errors get baked into
/// a total that is later reported as money.
/// </remarks>
[Table("GetnetTransactions", Schema = "getnet")]
public class GetnetTransaction
{
    [Key]
    public int Id { get; set; }

    /// <summary>The site's own reference for the order, not Getnet's.</summary>
    [Required]
    [MaxLength(200)]
    public string OrderRef { get; set; } = string.Empty;

    /// <summary>Getnet's payment id, absent until the gateway has accepted the request.</summary>
    [MaxLength(200)]
    public string? PaymentId { get; set; }

    /// <summary>Minor units - centavos for BRL. See the remarks on this class.</summary>
    public long AmountMinor { get; set; }

    [MaxLength(10)]
    public string Currency { get; set; } = "BRL";

    /// <summary>One of <see cref="GetnetTransactionStatus"/>.</summary>
    [Required]
    [MaxLength(50)]
    public string Status { get; set; } = GetnetTransactionStatus.Pending;

    /// <summary>credit, debit, pix or boleto.</summary>
    [MaxLength(30)]
    public string? PaymentMethod { get; set; }

    [MaxLength(30)]
    public string? CardBrand { get; set; }

    /// <summary>Last four digits only. Never store a full card number.</summary>
    [MaxLength(4)]
    public string? CardLast4 { get; set; }

    public int Installments { get; set; } = 1;

    [MaxLength(200)]
    public string? CustomerName { get; set; }

    [MaxLength(200)]
    public string? CustomerEmail { get; set; }

    [MaxLength(50)]
    public string? AuthorizationCode { get; set; }

    /// <summary>Why the gateway refused, when it did. Shown verbatim in the transactions table.</summary>
    [MaxLength(500)]
    public string? ErrorMessage { get; set; }

    public long RefundedMinor { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }
}

/// <summary>
/// The statuses the dashboard groups by. Strings rather than an enum because they are stored
/// and queried as text, and an enum's numeric values would make the table unreadable.
/// </summary>
public static class GetnetTransactionStatus
{
    public const string Pending = "PENDING";
    public const string Authorized = "AUTHORIZED";
    public const string Confirmed = "CONFIRMED";
    public const string Denied = "DENIED";
    public const string Canceled = "CANCELED";
    public const string Refunded = "REFUNDED";
    public const string Error = "ERROR";

    /// <summary>Statuses that represent money actually taken.</summary>
    public static readonly string[] Settled = [Confirmed];

    /// <summary>Statuses that represent an attempt that did not result in money.</summary>
    public static readonly string[] Unsuccessful = [Denied, Canceled, Error];
}
