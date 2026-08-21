using Microsoft.EntityFrameworkCore;

namespace SplatDev.Umbraco.Plugins.Payments.BancoInter.Models;

public class BancoInterDbContext(DbContextOptions<BancoInterDbContext> options) : DbContext(options)
{
    public DbSet<BancoInterTransaction> Transactions => Set<BancoInterTransaction>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // SQLite has no schemas. Asking for one there makes EF fold it into the
        // table name, so the generated DDL and the queries disagree about what the
        // table is called and every read fails against an object never created.
        if (!Database.IsSqlite())
            modelBuilder.HasDefaultSchema("bancointer");
        base.OnModelCreating(modelBuilder);
    }
}
