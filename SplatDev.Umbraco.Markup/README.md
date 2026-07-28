# SplatDev.Umbraco.Markup

HTML and markup helper extensions for Umbraco 13 (net8.0) and Umbraco 17 (net10.0) — HTML-to-text conversion, accent removal, Razor view rendering, grid content inspection, typed content traversal, and media helper extensions.

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Markup.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Markup)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Compatibility

| .NET | Umbraco | Package Version |
|------|---------|-----------------|
| 8.0  | 13      | 2.0.0           |
| 10.0 | 17      | 2.0.0           |

## Installation

```sh
dotnet add package SplatDev.Umbraco.Markup
```

## Configuration

### HTML extensions

```csharp
using SplatDev.Umbraco.Markup;

// Convert HTML to plain text
string html = "<h1>Hello World</h1><p>This is <strong>HTML</strong> content.</p>";
string plainText = HtmlExtensions.ConvertHtmlToPlainText(html);
// Result: "Hello World. This is HTML content."

// Remove accents from text
string accented = "café résumé naïveté";
string unaccented = HtmlExtensions.GetWithoutAccent(accented);
// Result: "cafe resume naivete"

// Remove <p> wrapper tags from HTML
string wrapped = "<p><span>Inner content</span></p>";
string unwrapped = HtmlExtensions.RemoveParagraphWrapperTags(wrapped);
// Result: "<span>Inner content</span>"
```

### Razor view rendering

```csharp
using SplatDev.Umbraco.Markup;

// Render a Razor view to a string from a controller
public class EmailController : Controller
{
    public async Task<IActionResult> Send()
    {
        var model = new EmailViewModel { UserName = "John", OrderId = 12345 };

        string htmlBody = await this.RenderViewAsync("Emails/OrderConfirmation", model);

        // Send the rendered HTML as an email
        await _emailService.SendAsync("user@example.com", "Order Confirmed", htmlBody);
    }
}
```

### Published content extensions

```csharp
using SplatDev.Umbraco.Markup;

// Check if content has a grid value
bool hasGrid = model.HasGridValue("mainContent");

// Get typed children
var articles = model.Children<Article>()
    .Where(a => a.IsPublished())
    .OrderByDescending(a => a.PublishDate);

// Get typed descendants (recursive)
var allNewsItems = model.Descendants<NewsItem>();

// Find the first ancestor of a specific content type
var section = model.GetPublishedContentOfType<Section>();
```

### Media extensions

```csharp
using SplatDev.Umbraco.Markup;

// Get media item by UDI or ID
var image = mediaItem.GetImageUrl(width: 800, height: 600, crop: true);

// Retrieve media with crop configuration
var croppedUrl = MediaExtensions.GetCroppedUrl(mediaItem, "hero", width: 1200);
```

## Usage

### Grid value inspection

```csharp
using SplatDev.Umbraco.Markup;

// Determine grid rendering strategy
if (content.HasGridValue("bodyContent"))
{
    // Render via Grid renderer with custom settings
    @Html.GetGridHtml(content, "bodyContent", "bootstrap3")
}
else
{
    // Fall back to a Block List or simple property
    @content.Value("bodyContent")
}
```

### Full Razor view example

```csharp
// In a controller action
public async Task<IActionResult> Invoice(int orderId)
{
    var order = await _orderService.GetOrderAsync(orderId);

    var html = await this.RenderViewAsync("Pdf/Invoice", order);

    var pdf = await _pdfService.GenerateFromHtmlAsync(html);

    return File(pdf, "application/pdf", $"invoice-{orderId}.pdf");
}
```

## Features

- **ConvertHtmlToPlainText** — strips HTML tags and produces clean plain text with sensible whitespace
- **GetWithoutAccent** — removes diacritical marks (accents, umlauts, cedillas) from strings
- **RemoveParagraphWrapperTags** — unwraps `<p>` tags while preserving inner content
- **RenderViewAsync<TModel>** — renders Razor views to strings for emails, PDFs, or API responses
- **HasGridValue** — checks whether a `PublishedContent` item contains grid data for a given alias
- **Children<T>** — returns children of a node filtered and cast to a specific Umbraco model type
- **Descendants<T>** — recursive traversal returning all descendants cast to a specific type
- **GetPublishedContentOfType** — walks the ancestor tree to find the nearest parent of a given type
- **MediaExtensions** — helpers for media URL generation with cropping and resizing
- **GridExtensions** — utilities for inspecting and rendering Umbraco Grid data
- Dual-targeted for **Umbraco 13** (net8.0) and **Umbraco 17** (net10.0)

## Key Classes

| Class | Purpose |
|-------|---------|
| `HtmlExtensions` | HTML-to-text conversion, accent removal, paragraph unwrapping |
| `RazorExtensions` | Render Razor views to strings from controllers |
| `PublishedContentExtensions` | Typed content traversal: Children, Descendants, grid inspection |
| `MediaExtensions` | Media URL generation with crop and resize parameters |
| `GridExtensions` | Grid data inspection and rendering helpers |

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `Umbraco.Cms.Core` | 13.12.0 / 17.3.4 | Core Umbraco APIs (IPublishedContent, grid, media) |
| `Umbraco.Cms.Infrastructure` | 13.12.0 / 17.3.4 | Umbraco infrastructure services |
| `Umbraco.Cms.Web.Common` | 13.12.0 / 17.3.4 | Web-layer helpers and Razor integration |
| `Umbraco.Cms.Web.Website` | 13.12.0 / 17.3.4 | Website rendering pipeline |
| `Umbraco.Cms.Web.BackOffice` | 13.12.0 | Backoffice helpers (net8.0 only) |
| `Umbraco.Cms.Api.Management` | 17.3.4 | Management API (net10.0 only) |
| `Newtonsoft.Json` | 13.0.3 | JSON serialization for grid and block data |
| `Microsoft.AspNetCore.App` | — | Framework reference for Razor and MVC |

---

**SplatDev.Umbraco.Markup** — part of the [SplatDev.Umbraco.Plugins](https://github.com/SplatDev-Ltda/SplatDev.Umbraco.Plugins) suite. Licensed under MIT. &copy; SplatDev Ltda.
