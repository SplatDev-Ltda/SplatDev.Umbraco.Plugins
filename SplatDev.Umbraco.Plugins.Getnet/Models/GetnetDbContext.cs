using Microsoft.EntityFrameworkCore;

namespace SplatDev.Umbraco.Plugins.Getnet.Models;

public class GetnetDbContext : DbContext
{
    public GetnetDbContext(DbContextOptions<GetnetDbContext> options)
        : base(options)
    {
    }

    public DbSet<GetnetTransaction> Transactions => Set<GetnetTransaction>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // SQLite has no schemas. Asking for one there makes EF fold it into the table name,
        // so the generated DDL and the queries disagree about what the table is called and
        // every read fails against an object that was never created.
        if (!Database.IsSqlite())
        {
            modelBuilder.HasDefaultSchema("getnet");
        }

        // The dashboard's three main reads are "recent transactions", "totals for a date
        // range" and "group by status", and all of them sort or filter on these.
        modelBuilder.Entity<GetnetTransaction>().HasIndex(t => t.CreatedAt);
        modelBuilder.Entity<GetnetTransaction>().HasIndex(t => t.Status);
        modelBuilder.Entity<GetnetTransaction>().HasIndex(t => t.OrderRef);

        base.OnModelCreating(modelBuilder);
    }
}
