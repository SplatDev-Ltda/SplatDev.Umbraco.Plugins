# UmbracoCms.Plugins.StarRatings

Content star-ratings plugin for Umbraco 13 (net8.0) and Umbraco 17 (net10.0).


<!-- screenshot:start -->

![StarRatings dashboard](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.StarRatings/docs/screenshots/01-dashboard.png)

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

### 2. Run EF Core migrations
```bash
dotnet ef migrations add InitialCreate --context StarRatingsDbContext
dotnet ef database update --context StarRatingsDbContext
```

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

### 2.2.2 — 2026-08-21
- Dashboard now sends the backoffice token with its API calls. On Umbraco 17 those calls were arriving unauthenticated and coming back 401, which the dashboard rendered as an empty state rather than an error.
- A failed request now raises a notification instead of leaving the dashboard looking like there is simply no data.
- The plugin's tables are created on startup. They were never created before, so anything touching them failed on a fresh install.
- Runs on SQLite as well as SQL Server. It previously assumed SQL Server and failed with "Keyword not supported: 'cache'" on the database Umbraco's installer offers by default.
