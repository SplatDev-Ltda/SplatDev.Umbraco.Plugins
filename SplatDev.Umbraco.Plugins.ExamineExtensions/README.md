# ExamineExtensions

Examine search extensions for Umbraco — query helpers, index inspection, and rebuild management via a backoffice dashboard.


<!-- screenshot:start -->
<!-- screenshot:end -->

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Plugins.ExamineExtensions.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.ExamineExtensions)

## Compatibility

| Umbraco | .NET | Package Version |
|---------|------|-----------------|
| 13.x    | 8.0  | 1.2.5           |
| 17.x    | 10.0 | 1.2.5           |

## Installation

```sh
dotnet add package SplatDev.Umbraco.Plugins.ExamineExtensions
```

## Quick Start

The plugin auto-registers via `PluginComposer`. Inject `IExamineExtensionsService` where needed:

```csharp
public class SearchController : SurfaceController
{
    private readonly IExamineExtensionsService _examine;

    public SearchController(IExamineExtensionsService examine)
    {
        _examine = examine;
    }
}
```

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/umbraco/api/examineextensions/GetIndexes` | List available Examine indexes |
| POST | `/umbraco/api/examineextensions/Search` | Search across indexes with query and pagination |
| POST | `/umbraco/api/examineextensions/RebuildIndex` | Trigger a full index rebuild |

## Usage

Search query body:

```json
{
    "query": "search term",
    "page": 1,
    "pageSize": 20
}
```

The dashboard provides a UI for browsing indexes, running searches, and triggering rebuilds directly from the Umbraco backoffice.

## Known Limitations

- Search wraps Examine's `ManagedQuery`/`GroupedOr` with basic pagination only — no advanced query DSL, filters, or sorting
- `RebuildIndex` performs a full index recreation (`CreateIndex()`) rather than an incremental rebuild
- No caching of search results; every call queries the index directly
- No authorization on API endpoints

## Changelog

### 1.2.5 — 2026-08-26

Fixes a duplicate registration on sites that still have a physical App_Plugins folder for this plugin, left behind by an older release that copied content into the site. Umbraco registered those extensions twice - once from its own scan of the folder, once from this package's embedded manifest - and logged "Extension with alias ... is already registered". The embedded manifest now yields to the physical copy.

### 1.2.4 — 2026-08-24

Removes a dashboard screenshot that showed an error toast. It was captured against a site where this plugin's API was unreachable, so it advertised a broken dashboard. No screenshot is better than a misleading one; a replacement will be taken against a working install.

### 1.2.3 — 2026-08-24

Package metadata only: the listing now carries an icon and search tags, and the project and repository links point at the organisation that actually hosts this code. No code changes.

### 1.2.2 — 2026-08-21
- Dashboard now sends the backoffice token with its API calls. On Umbraco 17 those calls were arriving unauthenticated and coming back 401, which the dashboard rendered as an empty state rather than an error.
- A failed request now raises a notification instead of leaving the dashboard looking like there is simply no data.

## License

MIT © [SplatDev](https://github.com/SplatDev-Ltda)

## Architecture

This is a **headless library** — no standalone backoffice dashboard or property editors. It extends Umbraco's built-in Examine backoffice UI with additional API endpoints and index features, operating as a DI-registered service.