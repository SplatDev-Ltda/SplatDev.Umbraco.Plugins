# LazyLoad

Lazy loading plugin for Umbraco — defers `img.lazy` and `iframe.lazy` until they approach the viewport, using `IntersectionObserver` with an immediate-load fallback.


<!-- screenshot:start -->

![LazyLoad dashboard](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.LazyLoad/docs/screenshots/01-dashboard.png)

<!-- screenshot:end -->

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Plugins.LazyLoad.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.LazyLoad)

## Compatibility

| Umbraco | .NET | Package Version |
|---------|------|-----------------|
| 13.x    | 8.0  | 1.2.4           |
| 17.x    | 10.0 | 1.2.4           |

## Installation

```sh
dotnet add package SplatDev.Umbraco.Plugins.LazyLoad
```

## Quick Start

No registration call is needed. The package ships Umbraco composers, so the `AddComposers()` already in the default `Program.cs` picks the plugin up as soon as the package is referenced.

## Changelog

### 1.2.4 — 2026-08-25

Documentation only, no code change. The README's Quick Start told you to call a registration method that does not exist in this package — following it produced a compile error on the first build. There is nothing to register: the package ships Umbraco composers and the `AddComposers()` already in the default `Program.cs` finds it. The Compatibility table also now shows the version actually being shipped instead of the one it was written at. The summary line also now describes what the plugin does — it defers `img.lazy` and `iframe.lazy` via `IntersectionObserver`, rather than adding a `loading=lazy` attribute to images.

### 1.2.3 — 2026-08-24

Package metadata only: the listing now carries an icon and search tags, and the project and repository links point at the organisation that actually hosts this code. No code changes.

### 1.2.2 — 2026-08-21
- Dashboard now sends the backoffice token with its API calls. On Umbraco 17 those calls were arriving unauthenticated and coming back 401, which the dashboard rendered as an empty state rather than an error.
- A failed request now raises a notification instead of leaving the dashboard looking like there is simply no data.

## License

MIT © [SplatDev](https://github.com/SplatDev-Ltda)