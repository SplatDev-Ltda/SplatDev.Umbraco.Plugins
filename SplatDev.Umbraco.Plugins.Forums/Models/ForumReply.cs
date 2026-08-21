using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SplatDev.Umbraco.Plugins.Forums.Models;

public class ForumReply
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    public int ThreadId { get; set; }

    [ForeignKey(nameof(ThreadId))]
    public ForumThread Thread { get; set; } = null!;

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

    public bool IsApproved { get; set; } = true;

    public bool IsDeleted { get; set; } = false;
}
