using Microsoft.EntityFrameworkCore;

using SplatDev.Umbraco.Plugins.ContentPackages.Entities;

namespace SplatDev.Umbraco.Plugins.ContentPackages.Migrations;

/// <summary>
/// Sidecar store for leads and download hits. Separate from the Umbraco database so
/// installing the plugin never alters the CMS schema.
/// </summary>
public class ContentPackagesDbContext : DbContext
{
    public ContentPackagesDbContext(DbContextOptions<ContentPackagesDbContext> options) : base(options)
    {
    }

    public DbSet<PackageLead> Leads => Set<PackageLead>();

    public DbSet<PackageDownload> Downloads => Set<PackageDownload>();

    protected override void OnModelCreating(ModelBuilder model)
    {
        model.Entity<PackageLead>(e =>
        {
            e.ToTable("contentPackageLead");
            e.HasIndex(l => l.PublicId).IsUnique();

            // One lead per address per package: re-submitting the same form should
            // re-send, not create a second row with a second set of live links.
            e.HasIndex(l => new { l.Email, l.Slug }).IsUnique();
        });

        model.Entity<PackageDownload>(e =>
        {
            e.ToTable("contentPackageDownload");
            e.HasIndex(d => d.LeadId);
            e.HasIndex(d => new { d.LeadId, d.Slug, d.Kind });
        });
    }
}
