using Microsoft.AspNetCore.Authorization;
using Umbraco.Cms.Web.Common.Authorization;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Web.Common.Controllers;
using SplatDev.Umbraco.Plugins.Exif.Services;

namespace SplatDev.Umbraco.Plugins.Exif.Controllers;

/// <remarks>
/// Previously anonymous. GetByFilePath took an arbitrary path from the query string and read the file, so it doubled as a probe for what exists on disk outside the media library.
/// </remarks>
[Authorize(Policy = AuthorizationPolicies.BackOfficeAccess)]
[Route("umbraco/api/exif/[action]")]
public class ExifApiController : ControllerBase
{
    private readonly IExifService _service;

    public ExifApiController(IExifService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetByFilePath([FromQuery] string filePath)
    {
        if (string.IsNullOrWhiteSpace(filePath))
            return BadRequest("filePath is required.");

        var data = await _service.ReadExifAsync(filePath);
        if (data == null)
            return NotFound("Could not read EXIF data from the specified file.");

        return Ok(data);
    }

    [HttpGet]
    public async Task<IActionResult> GetByMediaKey([FromQuery] Guid mediaKey)
    {
        var data = await _service.ReadExifFromMediaAsync(mediaKey);
        if (data == null)
            return NotFound("Could not read EXIF data for the specified media item.");

        return Ok(data);
    }
}
