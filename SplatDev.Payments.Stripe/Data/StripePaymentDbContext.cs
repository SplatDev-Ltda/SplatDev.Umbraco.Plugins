using Microsoft.EntityFrameworkCore;

namespace SplatDev.Payments.Stripe.Data;

public class StripePaymentDbContext : DbContext
{
    public StripePaymentDbContext(DbContextOptions<StripePaymentDbContext> options) : base(options) { }

    public DbSet<PaymentRecord> PaymentRecords => Set<PaymentRecord>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("stripe");

        modelBuilder.Entity<PaymentRecord>(entity =>
        {
            entity.ToTable("PaymentRecords");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedOnAdd();
            entity.Property(e => e.StripeEventId).IsRequired().HasMaxLength(256);
            entity.Property(e => e.PaymentIntentId).HasMaxLength(256);
            entity.Property(e => e.CheckoutSessionId).HasMaxLength(256);
            entity.Property(e => e.Currency).IsRequired().HasMaxLength(10).HasDefaultValue("usd");
            entity.Property(e => e.Status).IsRequired().HasMaxLength(50);
            entity.Property(e => e.CustomerEmail).HasMaxLength(320);
            entity.Property(e => e.ClientReferenceId).HasMaxLength(100);
            entity.Property(e => e.CreatedAt).IsRequired();
        });

        base.OnModelCreating(modelBuilder);
    }
}
