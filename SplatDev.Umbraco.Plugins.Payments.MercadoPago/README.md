# Payments.MercadoPago

MercadoPago payment integration for Umbraco — create payment preferences, track payment status, and handle webhook notifications via a backoffice dashboard.


<!-- screenshot:start -->
<!-- screenshot:end -->

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Plugins.Payments.MercadoPago.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.Payments.MercadoPago)

## Compatibility

| Umbraco | .NET | Package Version |
|---------|------|-----------------|
| 13.x    | 8.0  | 2.2.2           |
| 17.x    | 10.0 | 2.2.2           |

## Installation

```sh
dotnet add package SplatDev.Umbraco.Plugins.Payments.MercadoPago
```

## Quick Start

The plugin auto-registers via `MercadoPagoComposer`, which sets up the EF Core DbContext, `HttpClient`, and `IMercadoPagoService`.

## Configuration

Add to `appsettings.json`:

```json
{
  "MercadoPago": {
    "AccessToken": "your-mercadopago-access-token",
    "PublicKey": "your-mercadopago-public-key",
    "Sandbox": true
  },
  "ConnectionStrings": {
    "umbracoDbDSN": "Server=localhost;Database=umbraco;Trusted_Connection=True;"
  }
}
```

Set `Sandbox: true` for testing, `false` for production. Obtain credentials from the [MercadoPago Developer Dashboard](https://www.mercadopago.com/developers).

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/umbraco/api/mercadopago/GetConfig` | Returns public config (PublicKey, Sandbox) |
| POST | `/umbraco/api/mercadopago/CreatePreference` | Create a payment preference |
| GET | `/umbraco/api/mercadopago/GetPaymentStatus?paymentId=` | Query payment status |

## Usage

```javascript
// Create a payment preference
const response = await fetch('/umbraco/api/mercadopago/CreatePreference', {
    method: 'POST',
    body: JSON.stringify({
        items: [{ title: 'Product', quantity: 1, unit_price: 99.90 }],
        external_reference: 'ORDER-001'
    }),
    headers: { 'Content-Type': 'application/json' }
});
const { preferenceId } = await response.json();

// Initialize MercadoPago checkout with the returned preferenceId
const mp = new MercadoPago('PUBLIC_KEY');
mp.checkout({ preference: { id: preferenceId } });
```

## Known Limitations

- No built-in checkout UI — the API returns a `preferenceId` for client-side MercadoPago SDK integration
- The `AccessToken` is never exposed to the frontend (only `PublicKey` and `Sandbox` are returned by `GetConfig`)
- No webhook/IPN handling in the Umbraco plugin layer; actual API calls are delegated to `SplatDev.Payments.MercadoPago`
- Front-end integration requires the MercadoPago JavaScript SDK

## Changelog

### 2.2.2 — 2026-08-24

Removes a dashboard screenshot that showed an error toast. It was captured against a site where this plugin's API was unreachable, so it advertised a broken dashboard. No screenshot is better than a misleading one; a replacement will be taken against a working install.

### 2.2.1 — 2026-08-24

Package metadata only: the listing now carries an icon and search tags, and the project and repository links point at the organisation that actually hosts this code. No code changes.

### 2.2.0 — 2026-08-23

The Umbraco Marketplace listing now shows every screenshot for this plugin, not just the dashboard. The listing keeps its own screenshot list rather than reading the README.

### 2.1.6 — 2026-08-21
- Dashboard now sends the backoffice token with its API calls. On Umbraco 17 those calls were arriving unauthenticated and coming back 401, which the dashboard rendered as an empty state rather than an error.
- A failed request now raises a notification instead of leaving the dashboard looking like there is simply no data.
- The plugin's tables are created on startup. They were never created before, so anything touching them failed on a fresh install.
- Runs on SQLite as well as SQL Server. It previously assumed SQL Server and failed with "Keyword not supported: 'cache'" on the database Umbraco's installer offers by default.

## License

MIT © [SplatDev](https://github.com/SplatDev-Ltda)