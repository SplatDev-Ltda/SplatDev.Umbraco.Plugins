using Microsoft.EntityFrameworkCore;
using SplatDev.Umbraco.Plugins.ShopCart.Models;

namespace SplatDev.Umbraco.Plugins.ShopCart.Services;

public class ShopCartAdminService : IShopCartAdminService
{
    private readonly ShopCartDbContext _db;

    public ShopCartAdminService(ShopCartDbContext db) => _db = db;

    /// <summary>
    /// Groups the line items into carts.
    /// </summary>
    /// <remarks>
    /// There is no cart table — a cart is just the set of rows sharing a session id — so
    /// "last activity" is the newest line in the group. That is the only timestamp the
    /// schema carries, and it is what makes an abandoned basket identifiable at all.
    /// </remarks>
    private async Task<List<CartSummary>> Summaries(int abandonedAfterDays)
    {
        var cutoff = DateTime.UtcNow.AddDays(-Math.Max(1, abandonedAfterDays));

        var rows = await _db.CartItems.ToListAsync();

        return rows
            .GroupBy(i => i.SessionId)
            .Select(g =>
            {
                var last = g.Max(i => i.AddedAt);
                return new CartSummary
                {
                    SessionId = g.Key,
                    Items = g.Sum(i => i.Quantity),
                    Value = g.Sum(i => i.Price * i.Quantity),
                    LastActivity = last,
                    Abandoned = last < cutoff,
                };
            })
            .OrderByDescending(c => c.LastActivity)
            .ToList();
    }

    public async Task<CartOverview> Overview(int abandonedAfterDays)
    {
        var carts = await Summaries(abandonedAfterDays);

        return new CartOverview
        {
            Carts = carts.Count,
            Items = carts.Sum(c => c.Items),
            Value = carts.Sum(c => c.Value),
            Abandoned = carts.Count(c => c.Abandoned),
            AbandonedValue = carts.Where(c => c.Abandoned).Sum(c => c.Value),
        };
    }

    public async Task<IReadOnlyList<CartSummary>> Carts(int abandonedAfterDays, bool onlyAbandoned)
    {
        var carts = await Summaries(abandonedAfterDays);
        return onlyAbandoned ? carts.Where(c => c.Abandoned).ToList() : carts;
    }

    public async Task<CartResult> ClearOne(string sessionId)
    {
        var items = await _db.CartItems.Where(i => i.SessionId == sessionId).ToListAsync();
        if (items.Count == 0) return CartResult.Fail("That cart is already empty.");

        _db.CartItems.RemoveRange(items);
        await _db.SaveChangesAsync();
        return CartResult.Ok($"Cleared {items.Count} line(s).");
    }

    public async Task<CartResult> ClearAbandoned(int olderThanDays)
    {
        if (olderThanDays < 1)
            return CartResult.Fail("Specify at least one day.");

        var carts = (await Summaries(olderThanDays)).Where(c => c.Abandoned).Select(c => c.SessionId).ToHashSet();
        if (carts.Count == 0) return CartResult.Ok("No abandoned carts to clear.");

        var items = await _db.CartItems.Where(i => carts.Contains(i.SessionId)).ToListAsync();
        _db.CartItems.RemoveRange(items);
        await _db.SaveChangesAsync();

        return CartResult.Ok($"Cleared {carts.Count} abandoned cart(s).");
    }
}
