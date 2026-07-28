# SplatDev.Umbraco.Pagination

Core pagination library for the SplatDev Umbraco ecosystem — provides `PagedResults<T>`, `Pagination` model, entity interfaces, and extension methods. Zero Umbraco dependency — framework-reference only — making it usable in any .NET project.

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Pagination.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Pagination)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Compatibility

| .NET | Umbraco | Package Version |
|------|---------|-----------------|
| 8.0  | N/A     | 1.0.0           |
| 10.0 | N/A     | 1.0.0           |

This package has no Umbraco dependency and works in any .NET 8+ or .NET 10+ application.

## Installation

```sh
dotnet add package SplatDev.Umbraco.Pagination
```

## Usage

### Basic pagination

```csharp
using SplatDev.Umbraco.Pagination;
using SplatDev.Umbraco.Pagination.Extensions;

// Create a pagination request
var pagination = new Pagination
{
    Page = 1,
    PageSize = 20
};

// Paginate an IQueryable
var query = dbContext.Products.Where(p => p.IsActive);
var paged = query.PagedResults(pagination);

Console.WriteLine($"Page {paged.Page} of {paged.GetTotalPages()}");
Console.WriteLine($"Showing {paged.Items.Count} of {paged.TotalResults}");
```

### PagedResults&lt;T&gt;

```csharp
var results = new PagedResults<Product>
{
    Items = products,
    Page = 1,
    PageSize = 20,
    TotalResults = 150
};

// Check navigation state
bool hasNext = results.HasNextPage;
bool hasPrev = results.HasPreviousPage;
int totalPages = results.GetTotalPages();

// Serialize to JSON for APIs
return Ok(results);
```

### Extension methods

```csharp
using SplatDev.Umbraco.Pagination.Extensions;

// Get total pages
int pages = 150.GetTotalPages(20); // 8

// Paginate any IQueryable
var pagedResults = queryable.PagedResults(page: 1, pageSize: 20);

// Paginate any IEnumerable
var list = new List<string> { "a", "b", "c", "d", "e" };
var paged = list.AsQueryable().PagedResults(1, 3); // ["a","b","c"]

// Shuffle a list
var shuffled = list.Shuffle(); // random order
```

### Entity interfaces

Implement these interfaces to standardize your models:

```csharp
using SplatDev.Umbraco.Pagination.Interfaces;

public class Product : IEntity, IText, IDescription
{
    public int Id { get; set; }
    public string Text { get; set; }    // Display text
    public string Description { get; set; } // Detailed description
}
```

These interfaces enable generic handling in UI components, dropdown pickers, and search results.

### PersistenceDataType enum

```csharp
using SplatDev.Umbraco.Pagination.Enums;

var type = PersistenceDataType.Json;

switch (type)
{
    case PersistenceDataType.Json:
        // Serialize to JSON
        break;
    case PersistenceDataType.Xml:
        // Serialize to XML
        break;
    case PersistenceDataType.Binary:
        // Serialize to binary
        break;
}
```

### Pagination model for API requests

```csharp
// Use as API parameter
[HttpGet]
public IActionResult GetProducts([FromQuery] Pagination pagination)
{
    var results = _service.GetAll(pagination);
    return Ok(results);
}
```

## Features

- `PagedResults<T>` — Standardized paginated result container
- `Pagination` — Request model with `Page` and `PageSize` properties
- `PaginationExtensions` — `GetTotalPages()`, `PagedResults<T>()`, `Shuffle<T>()`
- `IEntity`, `IText`, `IDescription` interfaces — Consistent model contracts
- `PersistenceDataType` enum — JSON, XML, Binary data type enumeration
- Zero Umbraco dependency — `Microsoft.AspNetCore.App` framework reference only
- Usable in any .NET project, not just Umbraco

## Dependencies

| Package | Purpose |
|---------|---------|
| `Microsoft.AspNetCore.App` | Framework reference for ASP.NET Core integration |

No other NuGet dependencies. This is a lightweight, self-contained package with no external library requirements.

## Target Frameworks

- `net8.0` — for .NET 8 applications
- `net10.0` — for .NET 10 applications

---

**SplatDev.Umbraco.Pagination** — part of the [SplatDev.Umbraco.Plugins](https://github.com/SplatDev-Ltda/SplatDev.Umbraco.Plugins) suite. Licensed under MIT. &copy; SplatDev Ltda.
