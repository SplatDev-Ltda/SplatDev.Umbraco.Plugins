using Microsoft.EntityFrameworkCore;

namespace SplatDev.Umbraco.Plugins.DefaultValue.Models;

public class DefaultValueDbContext : DbContext
{
    public DefaultValueDbContext(DbContextOptions<DefaultValueDbContext> options) : base(options) { }

    public DbSet<DefaultValueRule> DefaultValueRules => Set<DefaultValueRule>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // SQLite has no schemas. Asking for one there makes EF fold it into the
        // table name, so the generated DDL and the queries disagree about what the
        // table is called and every read fails against an object never created.
        if (!Database.IsSqlite())
            modelBuilder.HasDefaultSchema("defaultvalue");

        modelBuilder.Entity<DefaultValueRule>()
            .Property(r => r.DocumentTypeAlias)
            .HasMaxLength(500)
            .IsRequired();

        modelBuilder.Entity<DefaultValueRule>()
            .Property(r => r.PropertyAlias)
            .HasMaxLength(500)
            .IsRequired();

        modelBuilder.Entity<DefaultValueRule>()
            .HasIndex(r => new { r.DocumentTypeAlias, r.PropertyAlias });

        base.OnModelCreating(modelBuilder);
    }
}
