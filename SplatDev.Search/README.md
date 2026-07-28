# SplatDev.Search

Provider-agnostic search abstractions for SplatDev packages — contracts for indexing documents, running queries, faceting, and autocomplete across Elasticsearch, OpenSearch, Meilisearch, and other backends.

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Search.svg)](https://www.nuget.org/packages/SplatDev.Search)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Compatibility

| .NET | Umbraco | Package Version |
|------|---------|-----------------|
| 8.0  | 13      | 1.0.0           |
| 10.0 | 17      | 1.0.0           |

## Positioning

**SplatDev.Search** is the out-of-process domain search layer. It is designed for cross-site aggregate data, product catalogs, user records, and analytics — any data that lives outside the CMS content tree.

**SplatDev.Umbraco.Examine** remains the in-process Lucene-based search for CMS content. Both packages coexist and serve different purposes:

| Concern | SplatDev.Umbraco.Examine | SplatDev.Search |
|---------|--------------------------|-----------------|
| Scope | CMS content (in-process) | Domain data (out-of-process) |
| Engine | Lucene.NET | Elasticsearch / OpenSearch / Meilisearch |
| Mapping | Umbraco property editors | Attribute-driven POCO mapping |
| Facets | Limited | First-class facet support |
| Index management | Umbraco-managed | Migration-driven (`ISearchMigration`) |

## Installation

```sh
dotnet add package SplatDev.Search
```

## Interfaces

### ISearchIndex\<TDoc\>

Index management for typed documents:

```csharp
public interface ISearchIndex<TDoc> where TDoc : class
{
    Task IndexAsync(TDoc doc, CancellationToken ct = default);
    Task IndexManyAsync(IEnumerable<TDoc> docs, CancellationToken ct = default);
    Task DeleteAsync(string id, CancellationToken ct = default);
    Task DeleteByQueryAsync(SearchQuery query, CancellationToken ct = default);
    Task<RefreshResult> RefreshAsync(CancellationToken ct = default);
}
```

### ISearchProvider\<TDoc\>

Query and analysis operations:

```csharp
public interface ISearchProvider<TDoc> where TDoc : class
{
    Task<SearchResult<TDoc>> SearchAsync(SearchQuery query, CancellationToken ct = default);
    Task<AutocompleteResult> AutocompleteAsync(string prefix, AutocompleteOptions? opts = null, CancellationToken ct = default);
    Task<IReadOnlyList<Facet>> FacetsAsync(SearchQuery query, IEnumerable<string> fields, CancellationToken ct = default);
}
```

### ISearchMigration

Index lifecycle management:

```csharp
public interface ISearchMigration
{
    Task EnsureIndexAsync(IndexDefinition definition, CancellationToken ct = default);
    Task DropIndexAsync(string indexName, CancellationToken ct = default);
}
```

### ISearchSerializer

Pluggable document serialization:

```csharp
public interface ISearchSerializer
{
    string? Serialize<T>(T? value);
    T? Deserialize<T>(string? json);
}
```

## Models

### SearchQuery — Fluent Builder

```csharp
var query = new SearchQuery()
    .WithText("running shoes")
    .Where("brand").Eq("adidas")
    .Where("category").In(["footwear", "athletic"])
    .Where("price").Range(50, 150)
    .OrderBy("rating", SortDirection.Desc)
    .Page(0, 20)
    .WithHighlight(new HighlightOptions { Fields = ["name", "description"] })
    .WithRefresh(RefreshPolicy.None);
```

### SearchResult\<TDoc\>

```csharp
public sealed class SearchResult<TDoc> where TDoc : class
{
    public IReadOnlyList<TDoc> Documents { get; init; }
    public long Total { get; init; }
    public int From { get; init; }
    public int Size { get; init; }
    public IReadOnlyList<Facet> Facets { get; init; }
    public IReadOnlyDictionary<string, IReadOnlyList<string>>? Highlights { get; init; }
    public long TookMs { get; init; }
}
```

### IndexDefinition — Attribute-Driven Mapping

Annotate your POCO and derive the mapping automatically:

```csharp
public class Product
{
    [SearchField(Type = FieldType.Keyword)]
    public string Id { get; set; }

    [SearchField(Type = FieldType.Text, Analyzer = "standard")]
    public string Name { get; set; }

    [SearchField(Type = FieldType.Double, Sortable = true, Facetable = true)]
    public double Price { get; set; }

    [SearchField(Type = FieldType.Keyword, Facetable = true)]
    public string Category { get; set; }
}

var def = IndexDefinition.FromType<Product>();
```

### SearchOptions

```csharp
public class SearchOptions
{
    public string IndexPrefix { get; set; } = "splatdev";
    public string KeySeparator { get; set; } = "-";
    public RefreshPolicy DefaultRefresh { get; set; } = RefreshPolicy.None;
    public bool ThrowOnEmptyIndex { get; set; }
    public int BulkChunkSize { get; set; } = 500;
}
```

### Enums

| Enum | Values |
|------|--------|
| `RefreshPolicy` | `None`, `WaitFor`, `Immediate` |
| `FieldOp` | `Eq`, `Neq`, `In`, `Range`, `Exists` |
| `FieldType` | `Text`, `Keyword`, `Long`, `Integer`, `Short`, `Byte`, `Double`, `Float`, `Boolean`, `Date`, `GeoPoint` |
| `SortDirection` | `Asc`, `Desc` |

## Dependency Injection

```csharp
services.AddSplatDevSearchAbstractions(configuration);
```

Binds `SearchOptions` from `"SplatDev:Search"` config section and registers:
- `SearchOptions` (singleton)
- `ISearchSerializer` → `SystemTextJsonSearchSerializer` (singleton)

**Note:** `ISearchProvider<TDoc>` and `ISearchIndex<TDoc>` are NOT registered — you must add a provider package (e.g. `SplatDev.Search.Elastic`).

### Configuration

```json
{
  "SplatDev": {
    "Search": {
      "IndexPrefix": "myapp",
      "KeySeparator": "-",
      "DefaultRefresh": "None",
      "BulkChunkSize": 500
    }
  }
}
```

## Available provider implementations

| Package | Backend | Description |
|---------|---------|-------------|
| `SplatDev.Search.Elastic` | Elasticsearch 8+ | Full-text search with aggregations |
| `SplatDev.Search.OpenSearch` | OpenSearch 2+ | AWS-compatible with optional SigV4 |
| `SplatDev.Search.Meilisearch` | Meilisearch | Typo-tolerant search with two-key model |

## Design decisions

- **Single-index v1**: Multi-index cross-search deferred to v2.
- **Refresh default**: `None` with per-call override via `SearchQuery.WithRefresh()`.
- **Vector/kNN**: Deferred to v2 (`SplatDev.Search.Vector.*`).
- **Highlighting**: Common `HighlightOptions` DTO with provider-specific escape hatch.
- **Bulk chunking**: Foundation `BulkChunkSize = 500`, honored by adapters.
- **Attribute-driven mapping**: Default approach with explicit `IndexDefinition` override supported.

## Dependencies

- `Microsoft.Extensions.DependencyInjection.Abstractions`
- `Microsoft.Extensions.Configuration.Abstractions`
- `Microsoft.Extensions.Configuration.Binder`

---

**SplatDev.Search** — part of the [SplatDev.Umbraco.Plugins](https://github.com/SplatDev-Ltda/SplatDev.Umbraco.Plugins) suite. Licensed under MIT. &copy; SplatDev Ltda.
