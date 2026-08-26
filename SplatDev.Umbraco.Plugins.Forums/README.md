# SplatDev.Umbraco.Plugins.Forums

Discussion forums plugin for Umbraco 13 (net8.0) and Umbraco 17 (net10.0).


<!-- screenshot:start -->

![Forums dashboard](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.Forums/docs/screenshots/01-dashboard.png)

<!-- screenshot:end -->

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Plugins.Forums.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.Forums)

## Compatibility

| Umbraco | .NET | Package Version |
|---------|------|-----------------|
| 13.x    | 8.0  | 2.2.7           |
| 17.x    | 10.0 | 2.2.7           |

## Installation

```sh
dotnet add package SplatDev.Umbraco.Plugins.Forums
```

## Features

- Forum categories with slug-based routing and sort order
- Threaded discussions with pinning, locking and view tracking
- Reply system with moderation (approve, soft-delete, hard-delete)
- Backoffice dashboard (Umbraco 17: Lit 3 element; Umbraco 13: AngularJS)
- Full moderation controls: lock/unlock threads, pin/unpin, delete threads and replies

## REST API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/umbraco/api/forums/GetCategories` | List categories |
| GET | `/umbraco/api/forums/GetCategory?slug=` | Get category by slug |
| GET | `/umbraco/api/forums/GetThreads?categoryId=&page=&pageSize=` | Threads in category |
| GET | `/umbraco/api/forums/GetThread?slug=` | Get thread with replies |
| POST | `/umbraco/api/forums/CreateThread` | Create new thread |
| GET | `/umbraco/api/forums/GetReplies?threadId=` | Replies for thread |
| POST | `/umbraco/api/forums/AddReply` | Add reply to thread |
| POST | `/umbraco/api/forums/LockThread?threadId=&locked=` | Lock/unlock thread |
| POST | `/umbraco/api/forums/PinThread?threadId=&pinned=` | Pin/unpin thread |
| DELETE | `/umbraco/api/forums/DeleteThread?threadId=` | Delete thread |
| POST | `/umbraco/api/forums/ApproveReply?replyId=` | Approve reply |
| DELETE | `/umbraco/api/forums/DeleteReply?replyId=&hard=` | Delete reply |

## Database

Uses EF Core against Umbraco’s own database. Schema: `forums`.

The tables are created for you the first time the site starts: the plugin runs its own
Umbraco migration against the database Umbraco is already using, on whichever provider
it is configured with — SQL Server or SQLite. There is nothing to scaffold and nothing
to run by hand.

## Building the client

```bash
cd client
npm install
npm run build
```

## Changelog

### 2.2.7 — 2026-08-26

The NuGet listing now shows the dashboard. It had no screenshot before, so the listing gave no picture of what the plugin looks like in the backoffice.

### 2.2.6 — 2026-08-26

Fixes a duplicate registration on sites that still have a physical App_Plugins folder for this plugin, left behind by an older release that copied content into the site. Umbraco registered those extensions twice - once from its own scan of the folder, once from this package's embedded manifest - and logged "Extension with alias ... is already registered". The embedded manifest now yields to the physical copy.

### 2.2.5 — 2026-08-24

Removes a dashboard screenshot that showed an error toast. It was captured against a site where this plugin's API was unreachable, so it advertised a broken dashboard. No screenshot is better than a misleading one; a replacement will be taken against a working install.

### 2.2.4 — 2026-08-24

Package metadata only: the listing now carries an icon and search tags, and the project and repository links point at the organisation that actually hosts this code. No code changes.

### 2.2.3 — 2026-08-21
- A failed request now says so in the dashboard. Previously the dashboard kept its previous (usually empty) state, so a refused or failed call looked identical to having no data.
- README no longer tells you to scaffold EF Core migrations by hand — the plugin creates its own tables on first start, on SQL Server or SQLite.

### 2.2.2 — 2026-08-21
- Dashboard now sends the backoffice token with its API calls. On Umbraco 17 those calls were arriving unauthenticated and coming back 401, which the dashboard rendered as an empty state rather than an error.
- A failed request now raises a notification instead of leaving the dashboard looking like there is simply no data.
- The plugin's tables are created on startup. They were never created before, so anything touching them failed on a fresh install.
- Runs on SQLite as well as SQL Server. It previously assumed SQL Server and failed with "Keyword not supported: 'cache'" on the database Umbraco's installer offers by default.

## License

MIT © [SplatDev](https://github.com/SplatDev-Ltda)