using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SplatDev.Umbraco.Plugins.StarRatings.Models;

[Table("StarRatings_ContentRating")]
public class ContentRating
{
    [Key]
    public int Id { get; set; }

    public Guid ContentKey { get; set; }

    [Required]
    [MaxLength(45)]
    public string VoterIp { get; set; } = string.Empty;

    /// <summary>Rating value between 1 and 5 inclusive.</summary>
    [Range(1, 5)]
    public int Rating { get; set; }

    public DateTime RatedAt { get; set; } = DateTime.UtcNow;

    [MaxLength(254)]
    public string? VoterEmail { get; set; }
}
