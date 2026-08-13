using Microsoft.EntityFrameworkCore;

namespace SplatDev.Umbraco.Plugins.TwoFactor.Models;

public class TwoFactorDbContext : DbContext
{
    public TwoFactorDbContext(DbContextOptions<TwoFactorDbContext> options) : base(options) { }

    public DbSet<TwoFactorSetup> TwoFactorSetups => Set<TwoFactorSetup>();
    public DbSet<BackupCode> BackupCodes => Set<BackupCode>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("twofactor");

        modelBuilder.Entity<TwoFactorSetup>(e =>
        {
            e.ToTable("TwoFactorSetups");
            e.HasKey(x => x.Id);
            e.Property(x => x.SecretKey).IsRequired().HasMaxLength(256);
            e.HasIndex(x => x.MemberId).IsUnique();
            e.HasMany(x => x.BackupCodes)
             .WithOne(bc => bc.Setup)
             .HasForeignKey(bc => bc.TwoFactorSetupId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<BackupCode>(e =>
        {
            e.ToTable("BackupCodes");
            e.HasKey(x => x.Id);
            // 64 hex characters of SHA-256.
            e.Property(x => x.CodeHash).IsRequired().HasMaxLength(64);
            e.HasIndex(x => new { x.MemberId, x.CodeHash });
        });
    }
}
