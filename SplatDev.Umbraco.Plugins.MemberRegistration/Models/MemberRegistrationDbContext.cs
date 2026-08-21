using Microsoft.EntityFrameworkCore;

namespace SplatDev.Umbraco.Plugins.MemberRegistration.Models;

public class MemberRegistrationDbContext : DbContext
{
    public MemberRegistrationDbContext(DbContextOptions<MemberRegistrationDbContext> options) : base(options) { }

    public DbSet<RegistrationToken> RegistrationTokens => Set<RegistrationToken>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // SQLite has no schemas. Asking for one there makes EF fold it into the
        // table name, so the generated DDL and the queries disagree about what the
        // table is called and every read fails against an object never created.
        if (!Database.IsSqlite())
            modelBuilder.HasDefaultSchema("memberreg");

        modelBuilder.Entity<RegistrationToken>(entity =>
        {
            entity.HasKey(t => t.Id);
            entity.Property(t => t.Token).HasMaxLength(256).IsRequired();
            entity.Property(t => t.MemberId).IsRequired();
            entity.Property(t => t.CreatedAt).IsRequired();
            entity.Property(t => t.ExpiresAt).IsRequired();
            entity.HasIndex(t => t.Token).IsUnique();
            entity.HasIndex(t => t.MemberId);
        });

        base.OnModelCreating(modelBuilder);
    }
}
