# SplatDev.Umbraco.NPoco

NPoco database layer for Umbraco — provides `BaseEntityRepository<T>` with automatic `IScopeProvider` integration, ambient scope management, SuperUser identity fallback, event-driven auditing, and bulk CRUD operations. Built on top of Umbraco's native NPoco infrastructure.

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.NPoco.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.NPoco)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Compatibility

| .NET | Umbraco | Package Version |
|------|---------|-----------------|
| 8.0  | 13.12.0 | 1.0.0           |
| 10.0 | 17.3.4  | 1.0.0           |

## Installation

```sh
dotnet add package SplatDev.Umbraco.NPoco
```

## Configuration

### DI registration

```csharp
using SplatDev.Umbraco.NPoco;

// Register your repository implementation
builder.Services.AddScoped<IMyEntityRepository, MyEntityRepository>();
```

### Define an entity

```csharp
using NPoco;

[TableName("MyTable")]
[PrimaryKey("Id", AutoIncrement = true)]
public class MyEntity
{
    public int Id { get; set; }
    public string Name { get; set; }
    public DateTime CreatedAt { get; set; }
    public int CreatedBy { get; set; }
}
```

### Implement a repository

```csharp
using SplatDev.Umbraco.NPoco;
using Umbraco.Cms.Infrastructure.Scoping;

public class MyEntityRepository : BaseEntityRepository<MyEntity>, IMyEntityRepository
{
    public MyEntityRepository(IScopeProvider scopeProvider)
        : base(scopeProvider) { }

    public async Task<IEnumerable<MyEntity>> GetActiveAsync()
    {
        return await FetchAsync("WHERE IsActive = 1 ORDER BY CreatedAt DESC");
    }
}
```

## Usage

### CRUD operations

```csharp
var repo = serviceProvider.GetRequiredService<IMyEntityRepository>();

// Scope management is automatic — no need to manually begin/commit
// Each method wraps its database work in an ambient IScope

// Insert
var entity = new MyEntity { Name = "Example" };
repo.Insert(entity);

// Get by ID
var item = repo.GetById(1);

// Update
item.Name = "Updated";
repo.Update(item);

// Delete
repo.Delete(item);

// Fetch with SQL
var recent = repo.Fetch("WHERE CreatedAt > @0", DateTime.UtcNow.AddDays(-7));
```

### Bulk operations

```csharp
// Insert multiple records in one batch
var entities = Enumerable.Range(1, 100).Select(i => new MyEntity
{
    Name = $"Bulk Item {i}"
}).ToList();

repo.InsertBulk(entities);

// Update multiple records
repo.UpdateBulk(entities);

// Delete multiple records by ID
repo.DeleteBulk(new[] { 1, 2, 3, 4, 5 });
```

### Auto-complete scopes

`BaseEntityRepository<T>` automatically wraps every database operation in an ambient `IScope`:

```csharp
// No manual scope.Begin() or scope.Complete() needed
// The repository handles scope lifecycle internally

var item = repo.GetById(42);          // Auto-scoped
repo.Insert(new MyEntity());           // Auto-scoped with auto-commit
repo.Update(existingItem);             // Auto-scoped with auto-commit
```

### SuperUser fallback

When no authenticated backoffice user is available (e.g., during scheduled tasks or background jobs), the repository automatically falls back to the SuperUser identity (`-1`) for audit fields like `CreatedBy` and `UpdatedBy`.

### Auditing via ActionCompletedEvent

```csharp
// Audit changes by subscribing to the event
MyEntityRepository.ActionCompleted += (sender, entity) =>
{
    Console.WriteLine($"Action completed on entity {entity.Id}");
    // Log, notify, or trigger downstream workflows
};
```

## Features

- `BaseEntityRepository<T>` — Generic base class with full CRUD
- Automatic `IScopeProvider` integration — scopes managed internally
- Ambient scope auto-completion — no manual `Begin()`/`Complete()` required
- SuperUser identity fallback for non-interactive contexts
- Event-driven auditing via `ActionCompletedEvent`
- Bulk insert, update, and delete operations
- Uses Umbraco's native `IScopeProvider` and NPoco infrastructure

## Dependencies

| Package | Purpose |
|---------|---------|
| `Umbraco.Cms.Core` (v13.12.0 / v17.3.4) | Umbraco core APIs |
| `Umbraco.Cms.Infrastructure` (v13.12.0 / v17.3.4) | IScopeProvider, NPoco integration |

NPoco is included implicitly via Umbraco.Cms.Infrastructure — no additional NPoco package reference required.

## Target Frameworks

- `net8.0` — for Umbraco 13 applications (v13.12.0)
- `net10.0` — for Umbraco 17 applications (v17.3.4)

---

**SplatDev.Umbraco.NPoco** — part of the [SplatDev.Umbraco.Plugins](https://github.com/SplatDev-Ltda/SplatDev.Umbraco.Plugins) suite. Licensed under MIT. &copy; SplatDev Ltda.
