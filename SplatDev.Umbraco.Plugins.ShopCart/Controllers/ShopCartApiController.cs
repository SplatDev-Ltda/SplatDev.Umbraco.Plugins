using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SplatDev.Umbraco.Plugins.ShopCart.Models;
using SplatDev.Umbraco.Plugins.ShopCart.Services;

namespace SplatDev.Umbraco.Plugins.ShopCart.Controllers;

/// <summary>
/// The shopper's cart.
/// </summary>
/// <remarks>
/// Anonymous on purpose — a shopper has no backoffice login — which is exactly why the
/// cart identity must not be a parameter. Every action previously took a sessionId from
/// the caller, so guessing one read or emptied somebody else's cart; UpdateQuantity and
/// RemoveItem took only a row id, so walking the integer sequence changed any line in any
/// cart with nothing to guess at all.
///
/// The session now comes from an HttpOnly cookie this controller issues and the browser
/// cannot read or forge, and every operation is scoped to it.
/// </remarks>
[AllowAnonymous]
[Route("umbraco/api/shopcart/[action]")]
public class ShopCartApiController : ControllerBase
{
    /// <summary>Opaque cart identifier. Holds no personal data.</summary>
    public const string CookieName = "splatdev_cart_sid";

    private readonly IShopCartService _service;

    public ShopCartApiController(IShopCartService service) => _service = service;

    /// <summary>
    /// The caller's cart id, issued on first use.
    /// </summary>
    /// <remarks>
    /// HttpOnly so page scripts cannot read it and send someone else's; strictly necessary,
    /// so it does not require consent — it carries nothing but an opaque identifier for the
    /// shopper's own basket.
    /// </remarks>
    private string SessionId()
    {
        var existing = Request.Cookies[CookieName];
        if (!string.IsNullOrWhiteSpace(existing)) return existing;

        var issued = Guid.NewGuid().ToString("N");

        Response.Cookies.Append(CookieName, issued, new CookieOptions
        {
            HttpOnly = true,
            IsEssential = true,
            SameSite = SameSiteMode.Lax,
            Secure = Request.IsHttps,
            Expires = DateTimeOffset.UtcNow.AddDays(30),
        });

        return issued;
    }

    [HttpGet]
    public async Task<IActionResult> GetCart() => Ok(await _service.GetCart(SessionId()));

    [HttpPost]
    public async Task<IActionResult> AddItem([FromBody] CartItem item)
    {
        if (string.IsNullOrWhiteSpace(item.ProductId))
            return BadRequest(new { message = "ProductId is required." });

        if (item.Quantity <= 0)
            return BadRequest(new { message = "Quantity must be at least one." });

        // The posted SessionId is ignored; the service overwrites it from the cookie.
        var result = await _service.AddItem(SessionId(), item);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpPost]
    public async Task<IActionResult> UpdateQuantity([FromBody] UpdateQuantityRequest request)
    {
        if (request.Qty < 0)
            return BadRequest(new { message = "Qty must be zero or greater." });

        var result = await _service.UpdateQuantity(SessionId(), request.Id, request.Qty);
        return result.Success ? Ok(result) : NotFound(result);
    }

    [HttpDelete]
    public async Task<IActionResult> RemoveItem(int id)
    {
        var result = await _service.RemoveItem(SessionId(), id);
        return result.Success ? Ok(result) : NotFound(result);
    }

    [HttpDelete]
    public async Task<IActionResult> ClearCart()
    {
        await _service.ClearCart(SessionId());
        return Ok(new { message = "Cart cleared." });
    }

    [HttpGet]
    public async Task<IActionResult> GetTotal() => Ok(new { total = await _service.GetTotal(SessionId()) });
}

public record UpdateQuantityRequest(int Id, int Qty);
