# SplatDev.Payments.BancoInter

<!-- screenshot:start -->
<!-- screenshot:end -->

Banco Inter payment gateway integration for `SplatDev.Payments` — models, settings, and API contracts for Pix, Boleto, and Banking operations with Banco Inter (Brazil).

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Payments.BancoInter.svg)](https://www.nuget.org/packages/SplatDev.Payments.BancoInter)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Compatibility

| .NET | Umbraco | Package Version |
|------|---------|-----------------|
| 8.0  | 13      | 1.0.5           |
| 10.0 | 17      | 1.0.5           |

## Installation

```sh
dotnet add package SplatDev.Payments.BancoInter
```

## Configuration

### BancoInterSettings

```csharp
using SplatDev.Payments.BancoInter;
using SplatDev.Payments.BancoInter.Models;   // the Inter* request and response types

var settings = new BancoInterSettings
{
    ClientId = "your-inter-client-id",
    ClientSecret = "your-inter-client-secret",
    Sandbox = true,                          // false for production
    CertificatePath = "/path/to/cert.pem",    // Required for production (mTLS)
    CertificateKeyPath = "/path/to/key.pem"   // Required for production (mTLS)
};

// Endpoints are derived automatically
Console.WriteLine(settings.BaseUrl);  // https://cdpj-sandbox.partners.uatinter.co
Console.WriteLine(settings.TokenUrl); // https://cdpj-sandbox.partners.uatinter.co/oauth/v2/token
```

### appsettings.json

```json
{
  "BancoInter": {
    "ClientId": "your-inter-client-id",
    "ClientSecret": "your-inter-client-secret",
    "Sandbox": true,
    "CertificatePath": "/path/to/cert.pem",
    "CertificateKeyPath": "/path/to/key.pem"
  }
}
```

## Sandbox vs Production

| Setting | Sandbox URL | Production URL |
|---------|-------------|----------------|
| `Sandbox = true` | `https://cdpj-sandbox.partners.uatinter.co` | — |
| `Sandbox = false` | — | `https://cdpj.partners.uatinter.co` |

**Important:** Production requires mTLS with a valid PEM certificate and private key. Both `CertificatePath` and `CertificateKeyPath` must be set.

## Models

### Pix

| Class | Description |
|-------|-------------|
| `InterPixChargeRequest` | Pix charge request (amount, payer, expiration) |
| `InterPixChargeResponse` | Pix charge response (txid, QR code, copy-paste string) |
| `InterPixPayment` | Pix payment request (Pix key, amount, description) |

### Boleto

| Class | Description |
|-------|-------------|
| `InterBoletoRequest` | Boleto issuance request (payer, amount, due date, fine/interest) |
| `InterBoletoResponse` | Boleto issuance response (barcode, digitable line, PDF URL) |

### Banking

| Class | Description |
|-------|-------------|
| `InterBankingBalance` | Account balance response |
| `InterTokenResponse` | OAuth token response (access_token, expires_in) |
| `InterWebhookPayload` | Incoming webhook event payload |

## Usage

```csharp
using SplatDev.Payments.BancoInter;
using SplatDev.Payments.BancoInter.Models;   // the Inter* request and response types

// 1. Get OAuth token
var token = await GetTokenAsync(settings);  // POST {TokenUrl} with client_credentials

// 2. Create a Pix charge
var charge = new InterPixChargeRequest
{
    Calendario = new() { Expiracao = 3600 },
    Valor = new() { Original = "49.90", ModalidadeAlteracao = 0 },
    Chave = "customer-pix-key@email.com",
    SolicitacaoPagador = "Order #1234"
};

// POST {BaseUrl}/cob/v2/cob with Bearer token

// 3. Issue a Boleto
var boleto = new InterBoletoRequest
{
    SeuNumero = "INV-001",
    ValorNominal = 199.90m,
    // DataVencimento and DataEmissao are strings in the API's yyyy-MM-dd form, not dates.
    DataVencimento = DateTime.UtcNow.AddDays(7).ToString("yyyy-MM-dd"),
    Pagador = new()
    {
        Nome = "John Doe",
        CpfCnpj = "12345678901",
        // Endereco is the street line. Cidade and Uf are siblings of it, not nested inside.
        Endereco = "Rua Example, 100",
        Cidade = "Sao Paulo",
        Uf = "SP",
    }
};

// POST {BaseUrl}/cobranca/v3/boletos
```

## Dependencies

| Package | Purpose |
|---------|---------|
| `SplatDev.Payments` | Core payment abstractions |

No third-party SDK dependencies — this is a model/contracts library. HTTP calls should be implemented using `HttpClient` or `RestSharp` by the consuming application.

## Limitations

- Model/contracts library only. No service layer, DI extensions, or HTTP client included.
- mTLS certificate management is the caller's responsibility.
- Token lifecycle (refresh before expiry) must be handled by the consuming app.
- Webhook signature verification not built in.

---

**SplatDev.Payments.BancoInter** — part of the [SplatDev.Umbraco.Plugins](https://github.com/SplatDev-Ltda/SplatDev.Umbraco.Plugins) suite. Licensed under MIT. &copy; SplatDev Ltda.

## Changelog

### 1.0.5 — 2026-08-25

Documentation only, no code change. The README's example used `InterPixCharge` and `InterBoleto`; the real types are `InterPixChargeRequest` and `InterBoletoRequest`. Three further errors in the same snippet: `DataVencimento` is a string in `yyyy-MM-dd` form rather than a `DateTime`, `Pagador.Endereco` is the street line with `Cidade` and `Uf` as its siblings rather than nested inside it, and the `using` omitted `SplatDev.Payments.BancoInter.Models`, where every `Inter*` type actually lives. The example is now compiled against the assembly.

### 1.0.4 — 2026-08-24

Removes a dashboard screenshot that showed an error toast. It was captured against a site where this plugin's API was unreachable, so it advertised a broken dashboard. No screenshot is better than a misleading one; a replacement will be taken against a working install.

### 1.0.3 — 2026-08-24

Package metadata only: the listing now carries an icon and search tags, and the project and repository links point at the organisation that actually hosts this code. No code changes.

### 1.0.2 — 2026-08-24

This package now keeps a changelog. Earlier releases predate it and are not reconstructed here — consult the repository history for those. From this version on, every release records what changed for someone using it.

