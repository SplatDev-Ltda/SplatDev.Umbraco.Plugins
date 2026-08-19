using Microsoft.AspNetCore.Authorization;
using Umbraco.Cms.Web.Common.Authorization;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Web.Common.Controllers;
using SplatDev.Umbraco.Plugins.PhotoGallery.Models;
using SplatDev.Umbraco.Plugins.PhotoGallery.Services;

namespace SplatDev.Umbraco.Plugins.PhotoGallery.Controllers;

/// <remarks>
/// Previously anonymous. CreateAlbum, UpdateAlbum, DeleteAlbum, AddPhoto and DeletePhoto let anyone rewrite the galleries. Viewing stays open.
/// </remarks>
[Authorize(Policy = AuthorizationPolicies.BackOfficeAccess)]
[Route("umbraco/api/photogallery/[action]")]
public class PhotoGalleryApiController : ControllerBase
{
    private readonly IPhotoGalleryService _service;

    public PhotoGalleryApiController(IPhotoGalleryService service)
    {
        _service = service;
    }

    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> GetAlbums()
        => Ok(await _service.GetAlbumsAsync());

    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> GetAlbum(int id)
    {
        var album = await _service.GetAlbumAsync(id);
        return album is null ? NotFound() : Ok(album);
    }

    [HttpPost]
    public async Task<IActionResult> CreateAlbum([FromBody] Album album)
        => Ok(await _service.CreateAlbumAsync(album));

    [HttpPut]
    public async Task<IActionResult> UpdateAlbum([FromBody] Album album)
        => Ok(await _service.UpdateAlbumAsync(album));

    [HttpDelete]
    public async Task<IActionResult> DeleteAlbum(int id)
    {
        await _service.DeleteAlbumAsync(id);
        return Ok();
    }

    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> GetPhotos(int albumId)
        => Ok(await _service.GetPhotosAsync(albumId));

    [HttpPost]
    public async Task<IActionResult> AddPhoto([FromBody] Photo photo)
        => Ok(await _service.AddPhotoAsync(photo));

    [HttpDelete]
    public async Task<IActionResult> DeletePhoto(int id)
    {
        await _service.DeletePhotoAsync(id);
        return Ok();
    }
}
