# SvgViewer

SVG file viewer plugin for Umbraco — renders sanitized inline SVG files from the Umbraco media library safely.

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Plugins.SvgViewer.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.SvgViewer)

## Compatibility

| Umbraco | .NET | Package Version |
|---------|------|-----------------|
| 13.x    | 8.0  | 1.0.1           |
| 17.x    | 10.0 | 1.0.1           |

## Installation

```sh
dotnet add package SplatDev.Umbraco.Plugins.SvgViewer
```

The plugin registers automatically via `IComposer` — no manual `Program.cs` registration needed. Just add the package and build.

## Features

- Fetch and display sanitized SVG content from the Umbraco media library
- XSS sanitization: strips `<script>` tags, `on*` event handlers, `javascript:` hrefs, and `javascript:` xlink:hrefs
- Dimension parsing from `width`/`height` attributes or `viewBox` (handles `px` suffix)
- Handles both plain string and JSON-wrapped (`{"src": "..."}`) media path formats
- Backoffice dashboard at **Settings → SVG Viewer** with media key lookup and "Load All SVGs" grid preview
- Read-only property editor (`SvgCustomViewer`) for inline SVG display in backoffice

## API endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `umbraco/api/svgviewer/GetSvg?mediaKey={guid}` | GET | Returns sanitized SVG content for a single media item |
| `umbraco/api/svgviewer/GetAllSvg` | GET | Returns all root-level SVGs |

## Known limitations

- **Root media only** — `GetAllSvg` scans only the root media folder; SVGs in sub-folders are not discovered
- **No pagination** — loads all root-level SVGs in one request
- **No caching** — every API call re-reads and parses files from disk
- **Regex-based sanitization** — uses regex rather than XML-parser-based sanitization; sophisticated XSS payloads involving CDATA or entity encoding could potentially bypass filters in edge cases
- XML declaration parsing may fail for SVGs with `<?xml?>` preamble
- API endpoints are unauthenticated (inherit from `ControllerBase`)
- No mechanism to load SVG from a media picker in the property editor

## License

MIT © [SplatDev](https://github.com/SplatDev-Ltda)
