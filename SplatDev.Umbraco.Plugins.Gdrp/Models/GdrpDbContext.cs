using Microsoft.EntityFrameworkCore;

namespace SplatDev.Umbraco.Plugins.Gdrp.Models;

public class GdrpDbContext : DbContext
{
    public GdrpDbContext(DbContextOptions<GdrpDbContext> options)
        : base(options)
    {
    }

    public DbSet<ConsentRecord> ConsentRecords => Set<ConsentRecord>();
    public DbSet<DataRequest> DataRequests => Set<DataRequest>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // SQLite has no schemas. Asking for one there makes EF fold it into the
        // table name, so the generated DDL and the queries disagree about what the
        // table is called and every read fails against an object never created.
        if (!Database.IsSqlite())
            modelBuilder.HasDefaultSchema("gdrp");
        base.OnModelCreating(modelBuilder);
    }
}
