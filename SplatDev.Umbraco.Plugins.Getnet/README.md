# SplatDev.Umbraco.Plugins.Getnet

<!-- screenshot:start -->
<!-- screenshot:end -->

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

## Architecture

This is a **headless API plugin** — no standalone backoffice dashboard, property editors, or UI components. It operates as an API service (payment processing + webhooks), registered via DI composition. The backoffice/webhook management surface is intentionally left in the consuming application.

## Changelog

### 1.1.2 — 2026-08-24

Removes a dashboard screenshot that showed an error toast. It was captured against a site where this plugin's API was unreachable, so it advertised a broken dashboard. No screenshot is better than a misleading one; a replacement will be taken against a working install.

### 1.1.1 — 2026-08-24

Package metadata only: the listing now carries an icon and search tags, and the project and repository links point at the organisation that actually hosts this code. No code changes.

### 1.1.0 — 2026-08-24

This package now keeps a changelog. Earlier releases predate it and are not reconstructed here — consult the repository history for those. From this version on, every release records what changed for someone using it.

