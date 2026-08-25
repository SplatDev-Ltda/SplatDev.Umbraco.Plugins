# SEO

Umbraco SEO plugin — drop-in meta tags, Open Graph, canonical URLs, and robots directives for published content. Supports Umbraco 13 (net8.0) and Umbraco 17 (net10.0).


<!-- screenshot:start -->
<!-- screenshot:end -->

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Plugins.SEO.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.SEO)

## Compatibility

| Umbraco | .NET | Package Version |
|---------|------|-----------------|
| 13.x    | 8.0  | 2.1.7           |
| 17.x    | 10.0 | 2.1.7           |

## Installation

```sh
dotnet add package SplatDev.Umbraco.Plugins.SEO
```

## Quick Start

No registration call is needed. The package ships Umbraco composers, so the `AddComposers()` already in the default `Program.cs` picks the plugin up as soon as the package is referenced.

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

## Changelog

### 2.1.7 — 2026-08-25

Documentation only, no code change. The README's Quick Start told you to call a registration method that does not exist in this package — following it produced a compile error on the first build. There is nothing to register: the package ships Umbraco composers and the `AddComposers()` already in the default `Program.cs` finds it. The Compatibility table also now shows the version actually being shipped instead of the one it was written at.

### 2.1.6 — 2026-08-24

Removes a dashboard screenshot that showed an error toast. It was captured against a site where this plugin's API was unreachable, so it advertised a broken dashboard. No screenshot is better than a misleading one; a replacement will be taken against a working install.

### 2.1.5 — 2026-08-24

Package metadata only: the listing now carries an icon and search tags, and the project and repository links point at the organisation that actually hosts this code. No code changes.

### 2.1.4 — 2026-08-24

This package now keeps a changelog. Earlier releases predate it and are not reconstructed here — consult the repository history for those. From this version on, every release records what changed for someone using it.

## License

MIT © [SplatDev](https://github.com/splatdevtech)

---

[Feedback](mailto:feedback@splatdev.com)