using Microsoft.EntityFrameworkCore;

namespace SplatDev.Umbraco.Plugins.EmailNotifications.Models;

public class EmailNotificationsDbContext : DbContext
{
    public EmailNotificationsDbContext(DbContextOptions<EmailNotificationsDbContext> options) : base(options) { }

    public DbSet<EmailTemplate> EmailTemplates => Set<EmailTemplate>();
    public DbSet<EmailEvent> EmailEvents => Set<EmailEvent>();
    public DbSet<Subscriber> Subscribers => Set<Subscriber>();
    public DbSet<Campaign> Campaigns => Set<Campaign>();
    public DbSet<Notification> Notifications => Set<Notification>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // SQLite has no schemas. Asking for one there makes EF fold it into the
        // table name, so the generated DDL and the queries disagree about what the
        // table is called and every read fails against an object never created.
        if (!Database.IsSqlite())
            modelBuilder.HasDefaultSchema("emailnotifications");

        modelBuilder.Entity<EmailTemplate>(entity =>
        {
            entity.ToTable("EmailTemplates");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedOnAdd();
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Subject).IsRequired().HasMaxLength(500);
            entity.Property(e => e.BodyHtml).IsRequired();
        });

        modelBuilder.Entity<EmailEvent>(entity =>
        {
            entity.ToTable("EmailEvents");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedOnAdd();
            entity.Property(e => e.MessageId).IsRequired().HasMaxLength(256);
            entity.Property(e => e.RecipientEmail).IsRequired().HasMaxLength(320);
            entity.Property(e => e.EventType).HasConversion<int>();
            entity.Property(e => e.Url).HasMaxLength(2048);
            entity.Property(e => e.ErrorCode).HasMaxLength(100);
            entity.Property(e => e.ErrorMessage).HasMaxLength(1000);
            entity.HasIndex(e => e.MessageId);
            entity.HasIndex(e => e.RecipientEmail);
        });

        modelBuilder.Entity<Subscriber>(entity =>
        {
            entity.ToTable("Subscribers");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedOnAdd();
            entity.Property(e => e.Email).IsRequired().HasMaxLength(320);
            entity.Property(e => e.MemberId).HasMaxLength(450);
            entity.Property(e => e.ListId).HasMaxLength(100);
            entity.Property(e => e.FirstName).HasMaxLength(100);
            entity.Property(e => e.LastName).HasMaxLength(100);
            entity.HasIndex(e => new { e.Email, e.ListId }).IsUnique();
            entity.HasIndex(e => e.MemberId);
        });

        modelBuilder.Entity<Campaign>(entity =>
        {
            entity.ToTable("Campaigns");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedOnAdd();
            entity.Property(e => e.Subject).IsRequired().HasMaxLength(500);
            entity.Property(e => e.ListId).HasMaxLength(100);
            entity.Property(e => e.Status).HasConversion<int>();
            entity.HasOne(e => e.Template)
                .WithMany()
                .HasForeignKey(e => e.TemplateId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<Notification>(entity =>
        {
            entity.ToTable("Notifications");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedOnAdd();
            entity.Property(e => e.MemberId).IsRequired().HasMaxLength(450);
            entity.Property(e => e.Message).IsRequired().HasMaxLength(2000);
            entity.Property(e => e.Type).HasConversion<int>();
            entity.HasIndex(e => e.MemberId);
        });

        base.OnModelCreating(modelBuilder);
    }
}
