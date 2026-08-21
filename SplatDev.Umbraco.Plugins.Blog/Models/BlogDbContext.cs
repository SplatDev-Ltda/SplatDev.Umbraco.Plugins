using Microsoft.EntityFrameworkCore;

namespace SplatDev.Umbraco.Plugins.Blog.Models;

public class BlogDbContext : DbContext
{
    public BlogDbContext(DbContextOptions<BlogDbContext> options) : base(options) { }

    public DbSet<BlogPost> BlogPosts => Set<BlogPost>();
    public DbSet<BlogCategory> BlogCategories => Set<BlogCategory>();
    public DbSet<BlogTag> BlogTags => Set<BlogTag>();
    public DbSet<BlogPostTag> BlogPostTags => Set<BlogPostTag>();
    public DbSet<BlogComment> BlogComments => Set<BlogComment>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // SQLite has no schemas. Asking for one there makes EF fold it into the
        // table name, so the generated DDL and the queries disagree about what the
        // table is called and every read fails against an object never created.
        if (!Database.IsSqlite())
            modelBuilder.HasDefaultSchema("blog");

        // Composite primary key for join table
        modelBuilder.Entity<BlogPostTag>()
            .HasKey(bpt => new { bpt.BlogPostId, bpt.BlogTagId });

        modelBuilder.Entity<BlogPostTag>()
            .HasOne(bpt => bpt.BlogPost)
            .WithMany(p => p.BlogPostTags)
            .HasForeignKey(bpt => bpt.BlogPostId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<BlogPostTag>()
            .HasOne(bpt => bpt.BlogTag)
            .WithMany(t => t.BlogPostTags)
            .HasForeignKey(bpt => bpt.BlogTagId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<BlogPost>()
            .HasOne(p => p.Category)
            .WithMany(c => c.Posts)
            .HasForeignKey(p => p.CategoryId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<BlogPost>()
            .HasMany(p => p.Comments)
            .WithOne(c => c.BlogPost)
            .HasForeignKey(c => c.BlogPostId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<BlogPost>()
            .HasIndex(p => p.Slug)
            .IsUnique();

        modelBuilder.Entity<BlogCategory>()
            .HasIndex(c => c.Slug)
            .IsUnique();

        modelBuilder.Entity<BlogTag>()
            .HasIndex(t => t.Slug)
            .IsUnique();

        base.OnModelCreating(modelBuilder);
    }
}
