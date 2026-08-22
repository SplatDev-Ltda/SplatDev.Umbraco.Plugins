using Microsoft.EntityFrameworkCore;

namespace SplatDev.Umbraco.Plugins.CopyValue.Models;

public class CopyValueDbContext : DbContext
{
    public CopyValueDbContext(DbContextOptions<CopyValueDbContext> options) : base(options) { }

    public DbSet<CopyMapping> CopyMappings => Set<CopyMapping>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // SQLite has no schemas. Asking for one there makes EF fold it into the
        // table name, so the generated DDL and the queries disagree about what the
        // table is called and every read fails against an object never created.
        if (!Database.IsSqlite())
            modelBuilder.HasDefaultSchema("copyvalue");

        modelBuilder.Entity<CopyMapping>()
            .Property(m => m.Name)
            .HasMaxLength(500)
            .IsRequired();

        modelBuilder.Entity<CopyMapping>()
            .Property(m => m.SourceDocTypeAlias)
            .HasMaxLength(500)
            .IsRequired();

        modelBuilder.Entity<CopyMapping>()
            .Property(m => m.TargetDocTypeAlias)
            .HasMaxLength(500)
            .IsRequired();

        // Left unbounded rather than pinned to nvarchar(max): that is SQL Server's spelling,
        // and EF emitted it verbatim into the SQLite DDL, so creating the table failed with
        // 'near "max": syntax error'. The migration then aborted, the table was never created,
        // and every request 500'd with 'no such table: CopyMappings' — on the database
        // Umbraco's installer offers by default. Unconfigured, EF maps this to nvarchar(max)
        // on SQL Server and TEXT on SQLite, which is what was wanted in both cases.
        modelBuilder.Entity<CopyMapping>()
            .Property(m => m.PropertyMappingsJson);

        base.OnModelCreating(modelBuilder);
    }
}
