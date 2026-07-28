# Countries

Umbraco countries data plugin — seeds and maintains a `countries` database table with ISO country codes, names, and nationality data. Supports Umbraco 13 (net8.0) and Umbraco 17 (net10.0).

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Plugins.Countries.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.Countries)

## Compatibility

| Umbraco | .NET | Package Version |
|---------|------|-----------------|
| 13.x    | 8.0  | 2.0.0           |
| 17.x    | 10.0 | 2.0.0           |

## Installation

```sh
dotnet add package SplatDev.Umbraco.Plugins.Countries
```

## Quick Start

Register in `Program.cs`:

```csharp
builder.CreateUmbracoBuilder()
    .AddBackOffice()
    .AddWebsite()
    .AddCountries()   // <-- add this
    .Build();
```

On first startup, the plugin runs an Umbraco migration that creates the `countries` table and bulk-inserts country data from a CSV file.

## Configuration

The migration expects a CSV file at `C:\Temp\countries.csv`. Supply your own country data or pre-seed with a file containing these columns (matching the `Country` model):

| Column | Type | Example |
|--------|------|---------|
| `numCode` | int | 76 |
| `alpha2Code` | string | BR |
| `alpha3Code` | string | BRA |
| `enShortName` | string | Brazil |
| `nationality` | string | Brazilian |

If the `countries` table already exists (e.g., after deployments), the migration skips creation silently.

## Usage

### Querying Countries

The `Country` entity is mapped via NPoco. Query it from any Umbraco service or directly via the `IUmbracoDatabase`:

```csharp
using SplatDev.Umbraco.Plugins.Countries.Models;
using Umbraco.Cms.Infrastructure.Persistence;

public class CountryService(IUmbracoDatabaseFactory dbFactory)
{
    public IEnumerable<Country> GetAll()
    {
        using var db = dbFactory.CreateDatabase();
        return db.Fetch<Country>("SELECT * FROM countries ORDER BY enShortName");
    }
}
```

### Common Queries

```csharp
// Find by alpha-2 code
var br = db.FirstOrDefault<Country>("WHERE alpha2Code = @0", "BR");

// Search by name
var results = db.Fetch<Country>("WHERE enShortName LIKE @0", $"%{query}%");
```

## Architecture

| Component | Role |
|-----------|------|
| `Country` (NPoco entity) | Maps to `countries` table — id, numCode, alpha2Code, alpha3Code, enShortName, nationality |
| `CountryMigration` | Creates table and bulk-inserts from CSV (skips if exists) |
| `CountrySchemaMigrationComposer` | Registers the migration plan via Umbraco's `Upgrader` |

## License

MIT © [SplatDev](https://github.com/splatdevtech)

---

[Feedback](mailto:feedback@splatdev.com)
