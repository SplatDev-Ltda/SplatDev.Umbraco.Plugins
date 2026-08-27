# Book Library (PdfCurator)

<!-- screenshot:start -->

![PdfCurator dashboard](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.PdfCurator/docs/screenshots/01-dashboard.png)

<!-- screenshot:end -->

Umbraco 17 backoffice section for managing PDF digital books, documents, and publications. Provides a dedicated **Book Library** section with Dashboard, Library, Review, and Reports views — all built as pluggable Lit web components ready for the full PdfCurator component suite.

Built on top of the `SplatDev.DigitalBookCurator.Core` library which handles PDF parsing, metadata extraction, and digital book storage.

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Plugins.PdfCurator.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.PdfCurator)

## Compatibility

| Umbraco | .NET | Package Version |
|---------|------|-----------------|
| 13.x    | 8.0  | 3.0.1           |
| 17.x    | 10.0 | 3.0.1           |

## Installation

```sh
dotnet add package SplatDev.Umbraco.Plugins.PdfCurator
```

## Quick Start

Register in `Program.cs` (the `PdfCuratorComposer` auto-wires via Umbraco's `IComposer` discovery):

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
  "PdfCurator": {
    "ApiBase": "/umbraco/pdfcurator/api/v1",
    "LibraryRoot": "wwwroot/uploads/pdfs"
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
| `PdfCurator:ApiBase` | `/umbraco/pdfcurator/api/v1` | Base route for the PdfCurator API |
| `PdfCurator:LibraryRoot` | `wwwroot/uploads/pdfs` | Root folder for the PDF library |
| `CuratorSettings:Origin` | `wwwroot\uploads\pdfs` | Folder where uploaded PDFs land before processing |
| `CuratorSettings:Destination` | `wwwroot\ebooks` | Folder where processed digital books are stored |
| `CuratorSettings:DeleteEmptyFolders` | `false` | Whether to remove empty directories after processing |

The import folder can also be set via the `Imports` appsetting key. If neither is set, the default is `wwwroot\uploads\pdfs`.

## Architecture

The plugin wraps `SplatDev.DigitalBookCurator.Core` and wires it into Umbraco via an `IComposer`:

- **`PdfCuratorComposer`** — registers `CuratorDbContext` (SQLite/EF Core), `IBookRepository`, `BookRepository`, and `FileManagerService` in the DI container. Binds `PdfCuratorOptions` from the `PdfCurator` configuration section.
- **SQLite database** — stores parsed book metadata and processing state.
- **Lit web components** — Umbraco 17 (Bellissima) backoffice section built from `client/` (Vite 5 + TypeScript strict + Lit 3).

### Backoffice Section

The plugin registers a **Book Library** section (`PdfCurator.Section`) in the Umbraco backoffice with four menu items:

| View | Element | Description |
|------|---------|-------------|
| Dashboard | `pdfc-dashboard-wrapper` | Library overview, KPIs, and pipeline health |
| Library | `pdfc-library-wrapper` | Browse, search, and manage the PDF collection |
| Review | `pdfc-review-wrapper` | Review queue for processing uploaded PDFs |
| Reports | `pdfc-reports-wrapper` | Usage reports and analytics |

Each view renders a placeholder `<pdfc-*>` mount inside `uui-box` chrome — ready for Phase B integration with the full PdfCurator.Web component suite. A token bridge maps `--pdfc-*` custom properties to `--uui-*` design tokens for seamless visual blending.

### API Controllers

All controllers require backoffice authentication.

#### `PingController`

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `ping` | Health check — returns `{status:"ok", version}` (200 for authenticated users, 401 anonymously) |

Base route: `/umbraco/pdfcurator/api/v1/`

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

## Client Build

The Lit web components live in `client/` and are built with Vite 5:

```sh
cd client
npm run build      # production build to ../App_Plugins/PdfCurator/dist/
npm run dev        # build in watch mode
```

Output files:
- `pdfc-dashboard-wrapper.element.js` — Dashboard view
- `pdfc-library-wrapper.element.js` — Library view
- `pdfc-review-wrapper.element.js` — Review queue view
- `pdfc-reports-wrapper.element.js` — Reports view

## Localization

Localized in English (`en`) and Spanish (`es`).

## Dependencies

- `SplatDev.DigitalBookCurator.Core` — PDF parsing and book storage engine
- `Microsoft.EntityFrameworkCore.Sqlite` — SQLite persistence
- `Umbraco.Cms.Core` / `Umbraco.Cms.Web.Common` — Umbraco framework
- `Umbraco.Cms.Api.Management` (net10.0 / Umbraco 17 only)

## Changelog

### 3.0.1 — 2026-08-27

The Book Library section works. Its four views rendered an empty card because a lit template cannot interpolate a tag name, and behind that its data calls answered 404 because the PdfCurator.Web API was never mapped into Umbraco - so every figure read zero whatever the library held. The API is now mapped under the configured ApiBase and requires backoffice access.

### 3.0.0 — 2026-08-25

Mounts the real PdfCurator component suite in the backoffice section — Dashboard, Library, Review and Reports are live rather than the placeholder they were, and the "coming soon" notice is gone. Adds a section wrapper element and the constants it shares.

**Breaking**: this release targets the Umbraco 17 Book Library add-on described by the new package description, and the major version reflects that the section's contents have changed wholesale rather than incrementally.

### 2.1.5 — 2026-08-24

Removes a dashboard screenshot that showed an error toast. It was captured against a site where this plugin's API was unreachable, so it advertised a broken dashboard. No screenshot is better than a misleading one; a replacement will be taken against a working install.

### 2.1.4 — 2026-08-21
- Dashboard now sends the backoffice token with its API calls. On Umbraco 17 those calls were arriving unauthenticated and coming back 401, which the dashboard rendered as an empty state rather than an error.
- A failed request now raises a notification instead of leaving the dashboard looking like there is simply no data.

## License

MIT © [SplatDev](https://github.com/splatdevtech)

---

[Feedback](mailto:feedback@splatdev.com)

## Deployment (stg1 hosts)

Drop-in DLL deployment does **not** work: the SplatDev.Umbraco host resolves
assemblies via its `deps.json`, so an unreferenced plugin assembly crashes the
site at startup (`FindAssembliesWithReferencesTo` → FileNotFoundException).

Deploy by referencing the plugin from the host and republishing:

1. In the SplatDev eCommerce repo (`/root/build-main` on the .25 VPS), add a
   `ProjectReference` to `SplatDev.Umbraco.Plugins.PdfCurator.csproj` in
   `src/SplatDev.Umbraco/SplatDev.Umbraco.csproj` (use a scratch copy, e.g.
   `/root/build-pdfc`).
2. `dotnet publish src/SplatDev.Umbraco -c Release -o <out>` and rsync over
   `/www/wwwroot/stg1-umbraco-staging/`, then `systemctl restart
   stg1-umbraco-staging`.
3. Verify: `/App_Plugins/PdfCurator/umbraco-package.json` 200, anonymous
   `/umbraco/pdfcurator/api/v1/ping` 401, backoffice shows the Book Library
   section. Rollback snapshot: `/root/stg1-umbraco-staging.pre-pdfc.tar.gz`.
