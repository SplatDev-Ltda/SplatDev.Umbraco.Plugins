# UmbracoCms.Plugins.DefaultValue

Set default values for Umbraco content properties by document type and property alias. When a new content node is created, automatically populate specified properties with configured defaults.


<!-- screenshot:start -->

![DefaultValue dashboard](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.DefaultValue/docs/screenshots/01-dashboard.png)

<!-- screenshot:end -->

## Supports

- Umbraco 13 (net8.0)
- Umbraco 17 (net10.0)

## Features

- Configure default value rules per document type and property alias
- Priority ordering for rule application
- Enable/disable individual rules
- EF Core persistence using the `defaultvalue` schema
- Filter and manage rules from the Umbraco Settings dashboard
- Lit 3 dashboard for Umbraco 17, AngularJS dashboard for Umbraco 13
- `DefaultValueViewComponent` for rendering rules in Razor views

## Installation

Add the NuGet package to your Umbraco project. The `DefaultValueComposer` registers the `DefaultValueDbContext` and `IDefaultValueService` automatically.

Run EF Core migrations:

```bash
dotnet ef migrations add InitialDefaultValue --context DefaultValueDbContext
dotnet ef database update --context DefaultValueDbContext
```

## Usage in Code

Inject `IDefaultValueService` and call `ApplyDefaultsAsync` when creating new content:

```csharp
var properties = new Dictionary<string, object?>();
await _defaultValueService.ApplyDefaultsAsync("blogPost", properties);
// properties now contains defaults for any unconfigured keys
```

## REST API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/umbraco/api/defaultvalue/GetRules` | List all rules |
| GET | `/umbraco/api/defaultvalue/GetRulesForType?documentTypeAlias=x` | Rules for a doc type |
| POST | `/umbraco/api/defaultvalue/SaveRule` | Create or update a rule |
| DELETE | `/umbraco/api/defaultvalue/DeleteRule?id=1` | Delete a rule |
| POST | `/umbraco/api/defaultvalue/ApplyDefaults?documentTypeAlias=x` | Apply defaults to a property bag |

## Changelog

### 2.2.2 — 2026-08-21
- Dashboard now sends the backoffice token with its API calls. On Umbraco 17 those calls were arriving unauthenticated and coming back 401, which the dashboard rendered as an empty state rather than an error.
- A failed request now raises a notification instead of leaving the dashboard looking like there is simply no data.
- The plugin's tables are created on startup. They were never created before, so anything touching them failed on a fresh install.
- Runs on SQLite as well as SQL Server. It previously assumed SQL Server and failed with "Keyword not supported: 'cache'" on the database Umbraco's installer offers by default.
