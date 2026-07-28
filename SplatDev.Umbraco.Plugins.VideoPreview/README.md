# VideoPreview

Video thumbnail preview for Umbraco — extract video metadata and auto-generate thumbnail URLs from YouTube, Vimeo, and Dailymotion video URLs.

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Plugins.VideoPreview.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.VideoPreview)

## Compatibility

| Umbraco | .NET | Package Version |
|---------|------|-----------------|
| 13.x    | 8.0  | 1.0.0           |
| 17.x    | 10.0 | 1.0.0           |

## Installation

```sh
dotnet add package SplatDev.Umbraco.Plugins.VideoPreview
```

## Quick Start

The plugin auto-registers via `VideoPreviewComposer`. Inject `IVideoPreviewService` or use the API:

```csharp
public class MediaController : SurfaceController
{
    private readonly IVideoPreviewService _videoPreview;

    public MediaController(IVideoPreviewService videoPreview)
    {
        _videoPreview = videoPreview;
    }
}
```

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/umbraco/api/videopreview/GetVideoInfo?url=` | Returns video metadata (title, thumbnail URL, duration, platform) |

## Usage

```javascript
// Fetch video preview info from a URL
fetch('/umbraco/api/videopreview/GetVideoInfo?url=https://www.youtube.com/watch?v=...')
    .then(r => r.json())
    .then(info => {
        // info.title, info.thumbnailUrl, info.platform, info.duration
        document.getElementById('thumbnail').src = info.thumbnailUrl;
    });
```

## Known Limitations

- Extracts metadata via HttpClient scraping — depends on external video platform pages being reachable
- No caching of video info results; each call performs a fresh HTTP request
- No support for custom thumbnail sizes or video platform configuration

## License

MIT © [SplatDev](https://github.com/SplatDev-Ltda)
