# UmbracoCms.Plugins.MemberRegistration

Member registration plugin for Umbraco 13 (net8.0) and Umbraco 17 (net10.0).


<!-- screenshot:start -->

![MemberRegistration dashboard](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.MemberRegistration/docs/screenshots/01-dashboard.png)

![MemberRegistration on the front end](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.MemberRegistration/docs/screenshots/04-front-end.png)

<!-- screenshot:end -->

## Features

- Registration form with name, email, username, password
- Email verification via token stored in SQL (schema: `memberreg`)
- Admin approval workflow for new members
- Pending member listing and bulk approval

## Database

Uses EF Core with a dedicated schema `memberreg`. Table: `RegistrationTokens`.

The tables are created for you the first time the site starts: the plugin runs its own
Umbraco migration against the database Umbraco is already using, on whichever provider
it is configured with — SQL Server or SQLite. There is nothing to scaffold and nothing
to run by hand.

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/umbraco/api/memberregistration/Register` | Register a new member |
| POST | `/umbraco/api/memberregistration/VerifyEmail` | Verify email with token |
| POST | `/umbraco/api/memberregistration/Approve?memberId=X` | Approve a pending member |
| GET | `/umbraco/api/memberregistration/GetPending` | List unapproved members |

## View Component

```cshtml
@await Component.InvokeAsync("MemberRegistration", new { redirectUrl = "/welcome" })
```

## Changelog

### 2.3.1 — 2026-08-24

Package metadata only: the listing now carries an icon and search tags, and the project and repository links point at the organisation that actually hosts this code. No code changes.

### 2.3.0 — 2026-08-23

The Razor view behind `@await Component.InvokeAsync(...)` is now compiled into the package. It was previously carried as a loose file that nothing packed, so the component threw "view not found" on every install and the front-end usage shown in this README could not have worked.

### 2.2.3 — 2026-08-21
- A failed request now says so in the dashboard. Previously the dashboard kept its previous (usually empty) state, so a refused or failed call looked identical to having no data.
- README no longer tells you to scaffold EF Core migrations by hand — the plugin creates its own tables on first start, on SQL Server or SQLite.

### 2.2.2 — 2026-08-21
- Dashboard now sends the backoffice token with its API calls. On Umbraco 17 those calls were arriving unauthenticated and coming back 401, which the dashboard rendered as an empty state rather than an error.
- A failed request now raises a notification instead of leaving the dashboard looking like there is simply no data.
- The plugin's tables are created on startup. They were never created before, so anything touching them failed on a fresh install.
- Runs on SQLite as well as SQL Server. It previously assumed SQL Server and failed with "Keyword not supported: 'cache'" on the database Umbraco's installer offers by default.
