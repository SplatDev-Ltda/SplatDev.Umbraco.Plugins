# Analytics 3.0.0 v17 completion report

## Scope
Analytics 3.x is a self-hosted, first-party visit tracker for Umbraco 17. It stores privacy-preserving visit events in the host database and exposes a Bellissima/Lit dashboard. It is not Google Analytics and is not a continuation of SimpleAnalytics 2.x.

## Verification

- `npx vite build` — passed; generated `App_Plugins/Analytics/dist/analytics-dashboard.element.js`.
- `dotnet build SplatDev.Umbraco.Plugins.Analytics/SplatDev.Umbraco.Plugins.Analytics.csproj --no-restore` — passed with existing dependency vulnerability and Umbraco 17 deprecation warnings.
- `dotnet pack ... -o artifacts/analytics` — passed; generated `SplatDev.Umbraco.Plugins.Analytics.3.0.0.nupkg`.

## Implementation evidence

- Website middleware tracks successful HTML GET responses outside `/umbraco` and `/media`.
- Raw IP addresses are never persisted; visitor IDs are one-way hashed cookie identifiers.
- A tracked migration creates `Analytics_Visit` non-destructively on install.
- Dashboard calls `GET /umbraco/api/analytics/Summary?days=N` and renders visits, unique visitors, top paths, browsers, countries, loading, empty, and error states.
- IP2Location binary data is deliberately not redistributed until currency and licensing are verified; country/city fields remain provider-ready.

## Remaining environment-dependent check

A clean Umbraco 17 site with SQL Server and seeded visit rows is required for the final browser screenshot. This workspace has no running clean site or SQL Server instance, so a non-empty dashboard screenshot could not be captured here.
