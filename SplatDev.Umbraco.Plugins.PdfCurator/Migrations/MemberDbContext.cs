using Microsoft.EntityFrameworkCore;

using SplatDev.Umbraco.Plugins.PdfCurator.Entities;

namespace SplatDev.Umbraco.Plugins.PdfCurator.Migrations;

public class MemberDbContext : DbContext
{
    public MemberDbContext(DbContextOptions<MemberDbContext> options) : base(options)
    {
    }

    public DbSet<MemberFavorite> Favorites => Set<MemberFavorite>();

    public DbSet<MemberProgress> Progress => Set<MemberProgress>();

    protected override void OnModelCreating(ModelBuilder model)
    {
        model.Entity<MemberFavorite>(e =>
        {
            e.ToTable("pdfCuratorFavorite");
            e.HasIndex(f => new { f.MemberKey, f.BookId }).IsUnique();
        });

        model.Entity<MemberProgress>(e =>
        {
            e.ToTable("pdfCuratorProgress");
            e.HasIndex(p => new { p.MemberKey, p.BookId }).IsUnique();
        });
    }
}
