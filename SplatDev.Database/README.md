# SplatDev.Database

<!-- screenshot:start -->
<!-- screenshot:end -->

Generic NPoco-based CRUD repository layer with automatic table creation and attribute-driven migration support. Provides the `IDbService<T>` interface and `DbService<T>` abstract class for consistent database access across any NPoco-backed SQL database.

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Database.svg)](https://www.nuget.org/packages/SplatDev.Database)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Compatibility

| .NET | Umbraco | Package Version |
|------|---------|-----------------|
| 8.0  | 13      | 1.0.2           |
| 10.0 | 17      | 1.0.2           |

## Installation

```sh
dotnet add package SplatDev.Database
```

## Configuration

### DI registration

```csharp
using SplatDev.Database;

// Register with NPoco DatabaseFactory
builder.Services.AddSingleton<IDatabaseFactory>(sp =>
    new DatabaseFactory("DefaultConnection"));
builder.Services.AddScoped<IDbService<MyEntity>, MyDbService>();
```

### Define an entity

```csharp
using SplatDev.Database.Attributes;
using NPoco;

[TableName("MyTable")]
[PrimaryKey("Id", AutoIncrement = true)]
public class MyEntity
{
    public int Id { get; set; }

    [NvarcharMax]
    public string Description { get; set; }

    [CreateOrder(1)]
    public string Name { get; set; }

    [AlteredColumn("PreviousName")]
    public string RenamedColumn { get; set; }

    public DateTime CreatedAt { get; set; }
}
```

### Implement a service

```csharp
using SplatDev.Database;

public class MyDbService : DbService<MyEntity>, IDbService<MyEntity>
{
    public MyDbService(IDatabaseFactory dbFactory)
        : base(dbFactory) { }

    public async Task<IEnumerable<MyEntity>> GetByNameAsync(string name)
    {
        return await FetchAsync("WHERE Name = @0", name);
    }
}
```

## Usage

### CRUD operations

```csharp
var service = serviceProvider.GetRequiredService<IDbService<MyEntity>>();

// Create
var entity = new MyEntity { Name = "Example", CreatedAt = DateTime.UtcNow };
service.Insert(entity);

// Read
var item = service.GetById(1);

// Update
item.Name = "Updated";
service.Update(item);

// Delete
service.Delete(item);

// Query
var all = service.Fetch("WHERE CreatedAt > @0", DateTime.UtcNow.AddDays(-7));
var page = service.Page(1, 20, "ORDER BY CreatedAt DESC");
```

### Automatic table creation

`DbService<T>` inspects the entity model at startup and automatically creates the database table if it does not exist — no manual SQL scripts required.

### Migration support

- `[CreateOrder]` — Controls column ordering in generated CREATE TABLE statements
- `[NvarcharMax]` — Marks string properties for `NVARCHAR(MAX)` instead of `NVARCHAR(255)`
- `[AlteredColumn]` — Tracks column renames for migration scripts, stores original name

## Features

- `IDbService<T>` interface for testable, injectable data access
- `DbService<T>` abstract base class with full CRUD: `Insert`, `Update`, `Delete`, `GetById`, `Fetch`, `Page`
- Automatic table creation from entity model
- Attribute-driven schema control: `[CreateOrder]`, `[NvarcharMax]`, `[AlteredColumn]`
- Built on NPoco for lightweight, high-performance micro-ORM access
- Compatible with any NPoco-supported database (SQL Server, SQLite, PostgreSQL, MySQL)

## Dependencies

| Package | Purpose |
|---------|---------|
| `NPoco` (v5.3.0) | Lightweight micro-ORM |
| `Microsoft.Extensions.DependencyInjection.Abstractions` (v8.0.0) | DI abstractions |
| `SplatDev.Reflection.Helpers` | Reflection utilities for model inspection |

## Target Frameworks

- `net8.0` — for Umbraco 13 applications
- `net10.0` — for Umbraco 17 applications

---

**SplatDev.Database** — part of the [SplatDev.Umbraco.Plugins](https://github.com/SplatDev-Ltda/SplatDev.Umbraco.Plugins) suite. Licensed under MIT. &copy; SplatDev Ltda.

## Changelog

### 1.0.2 — 2026-08-24

Removes a dashboard screenshot that showed an error toast. It was captured against a site where this plugin's API was unreachable, so it advertised a broken dashboard. No screenshot is better than a misleading one; a replacement will be taken against a working install.

### 1.0.1 — 2026-08-24

Package metadata only: the listing now carries an icon and search tags, and the project and repository links point at the organisation that actually hosts this code. No code changes.

### 1.0.0 — 2026-08-24

This package now keeps a changelog. Earlier releases predate it and are not reconstructed here — consult the repository history for those. From this version on, every release records what changed for someone using it.

