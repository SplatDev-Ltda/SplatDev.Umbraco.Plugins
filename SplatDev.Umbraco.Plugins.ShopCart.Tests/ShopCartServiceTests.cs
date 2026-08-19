using Microsoft.EntityFrameworkCore;
using SplatDev.Umbraco.Plugins.ShopCart.Models;
using SplatDev.Umbraco.Plugins.ShopCart.Services;
using Xunit;

namespace SplatDev.Umbraco.Plugins.ShopCart.Tests;

/// <summary>
/// These are mostly isolation tests. The cart was reachable by row id with no session
/// check, so the thing worth proving is that one shopper cannot touch another's basket.
/// </summary>
public class ShopCartServiceTests
{
    private const string Mine = "session-mine";
    private const string Theirs = "session-theirs";

    private static ShopCartService Build(out ShopCartDbContext db)
    {
        db = new ShopCartDbContext(new DbContextOptionsBuilder<ShopCartDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);
        return new ShopCartService(db);
    }

    private static CartItem Item(string productId = "SKU-1", int qty = 1) => new()
    {
        ProductId = productId, ProductName = "Widget", Price = 9.99m, Quantity = qty,
    };

    // ── the IDOR ─────────────────────────────────────────────────────────────

    [Fact]
    public async Task Another_shoppers_line_cannot_be_deleted_by_id()
    {
        // RemoveItem took only the row id, so walking the integer sequence emptied
        // anybody's cart with nothing to guess.
        var svc = Build(out var db);
        await svc.AddItem(Theirs, Item());
        var theirLine = db.CartItems.Single().Id;

        var result = await svc.RemoveItem(Mine, theirLine);

        Assert.False(result.Success);
        Assert.Single(await svc.GetCart(Theirs));
    }

    [Fact]
    public async Task Another_shoppers_quantity_cannot_be_changed_by_id()
    {
        var svc = Build(out var db);
        await svc.AddItem(Theirs, Item(qty: 2));
        var theirLine = db.CartItems.Single().Id;

        var result = await svc.UpdateQuantity(Mine, theirLine, 99);

        Assert.False(result.Success);
        Assert.Equal(2, (await svc.GetCart(Theirs)).Single().Quantity);
    }

    [Fact]
    public async Task The_refusal_does_not_reveal_whether_the_id_exists_elsewhere()
    {
        // Same message for "no such line" and "not yours", so the response cannot be used
        // to enumerate which ids are real.
        var svc = Build(out var db);
        await svc.AddItem(Theirs, Item());
        var theirLine = db.CartItems.Single().Id;

        var notYours = await svc.RemoveItem(Mine, theirLine);
        var notReal = await svc.RemoveItem(Mine, 999999);

        Assert.Equal(notYours.Message, notReal.Message);
    }

    [Fact]
    public async Task A_posted_session_id_is_ignored_in_favour_of_the_callers_own()
    {
        // The body used to carry SessionId, so a shopper could add straight into someone
        // else's cart.
        var svc = Build(out var db);
        var forged = Item();
        forged.SessionId = Theirs;

        await svc.AddItem(Mine, forged);

        Assert.Empty(await svc.GetCart(Theirs));
        Assert.Single(await svc.GetCart(Mine));
    }

    [Fact]
    public async Task Clearing_a_cart_leaves_other_carts_alone()
    {
        var svc = Build(out _);
        await svc.AddItem(Mine, Item("SKU-1"));
        await svc.AddItem(Theirs, Item("SKU-2"));

        await svc.ClearCart(Mine);

        Assert.Empty(await svc.GetCart(Mine));
        Assert.Single(await svc.GetCart(Theirs));
    }

    [Fact]
    public async Task A_total_covers_only_the_callers_own_cart()
    {
        var svc = Build(out _);
        await svc.AddItem(Mine, Item("SKU-1", qty: 2));      // 19.98
        await svc.AddItem(Theirs, Item("SKU-2", qty: 10));   // 99.90

        Assert.Equal(19.98m, await svc.GetTotal(Mine));
    }

    // ── ordinary behaviour ───────────────────────────────────────────────────

    [Fact]
    public async Task Adding_the_same_product_twice_increments_rather_than_duplicates()
    {
        var svc = Build(out _);
        await svc.AddItem(Mine, Item(qty: 1));
        await svc.AddItem(Mine, Item(qty: 2));

        var cart = await svc.GetCart(Mine);

        Assert.Single(cart);
        Assert.Equal(3, cart[0].Quantity);
    }

    [Fact]
    public async Task Setting_a_quantity_to_zero_removes_the_line()
    {
        var svc = Build(out var db);
        await svc.AddItem(Mine, Item());
        var line = db.CartItems.Single().Id;

        var r = await svc.UpdateQuantity(Mine, line, 0);

        Assert.True(r.Success);
        Assert.Empty(await svc.GetCart(Mine));
    }

    [Fact]
    public async Task An_empty_cart_totals_zero()
    {
        var svc = Build(out _);
        Assert.Equal(0m, await svc.GetTotal(Mine));
    }
}
