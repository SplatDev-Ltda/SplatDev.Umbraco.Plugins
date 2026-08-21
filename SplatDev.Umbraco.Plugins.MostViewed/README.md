# UmbracoCms.Plugins.MostViewed

Most-viewed content tracking plugin for Umbraco 13 (net8.0) and Umbraco 17 (net10.0).


<!-- screenshot:start -->

![MostViewed dashboard](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.MostViewed/docs/screenshots/01-dashboard.png)

<!-- screenshot:end -->

## Features
- Automatic page view recording via ASP.NET Core middleware
- Tracks content key, node name, URL, viewer IP, and timestamp
- Most-viewed content API with configurable count and date range
- View component for front-end rendering
- Umbraco backoffice dashboard (Angular for U13, Lit 3 for U17)

## Quick Start

### 1. Register the plugin
The `MostViewedComposer` is auto-discovered. It registers the DbContext, service, and middleware.

### 2. Database schema
The tables are created for you the first time the site starts: the plugin runs its own
Umbraco migration against the database Umbraco is already using, on whichever provider
it is configured with — SQL Server or SQLite. There is nothing to scaffold and nothing
to run by hand.

### 3. Use the view component in a Razor template
```cshtml
@* Show 5 most-viewed pages from the last 30 days *@
@await Component.InvokeAsync("MostViewed", new { count = 5, days = 30 })
```

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/umbraco/api/mostviewed/GetMostViewed?count=10&days=30` | Get most-viewed pages |
| GET | `/umbraco/api/mostviewed/GetViewCount?contentKey={guid}` | Get total views for a node |

## Build the backoffice client (U17)
```bash
cd client
npm install
npm run build
```

## Changelog

### 2.1.6 — 2026-08-21
- README no longer tells you to scaffold EF Core migrations by hand — the plugin creates its own tables on first start, on SQL Server or SQLite.

### 2.1.5 — 2026-08-21
- Dashboard now sends the backoffice token with its API calls. On Umbraco 17 those calls were arriving unauthenticated and coming back 401, which the dashboard rendered as an empty state rather than an error.
- A failed request now raises a notification instead of leaving the dashboard looking like there is simply no data.
- The plugin's tables are created on startup. They were never created before, so anything touching them failed on a fresh install.
- Runs on SQLite as well as SQL Server. It previously assumed SQL Server and failed with "Keyword not supported: 'cache'" on the database Umbraco's installer offers by default.
