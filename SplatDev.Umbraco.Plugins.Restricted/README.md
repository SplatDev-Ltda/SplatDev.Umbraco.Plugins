# Restricted

Content restriction plugin for Umbraco — member-only content gates using Umbraco's built-in `IPublicAccessService` with role-based access and a backoffice dashboard.


<!-- screenshot:start -->

![Restricted dashboard](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.Restricted/docs/screenshots/01-dashboard.png)

<!-- screenshot:end -->

## Compatibility

| Umbraco | .NET | Package Version |
|---------|------|-----------------|
| 13.x    | 8.0  | 2.0.0           |
| 17.x    | 10.0 | 2.0.0           |

## Installation

```sh
dotnet add package SplatDev.Umbraco.Plugins.Restricted
```

## Quick Start

The plugin auto-registers via Umbraco's composition system. No explicit `Program.cs` registration required.

## Features

- Member-only content gates using Umbraco's built-in `IPublicAccessService`
- Role-based access: restrict nodes to specific member groups
- Paywall support: redirect unauthorized visitors to a login or error page
- Backoffice dashboard to manage restricted nodes
- View component for rendering access status in Razor views

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/umbraco/api/restricted/GetRestrictedNodes` | List all restricted nodes |
| POST | `/umbraco/api/restricted/RestrictNode` | Restrict a node with member groups |
| DELETE | `/umbraco/api/restricted/UnrestrictNode?nodeId={id}` | Remove restrictions from a node |
| GET | `/umbraco/api/restricted/GetRequiredGroups?nodeId={id}` | Get required groups for a node |
| POST | `/umbraco/api/restricted/SetRequiredGroups` | Update required groups |

## Usage in Razor

```cshtml
@await Component.InvokeAsync("Restricted", new { nodeId = Model.Id })
```

## No EF Core Required

This plugin uses Umbraco's own public access infrastructure — no additional database tables needed.

## Known Limitations

- Relies entirely on Umbraco's `IPublicAccessService`; cannot enforce restrictions outside of Umbraco's content delivery pipeline
- Role-based access is limited to Umbraco member groups — no support for external identity providers
- Redirect behavior (login vs error page) must be configured per-node

## Changelog

### 2.3.2 — 2026-08-21
- Dashboard now sends the backoffice token with its API calls. On Umbraco 17 those calls were arriving unauthenticated and coming back 401, which the dashboard rendered as an empty state rather than an error.
- A failed request now raises a notification instead of leaving the dashboard looking like there is simply no data.

## License

MIT © [SplatDev](https://github.com/SplatDev-Ltda)