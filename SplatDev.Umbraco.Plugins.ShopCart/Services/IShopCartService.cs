using SplatDev.Umbraco.Plugins.ShopCart.Models;

namespace SplatDev.Umbraco.Plugins.ShopCart.Services;

/// <summary>
/// The cart, always scoped to one session.
/// </summary>
/// <remarks>
/// Every member takes the session id, including the ones that address a single line.
/// UpdateQuantity and RemoveItem previously took only the row id, so a caller could walk
/// the integer sequence and change or delete any line in anyone's cart — no session id to
/// guess, just increment. Scoping them means an id belonging to another cart simply is
/// not found.
/// </remarks>
public interface IShopCartService
{
    Task<List<CartItem>> GetCart(string sessionId);

    Task<CartResult> AddItem(string sessionId, CartItem item);

    Task<CartResult> UpdateQuantity(string sessionId, int id, int qty);

    Task<CartResult> RemoveItem(string sessionId, int id);

    Task ClearCart(string sessionId);

    Task<decimal> GetTotal(string sessionId);
}

public sealed class CartResult
{
    public bool Success { get; init; }
    public string Message { get; init; } = string.Empty;

    public static CartResult Ok(string message = "") => new() { Success = true, Message = message };
    public static CartResult Fail(string message) => new() { Success = false, Message = message };
}
