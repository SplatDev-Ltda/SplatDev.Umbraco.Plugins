using Microsoft.EntityFrameworkCore;

namespace SplatDev.Umbraco.Plugins.QuickPoll.Models;

public class QuickPollDbContext : DbContext
{
    public QuickPollDbContext(DbContextOptions<QuickPollDbContext> options) : base(options) { }

    public DbSet<Poll> Polls => Set<Poll>();
    public DbSet<PollOption> PollOptions => Set<PollOption>();
    public DbSet<PollVote> PollVotes => Set<PollVote>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // SQLite has no schemas. Asking for one there makes EF fold it into the
        // table name, so the generated DDL and the queries disagree about what the
        // table is called and every read fails against an object never created.
        if (!Database.IsSqlite())
            modelBuilder.HasDefaultSchema("quickpoll");

        modelBuilder.Entity<Poll>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Question).IsRequired().HasMaxLength(500);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
        });

        modelBuilder.Entity<PollOption>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.OptionText).IsRequired().HasMaxLength(300);
            entity.HasOne(e => e.Poll)
                  .WithMany(p => p.Options)
                  .HasForeignKey(e => e.PollId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<PollVote>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.VoterIp).IsRequired().HasMaxLength(45);
            entity.Property(e => e.VotedAt).HasDefaultValueSql("GETUTCDATE()");
            entity.HasOne(e => e.Poll)
                  .WithMany(p => p.Votes)
                  .HasForeignKey(e => e.PollId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.Option)
                  .WithMany(o => o.Votes)
                  .HasForeignKey(e => e.OptionId)
                  .OnDelete(DeleteBehavior.NoAction);
            // One vote per voter per poll
            entity.HasIndex(e => new { e.PollId, e.VoterIp }).IsUnique();
        });

        base.OnModelCreating(modelBuilder);
    }
}
