# SplatDev.Umbraco.Plugins.WhatsApp

<!-- screenshot:start -->

![WhatsApp inbox](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.WhatsApp/docs/screenshots/01-inbox.png)

![WhatsApp contacts](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.WhatsApp/docs/screenshots/02-contacts.png)

![WhatsApp send](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.WhatsApp/docs/screenshots/03-send.png)

![WhatsApp templates](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.WhatsApp/docs/screenshots/04-templates.png)

![WhatsApp status](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.WhatsApp/docs/screenshots/05-status.png)

<!-- screenshot:end -->

WhatsApp Business **Cloud API** integration for Umbraco — a backoffice inbox, template and
free-form sending, and an inbound webhook receiver.

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Plugins.WhatsApp.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.WhatsApp)

> **v3.0.0 is a rewrite.** Versions 2.x shipped a `wa.me` deep-link button, not an API
> integration. There is no upgrade path for the old `WhatsApp:*` configuration keys — see
> [Configuration](#configuration).

## Compatibility

| Umbraco | .NET | Backend API + webhook | Backoffice dashboard |
|---------|------|----------------------|----------------------|
| 13.x    | 8.0  | ✅                    | ❌ (Lit 3 requires the v14+ backoffice) |
| 17.x    | 10.0 | ✅                    | ✅                   |

On Umbraco 13 the plugin still sends messages and receives webhooks; only the UI is
Umbraco 17-only.

## Installation

```sh
dotnet add package SplatDev.Umbraco.Plugins.WhatsApp
```

The composer registers itself — no `Program.cs` change is required. On startup, the plugin
adds `SplatDev.WhatsApp.Section` to the built-in **Administrators** group if it is missing.
Existing permissions on Administrators and all other groups are preserved. The plugin never
removes a section permission during uninstall; custom groups must be granted access manually
by an administrator.

> On Umbraco 13 the backend API and webhook are available, but the Lit dashboard is not
> supported. The permission backfill still runs on both Umbraco 13 and 17.


## Configuration

Bound from the `SplatDev:WhatsApp` section.

```json
{
  "SplatDev": {
    "WhatsApp": {
      "PhoneNumberId": "1311077628745755",
      "BusinessAccountId": "1777491496760147",
      "AccessToken": "",
      "WebhookVerifyToken": "",
      "AppSecret": "",
      "GraphApiVersion": "v21.0",
      "CustomerServiceWindowHours": 24
    }
  }
}
```

> **Never commit `AccessToken` or `AppSecret`.** Use user-secrets locally and environment
> variables or Key Vault on the server:
>
> ```sh
> dotnet user-secrets set "SplatDev:WhatsApp:AccessToken" "EAAG..."
> # or, as environment variables:
> export SplatDev__WhatsApp__AccessToken=EAAG...
> export SplatDev__WhatsApp__AppSecret=...
> ```

| Setting | Required | Notes |
|---|---|---|
| `PhoneNumberId` | yes | The **ID**, not the display number. Find it in Meta → WhatsApp → API Setup. |
| `BusinessAccountId` | for templates | WABA ID. Without it the Templates view is empty. |
| `AccessToken` | yes | Use a **System User** token. The 24-hour tokens from the Meta dashboard break the integration daily. |
| `WebhookVerifyToken` | for inbound | Any non-empty string; enter the same value in Meta. Without it, verification fails and no inbound messages arrive. |
| `AppSecret` | production | Validates `X-Hub-Signature-256`. Without it the endpoint accepts unverified deliveries and logs a warning. |
| `CustomerServiceWindowHours` | no | Defaults to 24. Lower it only to give operators a safety margin. |

### Storage

Conversations live in a SQLite sidecar at `umbraco/Data/whatsapp.db`, created at startup.
The Umbraco database is never touched. Override with
`ConnectionStrings:WhatsAppDb`.

## Webhook setup

The plugin exposes:

```
GET  /umbraco/whatsapp/webhook   # Meta's verification handshake
POST /umbraco/whatsapp/webhook   # messages + delivery statuses
```

In the Meta app → **WhatsApp → Configuration → Webhook**, set the callback URL to
`https://your-site/umbraco/whatsapp/webhook`, the verify token to your
`WebhookVerifyToken`, and subscribe to the **`messages`** field.

### Running alongside an existing integration

A phone number belongs to the **WABA**, not to an app, and a WABA accepts **multiple
subscribed apps** (`POST /{waba-id}/subscribed_apps`). Each app receives the same events at
its own callback URL, and Meta resolves overrides per app
(phone-number override → WABA override → app default).

So if another system already consumes a number's webhooks, **do not repoint the app-level
callback** — you would silently cut that system off. There are two safe routes:

1. **Per-number override** (simplest). Overrides are resolved per phone number, so point
   only the number Umbraco owns at this plugin and leave the others alone:

   ```sh
   curl -X POST "https://graph.facebook.com/v21.0/{PHONE_NUMBER_ID}/settings" \
     -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
     -d '{"webhooks":{"override_callback_uri":"https://your-site/umbraco/whatsapp/webhook",
          "verify_token":"YOUR_VERIFY_TOKEN"}}'
   ```

2. **A second Meta app** subscribed to the same WABA, with its own callback URL. Use this
   when the two integrations need separate tokens or permissions.

## The 24-hour customer-service window

WhatsApp only allows free-form messages within 24 hours of the user's **last inbound
message**. Outside that window, only an approved template will deliver.

The plugin models this directly: `LastInboundUtc` is set by inbound messages only —
sending does **not** extend the window — and the inbox disables the reply box once it
closes, pointing the operator at a template instead of letting them type a reply that
would bounce with error `131047`.

## Backoffice

Adds a **WhatsApp** section with four views:

- **Inbox** — threads, transcript, live window countdown, reply box
- **Send** — approved template with variable filling and live preview, or free-form
- **Templates** — every template on the WABA with status and variable count
- **Status** — phone health, quality rating, and setup warnings for anything unconfigured

## API

All endpoints require a backoffice user (`AuthorizationPolicies.BackOfficeAccess`);
anonymous callers get `401`.

| Method | Route |
|---|---|
| `GET` | `/umbraco/whatsapp/api/v1/status` |
| `GET` | `/umbraco/whatsapp/api/v1/conversations` |
| `GET` | `/umbraco/whatsapp/api/v1/conversations/{id}/messages` |
| `POST` | `/umbraco/whatsapp/api/v1/conversations/{id}/read` |
| `GET` | `/umbraco/whatsapp/api/v1/templates` |
| `POST` | `/umbraco/whatsapp/api/v1/send/text` |
| `POST` | `/umbraco/whatsapp/api/v1/send/template` |

## Building the client

```sh
cd client
npm install --include=dev
npx vite build      # emits ../App_Plugins/WhatsApp/dist
```

## Testing

```sh
dotnet test SplatDev.Umbraco.Plugins.WhatsApp.Tests

# live, read-only checks against the Graph API (excluded from CI)
export SplatDev__WhatsApp__AccessToken=...
export SplatDev__WhatsApp__PhoneNumberId=...
export SplatDev__WhatsApp__BusinessAccountId=...
dotnet test --filter "Category=Integration"
```

## Troubleshooting

| Symptom | Cause |
|---|---|
| Inbox stays empty | Webhook not registered, or the `messages` field isn't subscribed. |
| Verification handshake fails | `WebhookVerifyToken` is empty or doesn't match Meta. |
| Send fails with code `131047` | The 24-hour window has closed — send a template. |
| Send fails with code `132000` | Template variable count doesn't match the body. |
| Templates view is empty | `BusinessAccountId` not set, or the token lacks `whatsapp_business_management`. |
| Webhooks return 401 | `AppSecret` doesn't match the Meta app secret. |

## Changelog

### 3.5.3 — 2026-08-26

Fixes a duplicate registration on sites that still have a physical App_Plugins folder for this plugin, left behind by an older release that copied content into the site. Umbraco registered those extensions twice - once from its own scan of the folder, once from this package's embedded manifest - and logged "Extension with alias ... is already registered". The embedded manifest now yields to the physical copy.

### 3.5.2 — 2026-08-26

The five screenshots on the NuGet listing now describe themselves — inbox, contacts, send, templates and status — rather than all five reading "screenshot".

### 3.5.1 — 2026-08-24

Package metadata only: the listing now carries an icon and search tags, and the project and repository links point at the organisation that actually hosts this code. No code changes.

### 3.5.0 — 2026-08-23

The Umbraco Marketplace listing now shows every screenshot for this plugin, not just the dashboard. The listing keeps its own screenshot list rather than reading the README.

## License

MIT © [SplatDev](https://github.com/SplatDev-Ltda)
