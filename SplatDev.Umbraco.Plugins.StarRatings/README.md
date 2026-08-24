# UmbracoCms.Plugins.StarRatings

Content star-ratings plugin for Umbraco 13 (net8.0) and Umbraco 17 (net10.0).


<!-- screenshot:start -->

![StarRatings dashboard](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.StarRatings/docs/screenshots/01-dashboard.png)

![StarRatings property editor](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.StarRatings/docs/screenshots/02-property-editor.png)

![StarRatings data type](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.StarRatings/docs/screenshots/03-data-type.png)

![StarRatings on the front end](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.StarRatings/docs/screenshots/04-front-end.png)

<!-- screenshot:end -->

## Features
- 1–5 star ratings per content node
- Per-IP deduplication (one vote per visitor per content item, updateable)
- Average rating calculation
- Top-rated content API endpoint
- View component for front-end rendering with AJAX voting
- Umbraco backoffice dashboard (Angular for U13, Lit 3 for U17)

## Quick Start

### 1. Register the plugin
The `StarRatingsComposer` is auto-discovered via `IComposer`. No manual registration needed.

### 2. Database schema
The tables are created for you the first time the site starts: the plugin runs its own
Umbraco migration against the database Umbraco is already using, on whichever provider
it is configured with — SQL Server or SQLite. There is nothing to scaffold and nothing
to run by hand.

### 3. Use the view component in a Razor template
```cshtml
@await Component.InvokeAsync("StarRatings", new { contentKey = Model.Key })
```

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/umbraco/api/starratings/GetRating?contentKey={guid}` | Get average + vote count |
| POST | `/umbraco/api/starratings/Rate` | Submit a rating (`{ contentKey, rating }`) |
| GET | `/umbraco/api/starratings/GetTopRated?count=10` | Get top N rated items |

## Build the backoffice client (U17)
```bash
cd client
npm install
npm run build
```

## Changelog

### 2.4.1 — 2026-08-24

Package metadata only: the listing now carries an icon and search tags, and the project and repository links point at the organisation that actually hosts this code. No code changes.

### 2.4.0 — 2026-08-23

The Razor view behind `@await Component.InvokeAsync(...)` is now compiled into the package. It was previously carried as a loose file that nothing packed, so the component threw "view not found" on every install and the front-end usage shown in this README could not have worked.

The view also still referenced the package's pre-rename namespace, so it would not have compiled even had it shipped. That is fixed, and the view is now built with the project — a broken view fails the build instead of failing a visitor's request.

### 2.3.0 — 2026-08-23
- A page's rating is visible while editing it. The plugin only had a dashboard of top-rated content, so the rating for the page in front of you was somewhere else entirely.
- The editor is deliberately read-only. The ratings belong to visitors, and a box an editor could type a number into would be a box for falsifying them — the average shown to the public would stop meaning what it says.

### 2.2.3 — 2026-08-21
- README no longer tells you to scaffold EF Core migrations by hand — the plugin creates its own tables on first start, on SQL Server or SQLite.

### 2.2.2 — 2026-08-21
- Dashboard now sends the backoffice token with its API calls. On Umbraco 17 those calls were arriving unauthenticated and coming back 401, which the dashboard rendered as an empty state rather than an error.
- A failed request now raises a notification instead of leaving the dashboard looking like there is simply no data.
- The plugin's tables are created on startup. They were never created before, so anything touching them failed on a fresh install.
- Runs on SQLite as well as SQL Server. It previously assumed SQL Server and failed with "Keyword not supported: 'cache'" on the database Umbraco's installer offers by default.
