# SplatDev.Umbraco.Plugins.Getnet

Umbraco 17 (net10.0) plugin that wires up [`SplatDev.Payments.Getnet`](../SplatDev.Payments.Getnet) — the
Getnet (Santander card-acquirer) SDK. Getnet uses OAuth2 `client_credentials` + HTTP Basic, **no client
certificate** (this is a different integration from the mTLS Open Banking `SplatDev.*.Santander` packages).

## What it provides
- **`GetnetComposer`** (`IComposer`) — binds the `Getnet:*` config section into `GetnetApiOptions`, registers
  `GetnetApiClient`, and configures the named `"Getnet"` `HttpClient` (base address, JSON, 30s timeout, Polly
  transient-error retry). No certificate handler.

## Not included (application-specific — stays in the consuming app)
The Getnet backoffice/webhook surface in the originating app is **domain-specific** (it reads/writes the host's
own tables, e.g. `risin_*`, and its Locação orchestration), so it is intentionally **not** in this reusable
plugin:
- `GetnetWebhookController` (updates the app's payment table on webhook),
- `GetnetBackofficeApiController` + `GetnetPaymentService` + `GetnetBackofficeService` (domain orchestration),
- the `App_Plugins/SantanderManager` dashboard (route `umbraco/backoffice/santander`).

Keep those in the consuming app; they depend on `GetnetApiClient` from the SDK. Extract them into this plugin
later only if a generic (non-domain) backoffice surface is desired.

## Config (appsettings `Getnet` section)
`BaseUrl` (`https://api.getnet.com.br` prod / `https://api-sandbox.getnet.com.br` sandbox), `TokenPath`,
`SellerId`, `ClientId`, `ClientSecret`, `EnableDevelopmentMockWithoutCredentials`, and the payment path options.
