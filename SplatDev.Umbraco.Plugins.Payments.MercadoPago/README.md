# Payments.MercadoPago

MercadoPago payment integration for Umbraco — create payment preferences, track payment status, and handle webhook notifications via a backoffice dashboard.


<!-- screenshot:start -->

![Payments.MercadoPago dashboard](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.Payments.MercadoPago/docs/screenshots/01-dashboard.png)

<!-- screenshot:end -->

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Plugins.Payments.MercadoPago.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.Payments.MercadoPago)

## Compatibility

| Umbraco | .NET | Package Version |
|---------|------|-----------------|
| 13.x    | 8.0  | 2.0.0           |
| 17.x    | 10.0 | 2.0.0           |

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

## License

MIT © [SplatDev](https://github.com/SplatDev-Ltda)