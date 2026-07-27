# Dropzone

Dropzone.js file upload integration for Umbraco — drag-and-drop file upload to the Umbraco Media library with progress feedback.

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Plugins.Dropzone.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.Dropzone)

## Compatibility

| Umbraco | .NET | Package Version |
|---------|------|-----------------|
| 13.x    | 8.0  | 1.0.1           |
| 17.x    | 10.0 | 1.0.1           |

## Installation

```sh
dotnet add package SplatDev.Umbraco.Plugins.Dropzone
```

The plugin registers automatically via `IComposer` — no manual `Program.cs` registration needed. Just add the package and build.

## Features

- Drag-and-drop file upload to Umbraco Media via `umbraco/api/dropzone/Upload`
- List and browse existing media items with optional parent folder filter
- Delete media by GUID key
- Backoffice dashboard at **Settings → Dropzone** with drag-and-drop UI, upload queue, and progress feedback
- Dual front-end: AngularJS (Umbraco 13) and LitElement (Umbraco 17)

## API endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `umbraco/api/dropzone/Upload` | POST | Upload file(s) to media |
| `umbraco/api/dropzone/GetMedia?parentId={id}` | GET | List media items (max 100) |
| `umbraco/api/dropzone/Delete?key={guid}` | POST | Delete media by GUID |

## Known limitations

- **File stream not saved to disk** — `MediaFileManager` is injected but the file stream is never persisted; only the filename is stored. Uploaded files will appear in the media list but the actual binary data is not saved. **Tracked in SPL-XXXX.**
- `GetMedia` returns at most 100 items with no pagination
- No server-side file type validation — the API accepts any file type
- API endpoints are unauthenticated (inherit from `ControllerBase`)
- `FolderName` field on `UploadRequest` is accepted but ignored by the service

## License

MIT © [SplatDev](https://github.com/SplatDev-Ltda)
