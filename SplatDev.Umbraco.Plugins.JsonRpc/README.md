# JsonRpc

JSON-RPC 2.0 API endpoint for Umbraco — expose content as JSON-RPC with API key management and request logging. Supports Umbraco 13 (net8.0) and Umbraco 17 (net10.0).


<!-- screenshot:start -->
<!-- screenshot:end -->

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Plugins.JsonRpc.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.JsonRpc)

## Compatibility

| Umbraco | .NET | Package Version | Dashboard |
|---------|------|-----------------|-----------|
| 13.x    | 8.0  | 2.2.6           | AngularJS |
| 17.x    | 10.0 | 2.2.6           | Lit (Bellissima) |

## Installation

```sh
dotnet add package SplatDev.Umbraco.Plugins.JsonRpc
```

## Quick Start

No registration call is needed. The package ships Umbraco composers, so the `AddComposers()` already in the default `Program.cs` picks the plugin up as soon as the package is referenced.

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

### 2.2.6 — 2026-08-26

Fixes a duplicate registration on sites that still have a physical App_Plugins folder for this plugin, left behind by an older release that copied content into the site. Umbraco registered those extensions twice - once from its own scan of the folder, once from this package's embedded manifest - and logged "Extension with alias ... is already registered". The embedded manifest now yields to the physical copy.

### 2.2.5 — 2026-08-25

Documentation only, no code change. The README's Quick Start told you to call a registration method that does not exist in this package — following it produced a compile error on the first build. There is nothing to register: the package ships Umbraco composers and the `AddComposers()` already in the default `Program.cs` finds it. The Compatibility table also now shows the version actually being shipped instead of the one it was written at.

### 2.2.4 — 2026-08-24

Removes a dashboard screenshot that showed an error toast. It was captured against a site where this plugin's API was unreachable, so it advertised a broken dashboard. No screenshot is better than a misleading one; a replacement will be taken against a working install.

### 2.2.3 — 2026-08-24

Package metadata only: the listing now carries an icon and search tags, and the project and repository links point at the organisation that actually hosts this code. No code changes.

### 2.2.2 — 2026-08-21
- API keys can be managed from the dashboard — list, create and revoke. It previously made no requests at all.
- A newly created key is returned as its own result with a rawKey field, shown once. It used to be smuggled back inside the entity's Name as "name||RAW:key", which every caller had to parse and which was one accidental re-save away from writing a live key into the database in plain text.
- A failed request now says so instead of leaving an empty list.

### 2.2.1 — 2026-08-21
- The plugin's tables are created on startup. They were never created before, so anything touching them failed on a fresh install.
- Runs on SQLite as well as SQL Server. It previously assumed SQL Server and failed with "Keyword not supported: 'cache'" on the database Umbraco's installer offers by default.

## License

MIT © [SplatDev](https://github.com/SplatDev-Ltda)