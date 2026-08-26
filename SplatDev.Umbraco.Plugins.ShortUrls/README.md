# ShortUrls

Umbraco short URL plugin — generate, store, and resolve short URLs backed by any EF Core `DbContext`. Supports Umbraco 13 (net8.0) and Umbraco 17 (net10.0).


<!-- screenshot:start -->
<!-- screenshot:end -->

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Plugins.ShortUrls.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.ShortUrls)

## Compatibility

| Umbraco | .NET | Package Version |
|---------|------|-----------------|
| 13.x    | 8.0  | 2.1.12          |
| 17.x    | 10.0 | 2.1.12          |

## Installation

```sh
dotnet add package SplatDev.Umbraco.Plugins.ShortUrls
```

## Quick Start

Registration is generic in your own short-URL entity — the extension method is
`AddShortUrls<T>()`, and it does not compile without the type argument:

```csharp
builder.CreateUmbracoBuilder()
    .AddBackOffice()
    .AddWebsite()
    .AddShortUrls<YourShortUrlEntity>()   // <-- add this
    .Build();
```

## Configuration

Wire up your EF Core `DbContext` to implement `IShortUrl`:

```json
// appsettings.json
{
  "ConnectionStrings": {
    "ShortUrlDb": "Server=.;Database=ShortUrls;..."
  }
}
```

## Usage

### Implement `IShortUrl`

Your entity must implement the interface:

```csharp
using SplatDev.Umbraco.Plugins.ShortUrls.Models;

public class MyShortUrl : IShortUrl
{
    public int Id { get; set; }
    public string? ShortUrl { get; set; }
    public string Url { get; set; } = "";
}
```

### Generate and Resolve

```csharp
using SplatDev.Umbraco.Plugins.ShortUrls.Services;

var service = new ShortUrlService<MyShortUrl>(dbContext);

// Generate a unique short code (collision-safe)
string code = service.GenerateShortUrl();  // e.g. "xK7mP2"

// Save to DB
dbContext.Add(new MyShortUrl { ShortUrl = code, Url = "https://example.com/long/path" });
await dbContext.SaveChangesAsync();

// Resolve a short URL
string redirectUrl = service.Get(code);
// → "https://example.com/long/path"
```

### Front-End Controller

The `ShortUrlController<T>` implements `IVirtualPageController` — it intercepts requests to `/s/{random}` and issues a 302 redirect to the mapped URL:

```csharp
// Maps /s/xK7mP2 → redirect to stored full URL
[HttpGet]
public async Task<IActionResult> GetFromShortUrl(string shortUrl)
{
    var redirectUrl = shortUrlService.Get(shortUrl);
    return Redirect(redirectUrl);
}
```

## Architecture

| Component | Role |
|-----------|------|
| `IShortUrl` | Interface your entity must implement (`ShortUrl`, `Url`) |
| `IShortUrlService` | Generate unique codes, check existence, resolve |
| `ShortUrlController<T>` | MVC controller handling `/s/{random}` → 302 redirect |
| `ShortUrlExtensions` | Random URL-safe code generation (collision-checked) |

## Changelog

### 2.1.12 — 2026-08-26

Fixes a duplicate registration on sites that still have a physical App_Plugins folder for this plugin, left behind by an older release that copied content into the site. Umbraco registered those extensions twice - once from its own scan of the folder, once from this package's embedded manifest - and logged "Extension with alias ... is already registered". The embedded manifest now yields to the physical copy.

### 2.1.11 — 2026-08-25

Documentation only, no code change. The README's Quick Start told you to call a registration method that does not exist in this package — following it produced a compile error on the first build. There is nothing to register: the package ships Umbraco composers and the `AddComposers()` already in the default `Program.cs` finds it. The Compatibility table also now shows the version actually being shipped instead of the one it was written at.

### 2.1.10 — 2026-08-24

Removes a dashboard screenshot that showed an error toast. It was captured against a site where this plugin's API was unreachable, so it advertised a broken dashboard. No screenshot is better than a misleading one; a replacement will be taken against a working install.

### 2.1.9 — 2026-08-24

Package metadata only: the listing now carries an icon and search tags, and the project and repository links point at the organisation that actually hosts this code. No code changes.

### 2.1.8 — 2026-08-21
- A failed request now says so in the dashboard. Previously the dashboard kept its previous (usually empty) state, so a refused or failed call looked identical to having no data.

### 2.1.7 — 2026-08-21
- Dashboard now sends the backoffice token with its API calls. On Umbraco 17 those calls were arriving unauthenticated and coming back 401, which the dashboard rendered as an empty state rather than an error.
- A failed request now raises a notification instead of leaving the dashboard looking like there is simply no data.

## License

MIT © [SplatDev](https://github.com/splatdevtech)

---

[Feedback](mailto:feedback@splatdev.com)