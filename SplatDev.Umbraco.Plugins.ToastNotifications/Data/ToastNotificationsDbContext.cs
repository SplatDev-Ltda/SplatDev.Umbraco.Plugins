using Microsoft.EntityFrameworkCore;
using SplatDev.Umbraco.Plugins.ToastNotifications.Models;

namespace SplatDev.Umbraco.Plugins.ToastNotifications.Data;

public class ToastNotificationsDbContext : DbContext
{
    public ToastNotificationsDbContext(DbContextOptions<ToastNotificationsDbContext> options)
        : base(options)
    {
    }

    public DbSet<ToastMessage> ToastMessages => Set<ToastMessage>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // SQLite has no schemas. Asking for one there makes EF fold it into the
        // table name, so the generated DDL and the queries disagree about what the
        // table is called and every read fails against an object never created.
        if (!Database.IsSqlite())
            modelBuilder.HasDefaultSchema("toastnotifications");

        modelBuilder.Entity<ToastMessage>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(256);
            entity.Property(e => e.Body).IsRequired().HasMaxLength(2000);
            entity.Property(e => e.Type).IsRequired().HasMaxLength(32);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
        });
    }
}
