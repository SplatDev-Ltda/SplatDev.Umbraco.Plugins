using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SplatDev.Umbraco.Plugins.ShopCart.Services;
using Umbraco.Cms.Web.Common.Authorization;

namespace SplatDev.Umbraco.Plugins.ShopCart.Controllers;

/// <summary>
/// Backoffice view of carts across the site.
/// </summary>
/// <remarks>
/// Deliberately a separate controller from the shopper-facing one, which is anonymous and
/// scoped to a single session. Adding these actions there would have put cross-session
/// reads behind [AllowAnonymous].
/// </remarks>
[Authorize(Policy = AuthorizationPolicies.BackOfficeAccess)]
[Route("umbraco/api/shopcart/admin/[action]")]
public class ShopCartAdminController : ControllerBase
{
    private const int DefaultAbandonedAfterDays = 7;

    private readonly IShopCartAdminService _service;

    public ShopCartAdminController(IShopCartAdminService service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> Overview([FromQuery] int abandonedAfterDays = DefaultAbandonedAfterDays)
        => Ok(await _service.Overview(abandonedAfterDays));

    [HttpGet]
    public async Task<IActionResult> Carts(
        [FromQuery] int abandonedAfterDays = DefaultAbandonedAfterDays,
        [FromQuery] bool onlyAbandoned = false)
        => Ok(await _service.Carts(abandonedAfterDays, onlyAbandoned));

    [HttpDelete]
    public async Task<IActionResult> ClearCart([FromQuery] string sessionId)
    {
        if (string.IsNullOrWhiteSpace(sessionId))
            return BadRequest(new { message = "sessionId is required." });

        var result = await _service.ClearOne(sessionId);
        return result.Success ? Ok(result) : NotFound(result);
    }

    [HttpPost]
    public async Task<IActionResult> ClearAbandoned([FromQuery] int olderThanDays = DefaultAbandonedAfterDays)
    {
        var result = await _service.ClearAbandoned(olderThanDays);
        return result.Success ? Ok(result) : BadRequest(result);
    }
}
