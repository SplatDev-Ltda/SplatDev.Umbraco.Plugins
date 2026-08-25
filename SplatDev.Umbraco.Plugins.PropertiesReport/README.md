# PropertiesReport

Document type properties report for Umbraco — generate a comprehensive report of all properties across content types with a backoffice dashboard.


<!-- screenshot:start -->

![PropertiesReport dashboard](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.PropertiesReport/docs/screenshots/01-dashboard.png)

<!-- screenshot:end -->

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Plugins.PropertiesReport.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.PropertiesReport)

## Compatibility

| Umbraco | .NET | Package Version |
|---------|------|-----------------|
| 13.x    | 8.0  | 2.3.1           |
| 17.x    | 10.0 | 2.3.1           |

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

## Changelog

### 2.3.1 — 2026-08-24

Package metadata only: the listing now carries an icon and search tags, and the project and repository links point at the organisation that actually hosts this code. No code changes.

### 2.3.0 — 2026-08-23

The Umbraco Marketplace listing now carries this plugin's screenshots. The listing keeps its own screenshot list rather than reading the README, and this one was empty — so the entry showed no images at all.

## License

MIT © [SplatDev](https://github.com/SplatDev-Ltda)