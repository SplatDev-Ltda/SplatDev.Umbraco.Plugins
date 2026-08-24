using Microsoft.EntityFrameworkCore;
using SplatDev.Umbraco.Plugins.Analytics.Models;

namespace SplatDev.Umbraco.Plugins.Analytics.Data;

public class AnalyticsDbContext : DbContext
{
    public AnalyticsDbContext(DbContextOptions<AnalyticsDbContext> options) : base(options) { }

    public DbSet<AnalyticsVisit> Visits => Set<AnalyticsVisit>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        var visit = modelBuilder.Entity<AnalyticsVisit>();

        // Every dashboard query filters or groups on these, and the table is the one that
        // grows without bound on a busy site.
        visit.HasIndex(v => v.VisitStarted);
        visit.HasIndex(v => v.ContentNodeId);
        visit.HasIndex(v => new { v.IpAddress, v.ContentNodeId });

        // No provider-specific column types here. CopyValue pinned nvarchar(max), which was
        // emitted verbatim into SQLite DDL and failed with `near "max": syntax error`,
        // aborting that migration for good.
        visit.Property(v => v.BrowserInfo).HasMaxLength(4000);

        base.OnModelCreating(modelBuilder);
    }
}
