# UmbracoCms.Plugins.Newsletters

Newsletter subscriber management, campaigns, and send tracking for Umbraco 13 (net8.0) and Umbraco 17 (net10.0).


<!-- screenshot:start -->

![Newsletters dashboard](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.Newsletters/docs/screenshots/01-dashboard.png)

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

### 2.2.2 — 2026-08-21
- Dashboard now sends the backoffice token with its API calls. On Umbraco 17 those calls were arriving unauthenticated and coming back 401, which the dashboard rendered as an empty state rather than an error.
- A failed request now raises a notification instead of leaving the dashboard looking like there is simply no data.
- The plugin's tables are created on startup. They were never created before, so anything touching them failed on a fresh install.
- Runs on SQLite as well as SQL Server. It previously assumed SQL Server and failed with "Keyword not supported: 'cache'" on the database Umbraco's installer offers by default.
