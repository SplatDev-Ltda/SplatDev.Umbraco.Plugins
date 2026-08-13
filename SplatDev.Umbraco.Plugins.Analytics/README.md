# Analytics 3.x

Privacy-conscious, self-hosted first-party visit analytics for Umbraco 17. The plugin stores visit events in the host database and provides totals, daily trends, paths, browser and country breakdowns through the Bellissima dashboard API.

> **Important:** Analytics 3.x is a different product from SimpleAnalytics 2.x and from the former Google Analytics integration. It does not send data to Google or another third-party analytics service. Upgrade users should review retention and consent requirements before enabling it.

## Installation

```sh
dotnet add package SplatDev.Umbraco.Plugins.Analytics --version 3.0.0
```

The package registers its database context and website middleware automatically. It records successful HTML GET responses while excluding `/umbraco` and `/media` paths. Visitor identifiers are random, cookie-based values; raw IP addresses are not persisted.

### Database setup

Analytics uses the host SQL Server connection `ConnectionStrings:umbracoDbDSN`. Apply the `Analytics_Visit` schema before enabling tracking (the table must have an identity `Id` key and the columns represented by `AnalyticsVisit`). The application fails fast with a descriptive error if this connection is missing.

The dashboard API is backoffice-authorized; it is not a public reporting endpoint.

## Storage and geolocation

Visits use the host's configured `umbracoDbDSN` SQL Server database. This release intentionally does not bundle the legacy IP2Location database: its currency and redistribution licence were not verified, so country/city enrichment is an optional future provider boundary rather than an unsafe binary redistribution.

## Release notes — 3.0.0

- New Umbraco 17 / .NET 10 self-hosted tracker under the `Analytics` package name.
- Added first-party visit storage, daily totals, unique visitor counts, browser, country and path breakdowns.
- Added Lit/Bellissima-compatible dashboard API surface.
- Analytics 3.x is not compatible with or a continuation of Google Analytics integration or SimpleAnalytics 2.x data.
