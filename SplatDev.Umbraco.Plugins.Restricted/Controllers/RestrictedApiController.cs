using Microsoft.AspNetCore.Authorization;
using Umbraco.Cms.Web.Common.Authorization;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Web.Common.Controllers;
using SplatDev.Umbraco.Plugins.Restricted.Services;

namespace SplatDev.Umbraco.Plugins.Restricted.Controllers;

/// <summary>
/// Controls which nodes require which member groups.
/// </summary>
/// <remarks>
/// Previously anonymous, with the same problem as HiddenContent but sharper:
/// UnrestrictNode removed the group requirement from a protected node outright, and
/// SetRequiredGroups rewrote it. The restriction was enforced by a service anyone could
/// call to lift it.
/// </remarks>
[Authorize(Policy = AuthorizationPolicies.BackOfficeAccess)]
[Route("umbraco/api/restricted/[action]")]
public class RestrictedApiController : ControllerBase
{
    private readonly IRestrictedContentService _service;

    public RestrictedApiController(IRestrictedContentService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetRestrictedNodes()
    {
        var nodes = await _service.GetRestrictedNodesAsync();
        return Ok(nodes);
    }

    [HttpPost]
    public async Task<IActionResult> RestrictNode([FromBody] RestrictNodeRequest request)
    {
        if (request.NodeId <= 0)
            return BadRequest("NodeId is required.");
        if (string.IsNullOrWhiteSpace(request.LoginPageNodeId))
            return BadRequest("LoginPageNodeId is required.");
        if (string.IsNullOrWhiteSpace(request.ErrorPageNodeId))
            return BadRequest("ErrorPageNodeId is required.");
        if (request.MemberGroups is null || !request.MemberGroups.Any())
            return BadRequest("At least one member group is required.");

        await _service.RestrictNodeAsync(request.NodeId, request.LoginPageNodeId, request.ErrorPageNodeId, request.MemberGroups);
        return Ok(new { message = $"Node {request.NodeId} restricted successfully." });
    }

    [HttpDelete]
    public async Task<IActionResult> UnrestrictNode([FromQuery] int nodeId)
    {
        if (nodeId <= 0)
            return BadRequest("NodeId is required.");

        await _service.UnrestrictNodeAsync(nodeId);
        return Ok(new { message = $"Node {nodeId} unrestricted." });
    }

    [HttpGet]
    public async Task<IActionResult> GetRequiredGroups([FromQuery] int nodeId)
    {
        if (nodeId <= 0)
            return BadRequest("NodeId is required.");

        var groups = await _service.GetRequiredGroupsAsync(nodeId);
        return Ok(groups);
    }

    [HttpPost]
    public async Task<IActionResult> SetRequiredGroups([FromBody] RestrictNodeRequest request)
    {
        if (request.NodeId <= 0)
            return BadRequest("NodeId is required.");

        await _service.SetRequiredGroupsAsync(request.NodeId, request.LoginPageNodeId, request.ErrorPageNodeId, request.MemberGroups ?? []);
        return Ok(new { message = $"Groups updated for node {request.NodeId}." });
    }
}

public class RestrictNodeRequest
{
    public int NodeId { get; set; }
    public string LoginPageNodeId { get; set; } = string.Empty;
    public string ErrorPageNodeId { get; set; } = string.Empty;
    public IEnumerable<string>? MemberGroups { get; set; }
}
