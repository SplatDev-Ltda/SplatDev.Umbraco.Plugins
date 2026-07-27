# SocialMedia.Channels

Umbraco social media channel management plugin — manage connected accounts and schedule posts to social platforms from a backoffice dashboard.

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

## License

MIT © [SplatDev](https://github.com/SplatDev-Ltda)
