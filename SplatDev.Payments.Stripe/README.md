# SplatDev.Payments.Stripe

Stripe payment provider for the SplatDev.Payments abstraction layer — PaymentIntents, refunds, customers, subscriptions, and webhooks.

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Payments.Stripe.svg)](https://www.nuget.org/packages/SplatDev.Payments.Stripe)

## Compatibility

| .NET | Package Version |
|------|-----------------|
| 8.0  | 1.0.0           |
| 10.0 | 1.0.0           |

## Installation

```sh
dotnet add package SplatDev.Payments.Stripe
```

## Configuration

```json
{
  "SplatDev": {
    "Payments": {
      "Stripe": {
        "ApiKey": "sk_test_YOUR_SECRET_KEY",
        "WebhookSecret": "whsec_YOUR_WEBHOOK_SECRET",
        "PublishableKey": "pk_test_YOUR_PUBLISHABLE_KEY",
        "ApiVersion": "2024-12-18.acacia"
      }
    }
  }
}
```

## Usage

```csharp
// Program.cs
builder.Services.AddSplatDevStripe(builder.Configuration);

// In your controller
public class PaymentController : ControllerBase
{
    private readonly StripeService _stripe;

    public PaymentController(StripeService stripe)
    {
        _stripe = stripe;
    }

    public async Task<IActionResult> Charge()
    {
        var intent = await _stripe.CreatePaymentIntentAsync(
            amount: 5000,       // 50.00 USD in cents
            currency: "usd",
            description: "Order #1234");

        return Ok(new { clientSecret = intent.ClientSecret });
    }
}
```

## Webhook verification

```csharp
[HttpPost("webhook")]
public async Task<IActionResult> Webhook()
{
    using var reader = new StreamReader(Request.Body);
    var json = await reader.ReadToEndAsync();

    try
    {
        var stripeEvent = _stripe.ConstructWebhookEvent(
            json,
            Request.Headers["Stripe-Signature"],
            _configuration["SplatDev:Payments:Stripe:WebhookSecret"]);

        switch (stripeEvent.Type)
        {
            case "payment_intent.succeeded":
                var intent = stripeEvent.Data.Object as PaymentIntent;
                // handle success
                break;
            case "payment_intent.payment_failed":
                // handle failure
                break;
        }
        return Ok();
    }
    catch (StripeException)
    {
        return BadRequest();
    }
}
```

## Supported operations

| Operation | Method |
|-----------|--------|
| PaymentIntent create | `CreatePaymentIntentAsync` |
| PaymentIntent confirm | `ConfirmPaymentIntentAsync` |
| PaymentIntent get | `GetPaymentIntentAsync` |
| PaymentIntent cancel | `CancelPaymentIntentAsync` |
| PaymentIntent capture | `CapturePaymentIntentAsync` |
| Refund | `RefundPaymentIntentAsync` |
| Customer create | `CreateCustomerAsync` |
| Customer get | `GetCustomerAsync` |
| Checkout session | `CreateCheckoutSessionAsync` |
| Subscription create | `CreateSubscriptionAsync` |
| Subscription cancel | `CancelSubscriptionAsync` |
| Webhook verification | `ConstructWebhookEvent` |

## Dependencies

| Package | Purpose |
|---------|---------|
| `SplatDev.Payments` | Base payment abstractions |
| `Stripe.net` 47.2.0 | Stripe API SDK (uses System.Text.Json) |
| `Microsoft.AspNetCore.App` | IOptions |

No third-party JSON library required — Stripe.net uses `System.Text.Json` internally.

---

*SplatDev — pragmatic tools for .NET developers.*
