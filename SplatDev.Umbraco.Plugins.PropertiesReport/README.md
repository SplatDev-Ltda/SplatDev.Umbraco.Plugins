# PropertiesReport

Document type properties report for Umbraco — generate a comprehensive report of all properties across content types with a backoffice dashboard.

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Plugins.PropertiesReport.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.PropertiesReport)

## Compatibility

| Umbraco | .NET | Package Version |
|---------|------|-----------------|
| 13.x    | 8.0  | 2.0.0           |
| 17.x    | 10.0 | 2.0.0           |

## Installation

```sh
dotnet add package SplatDev.Umbraco.Plugins.PropertiesReport
```

## Quick Start

The plugin auto-registers via `PropertiesReportComposer`. Inject `IPropertiesReportService` or use the API.

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/umbraco/api/propertiesreport/GetReport` | Full report of all content types and their properties |
| GET | `/umbraco/api/propertiesreport/GetByContentType?alias=` | Filter report by content type alias |

## Usage

Access the Properties Report dashboard from the Umbraco backoffice to view a table of all document types and their properties, including data types, groups, tabs, and validation rules. Use the content type filter to narrow results.

Programmatic access:

```csharp
var report = _propertiesReportService.GetReport();
var contentTypeReport = _propertiesReportService.GetByContentType("article");
```

## Known Limitations

- Read-only report — no editing, export (CSV/Excel), or bulk operations
- No caching; iterates all content types on every request
- Unordered property scan (O(n*m) complexity across groups)

## License

MIT © [SplatDev](https://github.com/SplatDev-Ltda)
