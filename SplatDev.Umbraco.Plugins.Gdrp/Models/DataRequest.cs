using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SplatDev.Umbraco.Plugins.Gdrp.Models;

[Table("DataRequests", Schema = "gdrp")]
public class DataRequest
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(320)]
    public string Email { get; set; } = string.Empty;

    /// <summary>Values: "export", "erasure"</summary>
    [Required]
    [MaxLength(20)]
    public string RequestType { get; set; } = string.Empty;

    /// <summary>Values: "pending", "completed"</summary>
    [Required]
    [MaxLength(20)]
    public string Status { get; set; } = "pending";

    public DateTime RequestedAt { get; set; } = DateTime.UtcNow;

    public DateTime? CompletedAt { get; set; }
}
