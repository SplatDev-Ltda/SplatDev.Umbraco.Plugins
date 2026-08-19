using Microsoft.AspNetCore.Authorization;
using Umbraco.Cms.Web.Common.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Umbraco.Cms.Web.Common.Controllers;
using SplatDev.Umbraco.Plugins.NewsTicker.Models;
using SplatDev.Umbraco.Plugins.NewsTicker.Services;

namespace SplatDev.Umbraco.Plugins.NewsTicker.Controllers;

/// <remarks>
/// Previously anonymous. AddItem, UpdateItem and DeleteItem let anyone publish to the ticker. Reads stay open.
/// </remarks>
[Authorize(Policy = AuthorizationPolicies.BackOfficeAccess)]
[Route("umbraco/api/newsticker")]
public class NewsTickerApiController : ControllerBase
{
    private readonly INewsTickerService _service;
    private readonly NewsTickerSettings _settings;

    public NewsTickerApiController(
        INewsTickerService service,
        IOptions<NewsTickerSettings> settings)
    {
        _service = service;
        _settings = settings.Value;
    }

    [AllowAnonymous]
    [HttpGet("items")]
    public async Task<IActionResult> GetItems()
    {
        var items = await _service.GetActiveItemsAsync();
        return Ok(items);
    }

    [AllowAnonymous]
    [HttpGet("settings")]
    public IActionResult GetSettings()
    {
        return Ok(_settings);
    }

    [HttpPost("items")]
    public async Task<IActionResult> AddItem([FromBody] NewsTickerItem item)
    {
        if (string.IsNullOrWhiteSpace(item.Text))
            return BadRequest("Text is required.");

        var created = await _service.AddItemAsync(item);
        return Ok(created);
    }

    [HttpPut("items/{id:int}")]
    public async Task<IActionResult> UpdateItem(int id, [FromBody] NewsTickerItem item)
    {
        if (id != item.Id)
            return BadRequest("ID mismatch.");

        try
        {
            await _service.UpdateItemAsync(item);
            return Ok();
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpDelete("items/{id:int}")]
    public async Task<IActionResult> DeleteItem(int id)
    {
        try
        {
            await _service.DeleteItemAsync(id);
            return Ok();
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }
}
