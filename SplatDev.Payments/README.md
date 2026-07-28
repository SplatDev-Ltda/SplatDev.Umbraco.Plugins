# SplatDev.Payments

Pure payment abstractions for .NET — defines interfaces for payments, transactions, payers, cards, subscriptions, shipments, and orders. Zero dependencies, provider-agnostic. Used as the foundation for all SplatDev payment provider implementations (Stripe, MercadoPago, PagSeguro, Getnet, Santander, BancoInter).

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Payments.svg)](https://www.nuget.org/packages/SplatDev.Payments)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Compatibility

| .NET | Umbraco | Package Version |
|------|---------|-----------------|
| 8.0  | 13      | 1.0.0           |
| 10.0 | 17      | 1.0.0           |

## Installation

```sh
dotnet add package SplatDev.Payments
```

## Abstractions

### IPayment — Base payment interface

```csharp
using SplatDev.Payments.Interfaces;

public class MyPaymentProvider : IPayment
{
    public async Task<PaymentResult> CreatePaymentRequestAsync(
        IPayer payer,
        decimal amount,
        string currency,
        CancellationToken ct = default)
    {
        // Implement payment creation
    }

    public async Task<Transaction> GetTransactionAsync(
        string transactionId,
        CancellationToken ct = default)
    {
        // Implement transaction retrieval
    }

    public async Task<Transaction> ConfirmTransationAsync(
        string transactionId,
        CancellationToken ct = default)
    {
        // Implement transaction confirmation
    }
}
```

### IPayment<T> — Generic payment interface

```csharp
using SplatDev.Payments.Interfaces;

// Typed payment with provider-specific configuration
public class StripePayment : IPayment<StripeConfig>
{
    private readonly StripeConfig _config;

    public StripePayment(StripeConfig config)
    {
        _config = config;
    }

    public async Task<PaymentResult> CreatePaymentRequestAsync(
        IPayer payer,
        decimal amount,
        string currency,
        CancellationToken ct = default)
    {
        // Use _config.ApiKey, _config.WebhookSecret, etc.
    }

    // ... other IPayment members
}
```

## Usage

### Implement a custom payment provider

```csharp
using SplatDev.Payments;
using SplatDev.Payments.Interfaces;

public class CustomProvider : IPayment
{
    public async Task<PaymentResult> CreatePaymentRequestAsync(
        IPayer payer,
        decimal amount,
        string currency,
        CancellationToken ct = default)
    {
        // Call the provider's API
        var response = await _httpClient.PostAsync(...);

        return new PaymentResult
        {
            Success = true,
            TransactionId = response.TransactionId,
            Status = PaymentStatus.Pending,
            RedirectUrl = response.CheckoutUrl
        };
    }

    public async Task<Transaction> GetTransactionAsync(
        string transactionId,
        CancellationToken ct = default)
    {
        // Query transaction status
    }

    public async Task<Transaction> ConfirmTransationAsync(
        string transactionId,
        CancellationToken ct = default)
    {
        // Confirm/capture the transaction
    }
}
```

### Register in DI

```csharp
// Program.cs
builder.Services.AddScoped<IPayment, CustomProvider>();

// Inject into a controller
public class CheckoutController : Controller
{
    private readonly IPayment _payment;

    public CheckoutController(IPayment payment)
    {
        _payment = payment;
    }

    [HttpPost]
    public async Task<IActionResult> Pay([FromBody] CheckoutRequest request)
    {
        var payer = new Payer
        {
            Name = request.CustomerName,
            Email = request.CustomerEmail,
            Card = new Card
            {
                Number = request.CardNumber,
                ExpirationMonth = request.ExpMonth,
                ExpirationYear = request.ExpYear
            }
        };

        var result = await _payment.CreatePaymentRequestAsync(
            payer, request.Amount, request.Currency);

        return result.Success
            ? Redirect(result.RedirectUrl!)
            : BadRequest(result.ErrorMessage);
    }
}
```

## Features

- **Zero dependencies** — pure C# interfaces, no external NuGet packages
- **IPayment** — base payment operations: `CreatePaymentRequestAsync`, `GetTransactionAsync`, `ConfirmTransationAsync`
- **IPayment<T>** — generic variant for provider-specific configuration types
- **IPayer** — abstraction for payer data (name, email, address, card)
- **ICard** — card details (number, expiration, CVV, holder)
- **ISubscription** — recurring payment definitions with billing intervals
- **IShipment** — shipping and fulfillment data
- **IOrder** — order tracking and line items
- **IPaymentMethod** — payment method abstraction (credit card, boleto, PIX, etc.)
- Provider-agnostic — works with any payment gateway implementation

## Provider Implementations

The following packages implement `SplatDev.Payments` abstractions:

| Package | Provider |
|---------|----------|
| `SplatDev.Payments.Stripe` | Stripe |
| `SplatDev.Payments.MercadoPago` | MercadoPago |
| `SplatDev.Payments.PagSeguro` | PagSeguro |
| `SplatDev.Payments.Getnet` | Getnet |
| `SplatDev.Payments.Santander` | Santander |
| `SplatDev.Payments.BancoInter` | BancoInter |

## Core Interfaces

| Interface | Purpose |
|-----------|---------|
| `IPayment` | Payment creation, transaction retrieval, and confirmation |
| `IPayment<T>` | Generic payment interface with typed configuration |
| `IPayer` | Payer information and billing data |
| `ICard` | Credit/debit card details |
| `ISubscription` | Recurring payment plan definition |
| `IShipment` | Shipping and delivery information |
| `IOrder` | Order details and line items |
| `IPaymentMethod` | Payment method selection and validation |

## Dependencies

None — this is a pure abstractions package with no external dependencies.

---

**SplatDev.Payments** — part of the [SplatDev.Umbraco.Plugins](https://github.com/SplatDev-Ltda/SplatDev.Umbraco.Plugins) suite. Licensed under MIT. &copy; SplatDev Ltda.
