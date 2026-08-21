using Microsoft.EntityFrameworkCore;

namespace SplatDev.Umbraco.Plugins.VisitorCounter.Models;

public class VisitorCounterDbContext : DbContext
{
    public VisitorCounterDbContext(DbContextOptions<VisitorCounterDbContext> options)
        : base(options) { }

    public DbSet<VisitorSession> VisitorSessions => Set<VisitorSession>();
    public DbSet<DailyVisitorCount> DailyVisitorCounts => Set<DailyVisitorCount>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<VisitorSession>(entity =>
        {
            entity.HasIndex(e => e.SessionId)
                  .IsUnique()
                  .HasDatabaseName("UX_VisitorCounter_SessionId");

            entity.HasIndex(e => e.FirstSeenAt)
                  .HasDatabaseName("IX_VisitorCounter_FirstSeenAt");
        });

        modelBuilder.Entity<DailyVisitorCount>(entity =>
        {
            entity.HasIndex(e => e.Date)
                  .IsUnique()
                  .HasDatabaseName("UX_VisitorCounter_Date");
        });
    }
}
