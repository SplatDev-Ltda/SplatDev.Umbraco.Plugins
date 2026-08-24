# SplatDev.Umbraco.Plugins.Analytics

First-party visitor analytics for Umbraco. Records visits against content nodes and
reports them from a backoffice dashboard. The data stays in your database — no third-party
analytics service, no account, nothing to consent to on someone else's behalf.

<!-- screenshot:start -->
<!-- screenshot:end -->

## Compatibility

| Umbraco | Target |
| --- | --- |
| 13 | `net8.0` |
| 17 | `net10.0` |

## Installation

```bash
dotnet add package SplatDev.Umbraco.Plugins.Analytics
```

The visits table is created on first startup. The dashboard appears in the Content
section.

## Recording visits

Add the tracking component to any template you want counted:

```cshtml
@await Component.InvokeAsync("Analytics", new { nodeId = Model.Id })
```

It emits a small inline script and nothing else — no styles, no elements that affect
layout. The script records the page view on load and closes the visit as the visitor
leaves, using `sendBeacon` so the exit is not lost to the page unloading.

## What it records

Per visit: the content node, entry and exit url, screen resolution, what the browser
reports about itself, when the visit started and finished, and whether that visitor has
seen the page before. Country and city are recorded only if you configure a lookup.

The dashboard shows totals, unique and returning visitors, activity in the last few
minutes, a per-day chart, and breakdowns by entry page, exit page and country.

## Automated traffic

Requests that identify themselves as crawlers, monitors or scripted clients are flagged
and excluded from every figure. The count of what was excluded is shown, so you can see
the filter is working rather than take it on trust.

## Configuration

```json
{
  "SplatDev": {
    "Analytics": {
      "IpSource": "Client",
      "StoreFullIpAddress": true,
      "RetentionDays": 0,
      "RecordBots": true,
      "IgnoreBackofficeUsers": true,
      "RealTimeWindowMinutes": 5,
      "Ip2LocationBinPath": null
    }
  }
}
```

| Setting | Default | What it does |
| --- | --- | --- |
| `IpSource` | `Client` | `Client` has the browser fetch its own address from a public lookup service and report it, which is what this plugin did on Umbraco 7 and 8. `Server` reads it from the connection instead — no third-party request from your visitors, and it cannot be spoofed by editing the payload. Behind a proxy, `Server` needs forwarded headers configured or every visit records the proxy. |
| `StoreFullIpAddress` | `true` | Off, the host part is zeroed before storing — still enough to tell visitors apart for returning-visitor counts, without keeping something that identifies one. |
| `RetentionDays` | `0` | Delete visits older than this. Zero keeps everything, which is what the old plugin did. |
| `RecordBots` | `true` | Store automated requests, flagged. Off, they are dropped entirely. |
| `IgnoreBackofficeUsers` | `true` | Don't count your own editors browsing the site. |
| `RealTimeWindowMinutes` | `5` | How recent a visit has to be to count as active now. |
| `Ip2LocationBinPath` | `null` | Path to an IP2Location BIN file. Unset, no geo lookup happens and the country and city columns stay empty. |

### A note on visitor addresses

The defaults reproduce the Umbraco 7/8 behaviour: the address is fetched by the visitor's
browser from a public service and stored whole. That means every visitor's browser
contacts a third party, and a full address is personal data in most jurisdictions. If
that matters for your site, set `IpSource` to `Server` and `StoreFullIpAddress` to
`false` — the dashboard works the same either way.

## API

All statistics endpoints require backoffice authentication.

| Method | Route | Returns |
| --- | --- | --- |
| GET | `/umbraco/api/analyticsstats/summary?days=30` | Totals, unique, returning, active now, and the daily series |
| GET | `/umbraco/api/analyticsstats/visits?page=1&pageSize=20` | Paged visits |
| GET | `/umbraco/api/analyticsstats/by-entry-url?take=10` | Top entry pages |
| GET | `/umbraco/api/analyticsstats/by-exit-url?take=10` | Top exit pages |
| GET | `/umbraco/api/analyticsstats/results-by?filter=country` | Grouped by `entryUrl`, `exitUrl`, `country`, `city`, `resolution` or `ip` |
| GET | `/umbraco/api/analyticsstats/visits-by-node?nodeId=1234` | Visits to one node |
| POST | `/umbraco/api/analyticsstats/purge` | Runs the retention sweep now |

The tracking endpoints under `/umbraco/api/analytics` are anonymous, because the public
site calls them.

On Umbraco 13 these are reached at `/umbraco/backoffice/api/AnalyticsApi/...` and
`/umbraco/backoffice/api/AnalyticsTracking/...`.

## Changelog

### 3.0.0 — 2026-08-24

The plugin does something again. Versions 2.x were a compatibility shim that forwarded to
`SplatDev.Umbraco.Plugins.GoogleAnalytics` and contained no analytics of their own, so the
self-hosted visitor tracking that the Umbraco 7 and 8 `SimpleAnalytics` plugin provided
had been missing since the rename. This restores it, on Umbraco 13 and 17.

Everything the old plugin recorded is back — visits against a content node, entry and exit
urls, screen resolution, browser details, returning visitors, per-page counts, real-time
activity, and breakdowns by entry and exit page — with a backoffice dashboard to read it.

Things the old plugin did not do:

- **The dashboard could never have loaded.** The package shipped a built backoffice bundle
  with no `umbraco-package.json` anywhere in it, so Umbraco 17 had nothing to register and
  the file was never requested.
- **Automated traffic is identified and excluded**, and the amount excluded is shown. The
  old build counted crawlers as visitors, which on most sites is the majority of the rows.
- **Exit tracking survives the page closing.** It used `beforeunload` with a plain request,
  which the browser is free to abandon; this uses `sendBeacon`.
- **The statistics endpoints require authentication.** The Umbraco 7 equivalents were open
  to anyone, and they return visitor addresses and browsing paths.
- **Retention.** Visits can be deleted after a configurable number of days. The old plugin
  kept every row forever.
- **Geo lookup is optional.** It required an IP2Location data file to be present; here an
  unconfigured lookup simply records no location.
- **The daily chart is one query**, not one per day, so ninety days costs the same as seven.
- **The tracking script ships with the package.** It used to reference
  `~/scripts/analytics.js`, a loose file the consuming site had to place itself.

The visits table is new rather than reusing the Umbraco 8 table, so a site upgrading from
that version starts fresh; the old table is left untouched.

## License

MIT
