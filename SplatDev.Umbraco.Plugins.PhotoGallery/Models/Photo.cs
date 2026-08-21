namespace SplatDev.Umbraco.Plugins.PhotoGallery.Models;

public class Photo
{
    public int Id { get; set; }
    public int AlbumId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public string? ThumbnailUrl { get; set; }
    public string? Caption { get; set; }
    public int SortOrder { get; set; }
    public Album Album { get; set; } = null!;
}
