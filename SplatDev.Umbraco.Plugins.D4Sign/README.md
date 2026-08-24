# D4Sign

D4Sign digital signature integration for Umbraco. Supports document upload, signer management, webhook processing, and a Lit 3 backoffice dashboard. Supports Umbraco 13 (net8.0) and Umbraco 17 (net10.0).


<!-- screenshot:start -->
<!-- screenshot:end -->

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Plugins.D4Sign.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.D4Sign)

## Compatibility

| Umbraco | .NET | Package Version |
|---------|------|-----------------|
| 13.x    | 8.0  | 1.0.0           |
| 17.x    | 10.0 | 1.0.0           |

## Installation

```sh
dotnet add package SplatDev.Umbraco.Plugins.D4Sign
```

## Quick Start

No registration call is needed. The package ships Umbraco composers, so the `AddComposers()` already in the default `Program.cs` picks the plugin up as soon as the package is referenced.

## Configuration

Add to `appsettings.json`:

```json
{
  "D4Sign": {
    "TokenAPI": "",
    "CryptKey": "",
    "BaseUrl": "https://sandbox.d4sign.com.br/api/v1"
  }
}
```

## Changelog

### 1.2.3 — 2026-08-24

Removes a dashboard screenshot that showed an error toast. It was captured against a site where this plugin's API was unreachable, so it advertised a broken dashboard. No screenshot is better than a misleading one; a replacement will be taken against a working install.

### 1.2.2 — 2026-08-21
- A missing table is reported as a setup step instead of a 500 that reads like a broken integration.

## License

MIT © [SplatDev](https://github.com/SplatDev-Ltda)