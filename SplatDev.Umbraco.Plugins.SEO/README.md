# SEO

Umbraco SEO plugin — drop-in meta tags, Open Graph, canonical URLs, and robots directives for published content. Supports Umbraco 13 (net8.0) and Umbraco 17 (net10.0).

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Plugins.SEO.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.SEO)

## Compatibility

| Umbraco | .NET | Package Version |
|---------|------|-----------------|
| 13.x    | 8.0  | 2.0.0           |
| 17.x    | 10.0 | 2.0.0           |

## Installation

```sh
dotnet add package SplatDev.Umbraco.Plugins.SEO
```

## Quick Start

Register in `Program.cs`:

```csharp
builder.CreateUmbracoBuilder()
    .AddBackOffice()
    .AddWebsite()
    .AddSEO()   // <-- add this
    .Build();
```

## Usage

### Meta Tags in Views

The plugin exposes a strongly-typed `SEO` model holding standard meta fields. Use it in your Razor views:

```html
@using SplatDev.Umbraco.Plugins.SEO.Models

@{
    var seo = new SEO
    {
        Title = Model.Value<string>("metaTitle") ?? Model.Name,
        Description = Model.Value<string>("metaDescription"),
        Tags = Model.Value<IEnumerable<string>>("tags") ?? [],
        Canonical = Model.Value<string>("canonical") ?? Model.Url(mode: UrlMode.Absolute),
        Robots = "index, follow"
    };
}

<title>@seo.Title</title>
<meta name="description" content="@seo.Description" />
<link rel="canonical" href="@seo.Canonical" />
```

### Open Graph

Call `GetOpenGraph()` on any `IPublishedContent` to populate social sharing tags:

```html
@using SplatDev.Umbraco.Plugins.SEO.Extensions

@{
    var og = Model.GetOpenGraph();
}

<meta property="og:title" content="@og.Title" />
<meta property="og:type" content="@og.Type" />
<meta property="og:url" content="@og.Url" />
<meta property="og:image" content="@og.Image" />
<meta property="og:description" content="@og.Description" />
```

The extension reads Umbraco properties (`metaTitle`, `metaDescription`, `shareImage`, `canonical`, `author`) and falls back to sensible defaults (page name, absolute URL, creation date).

### URL Helpers

```csharp
@using SplatDev.Umbraco.Plugins.SEO.Extensions

// Check URL structure
var isSubdomain = url.IsSubdomain();
var isWww = url.IsSubdomainNonWww();
var isAdmin = url.IsSubdomainAdmin(); // e.g. edit.example.com
```

## Configuration

No `appsettings.json` keys required — all data comes from Umbraco content properties.

## Models

| Model | Properties |
|-------|-----------|
| `SEO` | `Title`, `Description`, `Tags`, `Canonical`, `Robots`, `Charset` |
| `OpenGraph` | `Title`, `Type`, `Url`, `Image`, `Description`, `Author`, `DateCreated` |

## License

MIT © [SplatDev](https://github.com/splatdevtech)

---

[Feedback](mailto:feedback@splatdev.com)
