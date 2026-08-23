# Countries

<!-- screenshot:start -->

![Countries property editor](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.Countries/docs/screenshots/02-property-editor.png)

![Countries data type](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.Countries/docs/screenshots/03-data-type.png)

<!-- screenshot:end -->

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

## Changelog

### 2.1.0 — 2026-08-23
- The country list is actually populated. The migration read from `C:\Temp\countries.csv` — a hardcoded absolute path on someone's machine. No install has that file, and on Linux the drive letter is not even meaningful, so the read threw, the migration never completed, and Umbraco retried and failed it on every boot with the table left empty.
- The CSV that ships beside the code was never referenced by the project either, so pointing at it on disk would not have helped: it was not in the package. The list now travels inside the assembly.
- There is a Country property editor. The plugin created a countries table and gave nobody a way to use it — no controller, no UI, no data type — so editors typed country names by hand, which is how a site ends up with USA, U.S.A. and United States in one field.
- Which code is stored is configurable: two-letter, three-letter, numeric or the name.

## License

MIT © [SplatDev](https://github.com/splatdevtech)

---

[Feedback](mailto:feedback@splatdev.com)

## Architecture

This is a **headless data plugin** — no backoffice dashboard, property editors, or UI components. It operates as a database seeding service with NPoco query helpers, registered via DI composition.
