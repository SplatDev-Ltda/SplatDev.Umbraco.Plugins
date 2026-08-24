# VideoPreview

Video thumbnail preview for Umbraco — extract video metadata and auto-generate thumbnail URLs from YouTube, Vimeo, and Dailymotion video URLs.


<!-- screenshot:start -->

![VideoPreview dashboard](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.VideoPreview/docs/screenshots/01-dashboard.png)

![VideoPreview property editor](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.VideoPreview/docs/screenshots/02-property-editor.png)

![VideoPreview data type](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.VideoPreview/docs/screenshots/03-data-type.png)

<!-- screenshot:end -->

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

## Changelog

### 2.3.2 — 2026-08-24

Restores the `icon-movie` icon and the Rich Content group this plugin had as YouTube Preview on Umbraco 7 and 8, and its Brazilian Portuguese translation.

### 2.3.1 — 2026-08-24

Package metadata only: the listing now carries an icon and search tags, and the project and repository links point at the organisation that actually hosts this code. No code changes.

### 2.3.0 — 2026-08-23

The property editor can now be used. Its manifest declared a property editor schema with no server-side editor behind it, so Umbraco refused to create a data type for it with "The targeted property editor was not found". It now stores its value with a schema the server actually provides.

The Umbraco Marketplace listing now carries this plugin's screenshots. The listing keeps its own screenshot list rather than reading the README, and this one was empty — so the entry showed no images at all.

### 2.2.0 — 2026-08-23
- A video URL is now a property editor that shows the thumbnail the site will actually use. The plugin turned YouTube, Vimeo and Dailymotion links into thumbnails and shipped that as a dashboard you paste a URL into — a page's video URL was an ordinary text field, and whether it resolved to anything was discovered later, on the front end.
- A link the plugin does not understand says so while you are editing, instead of silently producing no thumbnail.

### 2.1.4 — 2026-08-21
- README now shows a screenshot of the dashboard.

## License

MIT © [SplatDev](https://github.com/SplatDev-Ltda)