# SocialMedia.Channels

Umbraco social media channel management plugin — manage connected accounts and schedule posts to social platforms from a backoffice dashboard.


<!-- screenshot:start -->

![SocialMedia.Channels dashboard](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.SocialMedia.Channels/docs/screenshots/01-dashboard.png)

<!-- screenshot:end -->

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Plugins.SocialMedia.Channels.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.SocialMedia.Channels)

## Compatibility

| Umbraco | .NET | Package Version |
|---------|------|-----------------|
| 13.x    | 8.0  | 2.0.0           |
| 17.x    | 10.0 | 2.0.0           |

## Installation

```sh
dotnet add package SplatDev.Umbraco.Plugins.SocialMedia.Channels
```

## Quick Start

The plugin auto-registers via `SocialChannelsComposer`, which sets up the EF Core DbContext and `ISocialChannelsService`.

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
| GET | `/umbraco/api/SocialChannelsApi/GetChannels` | List connected channels |
| POST | `/umbraco/api/SocialChannelsApi/AddChannel` | Add a social media channel |
| DELETE | `/umbraco/api/SocialChannelsApi/RemoveChannel?id=` | Remove a channel |
| GET | `/umbraco/api/SocialChannelsApi/GetPosts` | List scheduled posts |
| POST | `/umbraco/api/SocialChannelsApi/SchedulePost` | Schedule a post |
| DELETE | `/umbraco/api/SocialChannelsApi/DeletePost?id=` | Delete a scheduled post |

## Usage

Manage social media channels and schedule posts from the backoffice dashboard:

```javascript
// Schedule a post
fetch('/umbraco/api/SocialChannelsApi/SchedulePost', {
    method: 'POST',
    body: JSON.stringify({
        channelId: 1,
        content: 'Check out our new product!',
        scheduledAt: '2026-08-01T09:00:00Z'
    }),
    headers: { 'Content-Type': 'application/json' }
});
```

## Known Limitations

- CRUD-only management of channels and scheduled posts — no actual OAuth connection flow or social media API integration is implemented
- Stores channel data and scheduled posts but does not publish to social media platforms
- No support for image/media attachments in scheduled posts
- Uses Umbraco's own database connection string (no separate DB support)

## Changelog

### 2.3.0 — 2026-08-23

The Umbraco Marketplace listing now carries this plugin's screenshots. The listing keeps its own screenshot list rather than reading the README, and this one was empty — so the entry showed no images at all.

### 2.2.2 — 2026-08-21
- Access tokens are no longer sent to the browser. GetChannels and AddChannel returned the stored entity, which carries AccessToken and RefreshToken, so every connected account's OAuth credentials were serialised into the dashboard's JSON. They now return a summary that says whether a token exists and whether it has expired, and nothing more.
- The dashboard reaches all six operations it always had: list, connect and disconnect a channel, and list, schedule and remove a post. It previously made no requests at all.
- A failed request now says so instead of leaving an empty list.

### 2.2.1 — 2026-08-21
- The plugin's tables are created on startup. They were never created before, so anything touching them failed on a fresh install.
- Runs on SQLite as well as SQL Server. It previously assumed SQL Server and failed with "Keyword not supported: 'cache'" on the database Umbraco's installer offers by default.

## License

MIT © [SplatDev](https://github.com/SplatDev-Ltda)