# SplatDev.Umbraco.Examine

Enhanced Examine/Lucene search library for Umbraco — extends the built-in Examine search engine with fuzzy matching, boosted terms, a zero-stop-word analyzer, and strongly-typed search results with built-in pagination.

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Examine.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Examine)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Compatibility

| .NET | Umbraco | Package Version |
|------|---------|-----------------|
| 8.0  | 13.12.0 | 1.0.0           |
| 10.0 | 17.3.4  | 1.0.0           |

## Installation

```sh
dotnet add package SplatDev.Umbraco.Examine
```

## Configuration

### Register the custom analyzer

```csharp
using SplatDev.Umbraco.Examine.Analyzers;
using Examine;

// Use NoStopWordsAnalyzer in your Examine index
var index = new ExamineIndex(
    name: "ExternalIndex",
    fieldDefinitions: new FieldDefinitionCollection(),
    analyzer: new NoStopWordsAnalyzer(),
    validator: new ContentValueSetValidator(...),
    luceneDirectory: new Lucene.Net.Store.FSDirectory(...));
```

## Usage

### Basic search with ExamineExtensionsPlus

```csharp
using SplatDev.Umbraco.Examine.Extensions;
using Examine;
using Umbraco.Cms.Core;

// Get the external index
if (_examineManager.TryGetIndex("ExternalIndex", out var index))
{
    var searcher = index.Searcher;

    // Simple search
    var results = searcher.Search<SearchModel>(
        query: "development",
        page: 1,
        pageSize: 10);

    Console.WriteLine($"Found {results.TotalResults} results");
    foreach (var item in results.Items)
    {
        Console.WriteLine($"- {item.Name}: {item.Description}");
    }
}
```

### Fuzzy matching

```csharp
// Enable fuzzy search to catch typos and near-matches
var fuzzyResults = searcher.Search<SearchModel>(
    query: "developmint",  // typo!
    page: 1,
    pageSize: 10,
    fuzzy: 0.8f);  // 0.0 - 1.0 fuzziness factor

Console.WriteLine($"Fuzzy matched {fuzzyResults.TotalResults} items");
```

### Boosted terms

Boost specific fields to influence result ranking:

```csharp
var boosted = searcher.Search<SearchModel>(
    query: "umbraco plugin",
    page: 1,
    pageSize: 10,
    boostFields: new Dictionary<string, float>
    {
        { "nodeName", 2.0f },      // Title matches weigh double
        { "bodyContent", 1.5f },   // Body matches weigh 1.5x
        { "metaDescription", 0.5f } // Meta desc matches at half weight
    });
```

### Paged results

```csharp
// All search methods return PagedResults<T>
var paged = searcher.Search<SearchModel>("news", 1, 20);

Console.WriteLine($"Page {paged.Page} of {paged.GetTotalPages()}");
Console.WriteLine($"Showing {paged.Items.Count} of {paged.TotalResults}");

// Navigate pages
if (paged.HasNextPage)
{
    var next = searcher.Search<SearchModel>("news", paged.Page + 1, 20);
}
```

### SearchModel

```csharp
public class SearchModel : ISearchModel
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public string Url { get; set; }
    public float Score { get; set; }
}
```

## Features

- `ExamineExtensionsPlus` — Static helper class with `Search<T>()` generics
- `NoStopWordsAnalyzer` — Lucene analyzer with zero stop words (no "a", "the", "and" removal)
- Fuzzy matching with configurable fuzziness factor (0.0 to 1.0)
- Boosted term support for weighted field searches
- `PagedResults<T>` — Strongly-typed paginated result sets via `SplatDev.Umbraco.Pagination`
- `SearchModel` — Standardized search result model
- Full async examination via native Umbraco Examine APIs

## Dependencies

| Package | Purpose |
|---------|---------|
| `Umbraco.Cms.Core` (v13.12.0 / v17.3.4) | Umbraco core + Examine |
| `Umbraco.Cms.Infrastructure` (v13.12.0 / v17.3.4) | Examine infrastructure |
| `Umbraco.Cms.Examine` (v13.12.0 / v17.3.4) | Examine index/search APIs |
| `SplatDev.Umbraco.Pagination` | PagedResults<T> and pagination utilities |

## Target Frameworks

- `net8.0` — for Umbraco 13 applications (v13.12.0)
- `net10.0` — for Umbraco 17 applications (v17.3.4)

---

**SplatDev.Umbraco.Examine** — part of the [SplatDev.Umbraco.Plugins](https://github.com/SplatDev-Ltda/SplatDev.Umbraco.Plugins) suite. Licensed under MIT. &copy; SplatDev Ltda.
