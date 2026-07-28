# SplatDev.Umbraco.Plugins.Tweets

Twitter/X feed display plugin for Umbraco 13 (net8.0) and Umbraco 17 (net10.0).

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Plugins.Tweets.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.Tweets)

## Compatibility

| Umbraco | .NET | Package Version |
|---------|------|-----------------|
| 13.x    | 8.0  | 2.0.1           |
| 17.x    | 10.0 | 2.0.1           |

## Installation

```sh
dotnet add package SplatDev.Umbraco.Plugins.Tweets
```
Fetches tweets via Twitter API v2, caches them locally in SQL Server, and renders
styled tweet cards in Razor views or the backoffice dashboard.

## Features

- Fetches tweets using Twitter API v2 Bearer Token (OAuth 2.0)
- Caches tweets in a local `CachedTweets` SQL table (avoids rate limits on page load)
- Configurable maximum tweets count and refresh interval
- Backoffice dashboard with tweet feed preview and manual refresh trigger
- View component for embedding the feed in Razor views
- Umbraco 17 dashboard (Lit 3) and Umbraco 13 dashboard (AngularJS)

## Configuration

Add to `appsettings.json`:

```json
{
  "UmbracoCms": {
    "Tweets": {
      "BearerToken": "YOUR_TWITTER_API_V2_BEARER_TOKEN",
      "TwitterHandle": "YourHandle",
      "MaxTweets": 10,
      "RefreshIntervalMinutes": 60,
      "CacheEnabled": true
    }
  }
}
```

> **Important**: Keep the Bearer Token out of source control. Use environment variables
> or `appsettings.Production.json` (excluded from git) in production.

## Embedding the Feed

```cshtml
@* Default (uses MaxTweets from config) *@
@await Component.InvokeAsync("Tweets")

@* Limit to 5 tweets on a sidebar *@
@await Component.InvokeAsync("Tweets", new { maxItems = 5 })
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET  | `/umbraco/api/tweets/feed`    | Return cached tweets |
| POST | `/umbraco/api/tweets/refresh` | Trigger a live API refresh |

## Database Table

`CachedTweets` — stores tweet content, author info, engagement metrics, and cache timestamp.
Run migrations or `context.Database.EnsureCreated()` on startup.

## Notes on Twitter API v2

- A Twitter/X Developer account and App are required.
- The free tier allows read access to public tweets for owned accounts.
- The plugin handles the case where `BearerToken` or `TwitterHandle` is not configured
  by logging a warning and returning the current cache without error.

## License

MIT © [SplatDev](https://github.com/SplatDev-Ltda)
