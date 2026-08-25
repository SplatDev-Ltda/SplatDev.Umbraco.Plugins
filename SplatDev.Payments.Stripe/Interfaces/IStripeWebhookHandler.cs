namespace SplatDev.Payments.Stripe.Interfaces;

public interface IStripeWebhookHandler
{
    Task<WebhookResult> HandleEventAsync(string json, string stripeSignatureHeader, CancellationToken ct = default);
}
