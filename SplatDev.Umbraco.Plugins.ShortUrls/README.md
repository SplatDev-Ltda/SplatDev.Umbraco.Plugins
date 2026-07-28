# ShortUrls

Umbraco short URL plugin — generate, store, and resolve short URLs backed by any EF Core `DbContext`. Supports Umbraco 13 (net8.0) and Umbraco 17 (net10.0).

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Plugins.ShortUrls.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.ShortUrls)

## Compatibility

| Umbraco | .NET | Package Version |
|---------|------|-----------------|
| 13.x    | 8.0  | 2.0.0           |
| 17.x    | 10.0 | 2.0.0           |

## Installation

```sh
dotnet add package SplatDev.Umbraco.Plugins.ShortUrls
```

## Quick Start

Register in `Program.cs`:

```csharp
builder.CreateUmbracoBuilder()
    .AddBackOffice()
    .AddWebsite()
    .AddShortUrls()   // <-- add this
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

## License

MIT © [SplatDev](https://github.com/splatdevtech)

---

[Feedback](mailto:feedback@splatdev.com)
