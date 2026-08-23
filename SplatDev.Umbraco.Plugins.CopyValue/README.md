# UmbracoCms.Plugins.CopyValue

Copy property values between Umbraco content nodes — bulk copy, property mapping between different document types, with reusable mapping templates.


<!-- screenshot:start -->

![CopyValue dashboard](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.CopyValue/docs/screenshots/01-dashboard.png)

![CopyValue property editor](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.CopyValue/docs/screenshots/02-property-editor.png)

![CopyValue data type](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.CopyValue/docs/screenshots/03-data-type.png)

![CopyValue on the front end](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.CopyValue/docs/screenshots/04-front-end.png)

<!-- screenshot:end -->

## Supports

- Umbraco 13 (net8.0)
- Umbraco 17 (net10.0)

## Features

- Define reusable mapping templates (stored in EF Core `copyvalue` schema)
- Map properties between same or different document types
- Execute single-pair or bulk copy operations via the backoffice or REST API
- Optional publish-after-copy support
- Lit 3 dashboard for Umbraco 17, AngularJS dashboard for Umbraco 13
- `CopyValueViewComponent` for rendering mapping templates in Razor views

## Installation

Add the NuGet package. The `CopyValueComposer` registers `CopyValueDbContext` and `ICopyValueService`.


The tables are created for you the first time the site starts: the plugin runs its own
Umbraco migration against the database Umbraco is already using, on whichever provider
it is configured with — SQL Server or SQLite. There is nothing to scaffold and nothing
to run by hand.

## Usage in Code

```csharp
// Direct property copy with explicit mappings
var mappings = new[]
{
    new PropertyMapping { Source = "pageTitle", Target = "headline" },
    new PropertyMapping { Source = "bodyText",  Target = "content"  },
};
await _copyValueService.CopyPropertiesAsync(sourceId, targetId, mappings, publish: true);

// Bulk copy using a saved template
var pairs = new[] { (sourceId1, targetId1), (sourceId2, targetId2) };
int count = await _copyValueService.BulkCopyAsync(mappingId, pairs, publish: false);
```

## REST API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/umbraco/api/copyvalue/GetMappings` | List all mapping templates |
| GET | `/umbraco/api/copyvalue/GetMapping?id=1` | Get a single mapping |
| POST | `/umbraco/api/copyvalue/SaveMapping` | Create or update a mapping |
| DELETE | `/umbraco/api/copyvalue/DeleteMapping?id=1` | Delete a mapping |
| POST | `/umbraco/api/copyvalue/CopyProperties` | Execute a single copy operation |
| POST | `/umbraco/api/copyvalue/BulkCopy` | Execute a bulk copy using a template |

### CopyProperties request body

```json
{
  "sourceContentId": 1234,
  "targetContentId": 5678,
  "mappings": [
    { "source": "pageTitle", "target": "headline" }
  ],
  "publish": false
}
```

### BulkCopy request body

```json
{
  "mappingId": 1,
  "pairs": [
    { "sourceId": 1234, "targetId": 5678 },
    { "sourceId": 1235, "targetId": 5679 }
  ],
  "publish": false
}
```

## Changelog

### 2.4.0 — 2026-08-23

The copy button now reads the source property correctly. It asked the document for the value and was handed a subscription to it instead, so every configured source looked empty and the button stayed disabled even when the source property clearly had text in it. The preview also updates live while you type into the source property.

The Razor view behind `@await Component.InvokeAsync(...)` is now compiled into the package. It was previously carried as a loose file that nothing packed, so the component threw "view not found" on every install and the front-end usage shown in this README could not have worked.

The view also still referenced the package's pre-rename namespace, so it would not have compiled even had it shipped. That is fixed, and the view is now built with the project — a broken view fails the build instead of failing a visitor's request.

### 2.3.0 — 2026-08-23
- The Copy Value property editor exists. The plugin is named for it and had never registered one: `package.manifest` carried `"propertyEditors": []` — an empty array — and the Umbraco 17 manifest registered only a dashboard, so there was no Copy Value editor to choose when creating a data type on either version.
- It puts a button on a property that fills it from one or more **other properties on the same item**, chosen by alias in the data type. Several sources are joined with a separator you set.
- The values are read live from the item being edited, so it works before anything is saved — you copy a title into a meta description while writing it, not after publishing.
- It shows what it will produce before you press it, and asks before replacing a value that is already there unless the data type says otherwise.
- This is separate from the dashboard, which copies values between two content *nodes*. The editor copies between properties of one node.

### 2.2.4 — 2026-08-22
- The mappings table is created again. The DbContext pinned one column to `nvarchar(max)` — SQL Server's spelling — which EF emitted verbatim into the SQLite DDL, so creating the table failed with `near "max": syntax error`. The migration aborted, the table was never created, and every dashboard request returned 500 with `no such table: CopyMappings` on the database Umbraco's installer offers by default.

### 2.2.3 — 2026-08-21
- A failed request now says so in the dashboard. Previously the dashboard kept its previous (usually empty) state, so a refused or failed call looked identical to having no data.
- README no longer tells you to scaffold EF Core migrations by hand — the plugin creates its own tables on first start, on SQL Server or SQLite.

### 2.2.2 — 2026-08-21
- Dashboard now sends the backoffice token with its API calls. On Umbraco 17 those calls were arriving unauthenticated and coming back 401, which the dashboard rendered as an empty state rather than an error.
- A failed request now raises a notification instead of leaving the dashboard looking like there is simply no data.
- The plugin's tables are created on startup. They were never created before, so anything touching them failed on a fresh install.
- Runs on SQLite as well as SQL Server. It previously assumed SQL Server and failed with "Keyword not supported: 'cache'" on the database Umbraco's installer offers by default.
