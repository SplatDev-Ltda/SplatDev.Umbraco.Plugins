namespace SplatDev.Umbraco.Plugins.ShopCart.Services;

/// <summary>
/// The backoffice view of carts across the site.
/// </summary>
/// <remarks>
/// Separate from <see cref="IShopCartService"/> on purpose. That one is shopper-facing
/// and anonymous, and every method is scoped to a single session; this one crosses
/// sessions and is only ever called from an authorized controller. Keeping them apart
/// means the anonymous surface cannot accidentally grow a method that reads everyone's
/// carts, which is how the original IDOR would have been reintroduced.
/// </remarks>
public interface IShopCartAdminService
{
    Task<CartOverview> Overview(int abandonedAfterDays);

    Task<IReadOnlyList<CartSummary>> Carts(int abandonedAfterDays, bool onlyAbandoned);

    /// <summary>Empties one cart. Used to clear abandoned baskets.</summary>
    Task<CartResult> ClearOne(string sessionId);

    /// <summary>Empties every cart untouched since the cut-off.</summary>
    Task<CartResult> ClearAbandoned(int olderThanDays);
}

public sealed class CartOverview
{
    public int Carts { get; set; }
    public int Items { get; set; }
    public decimal Value { get; set; }
    public int Abandoned { get; set; }
    public decimal AbandonedValue { get; set; }
}

public sealed class CartSummary
{
    public string SessionId { get; set; } = string.Empty;
    public int Items { get; set; }
    public decimal Value { get; set; }
    public DateTime LastActivity { get; set; }
    public bool Abandoned { get; set; }
}
