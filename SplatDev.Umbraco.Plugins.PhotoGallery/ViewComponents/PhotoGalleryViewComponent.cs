using Microsoft.AspNetCore.Mvc;
using SplatDev.Umbraco.Plugins.PhotoGallery.Models;
using SplatDev.Umbraco.Plugins.PhotoGallery.Services;

namespace SplatDev.Umbraco.Plugins.PhotoGallery.ViewComponents;

/// <summary>
/// Renders an album on the front end.
/// </summary>
/// <remarks>
/// The plugin could build albums in the backoffice and pick one on a document, but had
/// no way to put the result on a page — the picker chose an id nothing consumed.
/// </remarks>
public class PhotoGalleryViewComponent : ViewComponent
{
    private readonly IPhotoGalleryService _service;

    public PhotoGalleryViewComponent(IPhotoGalleryService service) => _service = service;

    /// <param name="albumId">
    /// The album to show. Omitted, the first album is used, which is the common case on
    /// a site with one.
    /// </param>
    public async Task<IViewComponentResult> InvokeAsync(int? albumId = null)
    {
        var album = albumId.HasValue
            ? await _service.GetAlbumAsync(albumId.Value)
            : (await _service.GetAlbumsAsync()).FirstOrDefault();

        if (album is null)
        {
            return View(new PhotoGalleryViewModel(null, []));
        }

        var photos = (await _service.GetPhotosAsync(album.Id))
            .OrderBy(p => p.SortOrder)
            .ToList();

        return View(new PhotoGalleryViewModel(album, photos));
    }
}

public record PhotoGalleryViewModel(Album? Album, IReadOnlyList<Photo> Photos);
