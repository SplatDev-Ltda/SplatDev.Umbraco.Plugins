using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SplatDev.Umbraco.Plugins.Payments.MercadoPago.Models;

[Table("MercadoPagoOrders", Schema = "mpago")]
public class MercadoPagoOrder
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string OrderRef { get; set; } = string.Empty;

    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }

    [MaxLength(10)]
    public string Currency { get; set; } = "BRL";

    [Required]
    [MaxLength(50)]
    public string Status { get; set; } = string.Empty;

    [MaxLength(200)]
    public string? PaymentId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }
}
