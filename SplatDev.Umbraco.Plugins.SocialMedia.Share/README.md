# SocialMedia.Share

Umbraco social sharing buttons plugin — generate share URLs for Facebook, Twitter, LinkedIn, WhatsApp, and Email with configurable display options.


<!-- screenshot:start -->

![SocialMedia.Share dashboard](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.SocialMedia.Share/docs/screenshots/01-dashboard.png)

<!-- screenshot:end -->

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Plugins.SocialMedia.Share.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.SocialMedia.Share)

## Compatibility

| Umbraco | .NET | Package Version |
|---------|------|-----------------|
| 13.x    | 8.0  | 2.2.1           |
| 17.x    | 10.0 | 2.2.1           |

## Installation

```sh
dotnet add package SplatDev.Umbraco.Plugins.SocialMedia.Share
```

## Quick Start

The plugin auto-registers via `ShareComposer`. Inject `IShareService` or call the API directly.

## Configuration

Add to `appsettings.json`:

```json
{
  "SocialMedia": {
    "Share": {
      "EnabledPlatforms": ["Facebook", "Twitter", "LinkedIn", "WhatsApp", "Email"],
      "ShowLabels": true
    }
  }
}
```

Supported platforms: `Facebook`, `Twitter`, `LinkedIn`, `WhatsApp`, `Email`.

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/umbraco/api/ShareApi/GetShareLinks?pageUrl=&pageTitle=` | Returns share URLs for enabled platforms |

## Usage

```javascript
// Fetch share links from API
fetch('/umbraco/api/ShareApi/GetShareLinks?pageUrl=' + encodeURIComponent(location.href) + '&pageTitle=' + encodeURIComponent(document.title))
    .then(r => r.json())
    .then(links => {
        // Render share buttons using the returned URLs
        links.forEach(platform => { /* render share button */ });
    });
```

## Known Limitations

- Only generates share URLs — does not perform actual posting or track share analytics
- No built-in front-end rendering; consumers must call the API and render buttons themselves
- Default platforms are hardcoded as Facebook, Twitter, LinkedIn, WhatsApp, Email if no config section is provided

## Changelog

### 2.2.1 — 2026-08-24

Package metadata only: the listing now carries an icon and search tags, and the project and repository links point at the organisation that actually hosts this code. No code changes.

### 2.2.0 — 2026-08-23

The Umbraco Marketplace listing now carries this plugin's screenshots. The listing keeps its own screenshot list rather than reading the README, and this one was empty — so the entry showed no images at all.

### 2.1.4 — 2026-08-21
- README now shows a screenshot of the dashboard.

## License

MIT © [SplatDev](https://github.com/SplatDev-Ltda)