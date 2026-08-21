using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SplatDev.Umbraco.Plugins.Gdrp.Models;

[Table("ConsentRecords", Schema = "gdrp")]
public class ConsentRecord
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string SessionId { get; set; } = string.Empty;

    /// <summary>Values: "all", "essential", "none"</summary>
    [Required]
    [MaxLength(20)]
    public string ConsentType { get; set; } = "none";

    public DateTime ConsentDate { get; set; } = DateTime.UtcNow;

    [MaxLength(50)]
    public string? IpAddress { get; set; }

    [MaxLength(500)]
    public string? UserAgent { get; set; }
}
