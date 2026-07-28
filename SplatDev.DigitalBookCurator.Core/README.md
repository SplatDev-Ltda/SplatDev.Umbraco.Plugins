# SplatDev.DigitalBookCurator.Core

Standalone domain library for e-book and PDF management backed by EF Core + Sqlite.

## Install

```bash
dotnet add package SplatDev.DigitalBookCurator.Core
```

## What's implemented

- **`CuratorDbContext`** — EF Core `DbContext` targeting Sqlite with a soft-delete query filter on `Book`.
- **`Book`** model — Title, Author, FileName, FilePath, FileSize, FileType, Isbn, Description, CoverImagePath, PageCount, CreatedAt, ModifiedAt, IsDeleted.
- **`IBookRepository` + `BookRepository`** — async CRUD, paged filtering with sort, soft delete.
- **`FileManagerService`** — file storage with batch PDF import into the database.
- **`PagedFilter`** — `SearchTerm`, `SortBy`, `SortDescending`, `Page`, `PageSize`.
- **`PagedResults<T>`** — paginated response with `Items`, `TotalCount`, `Page`, `PageSize`, `TotalPages`.
- **`BookImportResult`** — per-file import outcome.
- **`CuratorSettings`** — configuration POCO (`Origin`, `Destination`, `DeleteEmptyFolders`).

## Configuration

Bind `CuratorSettings` from your app configuration:

```json
{
  "CuratorSettings": {
    "Origin": "/path/to/incoming",
    "Destination": "/path/to/library",
    "DeleteEmptyFolders": true
  }
}
```

```csharp
services.Configure<CuratorSettings>(configuration.GetSection("CuratorSettings"));
```

## Usage

Register the DbContext and repository:

```csharp
builder.Services.AddDbContext<CuratorDbContext>(options =>
    options.UseSqlite("Data Source=curator.db"));

builder.Services.AddScoped<IBookRepository, BookRepository>();
builder.Services.AddScoped<FileManagerService>();
```

Paged query example:

```csharp
var filter = new PagedFilter
{
    Page = 1,
    PageSize = 20,
    SearchTerm = "design patterns",
    SortBy = "title"
};

var results = await repository.GetFilteredBooksAsync(filter);
```

Batch import from a directory:

```csharp
var service = services.GetRequiredService<FileManagerService>();
await foreach (var result in service.ProcessUploadedAsync("/incoming", "/library"))
{
    Console.WriteLine(result.Success ? $"OK {result.FileName}" : $"FAIL {result.FileName}: {result.ErrorMessage}");
}
```

## Caveats

- **Sqlite-only.** No multi-provider abstraction — the DbContext and current queries target Sqlite directly.
- **LIKE-scoped filter.** `SearchTerm` uses `Contains` (`LIKE '%term%'`) — fast for small-to-medium catalogs but not FTS5. If the library grows beyond ~100k records, consider migrating to FTS5 or moving to SQL Server with full-text indexing.
- **No built-in cover extraction or ISBN lookup.** `CoverImagePath` and `Isbn` are stored as metadata but must be populated externally.
- **No EF Core migrations checked in.** This is a known gap — consumers must generate their own initial migration.

## Companion Umbraco plugin

The Umbraco backoffice consumer is `SplatDev.Umbraco.Plugins.PdfCurator` (tracked under SPL-2494). This is currently the only known consumer of the core library.

---

Built by [SplatDev](https://splatdev.com)
