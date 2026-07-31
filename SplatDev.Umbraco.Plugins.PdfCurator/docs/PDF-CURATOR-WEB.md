# PDF Curator Web — Phase 2 Specification

**Date:** 2026-07-30 · **Status:** Approved (scope decisions confirmed by Carlos)
**Builds on:** `PDF-CURATOR-V2.md` Phase 1 (shipped) — same Core, new heads.
**Wireframes:** `../wireframes/2026-07-30-*.md` (app shell, library browser, review queue, dashboard, admin)

## Decisions (locked)

| Decision | Choice |
|---|---|
| V1 scope | Everything: library browser, review queue, dashboards, admin (categories/settings/reports), user management |
| API | REST `/api/v1` now; GraphQL (HotChocolate) in v1.1 once the REST contract settles |
| Umbraco 17 | Dedicated backoffice **section** ("Book Library") |
| Standalone auth | ASP.NET Core Identity, roles `Admin` + `Viewer` |

## The pluggability contract (the point of this phase)

One rule drives everything: **the UI is framework-free Lit web components and
the server is a Razor Class Library; every host is thin.**

### Package layout

```
PdfCurator.Core        (exists)   pipeline, catalog, classifier — no HTTP, no UI
PdfCurator.Web         (RCL)      API controllers + SSE + static web assets:
                                  _content/PdfCurator.Web/pdfc.js  (all components, ESM)
                                  _content/PdfCurator.Web/pdfc.css (tokens + resets only)
PdfCurator.Standalone  (host)     ASP.NET Core app: Identity, shell page, Docker
PdfCurator.Umbraco     (add-on)   umbraco-package.json + section wrappers + auth adapter
```

### Embedding in ANY ASP.NET Core app (the general case)

```csharp
builder.Services.AddPdfCurator(o => o.Root = "/mnt/ebooks");   // Core + catalog
builder.Services.AddPdfCuratorWeb();                            // API + assets
app.MapPdfCuratorApi("/api/v1/curator");                        // mount anywhere
```

```html
<script type="module" src="/_content/PdfCurator.Web/pdfc.js"></script>
<pdfc-app api-base="/api/v1/curator"></pdfc-app>   <!-- or any single component -->
```

- Components never assume a URL: `api-base` attribute (or
  `window.pdfCurator.configure({...})`) sets the endpoint.
- Auth is the **host's** job: components send whatever the pluggable
  `AuthAdapter` provides (`credentials: include` cookie default; bearer-token
  adapter available). Server side, all endpoints require policies
  `PdfCurator.View` / `PdfCurator.Admin` — the host maps those policies to its
  own auth (Identity roles, Umbraco backoffice user, anything).
- Theming via `--pdfc-*` CSS custom properties only; styles are shadow-DOM
  scoped, Tailwind is a build-time tool and never leaks class names or a
  global stylesheet into the host page.
- Every component works standalone (`<pdfc-library-browser>` alone in a page
  is a valid integration), `<pdfc-app>` bundles shell + router.

### Umbraco 17 flavor

- `PdfCurator.Umbraco` ships the RCL assets + `umbraco-package.json`
  registering a `section` (alias `PdfCurator.Section`) with menu items
  Dashboard / Library / Review / Reports, each a thin Lit wrapper placing the
  corresponding `pdfc-*` component inside `uui-box` chrome.
- Auth adapter uses the backoffice session; `PdfCurator.Admin` policy maps to
  backoffice admin group, `PdfCurator.View` to section access.
- Token bridge maps `--pdfc-*` to `--uui-*` so the section looks native.
- No Users/Settings pages in Umbraco (backoffice + appsettings own those).

## REST API surface (`/api/v1`, Problem Details, paginated lists)

| Endpoint | Purpose |
|---|---|
| `GET  /books?query=&category=&language=&sort=&page=&pageSize=` | browse/search (paged, total count) |
| `GET  /books/{id}` · `GET /books/{id}/thumbnail` · `GET /books/{id}/file` | detail, thumb (cacheable), streamed PDF (range requests) |
| `POST /books/{id}/actions` | admin recategorize/rename → creates single-action batch |
| `GET  /batches` · `GET /batches/{id}` (paged actions, `?filter=suspect`) | review queue |
| `PATCH /batches/{id}/actions/{actionId}` | inline edit (type/category/title/author/ptbr → server recomputes destination) |
| `POST /batches/{id}/approve` · `POST /batches/{id}/execute` | the gate; execute returns 202 + progress channel |
| `POST /scans` (`{mode, fresh, ocr}`) · `GET /scans/current` | start/observe scans |
| `GET  /events` (SSE) | scan/execute progress, batch changes → live UI |
| `POST /uploads` (multipart) | drop-zone → Incoming/ + auto-scan |
| `GET  /stats/overview` · `GET /stats/categories` · `GET /stats/timeline` | dashboard |
| `GET  /reports/duplicates` · `GET /reports/audit` | maintenance reports |
| `GET/PUT /admin/categories` (+ `POST /admin/categories/test`, `/preview`) | ruleset editor with live scoring + impact preview |
| `GET/PUT /admin/settings` | standalone settings |
| Identity endpoints (standalone only) | login/logout/users CRUD (Admin) |

**Suspect flag** (server-computed per action, drives the review UI): junk-title
regex hit, fallback category, best-score < 2, title==author, title < 8 chars,
or corrupt. The UI's default review filter — encodes the "review the suspicious
5%, not all 664" lesson.

## Components inventory

`pdfc-app` (shell+router) · `pdfc-library-browser` · `pdfc-book-detail` ·
`pdfc-review-queue` · `pdfc-batch-review` (virtualized, keyboard-first) ·
`pdfc-dashboard` · `pdfc-admin-categories` · `pdfc-admin-users` ·
`pdfc-admin-settings` · `pdfc-reports` · `pdfc-upload-zone` ·
shared: `pdfc-thumb` (lazy), `pdfc-progress` (SSE), `pdfc-chart` (Chart.js wrap).

## Cross-cutting requirements

- **i18n**: en + es for every component string (lightweight runtime dictionary,
  `lang` attribute/host locale; standalone toggle, Umbraco follows backoffice
  language). Server messages already localized via resx.
- **A11y**: WCAG AA; full keyboard operation (review queue especially); ARIA
  roles on grid/table/dialog; focus management in drawers; visible focus rings.
- **TypeScript strict**, typed API client generated from the OpenAPI document
  (Swashbuckle emits it; client generation in the build).
- **Charts**: Chart.js 4 project-wide → documented in `docs/technical/CHARTS.md`.
- **Performance**: thumbnail lazy-load + virtualized grids (library and batch
  tables routinely exceed 600 rows); SSE not polling; HTTP caching on
  thumbnails (ETag = sha).
- **Safety invariants surface in UI copy**: nothing deletes, execute needs an
  approved batch, duplicate resolution creates a reviewable batch.

## Docker (standalone)

Compose: `curator-web` (standalone host; the SQLite catalog + library mount as
volumes) + optional `mssql` when `Provider=SqlServer` (the Phase-2 EF target for
multi-user). Health checks on `/health`. Backend/frontend version pinned
together (single assembly — the RCL guarantees it).

## Acceptance

1. A blank ASP.NET Core template turns into a working curator UI with the
   3-line embed above (demonstrated in an integration sample project).
2. Standalone: login (Admin/Viewer), full workflow browse→scan→review→execute
   →index from the browser only, on the real library, mobile-usable.
3. Umbraco 17 site with `PdfCurator.Umbraco` installed shows the Book Library
   section, functional end-to-end, styled native, no console errors.
4. Review queue handles a 664-action batch fluidly (virtualized, keyboard
   operable), suspect filter present, inline edits recompute destinations.
5. Both locales complete; axe-core clean on every view; Lighthouse a11y ≥ 95.
6. CI builds the front-end (vite) + backend, runs unit + Playwright E2E
   (standalone host with seeded catalog).
```
