# SplatDev.Umbraco.EntityFramework

Entity Framework Core integration for Umbraco — provides the `IRepository<TEntity>` abstraction with `DbContextRepository<TEntity>`, second-level caching, pagination, raw SQL execution, and `AsNoTracking` reads. Designed for Umbraco applications that need EF Core data access alongside the Umbraco NPoco pipeline.

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.EntityFramework.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.EntityFramework)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Compatibility

| .NET | Umbraco | EF Core | Package Version |
|------|---------|---------|-----------------|
| 8.0  | 13      | 8.0.20  | 1.0.0           |
| 10.0 | 17      | 10.0.7  | 1.0.0           |

## Installation

```sh
dotnet add package SplatDev.Umbraco.EntityFramework
```

## Configuration

### DI registration

```csharp
using SplatDev.Umbraco.EntityFramework;
using Microsoft.EntityFrameworkCore;

// Register your DbContext
builder.Services.AddDbContext<MyDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Register the repository
builder.Services.AddScoped<IRepository<MyEntity>, DbContextRepository<MyEntity>>();

// Add second-level caching
builder.Services.AddEFCoreSecondLevelCache(options =>
{
    options.UseMemoryCacheProvider();
    options.CacheAllQueries(CacheExpirationMode.Absolute, TimeSpan.FromMinutes(30));
});
```

## Usage

### Basic CRUD

```csharp
using SplatDev.Umbraco.EntityFramework;

public class ProductService
{
    private readonly IRepository<Product> _repo;

    public ProductService(IRepository<Product> repo) => _repo = repo;

    public async Task<Product> GetByIdAsync(int id)
        => await _repo.GetByIdAsync(id);

    public async Task<IEnumerable<Product>> GetAllAsync()
        => await _repo.GetAllAsync();

    public async Task AddAsync(Product product)
        => await _repo.AddAsync(product);

    public async Task UpdateAsync(Product product)
        => await _repo.UpdateAsync(product);

    public async Task DeleteAsync(Product product)
        => await _repo.DeleteAsync(product);
}
```

### Paginated queries

```csharp
// Returns PagedResults<T> from SplatDev.Umbraco.Pagination
var paged = await _repo.GetPagedAsync(
    page: 1,
    pageSize: 20,
    filter: p => p.IsActive,
    orderBy: q => q.OrderBy(p => p.CreatedAt));
```

### Raw SQL

```csharp
// Execute raw SQL with parameterized queries
var products = await _repo.FromSqlRawAsync(
    "SELECT * FROM Products WHERE Price > @0", 100);

// Execute non-query SQL
await _repo.ExecuteSqlRawAsync(
    "UPDATE Products SET IsActive = 0 WHERE LastUpdated < @0",
    DateTime.UtcNow.AddDays(-365));
```

### Second-level caching

Queries decorated with the EFCoreSecondLevelCacheInterceptor are automatically cached:

```csharp
// This result is cached for the configured duration
var categories = await _dbContext.Categories
    .Cacheable()
    .ToListAsync();

// Bypass cache when needed
var fresh = await _dbContext.Categories
    .NotCacheable()
    .ToListAsync();
```

### AsNoTracking reads

```csharp
// Read-only queries use AsNoTracking for performance
var readOnly = await _repo.GetAllNoTrackingAsync();
```

## Features

- `IRepository<TEntity>` interface for testable, injectable data access
- `DbContextRepository<TEntity>` implementation with full CRUD operations
- Second-level caching via `EFCoreSecondLevelCacheInterceptor` (v5.3.2)
- Built-in pagination via `SplatDev.Umbraco.Pagination` returning `PagedResults<T>`
- Raw SQL support: `FromSqlRawAsync` and `ExecuteSqlRawAsync`
- `AsNoTracking` read-only queries for performance
- Works alongside Umbraco's native NPoco pipeline

## Dependencies

| Package | Purpose |
|---------|---------|
| `Microsoft.EntityFrameworkCore` (v8.0.20 / v10.0.7) | EF Core ORM |
| `EFCoreSecondLevelCacheInterceptor` (v5.3.2) | Second-level query caching |
| `Umbraco.Cms.Core` | Umbraco core APIs |
| `SplatDev.Umbraco.Pagination` | PagedResults<T> and pagination utilities |

## Target Frameworks

- `net8.0` — for Umbraco 13 applications (EF Core 8.0.20)
- `net10.0` — for Umbraco 17 applications (EF Core 10.0.7)

---

**SplatDev.Umbraco.EntityFramework** — part of the [SplatDev.Umbraco.Plugins](https://github.com/SplatDev-Ltda/SplatDev.Umbraco.Plugins) suite. Licensed under MIT. &copy; SplatDev Ltda.
