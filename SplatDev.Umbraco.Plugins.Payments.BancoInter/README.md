# Payments.BancoInter

Banco Inter payment integration for Umbraco — supports Pix (immediate and due charges), Boleto com Pix, Banking (outbound Pix, boleto payments, balance/statement), and webhook handling.


<!-- screenshot:start -->

![Payments.BancoInter dashboard](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.Payments.BancoInter/docs/screenshots/01-dashboard.png)

<!-- screenshot:end -->

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Plugins.Payments.BancoInter.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.Payments.BancoInter)

## Compatibility

| Umbraco | .NET | Package Version |
|---------|------|-----------------|
| 13.x    | 8.0  | 2.0.0           |
| 17.x    | 10.0 | 2.0.0           |

## Installation

```sh
dotnet add package SplatDev.Umbraco.Plugins.Payments.BancoInter
```

## Quick Start

The plugin auto-registers via `BancoInterComposer`, which sets up the EF Core DbContext, `HttpClient`, memory cache, and four scoped services: Auth, Pix, Boleto, and Banking.

## Configuration

Add to `appsettings.json`:

```json
{
  "BancoInter": {
    "ClientId": "your-client-id",
    "ClientSecret": "your-client-secret",
    "CertificatePath": "/path/to/certificate.pfx",
    "CertificatePassword": "certificate-password",
    "Environment": "sandbox"
  },
  "ConnectionStrings": {
    "umbracoDbDSN": "Server=localhost;Database=umbraco;Trusted_Connection=True;"
  }
}
```

Set `Environment: sandbox` for testing, `production` for live transactions.

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/umbraco/api/bancointersandbox/CreatePixCharge` | Create a Pix charge |
| GET | `/umbraco/api/bancointersandbox/GetPixCharge?txid=` | Query a Pix charge |
| POST | `/umbraco/api/bancointersandbox/IssueBoleto` | Issue a Boleto |
| GET | `/umbraco/api/bancointersandbox/GetBoletoPdf?nossoNumero=` | Download Boleto PDF |
| GET | `/umbraco/api/bancointersandbox/GetBalance` | Check account balance |
| GET | `/umbraco/api/bancointersandbox/GetStatement?startDate=&endDate=` | Get account statement |
| POST | `/umbraco/api/bancointersandbox/WebhookPix` | Receive Pix webhook notifications |
| POST | `/umbraco/api/bancointersandbox/RegisterPixWebhook` | Register a Pix webhook |

## Payment Methods

| Method | Description |
|--------|-------------|
| Pix Imediato | Instant Pix transfer |
| Pix Vencimento | Pix with due date |
| Boleto com Pix | Boleto that can be paid via Pix |
| Banking Outbound Pix | Send Pix transfers from your account |
| Banking Boleto | Pay boletos from your account |
| Banking Statement | View account statement |

## Known Limitations

- API route prefix is `bancointersandbox` — production routing may use a different prefix
- Banking endpoints expose balance and statement data without granular access control
- Certificate-based authentication is required and managed by the `SplatDev.Payments.BancoInter` library
- Direct project reference to `SplatDev.Payments.BancoInter` (not a NuGet package dependency)
- Webhook payload signature verification is handled at the library level

## Changelog

### 1.2.1 — 2026-08-21
- The plugin's tables are created on startup. They were never created before, so anything touching them failed on a fresh install.
- Runs on SQLite as well as SQL Server. It previously assumed SQL Server and failed with "Keyword not supported: 'cache'" on the database Umbraco's installer offers by default.

## License

MIT © [SplatDev](https://github.com/SplatDev-Ltda)