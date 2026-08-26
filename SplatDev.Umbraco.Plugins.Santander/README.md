# SplatDev.Umbraco.Plugins.Santander

Umbraco 17 (net10.0) plugin for the **Santander Open Banking** suite. Wires up


<!-- screenshot:start -->

![Santander dashboard](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.Santander/docs/screenshots/01-dashboard.png)

<!-- screenshot:end -->

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Plugins.Santander.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.Santander)

## Compatibility

| Umbraco | .NET | Package Version |
|---------|------|-----------------|
| 17.x    | 10.0 | 1.3.6           |

## Installation

```sh
dotnet add package SplatDev.Umbraco.Plugins.Santander
```
[`SplatDev.Payments.Santander`](../SplatDev.Payments.Santander) and exposes a guarded banking API.

## What it provides
- **`SantanderComposer`** (`IComposer`) — binds the `Santander:*` config section into `SantanderApiOptions`,
  registers the `SantanderApiClient` (singleton, so the OAuth token cache is shared) and the 8 product
  services, and configures the named `HttpClient` (`"Santander"`) with the **mTLS** ICP-Brasil e-CNPJ
  certificate (`CertificatePath`/`CertificateBase64` + password) and a Polly transient-error retry policy.
- **`SantanderBankingApiController`** — route `umbraco/backoffice/santander-banking`, guarded by the
  `X-RISIN-Api-Key` header (value from `Santander:ApiKey`; returns 401 while unset). Endpoints: `diagnostics`,
  `balance`, `statement`, `pix/qrcode`(+`{txid}`), `payments`(+`{id}`), `boletos/workspaces`, `boletos`(+`{billId}`),
  `fx/quotes`(+`{id}`).

> The guard header alias is `X-RISIN-Api-Key` (kept for compatibility with the originating app). Rename the
> `ApiKeyHeader` const if you want a neutral alias.

## Not included (application-specific — stays in the consuming app)
- Payment-persistence schema (`risin_santander_pagamento` migration) and any domain orchestration.
- The Getnet backoffice dashboard (`App_Plugins/SantanderManager`) belongs to the **Getnet** integration
  (`SplatDev.Umbraco.Plugins.Getnet`), not this Open Banking plugin.

## Config (appsettings `Santander` section)
`BaseUrl`, `TokenPath`, `ClientId`, `ClientSecret`, `CertificatePath`/`CertificateBase64`/`CertificatePassword`,
`ApiKey`, `WorkspaceId`, `CovenantCode`, `BankId`, `AccountId`, `PixKey`, and per-product path overrides.

## Changelog

### 1.3.6 — 2026-08-26

The NuGet listing now shows the dashboard. It had no screenshot before, so the listing gave no picture of what the plugin looks like in the backoffice.

### 1.3.5 — 2026-08-26

Fixes a duplicate registration on sites that still have a physical App_Plugins folder for this plugin, left behind by an older release that copied content into the site. Umbraco registered those extensions twice - once from its own scan of the folder, once from this package's embedded manifest - and logged "Extension with alias ... is already registered". The embedded manifest now yields to the physical copy.

### 1.3.4 — 2026-08-24

Removes a dashboard screenshot that showed an error toast. It was captured against a site where this plugin's API was unreachable, so it advertised a broken dashboard. No screenshot is better than a misleading one; a replacement will be taken against a working install.

### 1.3.3 — 2026-08-24

Package metadata only: the listing now carries an icon and search tags, and the project and repository links point at the organisation that actually hosts this code. No code changes.

### 1.3.2 — 2026-08-21
- Dashboard now sends the backoffice token with its API calls. On Umbraco 17 those calls were arriving unauthenticated and coming back 401, which the dashboard rendered as an empty state rather than an error.
- A failed request now raises a notification instead of leaving the dashboard looking like there is simply no data.

## License

MIT © [SplatDev](https://github.com/SplatDev-Ltda)

## Architecture

This is a **headless API plugin** — no standalone backoffice dashboard, property editors, or UI components. It operates as an API service (banking integration), registered via DI composition. The banking backoffice surface is intentionally left in the consuming application.