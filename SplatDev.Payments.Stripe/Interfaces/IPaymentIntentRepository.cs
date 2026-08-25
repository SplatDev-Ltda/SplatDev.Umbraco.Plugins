namespace SplatDev.Payments.Stripe.Interfaces;

public interface IPaymentIntentRepository
{
    Task<bool> IsEventProcessedAsync(string stripeEventId, CancellationToken ct = default);
    Task MarkEventProcessedAsync(string stripeEventId, PaymentRecord record, CancellationToken ct = default);
    Task<PaymentRecord?> GetByPaymentIntentIdAsync(string paymentIntentId, CancellationToken ct = default);
}
