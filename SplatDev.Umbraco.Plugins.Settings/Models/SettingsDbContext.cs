using Microsoft.EntityFrameworkCore;

namespace SplatDev.Umbraco.Plugins.Settings.Models
{
    public class SettingsDbContext : DbContext
    {
        public SettingsDbContext(DbContextOptions<SettingsDbContext> options) : base(options) { }

        public DbSet<SettingGroup> SettingGroups => Set<SettingGroup>();
        public DbSet<SiteSetting> SiteSettings => Set<SiteSetting>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // SQLite has no schemas. Asking for one there makes EF fold it into the
            // table name, so the generated DDL and the queries disagree about what the
            // table is called and every read fails against an object never created.
            if (!Database.IsSqlite())
                modelBuilder.HasDefaultSchema("settings");

            modelBuilder.Entity<SettingGroup>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(256);
                entity.Property(e => e.Alias).IsRequired().HasMaxLength(256);
                entity.Property(e => e.Description).HasMaxLength(1024);
                entity.HasIndex(e => e.Alias).IsUnique();
            });

            modelBuilder.Entity<SiteSetting>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Key).IsRequired().HasMaxLength(512);
                entity.Property(e => e.Value).HasMaxLength(4000);
                entity.Property(e => e.Type).IsRequired().HasMaxLength(50).HasDefaultValue("text");
                entity.Property(e => e.Description).HasMaxLength(1024);
                entity.HasIndex(e => e.Key).IsUnique();
                entity.HasOne(e => e.Group)
                      .WithMany(g => g.Settings)
                      .HasForeignKey(e => e.GroupId)
                      .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}
