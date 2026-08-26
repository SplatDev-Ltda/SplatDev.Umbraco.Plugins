using Microsoft.AspNetCore.Authorization;
using Umbraco.Cms.Web.Common.Authorization;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Web.Common.Controllers;
using SplatDev.Umbraco.Plugins.Exif.Models;
using SplatDev.Umbraco.Plugins.Exif.Services;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.Web;
using Umbraco.Extensions;

namespace SplatDev.Umbraco.Plugins.Exif.Controllers;

/// <remarks>
/// Previously anonymous. GetByFilePath took an arbitrary path from the query string and read the file, so it doubled as a probe for what exists on disk outside the media library.
/// </remarks>
[Authorize(Policy = AuthorizationPolicies.BackOfficeAccess)]
[Route("umbraco/api/exif/[action]")]
public class ExifApiController : ControllerBase
{
    private readonly IExifService _service;
    private readonly IUmbracoContextAccessor _contextAccessor;

    public ExifApiController(IExifService service, IUmbracoContextAccessor contextAccessor)
    {
        _service = service;
        _contextAccessor = contextAccessor;
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

    /// <summary>
    /// Every image on a content node, with its EXIF.
    /// </summary>
    /// <remarks>
    /// Backs the dashboard's content picker. Without this the picker would have nothing to
    /// call — the other two actions take a single media key or a raw file path.
    ///
    /// Media pickers store their value as a UDI or a GUID depending on the property editor
    /// and the Umbraco major, so both are accepted rather than assuming one.
    /// </remarks>
    [HttpGet]
    public async Task<IActionResult> GetByContentKey([FromQuery] Guid contentKey)
    {
        if (!_contextAccessor.TryGetUmbracoContext(out var context) || context.Content is null)
        {
            return StatusCode(503, new { error = "The published content cache is not available yet." });
        }

#if NET10_0_OR_GREATER
        var node = await context.Content.GetByIdAsync(contentKey);
#else
        var node = context.Content.GetById(contentKey);
        await Task.CompletedTask;
#endif
        if (node is null) return NotFound("No published content with that key.");

        var results = new List<ContentMediaExif>();

        foreach (var property in node.Properties)
        {
            foreach (var key in MediaKeysIn(property.GetValue()))
            {
                var exif = await _service.ReadExifFromMediaAsync(key);
                results.Add(new ContentMediaExif
                {
                    MediaKey = key,
                    PropertyAlias = property.Alias,
                    Name = key.ToString(),
                    Exif = exif,
                });
            }
        }

        return Ok(results);
    }

    /// <summary>
    /// Pulls GUIDs out of a property value, whatever shape the editor stored it in.
    /// </summary>
    private static IEnumerable<Guid> MediaKeysIn(object? value)
    {
        switch (value)
        {
            case null:
                yield break;

            case IPublishedContent single:
                yield return single.Key;
                yield break;

            case IEnumerable<IPublishedContent> many:
                foreach (var m in many) yield return m.Key;
                yield break;

            case string text:
                foreach (var part in text.Split(',', StringSplitOptions.RemoveEmptyEntries))
                {
                    var trimmed = part.Trim();
                    // "umb://media/<guid>" as well as a bare guid.
                    var tail = trimmed.Contains('/') ? trimmed[(trimmed.LastIndexOf('/') + 1)..] : trimmed;
                    if (Guid.TryParse(tail, out var parsed)) yield return parsed;
                }
                yield break;
        }
    }
}
