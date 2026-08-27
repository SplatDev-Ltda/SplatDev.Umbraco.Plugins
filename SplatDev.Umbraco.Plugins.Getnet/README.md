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

## Backoffice dashboard

Settings → Getnet. Four period buttons (7, 30, 90, 365 days) drive every panel.

**Overview** — settled volume against the previous period of the same length, approval rate,
average ticket and refunds, then a per-day volume chart and breakdowns by status and by
payment method.

**Transactions** — the ledger, filterable by status, method and a search across order
reference, Getnet payment id, customer name and email. Shows card brand, last four digits
and instalments where the method has them, the authorisation code, and the gateway's own
refusal message when it refused.

**Connection** — whether the seller id, client id and client secret are configured, which
environment the base URL points at, and whether the development mock is on. Secrets are
reported as present or missing and never sent to the browser; the seller id is masked to its
last four digits.

### Where the numbers come from

Getnet's API answers about one payment at a time and offers no history to page through, so
the dashboard reads a local ledger this plugin keeps in Umbraco's database
(`GetnetTransactions`). A payment appears there once the consuming application records it:

```csharp
public class CheckoutService(IGetnetTransactionService getnet)
{
    public async Task StartAsync(Order order)
    {
        await getnet.RecordAsync(new GetnetTransaction
        {
            OrderRef = order.Reference,
            AmountMinor = order.TotalCents,   // centavos, not reais
            Currency = "BRL",
            PaymentMethod = "pix",
            CustomerName = order.CustomerName,
        });
    }

    // From the gateway response, or from a webhook.
    public Task ConfirmAsync(string paymentId, string authCode) =>
        getnet.UpdateStatusAsync(paymentId, GetnetTransactionStatus.Confirmed, authCode);
}
```

Amounts are stored in the currency's minor unit because that is what Getnet's API exchanges;
converting on the way in is how rounding errors end up baked into a total later reported as
money. Nothing is recorded automatically — a plugin cannot know which of your requests was a
payment — so a site that never calls `RecordAsync` will show an empty dashboard.


## Changelog

### 1.2.0 — 2026-08-27

Adds a backoffice dashboard under Settings: settled volume against the previous period, approval rate, average ticket and refunds, a per-day volume chart, breakdowns by status and payment method, a filterable transactions table, and a connection panel showing whether the gateway credentials are configured without revealing them. The figures come from a local ledger the plugin now keeps, because Getnet's API offers no payment history to page through.

### 1.1.3 — 2026-08-25

Fixes two defects in the Getnet client. Escaping a seller or order id that contains a control character produced a request body that was not valid JSON, so the call failed; the whole character set is escaped properly now. And the API client is registered as a singleton rather than per request, so the OAuth token it caches survives to be reused instead of every call re-authenticating.

### 1.1.2 — 2026-08-24

Removes a dashboard screenshot that showed an error toast. It was captured against a site where this plugin's API was unreachable, so it advertised a broken dashboard. No screenshot is better than a misleading one; a replacement will be taken against a working install.

### 1.1.1 — 2026-08-24

Package metadata only: the listing now carries an icon and search tags, and the project and repository links point at the organisation that actually hosts this code. No code changes.

### 1.1.0 — 2026-08-24

This package now keeps a changelog. Earlier releases predate it and are not reconstructed here — consult the repository history for those. From this version on, every release records what changed for someone using it.

