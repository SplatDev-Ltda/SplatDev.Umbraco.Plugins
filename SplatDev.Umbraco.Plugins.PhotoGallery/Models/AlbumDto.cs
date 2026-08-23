namespace SplatDev.Umbraco.Plugins.PhotoGallery.Models;

/// <summary>
/// An album as the API returns it.
/// </summary>
/// <remarks>
/// The endpoints used to serialize the <see cref="Album"/> entity straight out of EF.
/// Because the queries Include the photos, and every <see cref="Photo"/> carries an Album
/// back-reference, System.Text.Json walked Album to Photo to Album and gave up:
///
///     A possible object cycle was detected.
///
/// An album with no photos serialized fine, so an empty install looked healthy and the
/// dashboard broke as soon as someone added the first photo.
///
/// Projecting is the fix rather than a serializer setting: nothing outside this shape can
/// leak, and the shape is what the dashboard and the picker actually need.
/// </remarks>
public class AlbumDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? CoverImageUrl { get; set; }
    public DateTime CreatedAt { get; set; }
    public int PhotoCount { get; set; }
    public List<PhotoDto> Photos { get; set; } = new();

    public static AlbumDto From(Album album) => new()
    {
        Id = album.Id,
        Title = album.Title,
        Description = album.Description,
        CoverImageUrl = album.CoverImageUrl,
        CreatedAt = album.CreatedAt,
        PhotoCount = album.Photos?.Count ?? 0,
        Photos = album.Photos?
            .OrderBy(p => p.SortOrder)
            .Select(PhotoDto.From)
            .ToList() ?? new List<PhotoDto>(),
    };
}

/// <summary>One photo, without the back-reference to its album.</summary>
public class PhotoDto
{
    public int Id { get; set; }
    public int AlbumId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public string? ThumbnailUrl { get; set; }
    public string? Caption { get; set; }
    public int SortOrder { get; set; }

    public static PhotoDto From(Photo photo) => new()
    {
        Id = photo.Id,
        AlbumId = photo.AlbumId,
        Title = photo.Title,
        ImageUrl = photo.ImageUrl,
        ThumbnailUrl = photo.ThumbnailUrl,
        Caption = photo.Caption,
        SortOrder = photo.SortOrder,
    };
}
