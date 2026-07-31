# PDF Curator — Member Area Specification (Umbraco plugin Phase B)

**Date:** 2026-07-31 · **Status:** Approved (scope decisions confirmed by Carlos)
**Part of:** the Umbraco plugin (`SplatDev.Umbraco.Plugins.PdfCurator`), building on the merged Phase A section skeleton and `PDF-CURATOR-WEB.md`.
**Wireframes:** `../wireframes/2026-07-31-member-area.md`

## Decisions (locked)

| Decision | Choice |
|---|---|
| Access | **Members-only** (Umbraco Members login) for the whole area; every member sees all books. **Optional group scoping** via configuration (off by default): categories mapped to member groups; unmapped categories visible to all members. No admin UI for the mapping in v1 — `appsettings` only. |
| Reading | **Embedded reader**: PDF.js-based `<pdfc-reader>` with page nav, zoom, keyboard/touch, and per-member reading progress ("Continue reading p.N"). Reader module lazy-loads. |
| "Suggest more" | **Similar-books recommendations** ("You may also like" rail on the book page). Heuristic, server-computed: same category + same author + title-token overlap scoring. No request-a-book form in v1. |
| Surface | **Components + starter template**: `<pdfc-member-*>` web components + members API shipped by the plugin, plus one Razor partial so any theme adds a Library page in minutes. No doc-type scaffolding. |

## Features (member-facing)

Browse all books (grid, thumbnails, PT-BR/volume badges) · full-text search on
title/author · category filter + sort (recent/title/author) · book page with
metadata · **read** (embedded reader, progress persisted) · **download**
(range-request streaming) · **preview** (cover + first-page thumbnail on the
card/detail — no reader needed) · **favorite** (toggle, favorites page with a
"Reading now" section) · **similar books** rail.

## Architecture

- **Same plugin, new surface.** Member API controllers live beside the Phase A
  ping controller: route prefix `/umbraco/pdfcurator/api/v1/member/*`, secured
  with Umbraco **Members** auth (member-authorize filter — 401 JSON for
  anonymous API calls, never a redirect). The backoffice section remains
  backoffice-auth; the two never share endpoints.
- **Catalog access**: the plugin consumes `PdfCurator.Core` as a NuGet package
  (published from the pdf-curator repo's CI to GitHub Packages) — the same
  catalog the CLI/Web maintain. Config: `PdfCurator:LibraryRoot` +
  `ConnectionStrings:CuratorDb`. Read-only from the member area.
- **Member data** (plugin-owned tables via Umbraco `MigrationPlan`):
  - `pdfCuratorFavorite` (memberKey, bookId, createdAt; PK memberKey+bookId)
  - `pdfCuratorProgress` (memberKey, bookId, page, pageCount, updatedAt)
- **Similar books**: `GET member/books/{id}/similar` — score = 3×same-author +
  2×same-category + title-token Jaccard; top 5, computed with one indexed query
  + in-memory scoring; response cached (in-memory, 10 min TTL).
- **Group scoping**: `PdfCurator:MemberGroupScopes` config —
  `{ "Technology - Programming": ["Developers"], … }`. Applied server-side to
  every list/detail/file endpoint (absence, not 403, for unlisted books).
- **Components** (built in the plugin's `client/`, separate `member.js` entry
  so the public bundle excludes backoffice code; reader chunk lazy-loaded):
  `pdfc-member-library`, `pdfc-member-book`, `pdfc-member-favorites`,
  `pdfc-reader`. Tokens `--pdfc-*` inherit the host site's theme.
- **Starter template**: `Views/Partials/PdfCuratorLibrary.cshtml` shipped as
  content; README shows the 3-line embed + member-login redirect pattern.

## API surface (`/umbraco/pdfcurator/api/v1/member`)

| Endpoint | Purpose |
|---|---|
| `GET /books` (query, category, sort, page) | member browse/search (scoped) |
| `GET /books/{id}` · `/thumbnail` · `/file` | detail, cover, ranged stream (download + reader) |
| `GET /books/{id}/similar` | recommendations rail |
| `PUT/DELETE /favorites/{bookId}` · `GET /favorites` | favorite toggle + list |
| `PUT /progress/{bookId}` `{page}` · `GET /progress` | reading progress (debounced client-side) |

All JSON errors as Problem Details; anonymous → 401; scoped-out book → 404.

## Cross-cutting

i18n en+es for every string · WCAG AA (reader fully keyboard operable; focus
trap in the overlay; alt text from titles) · thumbnails ETag-cached · no
telemetry beyond progress/favorites · nothing writes to the library filesystem.

## Acceptance

1. On a member-enabled Umbraco 17 site (stg1-staging + a test member): login →
   Library page renders the full seeded catalog; search/filter work; anonymous
   API calls return 401 JSON and the page redirects to member login.
2. Reader opens in-page, paginates a 400+ page PDF smoothly, remembers the
   page across sessions; "Continue reading" appears on library + book pages.
3. Favorite toggle persists; favorites page lists favorites + "Reading now".
4. Similar rail shows sane neighbors for a Technology book (same
   category/author present in top 5).
5. With `MemberGroupScopes` configured, a member outside the group neither
   sees nor can fetch (404) scoped books; with it absent, everything visible.
6. `member.js` < 80 KB gz without the reader chunk; axe-core clean; en+es.
