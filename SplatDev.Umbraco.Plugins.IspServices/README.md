# IspServices

<!-- screenshot:start -->
<!-- screenshot:end -->

Umbraco ISP / IP resolution service — resolves client IP addresses including X-Forwarded-For header support.

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Plugins.IspServices.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.IspServices)

## Compatibility

| Umbraco | .NET | Package Version |
|---------|------|-----------------|
| 13.x    | 8.0  | 2.0.0           |
| 17.x    | 10.0 | 2.0.0           |

## Installation

```sh
dotnet add package SplatDev.Umbraco.Plugins.IspServices
```

## Quick Start

The plugin auto-registers via `IspServicesComposer`. Inject `IISPService` where needed:

```csharp
public class MyController : SurfaceController
{
    private readonly IISPService _ispService;

    public MyController(IISPService ispService)
    {
        _ispService = ispService;
    }

    public IActionResult Index()
    {
        var clientIp = _ispService.GetClientIpAddress(HttpContext);
        // Use clientIp for logging, geo-blocking, etc.
        return Content($"Your IP: {clientIp}");
    }
}
```

## API

| Method | Signature | Description |
|--------|-----------|-------------|
| `GetClientIpAddress` | `string GetClientIpAddress(HttpContext context)` | Returns the client IP, falling back from `RemoteIpAddress` to `X-Forwarded-For` header |

## Known Limitations

- Provides IP resolution only — no geo-location, ISP lookup, or IP intelligence features
- No controllers or backoffice UI; strictly a DI-registered service for programmatic use
- No support for `X-Real-IP` or other proxy headers beyond `X-Forwarded-For`

## Changelog

### 2.0.4 — 2026-08-24

Removes a dashboard screenshot that showed an error toast. It was captured against a site where this plugin's API was unreachable, so it advertised a broken dashboard. No screenshot is better than a misleading one; a replacement will be taken against a working install.

### 2.0.3 — 2026-08-24

Package metadata only: the listing now carries an icon and search tags, and the project and repository links point at the organisation that actually hosts this code. No code changes.

### 2.0.2 — 2026-08-24

This package now keeps a changelog. Earlier releases predate it and are not reconstructed here — consult the repository history for those. From this version on, every release records what changed for someone using it.

## License

MIT © [SplatDev](https://github.com/SplatDev-Ltda)
