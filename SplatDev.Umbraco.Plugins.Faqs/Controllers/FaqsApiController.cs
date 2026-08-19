using Microsoft.AspNetCore.Authorization;
using Umbraco.Cms.Web.Common.Authorization;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Web.Common.Controllers;
using SplatDev.Umbraco.Plugins.Faqs.Models;
using SplatDev.Umbraco.Plugins.Faqs.Services;

namespace SplatDev.Umbraco.Plugins.Faqs.Controllers;

/// <remarks>
/// Previously anonymous. CreateItem, UpdateItem, DeleteItem, PublishItem, CreateCategory and DeleteCategory let anyone rewrite the FAQ. Reads and search stay open.
/// </remarks>
[Authorize(Policy = AuthorizationPolicies.BackOfficeAccess)]
[Route("umbraco/api/faqs/[action]")]
public class FaqsApiController : ControllerBase
{
    private readonly IFaqsService _service;

    public FaqsApiController(IFaqsService service)
    {
        _service = service;
    }

    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> GetCategories([FromQuery] bool publishedOnly = true)
    {
        var categories = await _service.GetCategoriesAsync(publishedOnly);
        return Ok(categories);
    }

    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> GetCategory(
        [FromQuery] string slug,
        [FromQuery] bool publishedOnly = true)
    {
        if (string.IsNullOrWhiteSpace(slug))
            return BadRequest("Slug is required.");

        var category = await _service.GetCategoryBySlugAsync(slug, publishedOnly);
        if (category is null) return NotFound();
        return Ok(category);
    }

    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> GetItems(
        [FromQuery] int? categoryId = null,
        [FromQuery] bool publishedOnly = true)
    {
        var items = await _service.GetItemsAsync(categoryId, publishedOnly);
        var total = await _service.GetTotalItemCountAsync(publishedOnly);
        return Ok(new { items, total });
    }

    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> GetItem([FromQuery] int id)
    {
        var item = await _service.GetItemByIdAsync(id);
        if (item is null) return NotFound();
        return Ok(item);
    }

    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> Search(
        [FromQuery] string q,
        [FromQuery] bool publishedOnly = true)
    {
        if (string.IsNullOrWhiteSpace(q))
            return BadRequest("Search query is required.");

        var results = await _service.SearchAsync(q, publishedOnly);
        return Ok(results);
    }

    [HttpPost]
    public async Task<IActionResult> CreateItem([FromBody] FaqItem item)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var created = await _service.CreateItemAsync(item);
        return Ok(created);
    }

    [HttpPut]
    public async Task<IActionResult> UpdateItem([FromBody] FaqItem item)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var updated = await _service.UpdateItemAsync(item);
        return Ok(updated);
    }

    [HttpDelete]
    public async Task<IActionResult> DeleteItem([FromQuery] int id)
    {
        await _service.DeleteItemAsync(id);
        return Ok();
    }

    [HttpPost]
    public async Task<IActionResult> PublishItem([FromQuery] int id, [FromQuery] bool publish = true)
    {
        await _service.PublishItemAsync(id, publish);
        return Ok();
    }

    [HttpPost]
    public async Task<IActionResult> CreateCategory([FromBody] FaqCategory category)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var created = await _service.CreateCategoryAsync(category);
        return Ok(created);
    }

    [HttpDelete]
    public async Task<IActionResult> DeleteCategory([FromQuery] int categoryId)
    {
        await _service.DeleteCategoryAsync(categoryId);
        return Ok();
    }
}
