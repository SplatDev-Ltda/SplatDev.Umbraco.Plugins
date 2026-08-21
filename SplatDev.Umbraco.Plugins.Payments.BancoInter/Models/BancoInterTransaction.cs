using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SplatDev.Umbraco.Plugins.Payments.BancoInter.Models;

[Table("BancoInterTransactions", Schema = "bancointer")]
public class BancoInterTransaction
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(50)]
    public string Type { get; set; } = string.Empty;

    [MaxLength(100)]
    public string? ExternalRef { get; set; }

    [MaxLength(100)]
    public string? Txid { get; set; }

    [MaxLength(200)]
    public string? EndToEndId { get; set; }

    [MaxLength(100)]
    public string? NossoNumero { get; set; }

    [MaxLength(100)]
    public string? CodigoSolicitacao { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }

    [MaxLength(10)]
    public string Currency { get; set; } = "BRL";

    [Required]
    [MaxLength(50)]
    public string Status { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? PixCopiaECola { get; set; }

    [MaxLength(500)]
    public string? BoletoLinhaDigitavel { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
