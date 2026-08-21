using Microsoft.EntityFrameworkCore;

namespace SplatDev.Umbraco.Plugins.ShopCart.Models;

public class ShopCartDbContext : DbContext
{
    public ShopCartDbContext(DbContextOptions<ShopCartDbContext> options)
        : base(options)
    {
    }

    public DbSet<CartItem> CartItems => Set<CartItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // SQLite has no schemas. Asking for one there makes EF fold it into the table
        // name, so the generated DDL and the queries disagree about what the table is
        // called and every read fails against an object that was never created.
        if (!Database.IsSqlite())
            modelBuilder.HasDefaultSchema("shopcart");

        base.OnModelCreating(modelBuilder);
    }
}
