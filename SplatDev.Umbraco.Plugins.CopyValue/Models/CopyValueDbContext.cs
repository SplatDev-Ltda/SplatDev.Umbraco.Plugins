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

        modelBuilder.Entity<CopyMapping>()
            .Property(m => m.PropertyMappingsJson)
            .HasColumnType("nvarchar(max)");

        base.OnModelCreating(modelBuilder);
    }
}
