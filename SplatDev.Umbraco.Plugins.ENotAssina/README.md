# ENotAssina

e-Not Assina electronic signature integration for Umbraco. Supports document creation, sequential signing, webhook processing, PDF download, and a Lit 3 backoffice dashboard. Supports Umbraco 13 (net8.0) and Umbraco 17 (net10.0).


<!-- screenshot:start -->
<!-- screenshot:end -->

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Plugins.ENotAssina.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.ENotAssina)

## Compatibility

| Umbraco | .NET | Package Version |
|---------|------|-----------------|
| 13.x    | 8.0  | 1.2.4           |
| 17.x    | 10.0 | 1.2.4           |

## Installation

```sh
dotnet add package SplatDev.Umbraco.Plugins.ENotAssina
```

## Quick Start

No registration call is needed. The package ships Umbraco composers, so the `AddComposers()` already in the default `Program.cs` picks the plugin up as soon as the package is referenced.

## Configuration

Add to `appsettings.json`:

```json
{
  "ENotAssina": {
    "ApiKey": "",
    "BaseUrl": "https://api.enotassina.com.br"
  }
}
```

## Changelog

### 1.2.4 — 2026-08-25

Documentation only, no code change. The README's Quick Start told you to call a registration method that does not exist in this package — following it produced a compile error on the first build. There is nothing to register: the package ships Umbraco composers and the `AddComposers()` already in the default `Program.cs` finds it. The Compatibility table also now shows the version actually being shipped instead of the one it was written at.

### 1.2.3 — 2026-08-24

Removes a dashboard screenshot that showed an error toast. It was captured against a site where this plugin's API was unreachable, so it advertised a broken dashboard. No screenshot is better than a misleading one; a replacement will be taken against a working install.

### 1.2.2 — 2026-08-21
- A missing table is reported as a setup step instead of a 500 that reads like a broken integration.

## License

MIT © [SplatDev](https://github.com/SplatDev-Ltda)