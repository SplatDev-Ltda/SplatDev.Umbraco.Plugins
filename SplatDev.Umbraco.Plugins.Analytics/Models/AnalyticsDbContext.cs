using Microsoft.EntityFrameworkCore;

namespace SplatDev.Umbraco.Plugins.Analytics.Models;

public sealed class AnalyticsDbContext(DbContextOptions<AnalyticsDbContext> options) : DbContext(options)
{
    public DbSet<AnalyticsVisit> Visits => Set<AnalyticsVisit>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.Entity<AnalyticsVisit>(entity =>
        {
            entity.HasIndex(x => x.VisitedAtUtc).HasDatabaseName("IX_Analytics_Visit_Date");
            entity.HasIndex(x => new { x.VisitorId, x.VisitedAtUtc }).HasDatabaseName("IX_Analytics_Visit_Visitor_Date");
            entity.Property(x => x.Path).IsRequired();
        });
    }
}
