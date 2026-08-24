# SplatDev.Search.Meilisearch

Meilisearch adapter for `SplatDev.Search` abstractions — lightweight, typo-tolerant full-text search with instant indexing via the official `Meilisearch` .NET SDK.

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Search.Meilisearch.svg)](https://www.nuget.org/packages/SplatDev.Search.Meilisearch)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Compatibility

| .NET | Umbraco | Package Version |
|------|---------|-----------------|
| 8.0  | 13      | 1.0.0           |
| 10.0 | 17      | 1.0.0           |

## Installation

```sh
dotnet add package SplatDev.Search.Meilisearch
```

## Configuration

```csharp
using SplatDev.Search;
using SplatDev.Search.Meilisearch.Services;

builder.Services.AddSingleton<ISearchProvider>(_ =>
    new MeilisearchProvider("http://localhost:7700", "masterKey"));
```

## Usage

```csharp
var result = await _search.SearchAsync<Product>("products", new SearchRequest
{
    Query = "wireless headphones",
    Size = 20,
    Sort = [new SearchSort { Field = "price", Direction = SortDirection.Ascending }],
    Filters = new Dictionary<string, string> { { "inStock", "true" } },
    Fields = ["name", "price", "description"],
});
```

## Features

- Full `ISearchProvider` implementation backed by `Meilisearch` .NET SDK
- Instant indexing — documents are searchable immediately after `IndexAsync`
- Typo-tolerant search (Meilisearch handles misspellings automatically)
- Filter-based narrowing with `AND` combination
- Sorting by field with direction
- Attribute projection (field selection)
- Lightweight footprint — suitable for small-to-medium datasets

## Dependencies

| Package | Purpose |
|---------|---------|
| `SplatDev.Search` | Core abstractions (`ISearchProvider`) |
| `Meilisearch` | Official Meilisearch .NET SDK |

---

**SplatDev.Search.Meilisearch** — part of the [SplatDev.Umbraco.Plugins](https://github.com/SplatDev-Ltda/SplatDev.Umbraco.Plugins) suite. Licensed under MIT. &copy; SplatDev Ltda.

## Changelog

### 1.0.1 — 2026-08-24

Package metadata only: the listing now carries an icon and search tags, and the project and repository links point at the organisation that actually hosts this code. No code changes.

### 1.0.0 — 2026-08-24

This package now keeps a changelog. Earlier releases predate it and are not reconstructed here — consult the repository history for those. From this version on, every release records what changed for someone using it.

