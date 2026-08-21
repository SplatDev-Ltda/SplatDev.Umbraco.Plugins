# Payments.PagSeguro

PagSeguro payment integration for Umbraco — create checkout sessions, track transactions, and manage payment status from a backoffice dashboard.

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Plugins.Payments.PagSeguro.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.Payments.PagSeguro)

## Compatibility

| Umbraco | .NET | Package Version |
|---------|------|-----------------|
| 13.x    | 8.0  | 2.0.0           |
| 17.x    | 10.0 | 2.0.0           |

## Installation

```sh
dotnet add package SplatDev.Umbraco.Plugins.Payments.PagSeguro
```

## Quick Start

The plugin auto-registers via `PagSeguroComposer`, which sets up the EF Core DbContext, `HttpClient`, and `IPagSeguroService`.

## Configuration

Add to `appsettings.json`:

```json
{
  "PagSeguro": {
    "Email": "your-email@example.com",
    "Token": "your-api-token",
    "Sandbox": true
  },
  "ConnectionStrings": {
    "umbracoDbDSN": "Server=localhost;Database=umbraco;Trusted_Connection=True;"
  }
}
```

Set `Sandbox: true` for testing, `false` for production.

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/umbraco/api/pagseguro/GetConfig` | Returns public config (email, sandbox mode) |
| POST | `/umbraco/api/pagseguro/CreateTransaction` | Initiate a payment transaction |
| GET | `/umbraco/api/pagseguro/GetTransactionStatus?code=` | Query transaction status |

## Usage

```javascript
// Create a transaction
const response = await fetch('/umbraco/api/pagseguro/CreateTransaction', {
    method: 'POST',
    body: JSON.stringify({
        reference: 'ORDER-001',
        amount: 99.90,
        description: 'Product purchase'
    }),
    headers: { 'Content-Type': 'application/json' }
});
const { paymentUrl } = await response.json();
window.location.href = paymentUrl;
```

## Known Limitations

- No built-in checkout UI or front-end integration — API-only payment initiation
- The `Token` config value is never exposed to the frontend (only Email and Sandbox are returned by `GetConfig`)
- No webhook/IPN handling in the Umbraco plugin layer; depends on the parent `SplatDev.Payments.PagSeguro` library
- Lower-level API calls are delegated to the `SplatDev.Payments.PagSeguro` library

## Changelog

### 2.1.5 — 2026-08-21
- Dashboard now sends the backoffice token with its API calls. On Umbraco 17 those calls were arriving unauthenticated and coming back 401, which the dashboard rendered as an empty state rather than an error.
- A failed request now raises a notification instead of leaving the dashboard looking like there is simply no data.
- The plugin's tables are created on startup. They were never created before, so anything touching them failed on a fresh install.
- Runs on SQLite as well as SQL Server. It previously assumed SQL Server and failed with "Keyword not supported: 'cache'" on the database Umbraco's installer offers by default.

## License

MIT © [SplatDev](https://github.com/SplatDev-Ltda)
