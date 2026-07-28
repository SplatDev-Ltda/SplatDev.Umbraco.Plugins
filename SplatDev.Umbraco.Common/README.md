# SplatDev.Umbraco.Common

Common extension methods and utilities for Umbraco development. Provides a rich set of helpers for working with published content, strings, cookies, TempData, security headers, runtime minification, and custom content finders — reducing boilerplate across all SplatDev Umbraco plugins.

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Common.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Common)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Compatibility

| .NET | Umbraco | Package Version |
|------|---------|-----------------|
| 8.0  | 13.12.0 | 1.0.0           |
| 10.0 | 17.3.4  | 1.0.0           |

## Installation

```sh
dotnet add package SplatDev.Umbraco.Common
```

## Usage

### PublishedContentExtensions

Easily traverse and query the Umbraco content tree.

```csharp
using SplatDev.Umbraco.Common.Extensions;

var currentPage = UmbracoContext.PublishedRequest.PublishedContent;

// Get ancestor by document type alias
var homePage = currentPage.AncestorOfType("home");

// Get children of a specific type
var articles = currentPage.ChildrenOfType("article");

// Get a strongly-typed property value
var title = currentPage.GetPropertyValue<string>("title");

// Check if content has a template
bool hasTemplate = currentPage.HasTemplate();
```

### StringExtensions

```csharp
using SplatDev.Umbraco.Common.Extensions;

string raw = "Hello World! This is a test.";

// Generate a URL-safe slug
string slug = raw.ToUrlSlug(); // "hello-world-this-is-a-test"

// Truncate with ellipsis
string excerpt = raw.Truncate(15); // "Hello World!..."

// Strip HTML tags
string clean = "<p>Text</p>".StripHtml(); // "Text"
```

### CookieExtensions

```csharp
using SplatDev.Umbraco.Common.Extensions;

// Set a cookie
Response.SetCookie("user_pref", "dark-mode", 30); // expires in 30 days

// Get a cookie value
string pref = Request.GetCookieValue("user_pref");

// Delete a cookie
Response.DeleteCookie("user_pref");
```

### TempDataExtensions

```csharp
using SplatDev.Umbraco.Common.Extensions;

// Store complex objects in TempData
TempData.Put("alert", new { Type = "success", Message = "Saved!" });

// Retrieve complex objects from TempData
var alert = TempData.Get<dynamic>("alert");
```

### RuntimeMinifierExtensions

```csharp
using SplatDev.Umbraco.Common.Extensions;

// Minify HTML at runtime
string html = "<div>   <p>Hello</p>   </div>";
string minified = html.MinifyHtml();

// Minify CSS
string css = "body { color: red; }";
string minifiedCss = css.MinifyCss();

// Minify JavaScript
string js = "function hello() { return 'world'; }";
string minifiedJs = js.MinifyJs();
```

### FallbackExtensions

```csharp
using SplatDev.Umbraco.Common.Extensions;

// Safe null-coalescing for Umbraco properties
string metaDescription = currentPage
    .Fallback("metaDescription", "description")
    .GetValue<string>() ?? "Default description";
```

### SanitizedUrlContentFinder

A custom `IContentFinder` that sanitizes incoming URLs before content lookup — normalizes trailing slashes, lowercases paths, and strips query strings for clean content matching.

```csharp
// Registered automatically via IComposer or manually:
builder.Services.AddSingleton<IContentFinder, SanitizedUrlContentFinder>();
```

## Features

- `PublishedContentExtensions` — Safe traversal, property access, and content querying
- `StringExtensions` — URL slugs, truncation, HTML stripping
- `RuntimeMinifierExtensions` — On-the-fly HTML, CSS, and JS minification
- `FallbackExtensions` — Graceful property fallback chains for Umbraco content
- `CookieExtensions` — Simplified cookie read/write/delete operations
- `TempDataExtensions` — Store and retrieve complex objects in TempData
- `SanitizedUrlContentFinder` — URL normalization content finder
- Security headers via `Joonasw.AspNetCore.SecurityHeaders` and `NWebsec`

## Dependencies

| Package | Purpose |
|---------|---------|
| `Umbraco.Cms.Core` (v13.12.0 / v17.3.4) | Umbraco core APIs |
| `Umbraco.Cms.Web.Common` (v13.12.0 / v17.3.4) | Umbraco web framework |
| `Umbraco.Cms.Web.Website` (v13.12.0 / v17.3.4) | Umbraco website runtime |
| `Joonasw.AspNetCore.SecurityHeaders` (v6.0.0) | CSP and security header middleware |
| `NWebsec.AspNetCore.Middleware` (v3.0.0) | Additional security middleware |

## Target Frameworks

- `net8.0` — for Umbraco 13 applications (v13.12.0)
- `net10.0` — for Umbraco 17 applications (v17.3.4)

---

**SplatDev.Umbraco.Common** — part of the [SplatDev.Umbraco.Plugins](https://github.com/SplatDev-Ltda/SplatDev.Umbraco.Plugins) suite. Licensed under MIT. &copy; SplatDev Ltda.
