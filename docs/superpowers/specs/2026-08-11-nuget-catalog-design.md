# NuGet Catalog — design

A backoffice dashboard listing the packages a publisher has on nuget.org, with download
counts, latest version and a short summary. Built for Umbraco 17.

## Why

There is no view of the published catalog from inside Umbraco. Answering "what have we
shipped, what version is live, is anyone downloading it" means opening nuget.org and
searching. With ~115 packages under one owner that is tedious enough that nobody does it,
which is how three packages ended up with an Umbraco 8 build as their newest listed
version without anyone noticing.

## Scope

Lists the union of:

1. **Owner-sourced** — every package under the configured owner accounts
   (`owner:splatdev`), from the NuGet Search API.
2. **Explicitly added** — packages added through the UI by pasting a nuget.org URL or a
   bare package id. Covers packages outside the owner account.

Minus any package the user has hidden.

Not in scope: per-version download charts, dependency graphs, publishing or unlisting
actions. This reads nuget.org; it does not write to it.

## Target

`net10.0` only — Umbraco 17. The repo convention is to multi-target `net8.0;net10.0`, and
this deliberately does not: the UI is Lit 3, and supporting Umbraco 13 means a second
AngularJS bundle for a dashboard that is a convenience, not a dependency. Revisit if
someone actually wants it on 13.

## Data source

The NuGet Search API, unauthenticated:

```
GET https://azuresearch-usnc.nuget.org/query?q=owner:<owner>&take=<n>&prerelease=true
GET https://azuresearch-usnc.nuget.org/query?q=packageid:<id>&prerelease=true
```

One response carries everything needed: `id`, `version` (latest), `totalDownloads`,
`description`, `summary`, `title`, `iconUrl`, `projectUrl`, `deprecation`,
`vulnerabilities`. Measured at ~1s for 100 results.

Two known characteristics, both designed around rather than fought:

- **Eventually consistent.** A package published minutes ago reads 0 downloads and may
  report a stale latest version. The UI timestamps its data instead of implying it is live.
- **`description` is frequently thin or empty.** Truncating it blindly gives blank rows,
  so the summary falls back `summary` → `description` → `title` → `—`.

## Components

| Unit | Responsibility |
|---|---|
| `NuGetSearchClient` | One typed `HttpClient` against the Search API. Knows the query shapes and the response contract, nothing about Umbraco. |
| `CatalogStore` | Reads and writes the JSON settings file. Owns owners / added / hidden. |
| `CatalogService` | Composes store + client, applies hiding and truncation, owns the cache. The only thing the controller talks to. |
| `NuGetCatalogController` | Backoffice API. Auth-gated, thin. |
| `nuget-catalog.element.ts` | Lit 3 dashboard. |

## Views

The dashboard has two tabs.

**Packages** — the catalog itself: one row per package with id, latest version, download
count and the truncated summary, sorted by downloads. Each row links out to nuget.org and
carries a hide control. A `Hidden (n)` filter reveals hidden rows with a restore control.

**Manage** — the settings behind that list, kept off the reading view so the common case
stays a clean table:

- owner accounts to source from, added and removed
- packages added explicitly, with the paste-a-URL field
- everything currently hidden, with restore

Splitting them means the list stays scannable at 115 rows, and the destructive-ish
controls (removing an owner drops dozens of rows at once) are not one mis-click away from
someone who only wanted to read download counts.

## Storage

A single JSON file at `umbraco/Data/nuget-catalog.json`:

```json
{
  "owners": ["splatdev"],
  "added":  ["Umbraco.Cms"],
  "hidden": ["SplatDev.Umbraco.Plugins.AdPreview"]
}
```

Seeded from `SplatDev:NuGetCatalog` configuration on first run, then owned by the UI.
Config remains the way to ship a default set; the file is what the UI edits.

A flat file rather than a database: this is three lists of strings. A sidecar EF context
and a migration would be more machinery than the feature earns.

**Added packages are stored as an id, not a URL.** `https://www.nuget.org/packages/
Umbraco.Cms/17.3.4` is parsed down to `Umbraco.Cms`, so version segments, trailing
slashes and query strings all converge on the same entry and cannot double-add.

## Caching

`IMemoryCache`, 1 hour TTL, keyed on the resolved owner+added set. The dashboard renders
from cache and shows how old it is ("refreshed 4m ago"); an explicit Refresh bypasses it.

Nothing calls nuget.org on page load once warm. Hidden packages are still refreshed, so
unhiding one does not reveal stale numbers.

## Visibility

Hiding is per-site, not per-user: this is a settings dashboard, and which packages belong
in the catalog is an editorial decision rather than a personal preference.

Hidden packages leave the main list but remain visible behind a `Hidden (n)` filter, with
a restore control. A row that silently vanishes is worse than one visibly hidden —
particularly at 115 rows, where the alternative is wondering whether it failed to load.

## Failure behaviour

- nuget.org unreachable **with** a warm cache → serve the cache, show a warning banner.
- nuget.org unreachable **with no** cache → empty state naming the error, plus Retry.
- Malformed settings file → log, fall back to config defaults, keep running.

None of this throws from a composer. Today's estate work established the rule the hard
way: an exception during composition fails application startup and takes the whole site
down, backoffice included. A catalog that cannot reach nuget.org is a broken panel.

## API

| Method | Route | Purpose |
|---|---|---|
| `GET` | `/umbraco/nuget-catalog/api/v1/packages` | Cached catalog + `refreshedUtc` |
| `POST` | `/umbraco/nuget-catalog/api/v1/refresh` | Bypass cache, refetch |
| `POST` | `/umbraco/nuget-catalog/api/v1/packages` | Add by URL or id |
| `DELETE` | `/umbraco/nuget-catalog/api/v1/packages/{id}` | Remove an added package |
| `POST` | `/umbraco/nuget-catalog/api/v1/hidden/{id}` | Hide |
| `DELETE` | `/umbraco/nuget-catalog/api/v1/hidden/{id}` | Unhide |

All gated by `AuthorizationPolicies.BackOfficeAccess`.

## Testing

Unit tests, no network:

- URL → id parsing: full URL, URL with version, trailing slash, query string, bare id,
  rubbish input.
- Summary truncation: exactly 50, over 50 (ellipsis, no mid-word break at the boundary),
  under 50 (unchanged), empty description falling through the chain, all-empty → `—`.
- Hiding: hidden ids excluded from the list, still present in the hidden set.
- Store: missing file, malformed file, round-trip.

The Search API itself is covered by an `Integration`-tagged test, excluded from CI in
line with the rest of the repo.
