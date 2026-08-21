using Microsoft.EntityFrameworkCore;

namespace SplatDev.Umbraco.Plugins.Faqs.Models;

public class FaqsDbContext : DbContext
{
    public FaqsDbContext(DbContextOptions<FaqsDbContext> options) : base(options) { }

    public DbSet<FaqCategory> FaqCategories => Set<FaqCategory>();
    public DbSet<FaqItem> FaqItems => Set<FaqItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // SQLite has no schemas. Asking for one there makes EF fold it into the
        // table name, so the generated DDL and the queries disagree about what the
        // table is called and every read fails against an object never created.
        if (!Database.IsSqlite())
            modelBuilder.HasDefaultSchema("faqs");

        modelBuilder.Entity<FaqCategory>()
            .HasIndex(c => c.Slug)
            .IsUnique();

        modelBuilder.Entity<FaqCategory>()
            .HasMany(c => c.Items)
            .WithOne(i => i.Category)
            .HasForeignKey(i => i.CategoryId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<FaqItem>()
            .Property(i => i.IsPublished)
            .HasDefaultValue(true);

        base.OnModelCreating(modelBuilder);
    }
}
