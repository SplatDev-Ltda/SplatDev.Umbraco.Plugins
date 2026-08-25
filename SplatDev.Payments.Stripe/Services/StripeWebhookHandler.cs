using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SplatDev.Payments.Stripe.Interfaces;

namespace SplatDev.Payments.Stripe.Services;

public sealed class StripeWebhookHandler(
    IOptions<StripeSettings> options,
    IPaymentIntentRepository repository,
    ILogger<StripeWebhookHandler> logger) : IStripeWebhookHandler
{
    private readonly StripeSettings _settings = options.Value;

    public async Task<WebhookResult> HandleEventAsync(string json, string stripeSignatureHeader, CancellationToken ct = default)
    {
        if (_settings.DevMock)
        {
            logger.LogInformation("DevMock enabled — skipping Stripe webhook handling");
            return new WebhookResult(true, EventType: WebhookEventType.CheckoutSessionCompleted);
        }

        if (string.IsNullOrEmpty(stripeSignatureHeader))
            return new WebhookResult(false, ErrorMessage: "Missing Stripe-Signature header");

        try
        {
            global::Stripe.StripeConfiguration.ApiKey = _settings.SecretKey;

            var stripeEvent = global::Stripe.EventUtility.ConstructEvent(
                json, stripeSignatureHeader, _settings.WebhookSigningSecret,
                throwOnApiVersionMismatch: false);

            if (stripeEvent is null)
                return new WebhookResult(false, ErrorMessage: "Could not construct Stripe event");

            var eventId = stripeEvent.Id;

            var alreadyProcessed = await repository.IsEventProcessedAsync(eventId, ct);
            if (alreadyProcessed)
            {
                logger.LogInformation("Stripe event {EventId} already processed — idempotent skip", eventId);
                return new WebhookResult(true);
            }

            var result = await HandleByTypeAsync(stripeEvent, ct);

            logger.LogInformation("Stripe event {EventId} processed — type={Type}", eventId, stripeEvent.Type);
            return result;
        }
        catch (global::Stripe.StripeException ex)
        {
            logger.LogError(ex, "Stripe webhook error: {Message}", ex.StripeError?.Message ?? ex.Message);
            return new WebhookResult(false, ErrorMessage: $"Stripe error: {ex.StripeError?.Message ?? ex.Message}");
        }
    }

    private async Task<WebhookResult> HandleByTypeAsync(global::Stripe.Event stripeEvent, CancellationToken ct)
    {
        switch (stripeEvent.Type)
        {
            case "checkout.session.completed":
                return await HandleCheckoutSessionCompletedAsync(stripeEvent, ct);

            case "payment_intent.succeeded":
                return await HandlePaymentIntentSucceededAsync(stripeEvent, ct);

            case "payment_intent.payment_failed":
                return new WebhookResult(true, EventType: WebhookEventType.PaymentIntentFailed);

            default:
                logger.LogInformation("Unhandled Stripe event type: {Type}", stripeEvent.Type);
                return new WebhookResult(true, EventType: WebhookEventType.Unknown);
        }
    }

    private async Task<WebhookResult> HandleCheckoutSessionCompletedAsync(global::Stripe.Event stripeEvent, CancellationToken ct)
    {
        var session = stripeEvent.Data.Object as global::Stripe.Checkout.Session;
        if (session is null)
            return new WebhookResult(false, ErrorMessage: "Checkout session data is null");

        var record = new PaymentRecord
        {
            StripeEventId = stripeEvent.Id,
            CheckoutSessionId = session.Id,
            PaymentIntentId = session.PaymentIntentId,
            Currency = session.Currency?.ToLowerInvariant() ?? "usd",
            Amount = session.AmountTotal ?? 0,
            Status = session.PaymentStatus,
            CustomerEmail = session.CustomerDetails?.Email ?? session.CustomerEmail,
            ClientReferenceId = session.ClientReferenceId,
            CreatedAt = DateTime.UtcNow,
            ProcessedAt = DateTime.UtcNow
        };

        await repository.MarkEventProcessedAsync(stripeEvent.Id, record, ct);

        return new WebhookResult(true, EventType: WebhookEventType.CheckoutSessionCompleted);
    }

    private async Task<WebhookResult> HandlePaymentIntentSucceededAsync(global::Stripe.Event stripeEvent, CancellationToken ct)
    {
        var paymentIntent = stripeEvent.Data.Object as global::Stripe.PaymentIntent;
        if (paymentIntent is null)
            return new WebhookResult(false, ErrorMessage: "Payment intent data is null");

        var record = new PaymentRecord
        {
            StripeEventId = stripeEvent.Id,
            PaymentIntentId = paymentIntent.Id,
            Currency = paymentIntent.Currency?.ToLowerInvariant() ?? "usd",
            Amount = paymentIntent.Amount,
            Status = paymentIntent.Status,
            CustomerEmail = paymentIntent.ReceiptEmail,
            CreatedAt = DateTime.UtcNow,
            ProcessedAt = DateTime.UtcNow
        };

        await repository.MarkEventProcessedAsync(stripeEvent.Id, record, ct);

        return new WebhookResult(true, EventType: WebhookEventType.PaymentIntentSucceeded);
    }
}
