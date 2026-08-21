using Microsoft.EntityFrameworkCore;

namespace SplatDev.Umbraco.Plugins.Payments.MercadoPago.Models;

public class MercadoPagoDbContext : DbContext
{
    public MercadoPagoDbContext(DbContextOptions<MercadoPagoDbContext> options)
        : base(options)
    {
    }

    public DbSet<MercadoPagoOrder> Orders => Set<MercadoPagoOrder>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // SQLite has no schemas. Asking for one there makes EF fold it into the
        // table name, so the generated DDL and the queries disagree about what the
        // table is called and every read fails against an object never created.
        if (!Database.IsSqlite())
            modelBuilder.HasDefaultSchema("mpago");
        base.OnModelCreating(modelBuilder);
    }
}
