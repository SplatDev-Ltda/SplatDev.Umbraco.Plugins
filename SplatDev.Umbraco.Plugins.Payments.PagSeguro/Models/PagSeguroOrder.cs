using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SplatDev.Umbraco.Plugins.Payments.PagSeguro.Models;

[Table("PagSeguroOrders", Schema = "pagseguro")]
public class PagSeguroOrder
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string OrderRef { get; set; } = string.Empty;

    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }

    [Required]
    [MaxLength(50)]
    public string Status { get; set; } = "pending";

    [MaxLength(200)]
    public string? Code { get; set; }

    [MaxLength(500)]
    public string? CheckoutUrl { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
