# SplatDev.Umbraco.Plugins.ContentPackages

Gated content packages for Umbraco. A visitor subscribes to the newsletter, confirms their
address, and receives links to read the article online and download the same content as
**PDF**, **PPTX**, and **LLM-ready Markdown**.

> **Status: skeleton (v0.1.0).** Structure, catalogue, token service and endpoints exist and
> compile. Email delivery, the backoffice UI and the front end are not implemented yet.
> See [SPEC.md](SPEC.md) for the design and [PLAN.md](PLAN.md) for the phased build.

## Compatibility

| Umbraco | .NET | Backend | Backoffice UI |
|---------|------|---------|---------------|
| 13.x    | 8.0  | ✅       | ❌ planned     |
| 17.x    | 10.0 | ✅       | ❌ planned (Lit 3) |

## How it works

```
subscribe -> confirm email -> welcome email with 4 signed links -> read / download
```

Downloads are protected by **HMAC-signed, expiring links** — no account, no password. The
signature covers the lead, package slug, asset kind and expiry, so a link cannot be moved
between packages or formats, and revoking a lead kills its links immediately.

Links are only sent **after double opt-in confirmation**, which keeps the consent record
defensible and protects sender reputation.

## Content packages

One folder per package under the configured root:

```
<Root>/
  Entrepreneurship/
    Entrepreneurship-Zero-to-Operator.html    -> read online
    Entrepreneurship-Zero-to-Operator.pdf     -> download
    Entrepreneurship-Zero-to-Operator.pptx    -> download
    deck-content-source.md                    -> LLM markdown
    package.json                              -> metadata (generated)
```

Assets are matched by extension, so filenames are free-form. A folder containing two files
of the same kind is reported as **ambiguous** rather than guessed — picking wrong would
email the wrong file.

## Configuration

Section `SplatDev:ContentPackages`.

```json
{
  "SplatDev": {
    "ContentPackages": {
      "Root": "E:\\ContentPackages",
      "SigningKey": "",
      "TokenTtlDays": 30,
      "ConfirmTokenTtlHours": 72,
      "MaxDownloadsPerAsset": 0,
      "NewsletterListId": 1,
      "PublicBaseUrl": "https://splatdev.com"
    }
  }
}
```

> **`SigningKey` is a secret** — user-secrets or environment only, never committed.
> Rotating it invalidates every outstanding download link.

`PublicBaseUrl` must be set explicitly: links are baked into already-sent email, and the
request host is not trustworthy behind a reverse proxy.

## Endpoints

**Public**

| Method | Route |
|---|---|
| `POST` | `/umbraco/contentpackages/api/v1/subscribe` |
| `GET` | `/package/confirm?t=…` |
| `GET` | `/package/{slug}/{kind}?t=…&e=…&s=…` |

`kind` is one of `html`, `pdf`, `pptx`, `markdown`.

**Backoffice** (`AuthorizationPolicies.BackOfficeAccess`)

| Method | Route |
|---|---|
| `GET` | `/umbraco/contentpackages/api/v1/status` |
| `GET` | `/umbraco/contentpackages/api/v1/packages` |
| `POST` | `/umbraco/contentpackages/api/v1/packages/scan` |
| `GET` | `/umbraco/contentpackages/api/v1/leads` |
| `POST` | `/umbraco/contentpackages/api/v1/leads/{id}/revoke` |
| `POST` | `/umbraco/contentpackages/api/v1/leads/{id}/resend` |

## Relationship to other plugins

This plugin does **not** re-implement newsletters or email:

- `SplatDev.Umbraco.Plugins.Newsletter` — subscribers, lists, campaigns
- `SplatDev.Umbraco.Plugins.EmailTemplates` — templated rendering
- `SplatDev.Messaging.*` — delivery

It owns only the pending/confirm state, because double opt-in does not exist in the
Newsletter plugin today (`Subscribe` writes an active subscriber immediately and
`Subscriber` has no status column). A lead is handed to the Newsletter plugin only once it
is genuinely opted in.

## Storage

Leads and download hits live in a SQLite sidecar at `umbraco/Data/contentpackages.db`,
created at startup. The Umbraco database is never touched. Override with
`ConnectionStrings:ContentPackagesDb`.

## Changelog

### 0.1.1 — 2026-08-24

Package metadata only: the listing now carries an icon and search tags, and the project and repository links point at the organisation that actually hosts this code. No code changes.

### 0.1.0 — 2026-08-24

This package now keeps a changelog. Earlier releases predate it and are not reconstructed here — consult the repository history for those. From this version on, every release records what changed for someone using it.

## License

MIT © [SplatDev](https://github.com/SplatDev-Ltda)
