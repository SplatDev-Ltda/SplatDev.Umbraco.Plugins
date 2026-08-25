# SplatDev.Payments.Stripe

Stripe Checkout + PaymentIntents provider with webhook handling, idempotency, and EF Core 10 persistence. Multi-targets `net8.0` and `net10.0`.

## Architecture

```
Browser → Calculator UI → POST /api/checkout/create-session
                               │
                          IStripeCheckoutService
                               │
                          Stripe.net SDK → Stripe API
                               │
                          Returns session URL → Browser redirects to Stripe

Stripe webhook → POST /api/stripe/webhook
                      │
                 IStripeWebhookHandler
                      │
                 ┌── Signature verification (EventUtility.ConstructEvent)
                 ├── Idempotency check (unique StripeEventId in DB)
                 └── Persist PaymentRecord via IPaymentIntentRepository
```

## Interface Contracts

```csharp
public interface IStripeCheckoutService
{
    Task<CheckoutSessionResult> CreateSessionAsync(CheckoutRequest request, CancellationToken ct);
}

public interface IStripeWebhookHandler
{
    Task<WebhookResult> HandleEventAsync(string json, string stripeSignatureHeader, CancellationToken ct);
}

public interface IPaymentIntentRepository
{
    Task<bool> IsEventProcessedAsync(string stripeEventId, CancellationToken ct);
    Task MarkEventProcessedAsync(string stripeEventId, PaymentRecord record, CancellationToken ct);
    Task<PaymentRecord?> GetByPaymentIntentIdAsync(string paymentIntentId, CancellationToken ct);
}
```

## Configuration

### appsettings.json

```json
{
  "SplatDev": {
    "Payments": {
      "Stripe": {
        "SecretKey": "sk_live_xxx",
        "PublishableKey": "pk_live_xxx",
        "WebhookSigningSecret": "whsec_xxx",
        "SuccessUrl": "https://www.opennology.com/payment/success",
        "CancelUrl": "https://www.opennology.com/payment/cancel",
        "DevMock": false
      }
    }
  },
  "ConnectionStrings": {
    "umbracoDbDSN": "Server=localhost;Database=opennology;..."
  }
}
```

### Program.cs Registration

```csharp
using SplatDev.Payments.Stripe.Extensions;

builder.Services.AddSplatDevStripe(builder.Configuration);
```

### Dev Mock Mode

Set `DevMock: true` to work offline without Stripe API keys. The checkout service returns a mock session URL and the webhook handler returns success without calling Stripe.

## Database

Schema: `stripe`
Table: `PaymentRecords`

| Column | Type | Index |
|--------|------|-------|
| Id | int PK | Identity |
| StripeEventId | nvarchar(256) | UNIQUE (idempotency) |
| PaymentIntentId | nvarchar(256) | Indexed |
| CheckoutSessionId | nvarchar(256) | |
| Currency | nvarchar(10) | |
| Amount | bigint | |
| Status | nvarchar(50) | |
| CustomerEmail | nvarchar(320) | |
| ClientReferenceId | nvarchar(100) | |
| RawJson | nvarchar(max) | |
| CreatedAt | datetime2 | Indexed |
| ProcessedAt | datetime2 | |

Run EF Core migration from the host project:

```bash
dotnet ef migrations add StripePaymentRecords --context StripePaymentDbContext
dotnet ef database update --context StripePaymentDbContext
```

## Webhook Handling

### Idempotency

Every Stripe event ID is stored in `PaymentRecords.StripeEventId` with a **unique database constraint**. The repository checks `IsEventProcessedAsync` before processing any event — if the event was already processed, it returns success without side effects.

### Event Types Handled

| Event | Action |
|-------|--------|
| `checkout.session.completed` | Persist PaymentRecord from session data |
| `payment_intent.succeeded` | Persist PaymentRecord from payment intent |
| `payment_intent.payment_failed` | Logged as PaymentIntentFailed result |

### Webhook Controller (add to your Umbraco project)

```csharp
[Route("api/stripe")]
public class StripeWebhookController(
    IStripeWebhookHandler handler) : ControllerBase
{
    [HttpPost("webhook")]
    public async Task<IActionResult> Webhook(CancellationToken ct)
    {
        using var reader = new StreamReader(Request.Body);
        var json = await reader.ReadToEndAsync(ct);
        var signature = Request.Headers["Stripe-Signature"].ToString();

        var result = await handler.HandleEventAsync(json, signature, ct);

        return result.Success ? Ok() : BadRequest(new { error = result.ErrorMessage });
    }
}
```

## Security

- **Webhook signature verification** via `EventUtility.ConstructEvent` — signature is mandatory in production mode
- **Idempotent** by unique database constraint on `StripeEventId`
- **Never** references `SecureConnectionHelpers.OverrideCertificateValidation()` — TLS is verified
- Stripe secret/API keys read from `IOptions<StripeSettings>`, not hardcoded
- Dev-mock flag prevents accidental production processing during development

## Demo Setup

1. Set `DevMock: true` in appsettings
2. Checkout service returns mock URL without Stripe API calls
3. Webhook handler returns success without signature verification

For Stripe test mode:
1. Use Stripe test keys: `sk_test_...`, `pk_test_...`, `whsec_...`
2. Set `DevMock: false`
3. Use test card `4242 4242 4242 4242` with any future date and CVC

## Dependencies

- `Stripe.net` 46.2.1
- `Microsoft.EntityFrameworkCore.SqlServer` (8.0.20 / 10.0.7)
- `SplatDev.Payments`

## License

MIT — SplatDev Ltda

## Changelog

### 1.1.0 — 2026-08-25

Adds the checkout and webhook layer this package's README has always described but never contained. Until now it held four source files — an options class, a thin `StripeService` and its registration — while the README documented `IStripeCheckoutService`, webhook idempotency and a `PaymentRecords` table that did not exist.

`IStripeCheckoutService` creates Checkout sessions; `IStripeWebhookHandler` verifies the `Stripe-Signature` header through Stripe's own `EventUtility.ConstructEvent` and refuses a request without one; `IPaymentIntentRepository` and `StripePaymentDbContext` persist a `PaymentRecord` per event. Replay is handled twice over — `IsEventProcessedAsync` short-circuits a repeat, and a unique index on `StripeEventId` closes the race between two concurrent deliveries of the same event. `StripeAuditInterceptor` logs every save.

`checkout.session.completed`, `payment_intent.succeeded` and `payment_intent.payment_failed` are handled. `DevMock` still works offline without API keys. `AddSplatDevStripe(configuration)` registers all of it.
