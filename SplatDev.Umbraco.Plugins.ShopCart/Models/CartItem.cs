using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SplatDev.Umbraco.Plugins.ShopCart.Models;

[Table("CartItems", Schema = "shopcart")]
public class CartItem
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string SessionId { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string ProductId { get; set; } = string.Empty;

    [Required]
    [MaxLength(500)]
    public string ProductName { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string ProductAlias { get; set; } = string.Empty;

    [Column(TypeName = "decimal(18,2)")]
    public decimal Price { get; set; }

    public int Quantity { get; set; } = 1;

    [MaxLength(1000)]
    public string? ImageUrl { get; set; }

    public DateTime AddedAt { get; set; } = DateTime.UtcNow;
}
