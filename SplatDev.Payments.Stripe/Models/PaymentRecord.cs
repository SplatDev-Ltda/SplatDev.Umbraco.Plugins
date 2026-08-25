using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace SplatDev.Payments.Stripe;

[Index(nameof(StripeEventId), IsUnique = true)]
[Index(nameof(PaymentIntentId))]
[Index(nameof(CreatedAt))]
public class PaymentRecord
{
    public int Id { get; set; }

    [MaxLength(256)]
    public string StripeEventId { get; set; } = string.Empty;

    [MaxLength(256)]
    public string? PaymentIntentId { get; set; }

    [MaxLength(256)]
    public string? CheckoutSessionId { get; set; }

    [MaxLength(10)]
    public string Currency { get; set; } = "usd";

    public long Amount { get; set; }

    [MaxLength(50)]
    public string Status { get; set; } = string.Empty;

    [MaxLength(320)]
    public string? CustomerEmail { get; set; }

    [MaxLength(100)]
    public string? ClientReferenceId { get; set; }

    public string? RawJson { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? ProcessedAt { get; set; }
}
