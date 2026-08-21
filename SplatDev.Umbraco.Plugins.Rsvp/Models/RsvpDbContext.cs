using Microsoft.EntityFrameworkCore;

namespace SplatDev.Umbraco.Plugins.Rsvp.Models;

public class RsvpDbContext : DbContext
{
    public RsvpDbContext(DbContextOptions<RsvpDbContext> options) : base(options) { }

    public DbSet<RsvpEvent> RsvpEvents => Set<RsvpEvent>();
    public DbSet<RsvpAttendee> RsvpAttendees => Set<RsvpAttendee>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // SQLite has no schemas. Asking for one there makes EF fold it into the
        // table name, so the generated DDL and the queries disagree about what the
        // table is called and every read fails against an object never created.
        if (!Database.IsSqlite())
            modelBuilder.HasDefaultSchema("rsvp");

        modelBuilder.Entity<RsvpEvent>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Location).HasMaxLength(300);
        });

        modelBuilder.Entity<RsvpAttendee>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FirstName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.LastName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Phone).HasMaxLength(30);
            entity.Property(e => e.Status).HasConversion<string>();
            entity.Property(e => e.RegisteredAt).HasDefaultValueSql("GETUTCDATE()");
            entity.HasOne(e => e.Event)
                  .WithMany(ev => ev.Attendees)
                  .HasForeignKey(e => e.EventId)
                  .OnDelete(DeleteBehavior.Cascade);
            // One registration per email per event
            entity.HasIndex(e => new { e.EventId, e.Email }).IsUnique();
        });

        base.OnModelCreating(modelBuilder);
    }
}
