using Microsoft.AspNetCore.Authorization;
using Umbraco.Cms.Web.Common.Authorization;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Web.Common.Controllers;
using SplatDev.Umbraco.Plugins.DictionaryManager.Models;
using SplatDev.Umbraco.Plugins.DictionaryManager.Services;

namespace SplatDev.Umbraco.Plugins.DictionaryManager.Controllers;

/// <remarks>
/// Previously anonymous. Create, Update, Delete and Import rewrote dictionary items — the site's translated strings — for anyone who asked.
/// </remarks>
[Authorize(Policy = AuthorizationPolicies.BackOfficeAccess)]
[Route("umbraco/api/dictionarymanager/[action]")]
public class DictionaryManagerApiController : ControllerBase
{
    private readonly IDictionaryManagerService _service;

    public DictionaryManagerApiController(IDictionaryManagerService service)
    {
        _service = service;
    }

    [HttpGet]
    public IActionResult GetAll()
    {
        var items = _service.GetAll();
        return Ok(items);
    }

    [HttpPost]
    public IActionResult Create([FromBody] DictionaryItemDto item)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        if (string.IsNullOrWhiteSpace(item.Key))
            return BadRequest("Key is required.");

        var result = _service.Create(item);
        if (result is null)
            return StatusCode(500, new { message = "Failed to create dictionary item." });

        return Ok(result);
    }

    [HttpPut]
    public IActionResult Update([FromBody] DictionaryItemDto item)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        if (string.IsNullOrWhiteSpace(item.Key))
            return BadRequest("Key is required.");

        var result = _service.Update(item);
        if (result is null)
            return NotFound($"Dictionary item '{item.Key}' not found.");

        return Ok(result);
    }

    [HttpDelete]
    public IActionResult Delete([FromQuery] string key)
    {
        if (string.IsNullOrWhiteSpace(key))
            return BadRequest("Key is required.");

        var deleted = _service.Delete(key);
        if (!deleted)
            return NotFound($"Dictionary item '{key}' not found.");

        return Ok(new { message = $"'{key}' deleted." });
    }

    [HttpPost]
    public async Task<IActionResult> Import(
        [FromBody] List<DictionaryItemDto> items,
        [FromQuery] bool overrideExisting = false)
    {
        if (items is null || items.Count == 0)
            return BadRequest("No items provided.");

        var results = await _service.ImportAsync(items, overrideExisting);
        return Ok(results);
    }

    [HttpGet]
    public async Task<IActionResult> Export()
    {
        var bytes = await _service.ExportAsync();
        return File(bytes, "application/json", "dictionary-export.json");
    }
}
