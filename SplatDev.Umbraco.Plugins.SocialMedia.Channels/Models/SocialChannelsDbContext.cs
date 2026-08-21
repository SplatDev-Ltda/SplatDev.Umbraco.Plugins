using Microsoft.EntityFrameworkCore;

namespace SplatDev.Umbraco.Plugins.SocialMedia.Channels.Models
{
    public class SocialChannelsDbContext : DbContext
    {
        public SocialChannelsDbContext(DbContextOptions<SocialChannelsDbContext> options) : base(options) { }

        public DbSet<SocialChannel> SocialChannels => Set<SocialChannel>();
        public DbSet<ScheduledPost> ScheduledPosts => Set<ScheduledPost>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // SQLite has no schemas. Asking for one there makes EF fold it into the
            // table name, so the generated DDL and the queries disagree about what the
            // table is called and every read fails against an object never created.
            if (!Database.IsSqlite())
                modelBuilder.HasDefaultSchema("smchannels");

            modelBuilder.Entity<SocialChannel>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(256);
                entity.Property(e => e.Platform).IsRequired().HasMaxLength(100);
                entity.Property(e => e.AccessToken).IsRequired().HasMaxLength(2048);
                entity.Property(e => e.RefreshToken).HasMaxLength(2048);
                entity.Property(e => e.IsActive).HasDefaultValue(true);
                entity.Property(e => e.ConnectedAt).HasDefaultValueSql("GETUTCDATE()");
            });

            modelBuilder.Entity<ScheduledPost>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Content).IsRequired().HasMaxLength(4000);
                entity.Property(e => e.MediaUrl).HasMaxLength(2048);
                entity.Property(e => e.Status).IsRequired().HasMaxLength(50).HasDefaultValue("pending");
                entity.Property(e => e.ErrorMessage).HasMaxLength(4000);
                entity.HasOne(e => e.Channel)
                      .WithMany(c => c.ScheduledPosts)
                      .HasForeignKey(e => e.ChannelId)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.ScheduledAt);
            });
        }
    }
}
