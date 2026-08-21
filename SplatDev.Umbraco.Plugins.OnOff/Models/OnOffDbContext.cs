using Microsoft.EntityFrameworkCore;

namespace SplatDev.Umbraco.Plugins.OnOff.Models;

public class OnOffDbContext : DbContext
{
    public OnOffDbContext(DbContextOptions<OnOffDbContext> options) : base(options) { }

    public DbSet<FeatureToggle> FeatureToggles => Set<FeatureToggle>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // SQLite has no schemas. Asking for one there makes EF fold it into the
        // table name, so the generated DDL and the queries disagree about what the
        // table is called and every read fails against an object never created.
        if (!Database.IsSqlite())
            modelBuilder.HasDefaultSchema("onoff");

        modelBuilder.Entity<FeatureToggle>()
            .HasIndex(f => f.Alias)
            .IsUnique();

        modelBuilder.Entity<FeatureToggle>()
            .Property(f => f.Name)
            .HasMaxLength(200)
            .IsRequired();

        modelBuilder.Entity<FeatureToggle>()
            .Property(f => f.Alias)
            .HasMaxLength(200)
            .IsRequired();

        base.OnModelCreating(modelBuilder);
    }
}
