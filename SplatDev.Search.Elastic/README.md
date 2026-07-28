# SplatDev.Search.Elastic

Elasticsearch 8+ adapter for `SplatDev.Search` abstractions — full-text search, filtering, sorting, and bulk indexing via the official `Elastic.Clients.Elasticsearch` SDK.

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Search.Elastic.svg)](https://www.nuget.org/packages/SplatDev.Search.Elastic)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Compatibility

| .NET | Umbraco | Package Version |
|------|---------|-----------------|
| 8.0  | 13      | 1.0.0           |
| 10.0 | 17      | 1.0.0           |

## Installation

```sh
dotnet add package SplatDev.Search.Elastic
```

## Configuration

### DI registration

```csharp
using SplatDev.Search;
using SplatDev.Search.Elastic.Services;

// Cloud deployment (Elastic Cloud)
builder.Services.AddSingleton<ISearchProvider>(_ =>
    new ElasticSearchProvider("my-deployment:ZXVyb3B...", "api-key-string"));

// Self-hosted / local
builder.Services.AddSingleton<ISearchProvider>(_ =>
    new ElasticSearchProvider(new Uri("http://localhost:9200")));
```

## Usage

```csharp
using SplatDev.Search;

public class ProductCatalog
{
    private readonly ISearchProvider _search;

    public ProductCatalog(ISearchProvider search) => _search = search;

    public async Task IndexProductAsync(Product product)
    {
        await _search.IndexAsync("products", product);
    }

    public async Task BulkIndexAsync(IEnumerable<Product> products)
    {
        await _search.IndexManyAsync("products", products);
    }

    public async Task<SearchResult<Product>> SearchProductsAsync(string term, int page = 0)
    {
        return await _search.SearchAsync<Product>("products", new SearchRequest
        {
            Query = term,
            From = page * 20,
            Size = 20,
            Sort =
            [
                new SearchSort { Field = "price", Direction = SortDirection.Descending },
            ],
            Filters = new Dictionary<string, string>
            {
                { "category", "electronics" },
                { "inStock", "true" },
            },
            Fields = ["name", "price", "category"],
        });
    }
}
```

## Features

- Full `ISearchProvider` implementation backed by `Elastic.Clients.Elasticsearch` v8.15+
- Multi-match queries across configurable fields
- Term-level filters (converted to boolean filter clauses)
- Sorting by field with direction
- Source filtering (field projection)
- Bulk indexing via `IndexManyAsync`
- Index management (create, delete, exists)
- Delete by query string
- Both cloud (Elastic Cloud) and self-hosted connection modes

## Dependencies

| Package | Purpose |
|---------|---------|
| `SplatDev.Search` | Core abstractions (`ISearchProvider`) |
| `Elastic.Clients.Elasticsearch` | Official Elasticsearch v8+ .NET SDK |

---

**SplatDev.Search.Elastic** — part of the [SplatDev.Umbraco.Plugins](https://github.com/SplatDev-Ltda/SplatDev.Umbraco.Plugins) suite. Licensed under MIT. &copy; SplatDev Ltda.
