# JsonRpc

JSON-RPC 2.0 API endpoint for Umbraco — expose content as JSON-RPC with API key management and request logging. Supports Umbraco 13 (net8.0) and Umbraco 17 (net10.0).


<!-- screenshot:start -->

![JsonRpc dashboard](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.JsonRpc/docs/screenshots/01-dashboard.png)

<!-- screenshot:end -->

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Plugins.JsonRpc.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.JsonRpc)

## Compatibility

| Umbraco | .NET | Package Version | Dashboard |
|---------|------|-----------------|-----------|
| 13.x    | 8.0  | 2.0.0           | AngularJS |
| 17.x    | 10.0 | 2.0.0           | Lit (Bellissima) |

## Installation

```sh
dotnet add package SplatDev.Umbraco.Plugins.JsonRpc
```

## Quick Start

Register in `Program.cs`:

```csharp
builder.CreateUmbracoBuilder()
    .AddBackOffice()
    .AddWebsite()
    .AddJsonRpc()   // <-- add this
    .Build();
```

## Configuration

Add to `appsettings.json`:

```json
{
  "JsonRpc": {
    "ApiKeys": [ "" ],
    "EnableRequestLogging": true
  }
}
```

## U17 Bellissima Dashboard (Lit)

The U17 dashboard is built as a Lit Web Component using Vite and TypeScript.

### Development

```bash
cd client
npm install  # or pnpm install
npm run dev  # watch mode during development
npm run build  # production build
```

The build output is placed at `App_Plugins/JsonRpc/dist/jsonrpc-dashboard.element.js` and registered in `umbraco-package.json`.

### Architecture

- `client/` — Vite + TypeScript + Lit source
- `client/src/jsonrpc-dashboard.element.ts` — Lit element showing JSON-RPC status and endpoints
- `Controllers/` — JSON-RPC 2.0 handler endpoints
- `Services/` — API key management and request logging

## Changelog

### 2.2.1 — 2026-08-21
- The plugin's tables are created on startup. They were never created before, so anything touching them failed on a fresh install.
- Runs on SQLite as well as SQL Server. It previously assumed SQL Server and failed with "Keyword not supported: 'cache'" on the database Umbraco's installer offers by default.

## License

MIT © [SplatDev](https://github.com/SplatDev-Ltda)