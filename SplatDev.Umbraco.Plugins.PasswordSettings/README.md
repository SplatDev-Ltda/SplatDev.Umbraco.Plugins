# UmbracoCms.Plugins.PasswordSettings

Password policy enforcement plugin for Umbraco 13 (net8.0) and Umbraco 17 (net10.0).


<!-- screenshot:start -->

![PasswordSettings dashboard](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.PasswordSettings/docs/screenshots/01-dashboard.png)

<!-- screenshot:end -->

## Features

- Configurable password complexity rules (length, uppercase, digit, special character)
- Password expiration enforcement
- Password history tracking (prevents reuse of recent passwords)
- Strength meter / validation API
- Backoffice dashboard for managing policy settings

## EF Core Schema

Schema: `passwordsettings`

Tables:
- `PasswordHistories` — tracks password hashes per member
- `PasswordPolicies` — stores the active password policy

## API Endpoints

- `GET /umbraco/api/passwordsettings/GetPolicy`
- `POST /umbraco/api/passwordsettings/SavePolicy`
- `POST /umbraco/api/passwordsettings/ValidatePassword`
- `POST /umbraco/api/passwordsettings/RecordPasswordChange`
- `GET /umbraco/api/passwordsettings/IsPasswordReused`

## Configuration

Add a connection string named `umbracoDbDSN` in your `appsettings.json`.

Run EF Core migrations:

```bash
dotnet ef migrations add InitialCreate --project UmbracoCms.Plugins.PasswordSettings
dotnet ef database update --project UmbracoCms.Plugins.PasswordSettings
```

## Changelog

### 2.2.2 — 2026-08-21
- Dashboard now sends the backoffice token with its API calls. On Umbraco 17 those calls were arriving unauthenticated and coming back 401, which the dashboard rendered as an empty state rather than an error.
- A failed request now raises a notification instead of leaving the dashboard looking like there is simply no data.
- The plugin's tables are created on startup. They were never created before, so anything touching them failed on a fresh install.
- Runs on SQLite as well as SQL Server. It previously assumed SQL Server and failed with "Keyword not supported: 'cache'" on the database Umbraco's installer offers by default.
