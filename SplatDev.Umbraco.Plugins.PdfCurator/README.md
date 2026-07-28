# PdfCurator

Umbraco PDF curator/manager plugin — upload, import, and manage PDF digital books from the backoffice. Provides a backoffice dashboard for admins to add, process, and browse PDFs with full CRUD. Supports Umbraco 13 (net8.0) and Umbraco 17 (net10.0).

Built on top of the `SplatDev.DigitalBookCurator.Core` library which handles PDF parsing, metadata extraction, and digital book storage.

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Plugins.PdfCurator.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.PdfCurator)

## Compatibility

| Umbraco | .NET | Package Version |
|---------|------|-----------------|
| 13.x    | 8.0  | 2.0.0           |
| 17.x    | 10.0 | 2.0.0           |

## Installation

```sh
dotnet add package SplatDev.Umbraco.Plugins.PdfCurator
```

## Quick Start

Register in `Program.cs` (the `CuratorComposer` auto-wires via Umbraco's `IComposer` discovery):

```csharp
builder.CreateUmbracoBuilder()
    .AddBackOffice()
    .AddWebsite()
    .Build();
```

## Configuration

Add to `appsettings.json`:

```json
{
  "ConnectionStrings": {
    "CuratorDb": "Data Source=curator.db"
  },
  "CuratorSettings": {
    "Origin": "wwwroot\\uploads\\pdfs",
    "Destination": "wwwroot\\ebooks",
    "DeleteEmptyFolders": false
  }
}
```

| Key | Default | Description |
|-----|---------|-------------|
| `ConnectionStrings:CuratorDb` | *(required)* | SQLite connection string for the curator database |
| `CuratorSettings:Origin` | `wwwroot\uploads\pdfs` | Folder where uploaded PDFs land before processing |
| `CuratorSettings:Destination` | `wwwroot\ebooks` | Folder where processed digital books are stored |
| `CuratorSettings:DeleteEmptyFolders` | `false` | Whether to remove empty directories after processing |

The import folder can also be set via the `Imports` appsetting key. If neither is set, the default is `wwwroot\uploads\pdfs`.

## Architecture

The plugin wraps `SplatDev.DigitalBookCurator.Core` and wires it into Umbraco via an `IComposer`:

- **`CuratorComposer`** — registers `CuratorDbContext` (SQLite/EF Core), `IBookRepository`, `BookRepository`, and `FileManagerService` in the DI container. Reads `CuratorSettings` from configuration.
- **SQLite database** — stores parsed book metadata and processing state.
- **Dual backoffice** — AngularJS dashboard for Umbraco 13, Lit (Bellissima) dashboard for Umbraco 17.

### API Controllers

All controllers inherit `Umbraco.Cms.Web.Common.Controllers.ControllerBase` and are available at `/umbraco/backoffice/api/`:

#### `UploadApiController`

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `UploadFileAsync` | Upload a single PDF file to the import folder |
| `POST` | `UploadFiles` | Upload multiple PDF files via `multipart/form-data` |

**Security (post-SPL-2494 hardening):** Uploaded files are validated for PDF magic bytes, path traversal is blocked, and request size limits are configurable. Only authenticated backoffice users can access these endpoints.

#### `ImportApiController`

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `GetAllReadyAsync` | List files in the import folder awaiting processing |
| `GET` | `GetAllDoneAsync` | List processed files in the done folder |
| `POST` | `ImportAll` | Trigger batch processing of all uploaded PDFs |

#### `ManagerApiController`

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `GetAllAsync` | List all books in the library |
| `POST` | `GetFilteredBooksAsync` | Paginated, filtered book listing |
| `GET` | `GetBookAsync` | Get a single book by ID |
| `POST` | `UpdateBookAsync` | Update book metadata |
| `DELETE` | `DeleteBookAsync` | Delete a book and its associated files |

## Backoffice Dashboard

The plugin adds a **PDF Curator** dashboard under the **Settings** section in the Umbraco backoffice:

- **Umbraco 13**: AngularJS dashboard bundled in `App_Plugins/PdfCurator/`
- **Umbraco 17**: Lit (Bellissima) web component dashboard built from `client/` (Vite + TypeScript)

Localized in English (`en`) and Portuguese — Brazil (`pt-BR`).

## Dependencies

- `SplatDev.DigitalBookCurator.Core` — PDF parsing and book storage engine
- `Microsoft.EntityFrameworkCore.Sqlite` — SQLite persistence
- `Umbraco.Cms.Core` / `Umbraco.Cms.Web.Common` — Umbraco framework
- `Umbraco.Cms.Api.Management` (net10.0 / Umbraco 17 only)

## License

MIT © [SplatDev](https://github.com/splatdevtech)

---

[Feedback](mailto:feedback@splatdev.com)
