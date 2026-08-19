using Microsoft.EntityFrameworkCore;
using SplatDev.Umbraco.Plugins.ShopCart.Models;

namespace SplatDev.Umbraco.Plugins.ShopCart.Services;

public class ShopCartService : IShopCartService
{
    private readonly ShopCartDbContext _db;

    public ShopCartService(ShopCartDbContext db)
    {
        _db = db;
    }

    public async Task<List<CartItem>> GetCart(string sessionId)
    {
        return await _db.CartItems
            .Where(c => c.SessionId == sessionId)
            .OrderBy(c => c.AddedAt)
            .ToListAsync();
    }

    public async Task<CartResult> AddItem(string sessionId, CartItem item)
    {
        // If the same product already exists in the session cart, increment quantity instead
        item.SessionId = sessionId;

        var existing = await _db.CartItems
            .FirstOrDefaultAsync(c => c.SessionId == item.SessionId && c.ProductId == item.ProductId);

        if (existing is not null)
        {
            existing.Quantity += item.Quantity;
            _db.CartItems.Update(existing);
        }
        else
        {
            item.AddedAt = DateTime.UtcNow;
            await _db.CartItems.AddAsync(item);
        }

        await _db.SaveChangesAsync();
        return CartResult.Ok($"{item.ProductName} added to the cart.");
    }

    public async Task<CartResult> UpdateQuantity(string sessionId, int id, int qty)
    {
        var item = await _db.CartItems
            .FirstOrDefaultAsync(i => i.Id == id && i.SessionId == sessionId);

        // Not found covers both "no such line" and "belongs to another cart", deliberately:
        // distinguishing them would confirm that a given id exists somewhere.
        if (item is null) return CartResult.Fail("That item is not in your cart.");

        if (qty <= 0)
        {
            _db.CartItems.Remove(item);
        }
        else
        {
            item.Quantity = qty;
            _db.CartItems.Update(item);
        }

        await _db.SaveChangesAsync();
        return CartResult.Ok(qty <= 0 ? "Item removed." : "Quantity updated.");
    }

    public async Task<CartResult> RemoveItem(string sessionId, int id)
    {
        var item = await _db.CartItems
            .FirstOrDefaultAsync(i => i.Id == id && i.SessionId == sessionId);

        if (item is null) return CartResult.Fail("That item is not in your cart.");

        _db.CartItems.Remove(item);
        await _db.SaveChangesAsync();
        return CartResult.Ok("Item removed.");
    }

    public async Task ClearCart(string sessionId)
    {
        var items = await _db.CartItems
            .Where(c => c.SessionId == sessionId)
            .ToListAsync();

        _db.CartItems.RemoveRange(items);
        await _db.SaveChangesAsync();
    }

    public async Task<decimal> GetTotal(string sessionId)
    {
        return await _db.CartItems
            .Where(c => c.SessionId == sessionId)
            .SumAsync(c => c.Price * c.Quantity);
    }
}
