# ExamineExtensions

Examine search extensions for Umbraco — query helpers, index inspection, and rebuild management via a backoffice dashboard.

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Plugins.ExamineExtensions.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.ExamineExtensions)

## Compatibility

| Umbraco | .NET | Package Version |
|---------|------|-----------------|
| 13.x    | 8.0  | 2.0.0           |
| 17.x    | 10.0 | 2.0.0           |

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

## License

MIT © [SplatDev](https://github.com/SplatDev-Ltda)
