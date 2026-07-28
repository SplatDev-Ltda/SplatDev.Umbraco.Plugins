# RedirectManager

Umbraco redirect manager plugin — CRUD for URL redirects with a backoffice dashboard, NPoco-backed persistence, pattern-based redirects, and a front-end 301 fallback handler. Supports Umbraco 13 (net8.0) and Umbraco 17 (net10.0).

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Plugins.RedirectManager.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.RedirectManager)

## Compatibility

| Umbraco | .NET | Package Version |
|---------|------|-----------------|
| 13.x    | 8.0  | 2.0.0           |
| 17.x    | 10.0 | 2.0.0           |

## Installation

```sh
dotnet add package SplatDev.Umbraco.Plugins.RedirectManager
```

## Quick Start

Register in `Program.cs`:

```csharp
builder.CreateUmbracoBuilder()
    .AddBackOffice()
    .AddWebsite()
    .AddRedirectManager()   // <-- add this
    .Build();
```

On first startup, the plugin runs a migration creating the `redirectUrls` table.

## Configuration

Add to `appsettings.json`:

```json
{
  "RedirectManager": {
    "BasePath": "/quotes",
    "ValidateParameters": true,
    "RateLimitPermit": 100,
    "RateLimitWindowSeconds": 60
  }
}
```

| Key | Default | Description |
|-----|---------|-------------|
| `BasePath` | `/quotes` | Base path for regex/pattern matching |
| `ValidateParameters` | `true` | Whether to validate incoming URL parameters |
| `RateLimitPermit` | `100` | Max redirects per rate-limit window |
| `RateLimitWindowSeconds` | `60` | Rate-limit window duration |

## Usage

### Backoffice API

The `RedirectManagerController` exposes a REST API at `/umbraco/backoffice/api/RedirectManager/`:

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `GetAll` | List all redirect URLs |
| `GET` | `Get?id=` | Get single redirect by ID |
| `POST` | `Post` | Create a new redirect |
| `PUT` | `Put` | Update an existing redirect |
| `DELETE` | `Delete?id=` | Delete by ID |
| `DELETE` | `DeleteAll` | Remove all redirects |

### Programmatic Usage

```csharp
using SplatDev.Umbraco.Plugins.RedirectManager.Models;
using SplatDev.Umbraco.Plugins.RedirectManager.Repositories;

var repo = new RedirectUrlsRepository(dbFactory);

// Add a redirect
repo.AddRedirectionUrl(new RedirectUrl
{
    Url = "/old-blog/2023/post-slug",
    RedirectToUrl = "/blog/post-slug",
    CreatedOn = DateTime.UtcNow
});

// Look up a redirect
var match = repo.GetRedirectionUrl("/old-blog/2023/post-slug");
// → RedirectUrl { Url = "/old-blog/2023/post-slug", RedirectToUrl = "/blog/post-slug" }
```

### Front-End Fallback

The `FrontEndRedirectionController` provides a "last resort" check — call it from your 404 handler:

```csharp
_fallbackRedirect.LastResortCheckIfUrlHasRedirect(
    requestedUrl: "/old-page/",
    response: HttpContext.Response
);
// Issues 301 redirect if a matching entry exists, does nothing otherwise.
```

### Pattern-Based Redirects

The `RegexRedirectComposer` + `PatternUrlRedirector` handle bulk redirects via regex patterns:

```csharp
// Config-based pattern matching
// e.g. "/quotes/by-id/{id}" → "/products/{id}"
```

## Architecture

| Component | Role |
|-----------|------|
| `RedirectUrl` (NPoco entity) | `redirectUrls` table — Url, RedirectToUrl, CreatedOn |
| `RedirectUrlsRepository` | CRUD + lookup by exact URL match |
| `RedirectManagerController` | Backoffice REST API (auth-gated) |
| `FrontEndRedirectionController` | 301 fallback from 404 handler |
| `RegexRedirectComposer` | Pattern-based redirect pipeline |
| `RedirectConfiguration` | Rate limiting and path configuration |

## License

MIT © [SplatDev](https://github.com/splatdevtech)

---

[Feedback](mailto:feedback@splatdev.com)
