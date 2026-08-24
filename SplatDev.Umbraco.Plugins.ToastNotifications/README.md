# ToastNotifications

Toast / snackbar notification system for Umbraco — manage configurable notification messages shown to site visitors, with CRUD management via a backoffice dashboard.


<!-- screenshot:start -->
<!-- screenshot:end -->

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Plugins.ToastNotifications.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.ToastNotifications)

## Compatibility

| Umbraco | .NET | Package Version |
|---------|------|-----------------|
| 13.x    | 8.0  | 2.0.0           |
| 17.x    | 10.0 | 2.0.0           |

## Installation

```sh
dotnet add package SplatDev.Umbraco.Plugins.ToastNotifications
```

## Quick Start

The plugin auto-registers via `ToastNotificationsComposer`, which sets up the EF Core DbContext and `IToastNotificationsService`.

## Configuration

Add to `appsettings.json`:

```json
{
  "ConnectionStrings": {
    "umbracoDbDSN": "Server=localhost;Database=umbraco;Trusted_Connection=True;"
  }
}
```

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/umbraco/api/toastnotifications/GetActive` | Retrieve all active notifications |
| POST | `/umbraco/api/toastnotifications/Create` | Create a new notification |
| PUT | `/umbraco/api/toastnotifications/Update?id=` | Update an existing notification |
| DELETE | `/umbraco/api/toastnotifications/Delete?id=` | Delete a notification |

## Usage

Create notifications from the backoffice dashboard. Each notification has a message, type, and optional expiration:

```javascript
// Fetch active notifications for the front-end
fetch('/umbraco/api/toastnotifications/GetActive')
    .then(r => r.json())
    .then(notifications => {
        notifications.forEach(n => {
            showToast(n.message, n.type); // 'info', 'success', 'warning', 'error'
        });
    });
```

Supported notification types: `info`, `success`, `warning`, `error`.

## Known Limitations

- Front-end must poll the API or fetch notifications on page load — no push/WebSocket mechanism for real-time delivery
- Notification types are plain strings with no enum validation at the API level
- Uses Umbraco's own database connection string (no separate DB support)
- No built-in front-end rendering component; consumers must implement their own toast UI

## Changelog

### 2.4.2 — 2026-08-24

Removes a dashboard screenshot that showed an error toast. It was captured against a site where this plugin's API was unreachable, so it advertised a broken dashboard. No screenshot is better than a misleading one; a replacement will be taken against a working install.

### 2.4.1 — 2026-08-24

Package metadata only: the listing now carries an icon and search tags, and the project and repository links point at the organisation that actually hosts this code. No code changes.

### 2.4.0 — 2026-08-23

Fixes the notification tables on SQLite. The plugin asked for a default database schema unconditionally; SQLite has none, so EF folded the request into the table name and every read went to an object the migration never created.

The Umbraco Marketplace listing now carries this plugin's screenshots. The listing keeps its own screenshot list rather than reading the README, and this one was empty — so the entry showed no images at all.

### 2.3.2 — 2026-08-21
- Dashboard now sends the backoffice token with its API calls. On Umbraco 17 those calls were arriving unauthenticated and coming back 401, which the dashboard rendered as an empty state rather than an error.
- A failed request now raises a notification instead of leaving the dashboard looking like there is simply no data.
- The plugin's tables are created on startup. They were never created before, so anything touching them failed on a fresh install.
- Runs on SQLite as well as SQL Server. It previously assumed SQL Server and failed with "Keyword not supported: 'cache'" on the database Umbraco's installer offers by default.

## License

MIT © [SplatDev](https://github.com/SplatDev-Ltda)