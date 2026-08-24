# UmbracoCms.Plugins.HiddenContent

Hidden Content plugin for Umbraco 13 (net8.0) and Umbraco 17 (net10.0).


<!-- screenshot:start -->

![HiddenContent property editor](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.HiddenContent/docs/screenshots/02-property-editor.png)

![HiddenContent data type](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.HiddenContent/docs/screenshots/03-data-type.png)

![HiddenContent on the front end](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.HiddenContent/docs/screenshots/04-front-end.png)

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

### 2.5.3 — 2026-08-24

Restores the `icon-document-dashed-line` icon and the Common group this plugin had on Umbraco 7 and 8, and the Brazilian Portuguese translation that shipped with it.

### 2.5.2 — 2026-08-24

Removes a dashboard screenshot that showed an error toast. It was captured against a site where this plugin's API was unreachable, so it advertised a broken dashboard. No screenshot is better than a misleading one; a replacement will be taken against a working install.

### 2.5.1 — 2026-08-24

Package metadata only: the listing now carries an icon and search tags, and the project and repository links point at the organisation that actually hosts this code. No code changes.

### 2.5.0 — 2026-08-23

The Razor view behind `@await Component.InvokeAsync(...)` is now compiled into the package. It was previously carried as a loose file that nothing packed, so the component threw "view not found" on every install and the front-end usage shown in this README could not have worked.

### 2.4.0 — 2026-08-23
- A page can be hidden from navigation on the page itself. The plugin shipped a dashboard listing hidden nodes, so hiding one meant leaving it, finding it in a list, and coming back.
- It calls the plugin's own endpoints rather than writing umbracoNaviHide directly, so whatever the plugin does around hiding happens here too.
- The editor says plainly that hiding is not access control — the page stays published and reachable by its URL.

### 2.3.3 — 2026-08-21
- A failed request now says so in the dashboard. Previously the dashboard kept its previous (usually empty) state, so a refused or failed call looked identical to having no data.

### 2.3.2 — 2026-08-21
- Dashboard now sends the backoffice token with its API calls. On Umbraco 17 those calls were arriving unauthenticated and coming back 401, which the dashboard rendered as an empty state rather than an error.
- A failed request now raises a notification instead of leaving the dashboard looking like there is simply no data.
