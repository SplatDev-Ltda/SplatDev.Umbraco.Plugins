using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SplatDev.Umbraco.Plugins.Restricted.Models;
using SplatDev.Umbraco.Plugins.Restricted.Services;
using Umbraco.Cms.Web.Common.Authorization;

namespace SplatDev.Umbraco.Plugins.Restricted.Controllers;

/// <summary>
/// Controls which content requires which member groups.
/// </summary>
/// <remarks>
/// Previously anonymous, with the same problem as HiddenContent but sharper:
/// UnrestrictNode removed the group requirement from a protected node outright, and
/// SetRequiredGroups rewrote it. The restriction was enforced by a service anyone
/// could call to lift it.
/// </remarks>
[Authorize(Policy = AuthorizationPolicies.BackOfficeAccess)]
[Route("umbraco/api/restricted/[action]")]
public class RestrictedApiController : ControllerBase
{
    private readonly IRestrictedContentService _service;

    public RestrictedApiController(IRestrictedContentService service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> GetRestrictedNodes() =>
        Ok(await _service.GetRestrictedNodesAsync());

    /// <summary>Populates the group picker, and lets the dashboard show names for keys.</summary>
    [HttpGet]
    public async Task<IActionResult> GetMemberGroups() =>
        Ok(await _service.GetMemberGroupsAsync());

    /// <summary>
    /// The protection on one node, so the editor can load an existing rule into the form
    /// and amend it instead of retyping it.
    /// </summary>
    /// <remarks>
    /// An unprotected node is the ordinary case, not a failure, so it answers 200 with
    /// <c>restricted: false</c> rather than 404. Returning 404 made every unrestricted
    /// page log an error in the editor and left the caller unable to tell "no rule here"
    /// apart from "the request did not arrive".
    ///
    /// The group names are flattened to strings because that is what protection is set
    /// with — <see cref="RestrictNodeRequest.MemberGroups"/> is a list of names — so the
    /// value read back can be posted straight back without a translation step.
    /// </remarks>
    [HttpGet]
    public async Task<IActionResult> GetRestriction([FromQuery] string node)
    {
        var found = await _service.GetRestrictedNodeAsync(node);
        return Ok(new RestrictionState
        {
            Restricted = found is not null,
            MemberGroups = found?.MemberGroups.Select(g => g.Name).ToList() ?? [],
            LoginPage = found?.LoginPage?.Name,
            ErrorPage = found?.ErrorPage?.Name,
        });
    }

    [HttpPost]
    public async Task<IActionResult> RestrictNode([FromBody] RestrictNodeRequest request)
    {
        var result = await _service.RestrictNodeAsync(request);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpDelete]
    public async Task<IActionResult> UnrestrictNode([FromQuery] string node)
    {
        var result = await _service.UnrestrictNodeAsync(node);
        return result.Success ? Ok(result) : BadRequest(result);
    }
}
