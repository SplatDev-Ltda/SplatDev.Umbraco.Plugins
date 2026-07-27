# SplatDev.Payments.Getnet

Getnet (Santander's card acquirer) payment SDK for .NET — OAuth2 `client_credentials` + HTTP Basic auth, **no client certificate** (distinct from `SplatDev.Payments.Santander`, which is the mTLS Open Banking SDK).

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Payments.Getnet.svg)](https://www.nuget.org/packages/SplatDev.Payments.Getnet)

Targets both `net8.0` (Umbraco 13) and `net10.0` (Umbraco 17). Transport-only; the Umbraco webhook/backoffice controllers and dashboard live in `SplatDev.Umbraco.Plugins.Getnet`, and RISIN-specific orchestration stays in the consuming app.

## Compatibility

| Umbraco | .NET | Package Version |
|---------|------|-----------------|
| 13.x    | 8.0  | 1.0.0           |
| 17.x    | 10.0 | 1.0.0           |

## Installation

```sh
dotnet add package SplatDev.Payments.Getnet
```

## Key Types

| Type | Role |
|------|------|
| `GetnetApiOptions` | BaseUrl (sandbox/prod), token path, SellerId/ClientId/ClientSecret, payment paths, dev-mock flag |
| `GetnetApiClient` | OAuth2 token (Basic auth) + `seller_id` header; PIX/boleto/payment-link/status/list; in-memory dev mock |

## Quick Start

Register in `Program.cs`:

```csharp
builder.Services.Configure<GetnetApiOptions>(builder.Configuration.GetSection("Getnet"));
builder.Services.AddHttpClient<GetnetApiClient>();
```

Configure `appsettings.json`:

```json
{
  "Getnet": {
    "BaseUrl": "https://api-sandbox.getnet.com.br",
    "SellerId": "your-seller-id",
    "ClientId": "your-client-id",
    "ClientSecret": "your-client-secret"
  }
}
```

## Known Limitations

- Dev mock mode returns static responses; not suitable for integration testing.
- This is a transport-only SDK — payment orchestration (idempotency, retry, webhook handling) must be implemented in the consuming application.

## License

MIT © [SplatDev](https://github.com/SplatDev-Ltda)
