using Microsoft.EntityFrameworkCore;

namespace SplatDev.Umbraco.Plugins.RdpManager.Models
{
    public class RdpManagerDbContext : DbContext
    {
        public RdpManagerDbContext(DbContextOptions<RdpManagerDbContext> options) : base(options) { }

        public DbSet<RdpConnection> RdpConnections => Set<RdpConnection>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // SQLite has no schemas. Asking for one there makes EF fold it into the
            // table name, so the generated DDL and the queries disagree about what the
            // table is called and every read fails against an object never created.
            if (!Database.IsSqlite())
                modelBuilder.HasDefaultSchema("rdpmanager");

            modelBuilder.Entity<RdpConnection>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(256);
                entity.Property(e => e.Host).IsRequired().HasMaxLength(512);
                entity.Property(e => e.Username).HasMaxLength(256);
                entity.Property(e => e.Domain).HasMaxLength(256);
                entity.Property(e => e.Notes).HasMaxLength(4000);
                entity.Property(e => e.Port).HasDefaultValue(3389);
                entity.Property(e => e.ColorDepth).HasDefaultValue(32);
                entity.Property(e => e.Width).HasDefaultValue(1920);
                entity.Property(e => e.Height).HasDefaultValue(1080);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            });
        }
    }
}
