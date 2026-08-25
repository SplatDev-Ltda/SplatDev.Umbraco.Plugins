# SplatDev.Payments

<!-- screenshot:start -->
<!-- screenshot:end -->

Pure payment abstractions for .NET — defines interfaces for payments, transactions, payers, cards, subscriptions, shipments, and orders. Zero dependencies, provider-agnostic. Used as the foundation for all SplatDev payment provider implementations (Stripe, MercadoPago, PagSeguro, Getnet, Santander, BancoInter).

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Payments.svg)](https://www.nuget.org/packages/SplatDev.Payments)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Compatibility

| .NET | Umbraco | Package Version |
|------|---------|-----------------|
| 8.0  | 13      | 1.0.3           |
| 10.0 | 17      | 1.0.3           |

## Installation

```sh
dotnet add package SplatDev.Payments
```

## Abstractions

Two interfaces with the same name and very different jobs, which is the first thing to get
straight:

| | |
| --- | --- |
| `IPayment` | a **payment**, as data. Four properties, no methods. |
| `IPayment<T>` | a **provider**, as operations. Four async methods, returning `T`. |

A provider implements the generic one and takes the non-generic one as its input.

### IPayment — the payment itself

```csharp
using SplatDev.Payments.Interfaces;

public sealed class MyPayment : IPayment
{
    public IPaymentMethod Details { get; set; } = default!;
    public string PaymentMethodId { get; set; } = string.Empty;
    public decimal? TransactionAmount { get; set; }
    public string Description { get; set; } = string.Empty;
}
```

### IPayment&lt;T&gt; — the provider

`T` is whatever your provider's API hands back — a response DTO, a string, a status object.
The interface does not prescribe it.

```csharp
using SplatDev.Payments.Interfaces;

public sealed class MyProvider : IPayment<MyApiResponse>
{
    public Task<MyApiResponse> CreatePaymentRequestAsync(IPayment model) { ... }

    public Task<MyApiResponse> GetPaymentCodeAsync(IPayment model, string contentType) { ... }

    public Task<MyApiResponse> GetTransactionAsync(string notificationCode, string receiver, string token) { ... }

    // Note the spelling: ConfirmTransationAsync. It is a typo in the shipped interface and
    // renaming it would break every implementation, so it stays.
    public Task<bool> ConfirmTransationAsync(string transaction, string referenceCode, string receiver, string token) { ... }
}
```

### Register in DI

```csharp
builder.Services.AddScoped<IPayment<MyApiResponse>, MyProvider>();
```

Inject the closed generic — `IPayment<MyApiResponse>` — not `IPayment`, which is a model
rather than a service.

## The supporting interfaces

`ICard` is the only one with members:

```csharp
public interface ICard
{
    string FirstSixDigits { get; set; }
    string LastFourDigits { get; set; }
    int ExpirationMonth { get; set; }
    int ExpirationYear { get; set; }
    string Status { get; set; }
    DateTime DateCreated { get; set; }
    DateTime DateLastUpdated { get; set; }
}
```

`IOrder`, `IPayer`, `IPaymentMethod`, `IShipment` and `ISubscription` are **marker
interfaces** — declared empty, so a provider shapes those types however its API needs. This
package deliberately says nothing about them beyond the name.

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

## Changelog

### 1.0.3 — 2026-08-25

Documentation only, no code change. The README's Abstractions and Usage sections described an API this package does not have: it showed `IPayment` being implemented with async methods, when `IPayment` is a data interface with four properties and no methods at all, and it named `PaymentResult`, `Transaction` and `StripeConfig`, none of which exist. The operations live on `IPayment<T>`, whose four methods have quite different signatures. Both interfaces are now documented as they are, along with the fact that `IOrder`, `IPayer`, `IPaymentMethod`, `IShipment` and `ISubscription` are deliberately empty marker interfaces — and that `ConfirmTransationAsync` is spelled that way in the shipped interface.

### 1.0.2 — 2026-08-24

Removes a dashboard screenshot that showed an error toast. It was captured against a site where this plugin's API was unreachable, so it advertised a broken dashboard. No screenshot is better than a misleading one; a replacement will be taken against a working install.

### 1.0.1 — 2026-08-24

Package metadata only: the listing now carries an icon and search tags, and the project and repository links point at the organisation that actually hosts this code. No code changes.

### 1.0.0 — 2026-08-24

This package now keeps a changelog. Earlier releases predate it and are not reconstructed here — consult the repository history for those. From this version on, every release records what changed for someone using it.

