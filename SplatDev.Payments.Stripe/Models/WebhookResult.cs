namespace SplatDev.Payments.Stripe;

public record WebhookResult(
    bool Success,
    string? ErrorMessage = null,
    WebhookEventType? EventType = null);

public enum WebhookEventType
{
    Unknown,
    CheckoutSessionCompleted,
    PaymentIntentSucceeded,
    PaymentIntentFailed
}
