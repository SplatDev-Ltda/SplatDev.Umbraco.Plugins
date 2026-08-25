using System.ComponentModel.DataAnnotations;

namespace SplatDev.Payments.Stripe;

public class CheckoutRequest
{
    [Required]
    [MaxLength(200)]
    public string Description { get; set; } = string.Empty;

    [Range(1, int.MaxValue)]
    public int Quantity { get; set; } = 1;

    public decimal UnitAmount { get; set; }

    [MaxLength(10)]
    public string Currency { get; set; } = "usd";

    [MaxLength(500)]
    public string? CustomerEmail { get; set; }

    [MaxLength(100)]
    public string? ClientReferenceId { get; set; }

    public Dictionary<string, string>? Metadata { get; set; }
}
