using Microsoft.AspNetCore.Authorization;
using Umbraco.Cms.Web.Common.Authorization;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Web.Common.Controllers;
using SplatDev.Umbraco.Plugins.ExamineExtensions.Models;
using SplatDev.Umbraco.Plugins.ExamineExtensions.Services;

namespace SplatDev.Umbraco.Plugins.ExamineExtensions.Controllers;

/// <summary>
/// Index inspection and maintenance.
/// </summary>
/// <remarks>
/// Previously anonymous. Search queried the raw Examine indexes, which hold unpublished
/// and protected content that the delivery pipeline would never serve — the index does
/// not apply the access rules the front end does. RebuildIndex is also an expensive
/// operation to leave open to anonymous callers.
/// </remarks>
[Authorize(Policy = AuthorizationPolicies.BackOfficeAccess)]
[Route("umbraco/api/examineextensions/[action]")]
public class ExamineExtensionsApiController : ControllerBase
{
    private readonly IExamineExtensionsService _service;

    public ExamineExtensionsApiController(IExamineExtensionsService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetIndexes()
    {
        var indexes = await _service.GetAllIndexesAsync();
        return Ok(indexes);
    }

    [HttpPost]
    public async Task<IActionResult> Search([FromBody] SearchRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Query))
            return BadRequest("Query is required.");

        var result = await _service.SearchAsync(request);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> RebuildIndex([FromBody] string indexName)
    {
        if (string.IsNullOrWhiteSpace(indexName))
            return BadRequest("Index name is required.");

        await _service.RebuildIndexAsync(indexName);
        return Ok(new { success = true, message = $"Index '{indexName}' rebuild triggered." });
    }
}
