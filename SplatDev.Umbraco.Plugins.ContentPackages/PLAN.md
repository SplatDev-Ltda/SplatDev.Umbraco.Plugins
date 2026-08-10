# SplatDev.Umbraco.Plugins.ContentPackages — Implementation plan

Companion to [SPEC.md](SPEC.md). Phases are ordered so each one is independently
verifiable and leaves the plugin in a working state.

## Phase 0 — Skeleton ✅ done

Project structure, options, models, catalogue scanner, token service, controller
signatures, DI wiring, spec and plan. Compiles on net8.0 and net10.0.

What is deliberately **not** implemented yet is marked `TODO(CP-n)` in source.

## Phase 1 — Catalogue

**Goal:** the backoffice can see `E:\Entrepreneurship` as a valid package.

1. `PackageCatalog.Scan()` — enumerate subfolders, classify by extension, write
   `package.json` when absent, derive title from the markdown H1 when absent.
2. Report per package: `Ok`, `MissingAsset`, `Ambiguous` (two files of one kind).
3. Cache the result in `IMemoryCache`; invalidate on scan.
4. Backoffice `GET /packages` + `POST /packages/scan`.

**Verify:** scan the real folder, get one `Ok` package with four assets. Add a second PDF,
rescan, get `Ambiguous` — not a silent pick.

**Risk:** the root is a Windows path used from a Linux container in some environments.
Normalise and fail loudly at startup if the root is unreadable.

## Phase 2 — Tokens

**Goal:** links can be minted and verified without a database round trip for forgeries.

1. `DownloadTokenService.Issue(leadPublicId, slug, kind)` / `Validate(...)`.
2. Constant-time signature compare; validate in the cheap-first order from the spec.
3. Unit tests: valid, tampered payload, tampered signature, expired, wrong kind, wrong
   slug, missing key.

**Verify:** tests green. This is the security core — it lands before anything is exposed.

## Phase 3 — Leads and double opt-in

**Goal:** the signup → confirm state machine works, with no email yet.

1. EF Core SQLite sidecar (`contentPackageLead`, `contentPackageDownload`), schema on
   `UmbracoApplicationStartingNotification`, same pattern as the WhatsApp plugin.
2. `POST /subscribe` → `Pending` + confirm token hash. Uniform response always.
3. `GET /package/confirm` → `Confirmed`, single-use token, then
   `INewsletterService.Subscribe(NewsletterListId, email, name)`.

> **Note.** Double opt-in does **not** exist in the Newsletter plugin today —
> `INewsletterService.Subscribe` writes an active subscriber immediately and `Subscriber`
> carries only an `Active` bool, with no status column. The `SubscriberStatus` and
> `OptInPolicy` enums in `SplatDev.Messaging.Newsletter` are unused by it.
> This plugin therefore owns the pending state and only calls `Subscribe` **after**
> confirmation. Pushing opt-in down into the Newsletter plugin is the cleaner long-term
> fix but changes shared behaviour, so it is proposed separately rather than assumed here.

**Verify:** integration test drives subscribe → confirm → subscriber row exists. Re-using a
confirm token fails.

## Phase 4 — Email

**Goal:** the two emails actually send.

1. Templates via `IEmailTemplateService`: `contentpackage-confirm`, `contentpackage-welcome`.
2. Welcome email renders four absolute links built from `PublicBaseUrl`.
3. Send through the configured `SplatDev.Messaging` provider.
4. Plain-text alternative for both — a lead magnet that only renders in HTML looks like spam.

**Verify:** send to a real inbox; confirm links work from the email client, not just curl.

**Risk:** link rewriting by security scanners can pre-fetch links and burn a single-use
confirm token. Make confirm idempotent within its TTL — a second click of a *valid,
unexpired* token should succeed rather than error.

## Phase 5 — Delivery

**Goal:** assets are served correctly.

1. `GET /package/{slug}/{kind}` — validate, log the hit, increment the counter.
2. `html` inline; `pdf`/`pptx`/`markdown` as attachments with correct content types
   (`application/pdf`, `application/vnd.openxmlformats-officedocument.presentationml.presentation`,
   `text/markdown`).
3. Stream from disk; never buffer a 2.4 MB file into memory per request.
4. Support HTTP range requests so a large PDF resumes.

**Verify:** all four kinds download and open. Tampered token → 403. Expired → 403 with a
"request a fresh link" page rather than a raw error.

## Phase 6 — Backoffice UI

**Goal:** editors manage this without touching the server.

Lit 3 section, built the same way as the WhatsApp plugin (UUI components, `--uui-*`
tokens, `UMB_AUTH_CONTEXT` for auth):

- **Packages** — catalogue health, scan button
- **Leads** — status, download counts, revoke, resend
- **Settings** — read-only config with warnings for anything unset

**Verify:** renders in a real backoffice, light and dark.

## Phase 7 — Front end

**Goal:** an article page a visitor can actually use.

1. Document Type `contentPackageArticle` with a package picker (**pending open question 1**).
2. Signup partial + thank-you state.
3. Reading view for the HTML asset.

## Phase 8 — Hardening

1. Rate limiting on `subscribe` and `confirm`.
2. Lead deletion for erasure requests.
3. README, `umbraco-marketplace.json`, screenshots.
4. Add to `SplatDev.Core.sln`; confirm it survives the CI plugin filter in
   `build.yml` / `publish.yml`.

## Sequencing

Phase 2 before any public endpoint exists. Phase 5 must not ship before Phase 2 is tested —
that ordering is the whole security model.

Phases 1–5 are the minimum for the Entrepreneurship package to go live; 6–8 make it
maintainable by someone other than the author.

## Test strategy

| Layer | Coverage |
|---|---|
| Unit | Token issue/validate (all failure modes), catalogue classification, slug/kind resolution rejecting traversal |
| Integration | subscribe → confirm → download, against a temp root and in-memory store |
| Manual | Real inbox delivery; all four assets open in their native applications |

## Open questions blocking later phases

Carried from the spec — none block Phases 1–5.

1. Document Type vs route hijacking (blocks Phase 7)
2. One newsletter list or one per package (blocks Phase 3 config)
3. Per-culture package variants for BR (blocks Phase 7)
