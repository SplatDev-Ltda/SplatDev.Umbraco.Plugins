# SplatDev.Search.Meilisearch

<!-- screenshot:start -->
<!-- screenshot:end -->

Meilisearch adapter for `SplatDev.Search` abstractions — lightweight, typo-tolerant full-text search with instant indexing via the official `Meilisearch` .NET SDK.

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Search.Meilisearch.svg)](https://www.nuget.org/packages/SplatDev.Search.Meilisearch)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Compatibility

| .NET | Umbraco | Package Version |
|------|---------|-----------------|
| 8.0  | 13      | 1.0.3           |
| 10.0 | 17      | 1.0.3           |

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
    Sort = [new SearchSortField { Field = "price", Direction = SortDirection.Ascending }],
    Filters = new Dictionary<string, object> { { "inStock", "true" } },
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

### 1.0.3 — 2026-08-25

Documentation only, no code change. The README's search example used `SearchSort`; the real type is `SearchSortField`. It also assigned a `Dictionary<string, string>` to `SearchRequest.Filters`, which is a `Dictionary<string, object>` — so the sample did not compile on either count. It is now compiled against the assembly.

### 1.0.2 — 2026-08-24

Removes a dashboard screenshot that showed an error toast. It was captured against a site where this plugin's API was unreachable, so it advertised a broken dashboard. No screenshot is better than a misleading one; a replacement will be taken against a working install.

### 1.0.1 — 2026-08-24

Package metadata only: the listing now carries an icon and search tags, and the project and repository links point at the organisation that actually hosts this code. No code changes.

### 1.0.0 — 2026-08-24

This package now keeps a changelog. Earlier releases predate it and are not reconstructed here — consult the repository history for those. From this version on, every release records what changed for someone using it.

