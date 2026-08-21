# UmbracoCms.Plugins.HiddenContent

Hidden Content plugin for Umbraco 13 (net8.0) and Umbraco 17 (net10.0).


<!-- screenshot:start -->

![HiddenContent dashboard](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.HiddenContent/docs/screenshots/01-dashboard.png)

<!-- screenshot:end -->

## Features

- Hide content nodes from navigation menus and XML sitemaps
- Nodes remain fully accessible by direct URL
- Uses the standard Umbraco `umbracoNaviHide` property
- Bulk hide/show operations
- Backoffice dashboard to manage hidden nodes
- View component for rendering hidden status in Razor views

## No EF Core Required

This plugin uses Umbraco's `IContentService` — no additional database tables needed.

## API Endpoints

- `GET /umbraco/api/hiddencontent/GetHiddenNodes`
- `POST /umbraco/api/hiddencontent/HideNode?nodeId={id}`
- `POST /umbraco/api/hiddencontent/ShowNode?nodeId={id}`
- `GET /umbraco/api/hiddencontent/IsHidden?nodeId={id}`
- `POST /umbraco/api/hiddencontent/BulkHide` (body: `{ "nodeIds": [1,2,3] }`)
- `POST /umbraco/api/hiddencontent/BulkShow` (body: `{ "nodeIds": [1,2,3] }`)

## Usage in Razor

```cshtml
@await Component.InvokeAsync("HiddenContent", new { nodeId = Model.Id })
```

## How It Works

HideNodeAsync sets `umbracoNaviHide = "1"` and publishes. ShowNodeAsync sets it to `"0"` and publishes. Standard Umbraco navigation helpers and sitemap generators respect this property automatically.

## Changelog

### 2.3.2 — 2026-08-21
- Dashboard now sends the backoffice token with its API calls. On Umbraco 17 those calls were arriving unauthenticated and coming back 401, which the dashboard rendered as an empty state rather than an error.
- A failed request now raises a notification instead of leaving the dashboard looking like there is simply no data.
