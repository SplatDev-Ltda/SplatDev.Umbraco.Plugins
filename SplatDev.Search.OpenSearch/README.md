# SplatDev.Search.OpenSearch

OpenSearch adapter for `SplatDev.Search` abstractions — AWS-hosted or self-hosted OpenSearch with full-text search, filtering, sorting, and bulk indexing via the official `OpenSearch.Client` SDK.

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Search.OpenSearch.svg)](https://www.nuget.org/packages/SplatDev.Search.OpenSearch)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Compatibility

| .NET | Umbraco | Package Version |
|------|---------|-----------------|
| 8.0  | 13      | 1.0.0           |
| 10.0 | 17      | 1.0.0           |

## Installation

```sh
dotnet add package SplatDev.Search.OpenSearch
```

## Configuration

### DI registration

```csharp
using SplatDev.Search;
using SplatDev.Search.OpenSearch.Services;

// Self-hosted (no auth)
builder.Services.AddSingleton<ISearchProvider>(_ =>
    new OpenSearchProvider(new Uri("http://localhost:9200")));

// Self-hosted with basic auth
builder.Services.AddSingleton<ISearchProvider>(_ =>
    new OpenSearchProvider(new Uri("https://search.example.com"), "admin", "password"));

// AWS OpenSearch Service uses IAM-based auth — configure via environment/AWS SDK
```

## Usage

```csharp
using SplatDev.Search;

public class DocumentIndex
{
    private readonly ISearchProvider _search;

    public DocumentIndex(ISearchProvider search) => _search = search;

    public async Task IndexAsync(Document doc)
    {
        await _search.IndexAsync("documents", doc);
    }

    public async Task<SearchResult<Document>> SearchAsync(string term)
    {
        return await _search.SearchAsync<Document>("documents", new SearchRequest
        {
            Query = term,
            Size = 50,
            Sort = [new SearchSort { Field = "created", Direction = SortDirection.Descending }],
            Filters = new Dictionary<string, string> { { "status", "published" } },
        });
    }
}
```

## Features

- Full `ISearchProvider` implementation backed by `OpenSearch.Client` v1.8
- Multi-match queries across configurable fields
- Term-level filtering with boolean AND combination
- Sorting by field with direction
- Source filtering (field projection)
- Bulk indexing via `IndexManyAsync`
- Index management (create, delete, exists)
- Basic authentication support for self-hosted instances

## Dependencies

| Package | Purpose |
|---------|---------|
| `SplatDev.Search` | Core abstractions (`ISearchProvider`) |
| `OpenSearch.Client` | Official OpenSearch .NET SDK |

---

**SplatDev.Search.OpenSearch** — part of the [SplatDev.Umbraco.Plugins](https://github.com/SplatDev-Ltda/SplatDev.Umbraco.Plugins) suite. Licensed under MIT. &copy; SplatDev Ltda.
