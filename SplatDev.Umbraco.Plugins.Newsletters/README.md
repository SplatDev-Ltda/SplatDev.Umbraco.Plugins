# UmbracoCms.Plugins.Newsletters

Newsletter subscriber management, campaigns, and send tracking for Umbraco 13 (net8.0) and Umbraco 17 (net10.0).


<!-- screenshot:start -->

![Newsletters on the front end](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.Newsletters/docs/screenshots/04-front-end.png)

<!-- screenshot:end -->

## Features

- Subscriber management (subscribe / unsubscribe / confirmation flow)
- Campaign management (Draft, Scheduled, Sent states)
- Send tracking with open-rate recording
- Public subscription form via view component
- Backoffice dashboard (Lit 3 for U17, AngularJS for U13)
- Full REST API

## View Component

Embed the subscribe form in any Razor view:

```cshtml
@await Component.InvokeAsync("NewsletterSubscribe")

@* With custom labels: *@
@await Component.InvokeAsync("NewsletterSubscribe", new {
    buttonLabel = "Join Newsletter",
    placeholderText = "your@email.com"
})
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/umbraco/api/newsletters/subscribe` | Subscribe an email |
| POST | `/umbraco/api/newsletters/unsubscribe` | Unsubscribe an email |
| GET  | `/umbraco/api/newsletters/subscribers` | List active subscribers |
| GET  | `/umbraco/api/newsletters/campaigns` | List all campaigns |
| POST | `/umbraco/api/newsletters/send` | Send a campaign |
| POST | `/umbraco/api/newsletters/campaigns` | Create a campaign |

## Database Tables

- `NewsletterSubscribers` — subscriber records with confirmation and unsubscribe tracking
- `NewsletterCampaigns` — campaign content and status
- `NewsletterSends` — per-subscriber send records with open tracking

## Notes

The `SendCampaignAsync` method records send entries and marks the campaign as Sent.
Wire it up to an email delivery service (SendGrid, SMTP, Mailgun, etc.) in
`NewslettersService.cs` at the appropriate comment.

## Changelog

### 2.3.3 — 2026-08-26

Fixes a duplicate registration on sites that still have a physical App_Plugins folder for this plugin, left behind by an older release that copied content into the site. Umbraco registered those extensions twice - once from its own scan of the folder, once from this package's embedded manifest - and logged "Extension with alias ... is already registered". The embedded manifest now yields to the physical copy.

### 2.3.2 — 2026-08-24

Removes a dashboard screenshot that showed an error toast. It was captured against a site where this plugin's API was unreachable, so it advertised a broken dashboard. No screenshot is better than a misleading one; a replacement will be taken against a working install.

### 2.3.1 — 2026-08-24

Package metadata only: the listing now carries an icon and search tags, and the project and repository links point at the organisation that actually hosts this code. No code changes.

### 2.3.0 — 2026-08-23

The Razor view behind `@await Component.InvokeAsync(...)` is now compiled into the package. It was previously carried as a loose file that nothing packed, so the component threw "view not found" on every install and the front-end usage shown in this README could not have worked.

### 2.2.3 — 2026-08-21
- A failed request now says so in the dashboard. Previously the dashboard kept its previous (usually empty) state, so a refused or failed call looked identical to having no data.

### 2.2.2 — 2026-08-21
- Dashboard now sends the backoffice token with its API calls. On Umbraco 17 those calls were arriving unauthenticated and coming back 401, which the dashboard rendered as an empty state rather than an error.
- A failed request now raises a notification instead of leaving the dashboard looking like there is simply no data.
- The plugin's tables are created on startup. They were never created before, so anything touching them failed on a fresh install.
- Runs on SQLite as well as SQL Server. It previously assumed SQL Server and failed with "Keyword not supported: 'cache'" on the database Umbraco's installer offers by default.
