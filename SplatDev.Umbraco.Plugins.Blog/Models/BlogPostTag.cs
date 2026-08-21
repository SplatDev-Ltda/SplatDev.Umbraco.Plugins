using System.ComponentModel.DataAnnotations.Schema;

namespace SplatDev.Umbraco.Plugins.Blog.Models;

public class BlogPostTag
{
    public int BlogPostId { get; set; }

    [ForeignKey(nameof(BlogPostId))]
    public BlogPost BlogPost { get; set; } = null!;

    public int BlogTagId { get; set; }

    [ForeignKey(nameof(BlogTagId))]
    public BlogTag BlogTag { get; set; } = null!;
}
