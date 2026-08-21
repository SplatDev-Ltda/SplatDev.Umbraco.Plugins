using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SplatDev.Umbraco.Plugins.Forums.Models;

public class ForumThread
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    public int CategoryId { get; set; }

    [ForeignKey(nameof(CategoryId))]
    public ForumCategory Category { get; set; } = null!;

    [Required]
    [MaxLength(500)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [MaxLength(500)]
    public string Slug { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string AuthorName { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    [EmailAddress]
    public string AuthorEmail { get; set; } = string.Empty;

    [Required]
    public string Content { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public bool IsLocked { get; set; } = false;

    public bool IsPinned { get; set; } = false;

    public int ViewCount { get; set; } = 0;

    public int ReplyCount { get; set; } = 0;

    public ICollection<ForumReply> Replies { get; set; } = new List<ForumReply>();
}
