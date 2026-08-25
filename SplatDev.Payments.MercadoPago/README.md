# SplatDev.Payments.MercadoPago

<!-- screenshot:start -->
<!-- screenshot:end -->

Mercado Pago payment provider for `SplatDev.Payments` — models, enums, request/response contracts for the Mercado Pago REST API (Payments, Subscriptions, Pix, Boleto, Cards).

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Payments.MercadoPago.svg)](https://www.nuget.org/packages/SplatDev.Payments.MercadoPago)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Compatibility

| .NET | Umbraco | Package Version |
|------|---------|-----------------|
| 8.0  | 13      | 1.0.2           |
| 10.0 | 17      | 1.0.2           |

## Installation

```sh
dotnet add package SplatDev.Payments.MercadoPago
```

## Configuration

### API endpoints

```csharp
using SplatDev.Payments.MercadoPago;

// API base URLs
var v1 = Constants.APIv1;  // https://api.mercadopago.com/v1/
var api = Constants.API;   // https://api.mercadopago.com/

// JSON serializer settings (snake_case, ISO 8601 dates)
var settings = Constants.API_JSON_SETTINGS;
```

Using `Constants.API_JSON_SETTINGS` ensures consistent serialization with the Mercado Pago API conventions:
- `snake_case` property naming (`SnakeCaseNamingStrategy`)
- ISO 8601 date format (`yyyy-MM-ddTHH:mm:ss.fffZ`)
- `DefaultValueHandling.Ignore`
- `NullValueHandling.Ignore`

### Serialization helper

```csharp
var json = JsonConvert.SerializeObject(payment, Constants.API_JSON_SETTINGS);
var payment = JsonConvert.DeserializeObject<Payment>(responseJson, Constants.API_JSON_SETTINGS);
```

## Payment Methods

| Method | Enum | Description |
|--------|------|-------------|
| Credit Card | `PaymentMethodTypes.CreditCard` | Card payments via token |
| Debit Card | `PaymentMethodTypes.DebitCard` | Debit card payments |
| Pix | `PaymentMethodTypes.Pix` | Instant Pix transfers |
| Boleto (Ticket) | `PaymentMethodTypes.Ticket` | Boleto bancário |
| Account Money | `PaymentMethodTypes.AccountMoney` | Mercado Pago wallet |

## Models

### Payments

| Class | Description |
|-------|-------------|
| `Payment` | Full payment response (status, fees, transaction details, payer info) |
| `PaymentItem` | Line item in a payment |
| `Payer` | Payer identification (name, email, CPF/CNPJ, phone, address) |
| `TransactionDetails` | Payment processor details (installments, net amount, acquirer) |
| `CardHolder` | Credit card holder info |
| `PayerCosts` | Installment options for a given payment method |

### Requests

| Class | Description |
|-------|-------------|
| `PaymentsRequest` | Base payment request |
| `CardPaymentRequest` | Credit/debit card payment |
| `PixPaymentRequest` | Pix payment request |
| `TicketPaymentRequest` | Boleto payment request |
| `SubscriptionRequest` | Recurring subscription request |
| `UserRequest` | User/test user creation request |

### Subscriptions

| Class | Description |
|-------|-------------|
| `Subscription` | Subscription response |
| `PreApprovalPlan` | Subscription plan definition |
| `AutoRecurring` | Recurring charge configuration (frequency, amount, duration) |
| `FreeTrial` | Free trial configuration |

### Enums

| Enum | Values |
|------|--------|
| `PaymentMethodTypes` | `CreditCard`, `DebitCard`, `Pix`, `Ticket`, `AccountMoney` |
| `StatusTypes` | `Pending`, `Approved`, `Authorized`, `InProcess`, `InMediation`, `Rejected`, `Cancelled`, `Refunded`, `ChargedBack` |
| `BarcodeTypes` | `BRL` |
| `EntityTypes` | `Individual`, `Association` |
| `IdentificationTypes` | `CPF`, `CNPJ` |
| `FrequencyTypes` | `Days`, `Months` |
| `OrderTypes` | `Asc`, `Desc` |
| `PayerTypes` | `Customer`, `Registered`, `Guest` |

## Usage

```csharp
using SplatDev.Payments.MercadoPago;
using SplatDev.Payments.MercadoPago.Enum;
using SplatDev.Payments.MercadoPago.Requests;

// Card payment
var cardPayment = new CardPaymentRequest
{
    TransactionAmount = 149.90m,
    Token = "card-token-from-frontend",
    Description = "Order #1234",
    Installments = 1,
    PaymentMethodId = PaymentMethodTypes.CreditCard,
    Payer = new Payer
    {
        Email = "customer@example.com",
        Identification = new Identification
        {
            Type = IdentificationTypes.CPF,
            Number = "12345678901"
        }
    }
};

// Pix payment
var pixPayment = new PixPaymentRequest
{
    TransactionAmount = 49.90m,
    Description = "Order #5678",
    Payer = new Payer
    {
        Email = "customer@example.com",
        FirstName = "John",
        LastName = "Doe"
    }
};

// Subscription
var subscription = new SubscriptionRequest
{
    PreApprovalPlanId = "2c938084726fca480172750000000001",
    PayerEmail = "customer@example.com",
    AutoRecurring = new AutoRecurring
    {
        Frequency = 1,
        FrequencyType = FrequencyTypes.Months,
        TransactionAmount = 29.90m
    }
};
```

## Dependencies

| Package | Purpose |
|---------|---------|
| `SplatDev.Payments` | Core payment abstractions |
| `mercadopago-sdk` 2.11.0 | Official Mercado Pago .NET SDK |
| `Newtonsoft.Json` 13.0.3 | JSON serialization (snake_case, custom settings) |
| `RestSharp` 112.1.0 | HTTP client |
| `RestSharp.Serializers.NewtonsoftJson` 112.1.0 | RestSharp + Newtonsoft integration |

## API Status Transitions

```
Pending → Approved  (captured)
Pending → InProcess → Approved
Pending → Rejected   (declined)
Pending → Cancelled  (expired/cancelled)
Approved → Refunded
Approved → ChargedBack
```

## Limitations

- Model/contracts library. No service layer, DI extensions, or HTTP callers included.
- API access token management is the caller's responsibility.
- Webhook/IPN handling must be implemented by the consuming application.
- Only Brazilian payment methods are modeled (BRL currency).

---

**SplatDev.Payments.MercadoPago** — part of the [SplatDev.Umbraco.Plugins](https://github.com/SplatDev-Ltda/SplatDev.Umbraco.Plugins) suite. Licensed under MIT. &copy; SplatDev Ltda.

## Changelog

### 1.0.2 — 2026-08-24

Removes a dashboard screenshot that showed an error toast. It was captured against a site where this plugin's API was unreachable, so it advertised a broken dashboard. No screenshot is better than a misleading one; a replacement will be taken against a working install.

### 1.0.1 — 2026-08-24

Package metadata only: the listing now carries an icon and search tags, and the project and repository links point at the organisation that actually hosts this code. No code changes.

### 1.0.0 — 2026-08-24

This package now keeps a changelog. Earlier releases predate it and are not reconstructed here — consult the repository history for those. From this version on, every release records what changed for someone using it.

