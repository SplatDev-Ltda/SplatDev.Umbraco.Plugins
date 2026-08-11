using Microsoft.EntityFrameworkCore;

using SplatDev.Umbraco.Plugins.WhatsApp.Entities;

namespace SplatDev.Umbraco.Plugins.WhatsApp.Migrations;

/// <summary>
/// Sidecar store for WhatsApp conversations. Deliberately separate from the Umbraco
/// database so installing the plugin never touches the CMS schema.
/// </summary>
public class WhatsAppDbContext : DbContext
{
    public WhatsAppDbContext(DbContextOptions<WhatsAppDbContext> options) : base(options)
    {
    }

    public DbSet<WhatsAppConversation> Conversations => Set<WhatsAppConversation>();

    public DbSet<WhatsAppMessage> Messages => Set<WhatsAppMessage>();

    public DbSet<WhatsAppContact> Contacts => Set<WhatsAppContact>();

    protected override void OnModelCreating(ModelBuilder model)
    {
        model.Entity<WhatsAppConversation>(e =>
        {
            e.ToTable("whatsAppConversation");
            e.HasIndex(c => c.WaId).IsUnique();
            e.HasIndex(c => c.LastMessageUtc);
        });

        model.Entity<WhatsAppContact>(e =>
        {
            e.ToTable("whatsAppContact");

            // One contact per number. The inbox resolves names by wa_id, so a duplicate
            // would make which name wins non-deterministic.
            e.HasIndex(c => c.WaId).IsUnique();
        });

        model.Entity<WhatsAppMessage>(e =>
        {
            e.ToTable("whatsAppMessage");
            e.HasIndex(m => m.ConversationId);
            e.HasIndex(m => m.TimestampUtc);

            // Meta retries webhook deliveries, so the same wamid arrives more than once.
            // A unique index makes replay a no-op instead of a duplicate row. Filtered,
            // because outbound rows are written before Meta returns an id.
            e.HasIndex(m => m.WhatsAppMessageId)
                .IsUnique()
                .HasFilter("\"WhatsAppMessageId\" IS NOT NULL");
        });
    }
}
