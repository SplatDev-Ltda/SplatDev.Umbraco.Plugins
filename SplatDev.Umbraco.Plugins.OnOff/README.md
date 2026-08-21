# UmbracoCms.Plugins.OnOff

Feature toggle system for Umbraco CMS. Enable, disable and schedule site features via the backoffice dashboard.


<!-- screenshot:start -->

![OnOff dashboard](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.OnOff/docs/screenshots/01-dashboard.png)

<!-- screenshot:end -->

## Supports

- Umbraco 13 (net8.0)
- Umbraco 17 (net10.0)

## Features

- Manage feature flags from the Umbraco Settings dashboard
- Enable/disable features with a single click
- Schedule automatic enable/disable with `ScheduledEnableAt` / `ScheduledDisableAt`
- EF Core persistence using the `onoff` schema
- `OnOffButtonEditor` DataEditor property for use in document types
- Lit 3 dashboard for Umbraco 17, AngularJS dashboard for Umbraco 13
- `OnOffViewComponent` for rendering feature state in Razor views

## Installation

Add the NuGet package to your Umbraco project. The `OnOffComposer` registers the `OnOffDbContext` and `IOnOffService` automatically.

Run EF Core migrations to create the `onoff.FeatureToggles` table:

```bash
dotnet ef migrations add InitialOnOff --context OnOffDbContext
dotnet ef database update --context OnOffDbContext
```

## Usage in Views

```cshtml
@await Component.InvokeAsync("OnOff", new { alias = "darkMode" })
```

## REST API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/umbraco/api/onoff/GetAll` | List all feature toggles |
| GET | `/umbraco/api/onoff/GetFeature?alias=x` | Get a single feature |
| POST | `/umbraco/api/onoff/UpsertFeature` | Create or update a feature |
| POST | `/umbraco/api/onoff/Enable?alias=x` | Enable a feature |
| POST | `/umbraco/api/onoff/Disable?alias=x` | Disable a feature |
| POST | `/umbraco/api/onoff/Schedule?alias=x&enableAt=...&disableAt=...` | Schedule changes |
| DELETE | `/umbraco/api/onoff/Delete?id=1` | Delete a feature |
| POST | `/umbraco/api/onoff/ApplyScheduled` | Trigger scheduled changes |

## Changelog

### 2.2.2 — 2026-08-21
- Dashboard now sends the backoffice token with its API calls. On Umbraco 17 those calls were arriving unauthenticated and coming back 401, which the dashboard rendered as an empty state rather than an error.
- A failed request now raises a notification instead of leaving the dashboard looking like there is simply no data.
- The plugin's tables are created on startup. They were never created before, so anything touching them failed on a fresh install.
- Runs on SQLite as well as SQL Server. It previously assumed SQL Server and failed with "Keyword not supported: 'cache'" on the database Umbraco's installer offers by default.
