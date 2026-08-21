using Microsoft.EntityFrameworkCore;

namespace SplatDev.Umbraco.Plugins.Forums.Models;

public class ForumsDbContext : DbContext
{
    public ForumsDbContext(DbContextOptions<ForumsDbContext> options) : base(options) { }

    public DbSet<ForumCategory> ForumCategories => Set<ForumCategory>();
    public DbSet<ForumThread> ForumThreads => Set<ForumThread>();
    public DbSet<ForumReply> ForumReplies => Set<ForumReply>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // SQLite has no schemas. Asking for one there makes EF fold it into the
        // table name, so the generated DDL and the queries disagree about what the
        // table is called and every read fails against an object never created.
        if (!Database.IsSqlite())
            modelBuilder.HasDefaultSchema("forums");

        modelBuilder.Entity<ForumCategory>()
            .HasIndex(c => c.Slug)
            .IsUnique();

        modelBuilder.Entity<ForumCategory>()
            .HasMany(c => c.Threads)
            .WithOne(t => t.Category)
            .HasForeignKey(t => t.CategoryId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ForumThread>()
            .HasIndex(t => t.Slug)
            .IsUnique();

        modelBuilder.Entity<ForumThread>()
            .HasMany(t => t.Replies)
            .WithOne(r => r.Thread)
            .HasForeignKey(r => r.ThreadId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ForumCategory>()
            .Property(c => c.SortOrder)
            .HasDefaultValue(0);

        base.OnModelCreating(modelBuilder);
    }
}
