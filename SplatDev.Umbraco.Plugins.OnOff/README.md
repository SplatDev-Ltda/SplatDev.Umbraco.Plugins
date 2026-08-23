# UmbracoCms.Plugins.OnOff

Feature toggle system for Umbraco CMS. Enable, disable and schedule site features via the backoffice dashboard.


<!-- screenshot:start -->

![OnOff dashboard](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.OnOff/docs/screenshots/01-dashboard.png)

![OnOff property editor](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.OnOff/docs/screenshots/02-property-editor.png)

![OnOff data type](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.OnOff/docs/screenshots/03-data-type.png)

![OnOff on the front end](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.OnOff/docs/screenshots/04-front-end.png)

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

The tables are created for you the first time the site starts: the plugin runs its own
Umbraco migration against the database Umbraco is already using, on whichever provider
it is configured with — SQL Server or SQLite. There is nothing to scaffold and nothing
to run by hand.

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

### 2.3.0 — 2026-08-23

The Razor view behind `@await Component.InvokeAsync(...)` is now compiled into the package. It was previously carried as a loose file that nothing packed, so the component threw "view not found" on every install and the front-end usage shown in this README could not have worked.

The view also still referenced the package's pre-rename namespace, so it would not have compiled even had it shipped. That is fixed, and the view is now built with the project — a broken view fails the build instead of failing a visitor's request.

### 2.2.4 — 2026-08-22
- The on/off switch is now an actual property editor you can pick when creating a data type. The plugin had always shipped the switch's markup and styling but never registered it, so on Umbraco 17 there was no editor to choose at all.
- The switch is styled on Umbraco 13 too. Its view referenced CSS classes that no stylesheet in the package defined, so it rendered as an unstyled button.
- Labels are configurable per data type — set what the switch reads when on and when off.
- Keyboard and screen-reader support: the control reports itself as a switch with its checked state, and responds to the arrow keys as well as Enter and Space.
- Values are stored by Umbraco's own true/false schema, so a property using this editor can be switched to the built-in toggle without migrating data.

### 2.2.3 — 2026-08-21
- A failed request now says so in the dashboard. Previously the dashboard kept its previous (usually empty) state, so a refused or failed call looked identical to having no data.
- README no longer tells you to scaffold EF Core migrations by hand — the plugin creates its own tables on first start, on SQL Server or SQLite.

### 2.2.2 — 2026-08-21
- Dashboard now sends the backoffice token with its API calls. On Umbraco 17 those calls were arriving unauthenticated and coming back 401, which the dashboard rendered as an empty state rather than an error.
- A failed request now raises a notification instead of leaving the dashboard looking like there is simply no data.
- The plugin's tables are created on startup. They were never created before, so anything touching them failed on a fresh install.
- Runs on SQLite as well as SQL Server. It previously assumed SQL Server and failed with "Keyword not supported: 'cache'" on the database Umbraco's installer offers by default.
