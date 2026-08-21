using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SplatDev.Umbraco.Plugins.MostViewed.Models;

[Table("MostViewed_PageView")]
public class PageView
{
    [Key]
    public int Id { get; set; }

    public Guid ContentKey { get; set; }

    [Required]
    [MaxLength(500)]
    public string NodeName { get; set; } = string.Empty;

    [Required]
    [MaxLength(2000)]
    public string NodeUrl { get; set; } = string.Empty;

    public DateTime ViewedAt { get; set; } = DateTime.UtcNow;

    [MaxLength(45)]
    public string ViewerIp { get; set; } = string.Empty;
}
