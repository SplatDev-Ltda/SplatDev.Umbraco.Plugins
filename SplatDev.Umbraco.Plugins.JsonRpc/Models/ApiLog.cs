using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SplatDev.Umbraco.Plugins.JsonRpc.Models;

[Table("ApiLogs", Schema = "jsonrpc")]
public class ApiLog
{
    [Key]
    public int Id { get; set; }

    public int? ApiKeyId { get; set; }

    [Required]
    [MaxLength(200)]
    public string Method { get; set; } = string.Empty;

    [Required]
    [MaxLength(500)]
    public string Endpoint { get; set; } = string.Empty;

    public DateTime RequestedAt { get; set; } = DateTime.UtcNow;

    public int StatusCode { get; set; }

    [MaxLength(50)]
    public string? IpAddress { get; set; }
}
