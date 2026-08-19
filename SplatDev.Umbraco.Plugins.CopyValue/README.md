# UmbracoCms.Plugins.CopyValue

Copy property values between Umbraco content nodes — bulk copy, property mapping between different document types, with reusable mapping templates.


<!-- screenshot:start -->

![CopyValue dashboard](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.CopyValue/docs/screenshots/01-dashboard.png)

<!-- screenshot:end -->

## Supports

- Umbraco 13 (net8.0)
- Umbraco 17 (net10.0)

## Features

- Define reusable mapping templates (stored in EF Core `copyvalue` schema)
- Map properties between same or different document types
- Execute single-pair or bulk copy operations via the backoffice or REST API
- Optional publish-after-copy support
- Lit 3 dashboard for Umbraco 17, AngularJS dashboard for Umbraco 13
- `CopyValueViewComponent` for rendering mapping templates in Razor views

## Installation

Add the NuGet package. The `CopyValueComposer` registers `CopyValueDbContext` and `ICopyValueService`.

Run EF Core migrations:

```bash
dotnet ef migrations add InitialCopyValue --context CopyValueDbContext
dotnet ef database update --context CopyValueDbContext
```

## Usage in Code

```csharp
// Direct property copy with explicit mappings
var mappings = new[]
{
    new PropertyMapping { Source = "pageTitle", Target = "headline" },
    new PropertyMapping { Source = "bodyText",  Target = "content"  },
};
await _copyValueService.CopyPropertiesAsync(sourceId, targetId, mappings, publish: true);

// Bulk copy using a saved template
var pairs = new[] { (sourceId1, targetId1), (sourceId2, targetId2) };
int count = await _copyValueService.BulkCopyAsync(mappingId, pairs, publish: false);
```

## REST API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/umbraco/api/copyvalue/GetMappings` | List all mapping templates |
| GET | `/umbraco/api/copyvalue/GetMapping?id=1` | Get a single mapping |
| POST | `/umbraco/api/copyvalue/SaveMapping` | Create or update a mapping |
| DELETE | `/umbraco/api/copyvalue/DeleteMapping?id=1` | Delete a mapping |
| POST | `/umbraco/api/copyvalue/CopyProperties` | Execute a single copy operation |
| POST | `/umbraco/api/copyvalue/BulkCopy` | Execute a bulk copy using a template |

### CopyProperties request body

```json
{
  "sourceContentId": 1234,
  "targetContentId": 5678,
  "mappings": [
    { "source": "pageTitle", "target": "headline" }
  ],
  "publish": false
}
```

### BulkCopy request body

```json
{
  "mappingId": 1,
  "pairs": [
    { "sourceId": 1234, "targetId": 5678 },
    { "sourceId": 1235, "targetId": 5679 }
  ],
  "publish": false
}
```