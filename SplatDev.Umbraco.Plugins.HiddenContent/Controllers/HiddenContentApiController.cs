using Microsoft.AspNetCore.Authorization;
using Umbraco.Cms.Web.Common.Authorization;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Web.Common.Controllers;
using SplatDev.Umbraco.Plugins.HiddenContent.Services;

namespace SplatDev.Umbraco.Plugins.HiddenContent.Controllers;

/// <summary>
/// Controls which nodes are hidden.
/// </summary>
/// <remarks>
/// Previously anonymous — so the mechanism that hides content could be read and reversed
/// by anyone. GetHiddenNodes enumerated exactly what was meant to be concealed, and
/// ShowNode / BulkShow revealed it. An access-control feature that anyone can switch off
/// is not one.
/// </remarks>
[Authorize(Policy = AuthorizationPolicies.BackOfficeAccess)]
[Route("umbraco/api/hiddencontent/[action]")]
public class HiddenContentApiController : ControllerBase
{
    private readonly IHiddenContentService _service;

    public HiddenContentApiController(IHiddenContentService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetHiddenNodes()
    {
        var nodes = await _service.GetHiddenNodesAsync();
        return Ok(nodes);
    }

    [HttpPost]
    public async Task<IActionResult> HideNode([FromQuery] int nodeId)
    {
        if (nodeId <= 0)
            return BadRequest("NodeId is required.");

        await _service.HideNodeAsync(nodeId);
        return Ok(new { message = $"Node {nodeId} hidden from navigation." });
    }

    [HttpPost]
    public async Task<IActionResult> ShowNode([FromQuery] int nodeId)
    {
        if (nodeId <= 0)
            return BadRequest("NodeId is required.");

        await _service.ShowNodeAsync(nodeId);
        return Ok(new { message = $"Node {nodeId} shown in navigation." });
    }

    [HttpGet]
    public async Task<IActionResult> IsHidden([FromQuery] int nodeId)
    {
        if (nodeId <= 0)
            return BadRequest("NodeId is required.");

        var hidden = await _service.IsHiddenAsync(nodeId);
        return Ok(new { nodeId, hidden });
    }

    [HttpPost]
    public async Task<IActionResult> BulkHide([FromBody] BulkNodeRequest request)
    {
        if (request.NodeIds is null || !request.NodeIds.Any())
            return BadRequest("NodeIds are required.");

        await _service.BulkHideAsync(request.NodeIds);
        return Ok(new { message = $"{request.NodeIds.Count()} nodes hidden." });
    }

    [HttpPost]
    public async Task<IActionResult> BulkShow([FromBody] BulkNodeRequest request)
    {
        if (request.NodeIds is null || !request.NodeIds.Any())
            return BadRequest("NodeIds are required.");

        await _service.BulkShowAsync(request.NodeIds);
        return Ok(new { message = $"{request.NodeIds.Count()} nodes shown." });
    }
}

public class BulkNodeRequest
{
    public IEnumerable<int>? NodeIds { get; set; }
}
