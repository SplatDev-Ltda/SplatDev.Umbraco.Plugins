# UmbracoCms.Plugins.PasswordSettings

Password policy enforcement plugin for Umbraco 13 (net8.0) and Umbraco 17 (net10.0).


<!-- screenshot:start -->

![PasswordSettings on the front end](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.PasswordSettings/docs/screenshots/04-front-end.png)

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


The tables are created for you the first time the site starts: the plugin runs its own
Umbraco migration against the database Umbraco is already using, on whichever provider
it is configured with — SQL Server or SQLite. There is nothing to scaffold and nothing
to run by hand.

## Changelog

### 2.3.3 — 2026-08-26

Fixes a duplicate registration on sites that still have a physical App_Plugins folder for this plugin, left behind by an older release that copied content into the site. Umbraco registered those extensions twice - once from its own scan of the folder, once from this package's embedded manifest - and logged "Extension with alias ... is already registered". The embedded manifest now yields to the physical copy.

### 2.3.2 — 2026-08-24

Removes a dashboard screenshot that showed an error toast. It was captured against a site where this plugin's API was unreachable, so it advertised a broken dashboard. No screenshot is better than a misleading one; a replacement will be taken against a working install.

### 2.3.1 — 2026-08-24

Package metadata only: the listing now carries an icon and search tags, and the project and repository links point at the organisation that actually hosts this code. No code changes.

### 2.3.0 — 2026-08-23

The Razor view behind `@await Component.InvokeAsync(...)` is now compiled into the package. It was previously carried as a loose file that nothing packed, so the component threw "view not found" on every install and the front-end usage shown in this README could not have worked.

The view also still referenced the package's pre-rename namespace, so it would not have compiled even had it shipped. That is fixed, and the view is now built with the project — a broken view fails the build instead of failing a visitor's request.

### 2.2.3 — 2026-08-21
- A failed request now says so in the dashboard. Previously the dashboard kept its previous (usually empty) state, so a refused or failed call looked identical to having no data.
- README no longer tells you to scaffold EF Core migrations by hand — the plugin creates its own tables on first start, on SQL Server or SQLite.

### 2.2.2 — 2026-08-21
- Dashboard now sends the backoffice token with its API calls. On Umbraco 17 those calls were arriving unauthenticated and coming back 401, which the dashboard rendered as an empty state rather than an error.
- A failed request now raises a notification instead of leaving the dashboard looking like there is simply no data.
- The plugin's tables are created on startup. They were never created before, so anything touching them failed on a fresh install.
- Runs on SQLite as well as SQL Server. It previously assumed SQL Server and failed with "Keyword not supported: 'cache'" on the database Umbraco's installer offers by default.
