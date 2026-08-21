using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Authorization;
using Umbraco.Cms.Web.Common.Authorization;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Web.Common.Controllers;
using SplatDev.Umbraco.Plugins.Dropzone.Models;
using SplatDev.Umbraco.Plugins.Dropzone.Services;

namespace SplatDev.Umbraco.Plugins.Dropzone.Controllers;

/// <summary>
/// Media upload for the backoffice Dropzone dashboard.
/// </summary>
/// <remarks>
/// Previously anonymous, which meant any caller on the internet could write files into
/// the media library — the classic path to dropping something executable onto a host —
/// and delete existing media.
/// </remarks>
[Authorize(Policy = AuthorizationPolicies.BackOfficeAccess)]
[Route("umbraco/api/dropzone/[action]")]
public class DropzoneApiController : ControllerBase
{
    private readonly IDropzoneService _service;

    public DropzoneApiController(IDropzoneService service)
    {
        _service = service;
    }

    /// <summary>The upload limits, so the dashboard can state them and check before posting.</summary>
    [HttpGet]
    public IActionResult GetOptions()
    {
        var o = _service.GetOptions();
        return Ok(new
        {
            allowedExtensions = o.AllowedExtensions,
            maxFileSizeMb = o.MaxFileSizeMb,
            maxFileSizeBytes = o.MaxFileSizeBytes,
            renameOnCollision = o.RenameOnCollision
        });
    }

    /// <summary>Media folders, so a destination can be picked rather than typed.</summary>
    [HttpGet]
    public async Task<IActionResult> GetFolders()
    {
        var folders = await _service.GetFoldersAsync();
        return Ok(folders.Select(f => new { id = f.Id, key = f.Key, name = f.Name }));
    }

    [HttpPost]
    [DisableRequestSizeLimit]
    public async Task<IActionResult> Upload(
        [FromForm] IFormFile file,
        [FromForm] string? folderName,
        [FromForm] int? parentMediaId,
        [FromForm] Guid? parentMediaKey)
    {
        if (file == null || file.Length == 0)
            return BadRequest("No file provided.");

        var request = new UploadRequest
        {
            FolderName = folderName ?? "",
            ParentMediaId = parentMediaId,
            ParentMediaKey = parentMediaKey
        };

        var result = await _service.UploadFileAsync(file, request);

        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpGet]
    public async Task<IActionResult> GetMedia([FromQuery] int? parentId)
    {
        var items = await _service.GetMediaItemsAsync(parentId);
        var data = items.Select(m => new
        {
            id = m.Id,
            key = m.Key,
            name = m.Name,
            contentType = m.ContentType.Alias
        });
        return Ok(data);
    }

    [HttpDelete]
    public async Task<IActionResult> Delete([FromQuery] Guid mediaKey)
    {
        var success = await _service.DeleteMediaAsync(mediaKey);
        if (!success)
            return NotFound($"Media item with key '{mediaKey}' not found.");

        return Ok(new { success = true });
    }
}
