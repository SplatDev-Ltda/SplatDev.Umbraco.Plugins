# LiveVideo

Live video embed for Umbraco — generate embed URLs for YouTube Live, Twitch, and Vimeo live streams.


<!-- screenshot:start -->

![LiveVideo dashboard](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.LiveVideo/docs/screenshots/01-dashboard.png)

![LiveVideo property editor](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.LiveVideo/docs/screenshots/02-property-editor.png)

![LiveVideo data type](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.LiveVideo/docs/screenshots/03-data-type.png)

<!-- screenshot:end -->

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Plugins.LiveVideo.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.LiveVideo)

## Compatibility

| Umbraco | .NET | Package Version |
|---------|------|-----------------|
| 13.x    | 8.0  | 2.0.0           |
| 17.x    | 10.0 | 2.0.0           |

## Installation

```sh
dotnet add package SplatDev.Umbraco.Plugins.LiveVideo
```

## Quick Start

The plugin auto-registers via `LiveVideoComposer`. Inject `ILiveVideoService` and call the API:

```csharp
public class StreamController : SurfaceController
{
    private readonly ILiveVideoService _liveVideo;

    public StreamController(ILiveVideoService liveVideo)
    {
        _liveVideo = liveVideo;
    }
}
```

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/umbraco/api/livevideo/GetEmbed?platform=&channelId=` | Returns embed URL for the specified platform and channel |

Supported platforms: `youtube`, `twitch`, `vimeo`.

## Usage Example

```html
<iframe src="@liveVideoEmbedUrl" width="800" height="450"
    frameborder="0" allowfullscreen></iframe>
```

## Known Limitations

- Only generates embed URLs — does not detect or verify live stream status
- No caching of embed URLs or platform availability checks
- No support for custom embed parameters (width, height, autoplay, mute)

## Changelog

### 2.2.0 — 2026-08-23
- Choosing a stream is now a property on the page, with the embed resolved before you publish. The endpoint takes a platform and a channel and only a dashboard called it, so a page's stream lived in a plain text field with the platform implied.
- The value is stored as `platform:channel`, which stays unambiguous when the two are edited separately.

## License

MIT © [SplatDev](https://github.com/SplatDev-Ltda)