using Microsoft.EntityFrameworkCore;

namespace SplatDev.Umbraco.Plugins.Payments.PagSeguro.Models;

public class PagSeguroDbContext : DbContext
{
    public PagSeguroDbContext(DbContextOptions<PagSeguroDbContext> options)
        : base(options)
    {
    }

    public DbSet<PagSeguroOrder> Orders => Set<PagSeguroOrder>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // SQLite has no schemas. Asking for one there makes EF fold it into the
        // table name, so the generated DDL and the queries disagree about what the
        // table is called and every read fails against an object never created.
        if (!Database.IsSqlite())
            modelBuilder.HasDefaultSchema("pagseguro");
        base.OnModelCreating(modelBuilder);
    }
}
