# UmbracoCms.Plugins.VisitorCounter

Site visitor counter plugin for Umbraco 13 (net8.0) and Umbraco 17 (net10.0).


<!-- screenshot:start -->

![VisitorCounter dashboard](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.VisitorCounter/docs/screenshots/01-dashboard.png)

![VisitorCounter on the front end](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.VisitorCounter/docs/screenshots/04-front-end.png)

<!-- screenshot:end -->

## Features
- Cookie-based session tracking (IP-hash fallback, privacy-preserving)
- Unique vs. total visit counts
- Daily aggregated visitor counts table
- View component for front-end display (odometer-style counter widget)
- Umbraco backoffice dashboard (Angular for U13, Lit 3 with uui-table for U17)

## Quick Start

### 1. Register the plugin
The `VisitorCounterComposer` is auto-discovered. It registers the DbContext, service, and middleware.

### 2. Database schema
The tables are created for you the first time the site starts: the plugin runs its own
Umbraco migration against the database Umbraco is already using, on whichever provider
it is configured with — SQL Server or SQLite. There is nothing to scaffold and nothing
to run by hand.

### 3. Use the view component in a Razor template
```cshtml
@* Show total visits + unique visitors for the last 30 days *@
@await Component.InvokeAsync("VisitorCounter", new { days = 30 })
```

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/umbraco/api/visitorcounter/GetStats?days=30` | Total + unique visit counts |
| GET | `/umbraco/api/visitorcounter/GetDailyCounts?days=30` | Per-day visit breakdown |

## Session Tracking

Visitors are tracked by a 30-day `_vcid` cookie (HttpOnly, SameSite=Lax).
No raw IP addresses are stored in the database.

## Build the backoffice client (U17)
```bash
cd client
npm install
npm run build
```

## Changelog

### 2.2.2 — 2026-08-26

Fixes a duplicate registration on sites that still have a physical App_Plugins folder for this plugin, left behind by an older release that copied content into the site. Umbraco registered those extensions twice - once from its own scan of the folder, once from this package's embedded manifest - and logged "Extension with alias ... is already registered". The embedded manifest now yields to the physical copy.

### 2.2.1 — 2026-08-24

Package metadata only: the listing now carries an icon and search tags, and the project and repository links point at the organisation that actually hosts this code. No code changes.

### 2.2.0 — 2026-08-23

The Razor view behind `@await Component.InvokeAsync(...)` is now compiled into the package. It was previously carried as a loose file that nothing packed, so the component threw "view not found" on every install and the front-end usage shown in this README could not have worked.

The view also still referenced the package's pre-rename namespace, so it would not have compiled even had it shipped. That is fixed, and the view is now built with the project — a broken view fails the build instead of failing a visitor's request.

### 2.1.7 — 2026-08-22
- Statistics load instead of returning 500. The migration created `VisitorSession` and `DailyVisitorCount`, while the entities map to `VisitorCounter_Session` and `VisitorCounter_DailyCount`, so every read hit a table that was never created.
- Table creation is now generated from the EF model itself, so the names cannot drift from the queries again.
- The tables the old migration created under the wrong names are left in place rather than dropped, in case a site put data in them by hand. They are unused; an empty one is safe to drop.

### 2.1.6 — 2026-08-21
- README no longer tells you to scaffold EF Core migrations by hand — the plugin creates its own tables on first start, on SQL Server or SQLite.

### 2.1.5 — 2026-08-21
- Dashboard now sends the backoffice token with its API calls. On Umbraco 17 those calls were arriving unauthenticated and coming back 401, which the dashboard rendered as an empty state rather than an error.
- A failed request now raises a notification instead of leaving the dashboard looking like there is simply no data.
- Runs on SQLite as well as SQL Server. It previously assumed SQL Server and failed with "Keyword not supported: 'cache'" on the database Umbraco's installer offers by default.
