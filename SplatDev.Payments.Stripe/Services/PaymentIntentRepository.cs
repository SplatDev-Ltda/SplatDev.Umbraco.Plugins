using Microsoft.EntityFrameworkCore;
using SplatDev.Payments.Stripe.Data;
using SplatDev.Payments.Stripe.Interfaces;

namespace SplatDev.Payments.Stripe.Services;

public sealed class PaymentIntentRepository(StripePaymentDbContext db) : IPaymentIntentRepository
{
    public async Task<bool> IsEventProcessedAsync(string stripeEventId, CancellationToken ct = default)
    {
        return await db.PaymentRecords.AnyAsync(r => r.StripeEventId == stripeEventId, ct);
    }

    public async Task MarkEventProcessedAsync(string stripeEventId, PaymentRecord record, CancellationToken ct = default)
    {
        record.StripeEventId = stripeEventId;
        record.CreatedAt = DateTime.UtcNow;

        db.PaymentRecords.Add(record);
        await db.SaveChangesAsync(ct);
    }

    public async Task<PaymentRecord?> GetByPaymentIntentIdAsync(string paymentIntentId, CancellationToken ct = default)
    {
        return await db.PaymentRecords
            .AsNoTracking()
            .OrderByDescending(r => r.CreatedAt)
            .FirstOrDefaultAsync(r => r.PaymentIntentId == paymentIntentId, ct);
    }
}
