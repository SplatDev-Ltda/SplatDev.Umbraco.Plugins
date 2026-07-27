# LazyLoad

Lazy loading plugin for Umbraco — intercepts content rendering to add lazy loading to `<img>` and `<iframe>` tags using `IntersectionObserver`.

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Plugins.LazyLoad.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.LazyLoad)

## Compatibility

| Umbraco | .NET | Package Version |
|---------|------|-----------------|
| 13.x    | 8.0  | 1.0.1           |
| 17.x    | 10.0 | 1.0.1           |

## Installation

```sh
dotnet add package SplatDev.Umbraco.Plugins.LazyLoad
```

The plugin registers automatically via `IComposer` — no manual `Program.cs` registration needed. Just add the package and build.

## Features

- **Tag Helpers**: Intercepts `<img>` and `<iframe>` elements, replacing `src` with `data-src` and a placeholder
- **Client-side JS**: Uses `IntersectionObserver` (200px root margin) to swap `data-src` back to `src` when elements become visible
- **Graceful fallback**: Loads all images immediately if `IntersectionObserver` is not supported
- Backoffice dashboard at **Settings → Lazy Load** with toggle controls

## Configuration

Add to `appsettings.json`:

```json
{
  "LazyLoad": {
    "Enabled": true,
    "Placeholder": "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=",
    "LazyLoadIframes": true
  }
}
```

| Key | Default | Description |
|-----|---------|-------------|
| `Enabled` | `true` | Enables the tag helpers (note: currently not enforced — see limitations) |
| `Placeholder` | 1x1 transparent GIF | Base64 image shown while the real image loads |
| `LazyLoadIframes` | `true` | Whether to also lazy-load iframes |

## Known limitations

- **Settings not persisted** — the dashboard Save button updates settings in-memory only; changes revert on app restart. **Tracked in SPL-XXXX.**
- **`Enabled` flag is not enforced** — the tag helpers always transform all images regardless of the `Enabled` setting
- **Hardcoded placeholder** — the tag helpers ignore the configurable `Placeholder` setting from `appsettings.json`
- **No opt-out mechanism** — all `<img>` and `<iframe>` elements are transformed; inline icons and SVGs cannot be excluded
- **Script loads in backoffice** — the lazy load JS is loaded on every Umbraco backoffice page via `package.manifest`, not just the front-end
- Does not use the native `loading="lazy"` attribute for browsers that support it

## License

MIT © [SplatDev](https://github.com/SplatDev-Ltda)
