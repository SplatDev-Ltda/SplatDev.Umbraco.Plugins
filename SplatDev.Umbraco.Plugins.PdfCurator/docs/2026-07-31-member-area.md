# Wireframe — Member Area (Umbraco plugin, front-of-site)

Member-facing components (`<pdfc-member-*>`) rendered on the host site's own
pages via a starter Razor partial. Umbraco **Members** cookie auth (not
backoffice). All views theme through `--pdfc-*` tokens to match the host site.

## Library page (`<pdfc-member-library>`, members-only)

```
┌─ host site chrome (its own header/nav) ─────────────────────────────────┐
│                                                                          │
│  My Library                                    👤 maria@… · ⭐ Favorites │
│  [Search title/author…            🔍]  Category ▾   Sort: Recent ▾      │
│ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐       │
│ │ [cover]│ │ [cover]│ │ [cover]│ │ [cover]│ │ [cover]│ │ [cover]│       │
│ │      ⭐│ │        │ │      ⭐│ │  PT-BR │ │        │ │        │       │
│ ├────────┤ ├────────┤ ├────────┤ ├────────┤ ├────────┤ ├────────┤       │
│ │Clean   │ │Design  │ │Sapiens │ │Dom     │ │SQL Anti│ │ …      │       │
│ │Code    │ │Patterns│ │        │ │Casmurro│ │patterns│ │        │       │
│ │▶ p.212 │ │        │ │        │ │        │ │        │ │        │       │
│ └────────┘ └────────┘ └────────┘ └────────┘ └────────┘ └────────┘       │
│                     ‹ 1 2 3 … ›                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

- ⭐ = favorited (toggle on hover/tap); `▶ p.212` = reading-progress badge
  ("continue reading"). Card click → book page.
- Anonymous visitors hitting the page see the host's member-login redirect
  (starter partial handles it); the API returns 401 for non-members.
- Group scoping (optional, config): categories a member's groups can't access
  are absent from filters and results entirely — not shown-but-locked.

## Book page (`<pdfc-member-book>`)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ ┌─────────┐  Clean Code — A Handbook of Agile Software Craftsmanship     │
│ │  cover  │  Robert C. Martin · Technology - Programming · 464 pages     │
│ │         │                                                              │
│ └─────────┘  [▶ Continue reading  p.212]  [⬇ Download]  [☆ Favorite]    │
│                                                                          │
│  You may also like                                                       │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                            │
│  │cover │ │cover │ │cover │ │cover │ │cover │   ← similar-books rail:    │
│  │Refact│ │Prag  │ │TDD by│ │Clean │ │Working│     same category/author, │
│  │oring │ │Prog  │ │Examp │ │Arch  │ │Legacy │     title-token overlap   │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘                            │
└──────────────────────────────────────────────────────────────────────────┘
```

- Primary button reads "Read" (never opened) / "Continue reading p.N".
- Download streams the PDF (range requests; member-authorized).

## Reader (`<pdfc-reader>`, full-viewport overlay)

```
┌─ ✕ Close ── Clean Code ─────────────────── p. 212 / 464 ── ⭐ ── ⬇ ─────┐
│                                                                          │
│                    ┌───────────────────────────┐                         │
│                    │                           │                         │
│                    │      rendered page        │  ← PDF.js canvas,       │
│                    │        (fit width)        │    lazy-loaded module   │
│                    │                           │    (not in pdfc.js core)│
│                    └───────────────────────────┘                         │
│                                                                          │
│   ‹ prev        [ 212 ] / 464        next ›          − zoom + │ fit ▾    │
└──────────────────────────────────────────────────────────────────────────┘
```

- Progress saved per member per book (debounced) → powers "Continue reading".
- Keyboard: ←/→ pages, +/− zoom, Esc close. Touch: swipe pages.
- Reader module lazy-loads only when opened (keeps the core bundle small).

## Favorites page (`<pdfc-member-favorites>`)

Same grid as the library, filtered to the member's favorites, with a
"Reading now" section on top (books with progress, most recent first).

## Starter template (shipped Razor partial)

```razor
@* ~/Views/Partials/PdfCuratorLibrary.cshtml — drop into any template *@
@if (Context.User?.Identity?.IsAuthenticated != true) { /* redirect to member login */ }
<script type="module" src="/App_Plugins/PdfCurator/dist/member.js"></script>
<pdfc-member-library api-base="/umbraco/pdfcurator/api/v1/member"></pdfc-member-library>
```
