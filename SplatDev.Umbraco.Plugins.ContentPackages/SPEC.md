# SplatDev.Umbraco.Plugins.ContentPackages — Specification

**Status:** draft v1 · 2026-08-10
**Umbraco:** 17 (net10.0) primary; net8.0 builds for API/backend parity

## Problem

SplatDev publishes long-form research decks. Each exists in four renderings of the same
work — a reading HTML, a PDF, a PPTX, and a source Markdown intended for LLM ingestion.
Today there is no way to put one behind a newsletter signup and deliver it.

The first package is **Entrepreneurship: From Zero to Operator** (93 sections, 5 parts),
supplied as `E:\Entrepreneurship`.

## Goal

A visitor gives an email address, confirms it, and receives a welcome email containing
links to read the article online and download all three files. Editors add a new package
by dropping a folder on disk and clicking scan.

## Non-goals

- Building a newsletter system. `SplatDev.Umbraco.Plugins.Newsletter` already owns
  subscribers, lists and campaigns, and this plugin consumes it.
- Building an email renderer. `SplatDev.Umbraco.Plugins.EmailTemplates` owns that.
- Payments, DRM, or watermarking.
- Generating the PDF/PPTX/HTML. They are authored elsewhere and dropped in.

## Decisions

Settled with the product owner on 2026-08-10:

| Decision | Choice | Why |
|---|---|---|
| Download protection | **HMAC-signed expiring links** | Standard lead-magnet pattern. No password step, so conversion holds. Tokens are per-lead, so a leaked link is traceable and revocable. |
| Delivery timing | **After double opt-in confirm** | Protects sender reputation and gives a defensible consent record under both LGPD (BR) and CAN-SPAM/GDPR expectations. |
| Asset storage | **Disk folder per package** | Matches how content is authored and handed over. A 2.4 MB PPTX never enters the media pipeline or git. |

## Content package format

A package is one folder under the configured root. Assets are matched by extension, so
the deck filename does not have to follow a convention:

```
<Root>/
  Entrepreneurship/
    Entrepreneurship-Zero-to-Operator.html    -> read online
    Entrepreneurship-Zero-to-Operator.pdf     -> download
    Entrepreneurship-Zero-to-Operator.pptx    -> download
    deck-content-source.md                    -> LLM markdown
    package.json                              -> metadata (generated on first scan)
```

`package.json` is written by the scanner and is then editable:

```json
{
  "slug": "entrepreneurship",
  "title": "Entrepreneurship: From Zero to Operator",
  "summary": "Everything a non-technical person needs to know...",
  "version": "1",
  "publishedUtc": "2026-08-10T00:00:00Z",
  "assets": {
    "html": "Entrepreneurship-Zero-to-Operator.html",
    "pdf": "Entrepreneurship-Zero-to-Operator.pdf",
    "pptx": "Entrepreneurship-Zero-to-Operator.pptx",
    "markdown": "deck-content-source.md"
  }
}
```

**Exactly one asset per kind.** If a folder contains two PDFs the scan reports the package
as ambiguous rather than guessing — a silent wrong pick would email the wrong file.

## Flow

```
1. Visitor submits email on an article page
      POST /umbraco/contentpackages/api/v1/subscribe   { email, name?, slug }
      -> lead row created, status = Pending
      -> CONFIRM email sent (single-use confirm token)
      -> 200 { status: "pending" }        (always; see Enumeration below)

2. Visitor clicks the confirm link
      GET /package/confirm?t=<confirm-token>
      -> lead status Pending -> Confirmed
      -> subscriber registered via INewsletterService.Subscribe(listId, email, name)
      -> WELCOME email sent, carrying four signed asset links
      -> redirect to the article's thank-you page

3. Visitor uses a link
      GET /package/{slug}/{kind}?t=<token>&e=<expiry>&s=<signature>
      -> signature + expiry + kind + lead validated
      -> download counter incremented, hit logged
      -> html  -> rendered inline
         others -> file stream with Content-Disposition: attachment
```

## Token design

Two distinct tokens; conflating them would let a confirm link be replayed as a download.

**Confirm token** — single use. Random 32 bytes, stored hashed on the lead row, cleared on
use. Default TTL 72 hours.

**Asset token** — stateless and signed, so downloads need no database lookup to reject a
forgery:

```
payload   = "{leadPublicId}|{slug}|{kind}|{expiryUnix}"
signature = HMAC-SHA256(payload, SigningKey)   // compared in constant time
```

Validation order — cheapest rejection first: signature → expiry → lead exists and is
Confirmed → not revoked → download cap not exceeded.

Revocation is a flag on the lead. Because the token is stateless, that check is the only
thing that makes revocation possible, so it is not optional.

## Configuration

Section `SplatDev:ContentPackages`.

| Setting | Default | Notes |
|---|---|---|
| `Root` | — | Folder holding package subfolders. Required. |
| `SigningKey` | — | Required. **Secret** — never committed. Rotating it invalidates every outstanding link. |
| `TokenTtlDays` | 30 | Asset link lifetime. |
| `ConfirmTokenTtlHours` | 72 | Confirm link lifetime. |
| `MaxDownloadsPerAsset` | 0 | 0 = unlimited. |
| `NewsletterListId` | — | List in the Newsletter plugin that confirmed leads join. |
| `PublicBaseUrl` | — | Absolute base for links in emails; request host is not trustworthy behind a proxy. |

## Endpoints

**Public** (`AllowAnonymous`)

| Method | Route | Purpose |
|---|---|---|
| `POST` | `/umbraco/contentpackages/api/v1/subscribe` | Submit an email |
| `GET` | `/package/confirm` | Confirm and trigger the welcome email |
| `GET` | `/package/{slug}/{kind}` | Read or download an asset |

**Backoffice** (`AuthorizationPolicies.BackOfficeAccess`)

| Method | Route | Purpose |
|---|---|---|
| `GET` | `/umbraco/contentpackages/api/v1/packages` | List packages and asset health |
| `POST` | `/umbraco/contentpackages/api/v1/packages/scan` | Rescan the root |
| `GET` | `/umbraco/contentpackages/api/v1/leads` | Leads, status, download counts |
| `POST` | `/umbraco/contentpackages/api/v1/leads/{id}/revoke` | Kill a lead's links |
| `POST` | `/umbraco/contentpackages/api/v1/leads/{id}/resend` | Re-send the welcome email |

## Security

- **Enumeration.** `subscribe` returns the same `pending` response for a new address, a
  known address, and a rejected one. Otherwise the endpoint becomes an oracle for whether
  an address is on the list.
- **Rate limiting.** Per-IP and per-email throttle on `subscribe` and `confirm`, so the
  endpoint cannot be used to mail-bomb a third party.
- **Path traversal.** `slug` and `kind` are resolved against the scanned catalogue only.
  No user-supplied string is ever concatenated into a file path.
- **Constant-time comparison** for both token types.
- **Signing key** is a secret, held in user-secrets or the environment.
- Personal data is limited to email, optional name, and request metadata. Leads are
  deletable from the backoffice for erasure requests.

## Success criteria

1. A visitor completes signup → confirm → download for all four kinds.
2. A tampered or expired signature returns 403 and is not served.
3. A revoked lead's links stop working immediately.
4. Dropping a second folder and clicking scan publishes it with no code change.
5. A folder with a missing or duplicated asset is reported, not silently half-published.

## Open questions

1. **Article surface.** Does the front end get an Umbraco Document Type
   (`contentPackageArticle`) with a picker, or is a package rendered by a route-hijacked
   controller only? Affects whether editors can add copy around the download block.
2. **Newsletter list.** One shared list, or one list per package? Per package gives
   cleaner segmentation but multiplies list admin.
3. **Localisation.** Content is English-only today; BR is a stated market. Does a package
   need per-culture variants (`/pt-br/...`) in v1?
