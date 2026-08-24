# UmbracoCms.Plugins.DefaultValue

Set default values for Umbraco content properties by document type and property alias. When a new content node is created, automatically populate specified properties with configured defaults.


<!-- screenshot:start -->

![DefaultValue dashboard](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.DefaultValue/docs/screenshots/01-dashboard.png)

![DefaultValue on the front end](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.DefaultValue/docs/screenshots/04-front-end.png)

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


The tables are created for you the first time the site starts: the plugin runs its own
Umbraco migration against the database Umbraco is already using, on whichever provider
it is configured with — SQL Server or SQLite. There is nothing to scaffold and nothing
to run by hand.

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

### 2.4.0 — 2026-08-24

Brings back the property editor. Version 2.x replaced this plugin with a rules engine — tables, a dashboard, rules applied across content — and shipped no editor at all, which is a different product under the same package id. A site upgrading from Umbraco 7 or 8 had document types whose properties were bound to `splatDev.DefaultValue`, and that editor was simply absent, leaving those properties without one and their `dValue` configuration orphaned.

The editor is back under its original alias, with the original `dValue` prevalue, so those document types resolve again. The rules engine is untouched and remains the way to apply defaults across many properties at once — the two are complementary, not alternatives.

One deliberate difference from the original: it applies the default only when the property is empty. The Umbraco 7/8 controller assigned the configured value on every load, which discarded anything an editor had typed.

### 2.3.1 — 2026-08-24

Package metadata only: the listing now carries an icon and search tags, and the project and repository links point at the organisation that actually hosts this code. No code changes.

### 2.3.0 — 2026-08-23

The Razor view behind `@await Component.InvokeAsync(...)` is now compiled into the package. It was previously carried as a loose file that nothing packed, so the component threw "view not found" on every install and the front-end usage shown in this README could not have worked.

The view also still referenced the package's pre-rename namespace, so it would not have compiled even had it shipped. That is fixed, and the view is now built with the project — a broken view fails the build instead of failing a visitor's request.

### 2.2.3 — 2026-08-21
- A failed request now says so in the dashboard. Previously the dashboard kept its previous (usually empty) state, so a refused or failed call looked identical to having no data.
- README no longer tells you to scaffold EF Core migrations by hand — the plugin creates its own tables on first start, on SQL Server or SQLite.

### 2.2.2 — 2026-08-21
- Dashboard now sends the backoffice token with its API calls. On Umbraco 17 those calls were arriving unauthenticated and coming back 401, which the dashboard rendered as an empty state rather than an error.
- A failed request now raises a notification instead of leaving the dashboard looking like there is simply no data.
- The plugin's tables are created on startup. They were never created before, so anything touching them failed on a fresh install.
- Runs on SQLite as well as SQL Server. It previously assumed SQL Server and failed with "Keyword not supported: 'cache'" on the database Umbraco's installer offers by default.
