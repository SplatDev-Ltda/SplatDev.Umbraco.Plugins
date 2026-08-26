# SocialMedia.Login

Umbraco social login integration plugin — configure OAuth providers (Facebook, Google, Twitter/X, Apple) for member sign-in. Supports Umbraco 13 (net8.0) and Umbraco 17 (net10.0).


<!-- screenshot:start -->

![SocialMedia.Login dashboard](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.SocialMedia.Login/docs/screenshots/01-dashboard.png)

<!-- screenshot:end -->

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Plugins.SocialMedia.Login.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.SocialMedia.Login)

## Compatibility

| Umbraco | .NET | Package Version |
|---------|------|-----------------|
| 13.x    | 8.0  | 2.2.3           |
| 17.x    | 10.0 | 2.2.3           |

## Installation

```sh
dotnet add package SplatDev.Umbraco.Plugins.SocialMedia.Login
```

## Quick Start

No registration call is needed. The package ships Umbraco composers, so the `AddComposers()` already in the default `Program.cs` picks the plugin up as soon as the package is referenced.

## Configuration

Add to `appsettings.json`:

```json
{
  "SocialMedia": {
    "Login": {
      "Google": {
        "ClientId": "",
        "ClientSecret": ""
      },
      "Facebook": {
        "AppId": "",
        "AppSecret": ""
      }
    }
  }
}
```

## Changelog

### 2.2.3 — 2026-08-26

Fixes a duplicate registration on sites that still have a physical App_Plugins folder for this plugin, left behind by an older release that copied content into the site. Umbraco registered those extensions twice - once from its own scan of the folder, once from this package's embedded manifest - and logged "Extension with alias ... is already registered". The embedded manifest now yields to the physical copy.

### 2.2.2 — 2026-08-25

Documentation only, no code change. The README's Quick Start told you to call a registration method that does not exist in this package — following it produced a compile error on the first build. There is nothing to register: the package ships Umbraco composers and the `AddComposers()` already in the default `Program.cs` finds it. The Compatibility table also now shows the version actually being shipped instead of the one it was written at.

### 2.2.1 — 2026-08-24

Package metadata only: the listing now carries an icon and search tags, and the project and repository links point at the organisation that actually hosts this code. No code changes.

### 2.2.0 — 2026-08-23

The Umbraco Marketplace listing now carries this plugin's screenshots. The listing keeps its own screenshot list rather than reading the README, and this one was empty — so the entry showed no images at all.

### 2.1.4 — 2026-08-21
- README now shows a screenshot of the dashboard.

## License

MIT © [SplatDev](https://github.com/SplatDev-Ltda)