using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SplatDev.Umbraco.Plugins.HiddenContent.Models;
using SplatDev.Umbraco.Plugins.HiddenContent.Services;
using Umbraco.Cms.Web.Common.Authorization;

namespace SplatDev.Umbraco.Plugins.HiddenContent.Controllers;

/// <summary>
/// Controls which nodes are hidden from navigation.
/// </summary>
/// <remarks>
/// Previously anonymous — so the mechanism that hides content could be read and reversed
/// by anyone. GetHiddenNodes enumerated exactly what was meant to be concealed, and
/// ShowNode / BulkShow revealed it.
/// </remarks>
[Authorize(Policy = AuthorizationPolicies.BackOfficeAccess)]
[Route("umbraco/api/hiddencontent/[action]")]
public class HiddenContentApiController : ControllerBase
{
    private readonly IHiddenContentService _service;

    public HiddenContentApiController(IHiddenContentService service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> GetHiddenNodes() =>
        Ok(await _service.GetHiddenNodesAsync());

    [HttpGet]
    public async Task<IActionResult> IsHidden([FromQuery] string node)
    {
        var hidden = await _service.IsHiddenAsync(node);
        return hidden is null ? NotFound() : Ok(new { hidden = hidden.Value });
    }

    /// <summary>
    /// Hides one or more nodes.
    /// </summary>
    /// <remarks>
    /// Single and bulk were separate endpoints doing the same work, which meant the
    /// dashboard had two code paths and two comma-separated-id text boxes. One endpoint
    /// takes a list; a list of one is the single case.
    /// </remarks>
    [HttpPost]
    public async Task<IActionResult> Hide([FromBody] NodeRefsRequest request)
    {
        var result = await _service.HideAsync(request.Nodes);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpPost]
    public async Task<IActionResult> Show([FromBody] NodeRefsRequest request)
    {
        var result = await _service.ShowAsync(request.Nodes);
        return result.Success ? Ok(result) : BadRequest(result);
    }
}
