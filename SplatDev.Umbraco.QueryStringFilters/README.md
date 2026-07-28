# SplatDev.Umbraco.QueryStringFilters

ASP.NET Core middleware that sanitizes query strings on incoming requests — strips dangerous characters from paths and filters parameters against a hardcoded allowlist. Designed to mitigate query string injection attacks on Umbraco 13 and Umbraco 17 front-end sites.

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.QueryStringFilters.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.QueryStringFilters)

## Compatibility

| .NET | Umbraco | Package Version |
|------|---------|-----------------|
| 8.0  | 13      | 2.0.0           |
| 10.0 | 17      | 2.0.0           |

## Installation

```sh
dotnet add package SplatDev.Umbraco.QueryStringFilters
```

## What's implemented

### QueryStringStripMiddleware

ASP.NET Core middleware that runs on every request (except backoffice paths containing `/umbraco`) and performs two sanitization steps:

1. **Path cleaning** — strips `?` and `&` characters from the request path. This prevents attackers from injecting query string delimiters into clean URLs (e.g., `/page/foo?malicious=1` becomes `/page/foo`).

2. **Parameter filtering** — rebuilds the query string to include only whitelisted parameters. Any query parameter not in the allowlist is silently dropped.

**Whitelisted parameters (19):** `random`, `direction`, `sort`, `searchDataType`, `query`, `quoteId`, `profession`, `nationality`, `month`, `day`, `letter`, `authorSlug`, `quoteSlug`, `PageSize`, `Page`, `TotalPages`, `TotalResults`, `SearchTerm`, `SearchDataType`, `topic`

### QueryStringExtensions

A static helper for URL manipulation:

- **`RemoveQueryStringByKey(string url, string key)`** — removes a single query string key from a URL. Parses the URI, strips the specified key, and returns the cleaned URL. Returns the path-only URL if no query parameters remain.

## Configuration

### Middleware registration

This package does **not** auto-register via `IComposer`. Add the middleware to your pipeline in `Program.cs` or a startup filter:

```csharp
using SplatDev.Umbraco.QueryStringFilters.Extensions;

// In Program.cs — add early in the pipeline, before routing
app.UseMiddleware<QueryStringStripMiddleware>();
```

### Appsettings

No appsettings keys are required. The allowlist is entirely hardcoded in `QueryStringStripMiddleware`.

## Usage

### Middleware pipeline

Register early in the pipeline so query strings are sanitized before routing or controller execution:

```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

// Sanitize query strings before anything else
app.UseMiddleware<QueryStringStripMiddleware>();

// ... rest of the pipeline
app.UseUmbraco()
   .WithMiddleware(u =>
   {
       u.UseBackOffice();
       u.UseWebsite();
   })
   .WithEndpoints(u =>
   {
       u.UseBackOfficeEndpoints();
       u.UseWebsiteEndpoints();
   });

app.Run();
```

### Removing a query string key

```csharp
using SplatDev.Umbraco.QueryStringFilters.Extensions;

var url = "https://example.com/page?foo=bar&baz=qux";
var cleaned = QueryStringExtensions.RemoveQueryStringByKey(url, "foo");
// Result: "https://example.com/page?baz=qux"
```

## Dependencies

| Package | Purpose |
|---------|---------|
| `Microsoft.AspNetCore.App` | `RequestDelegate`, `HttpContext`, `QueryString` (framework reference) |

No external NuGet dependencies. The package relies only on the ASP.NET Core shared framework.

## Caveats

- **Hardcoded allowlist.** New query parameters needed by the application must be added to the middleware source. There is no appsettings-based or DI-based extension point.
- **Backoffice bypass.** All paths containing `/umbraco` (case-insensitive) skip the middleware entirely. If your Umbraco backoffice is hosted under a different path prefix, you must update the middleware.
- **No automatic DI registration.** You must register the middleware in your pipeline manually. There is no `IComposer` or `IApplicationBuilder` extension.
- **Silent dropping.** Disallowed parameters are removed without logging or surfacing an error. This is by design to prevent noise from malicious requests, but it means legitimate typos in query parameter names go undetected.

---

**SplatDev.Umbraco.QueryStringFilters** — part of the [SplatDev.Umbraco.Plugins](https://github.com/SplatDev-Ltda/SplatDev.Umbraco.Plugins) suite. Licensed under MIT. &copy; SplatDev Ltda.
