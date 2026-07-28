# SplatDev.Payments.PagSeguro

PagSeguro / PagBank Order API v4 payment provider for the SplatDev.Payments abstraction layer.

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Payments.PagSeguro.svg)](https://www.nuget.org/packages/SplatDev.Payments.PagSeguro)

## Compatibility

| .NET | Package Version |
|------|-----------------|
| 8.0  | 1.0.0           |
| 10.0 | 1.0.0           |

## Target API

**PagBank Order API v4** (`api.pagseguro.com` production, `sandbox.api.pagseguro.com` sandbox). The legacy PagSeguro v2 API is sunset — this adapter targets v4 exclusively.

## Installation

```sh
dotnet add package SplatDev.Payments.PagSeguro
```

## Configuration

```json
{
  "SplatDev": {
    "Payments": {
      "PagSeguro": {
        "Token": "YOUR_PAGBANK_TOKEN",
        "Environment": "Sandbox",
        "WebhookSecret": "YOUR_WEBHOOK_SECRET",
        "TimeoutSeconds": 30
      }
    }
  }
}
```

## Usage

```csharp
// Program.cs
builder.Services.AddSplatDevPagSeguro(builder.Configuration);

// In your controller
public class CheckoutController : ControllerBase
{
    private readonly PagSeguroService _pagSeguro;

    public CheckoutController(PagSeguroService pagSeguro)
    {
        _pagSeguro = pagSeguro;
    }

    public async Task<IActionResult> CreateOrder()
    {
        var order = new PagSeguroOrderRequest
        {
            ReferenceId = "ORDER-001",
            Customer = new PagSeguroCustomer { Name = "John Doe", Email = "john@example.com", TaxId = "12345678909" },
            Items = new() { new PagSeguroItem { Name = "Product", Quantity = 1, UnitAmount = 10000 } },
            Charges = new()
            {
                new PagSeguroCharge
                {
                    Description = "First charge",
                    Amount = new PagSeguroAmount { Value = 10000, Currency = "BRL" },
                    PaymentMethod = new PagSeguroPaymentMethod
                    {
                        Type = "CREDIT_CARD",
                        Installments = 1,
                        Capture = true,
                        Card = new PagSeguroCard
                        {
                            Number = "4111111111111111",
                            ExpMonth = "12",
                            ExpYear = "2026",
                            SecurityCode = "123",
                            Holder = new PagSeguroCardHolder { Name = "John Doe", TaxId = "12345678909" }
                        }
                    }
                }
            }
        };

        var result = await _pagSeguro.CreateOrderAsync(order);
        return Ok(result);
    }
}
```

## Supported payment methods

| Method         | Type value       |
|----------------|------------------|
| Credit card    | `CREDIT_CARD`    |
| Debit card     | `DEBIT_CARD`     |
| Boleto         | `BOLETO`         |
| PIX            | `PIX`             |

## Webhook verification

```csharp
[HttpPost("webhook")]
public async Task<IActionResult> Webhook()
{
    using var reader = new StreamReader(Request.Body);
    var rawBody = await reader.ReadToEndAsync();

    if (!_pagSeguro.VerifyWebhookSignatureAsync(rawBody, Request.Headers["X-Hub-Signature"]))
        return Unauthorized();

    var payload = JsonSerializer.Deserialize<PagSeguroWebhookPayload>(rawBody);
    // handle order status update
    return Ok();
}
```

## Dependencies

| Package | Purpose |
|---------|---------|
| `SplatDev.Payments` | Base payment abstractions |
| `Microsoft.AspNetCore.App` | HttpClient + IOptions |

Built on `System.Text.Json` — no third-party JSON library required.

---

*SplatDev — pragmatic tools for .NET developers.*
