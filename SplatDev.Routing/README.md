# SplatDev.Routing

Convention-based route registration helpers for ASP.NET Core applications.

## What it provides

- **IRoute** — interface for declaring conventional MVC routes:
  - `RouteAlias` — unique route name
  - `Url` — route pattern (must not start with `/`)
  - `Controller` — target controller name
  - `Action` — target action name
  - `Defaults` — optional route defaults (anonymous object)

- **IUmbracoPluginRoute** — extends `IRoute` with Umbraco-specific metadata:
  - `RootId` — Umbraco content node root ID
  - `RootAlias` — Umbraco content node root alias
  - `IsPluginController` — marks the route as a plugin controller

- **RouteServiceExtensions.MapSplatDevRoutes** — scans caller-provided assemblies for `IRoute` implementations and registers each as a conventional MVC route. Uses `ActivatorUtilities.CreateInstance` for DI support on route ctors.

## Install

```shell
dotnet add package SplatDev.Routing
```

## Usage

```csharp
// 1. Implement IRoute
public class HomeRoute : IRoute
{
    public string RouteAlias => "home";
    public string Url => "";
    public string Controller => "Home";
    public string Action => "Index";
    public object Defaults => null;
}

// 2. Register in Program.cs / Startup.cs
app.UseEndpoints(endpoints =>
{
    endpoints.MapSplatDevRoutes(typeof(HomeRoute).Assembly);
});
```

For Umbraco plugin routes, implement `IUmbracoPluginRoute : IRoute` instead.

## Limitations

- Routes must be registered via the `Microsoft.AspNetCore.Mvc` pipeline (`MapControllerRoute`).
- All-assemblies scan is not supported — callers must explicitly provide the target assemblies.

## Design decisions

- **Interface split (v1.1.0):** `RootId`, `RootAlias`, and `IsPluginController` were moved from `IRoute` to `IUmbracoPluginRoute : IRoute` to keep the base interface free of Umbraco-specific fields.
- **DI on ctors:** `Activator.CreateInstance` was replaced with `ActivatorUtilities.CreateInstance` (requires `IServiceProvider` from `IEndpointRouteBuilder`).

## Target frameworks

| Framework |
|-----------|
| net8.0    |
| net10.0   |

---

**SplatDev.Routing** — part of the [SplatDev.Umbraco.Plugins](https://github.com/SplatDev-Ltda/SplatDev.Umbraco.Plugins) suite. Licensed under MIT. © SplatDev Ltda.

## Changelog

### 2.0.0 — 2026-08-25

**Breaking.** `RootId`, `RootAlias` and `IsPluginController` move off `IRoute` and onto a new `IUmbracoPluginRoute : IRoute`. They only ever meant anything for routes served by an Umbraco plugin controller, but sat on the base interface, so every route had to implement three members it did not use. A route that needs them now implements `IUmbracoPluginRoute`; one that does not is unchanged apart from dropping the three stubs.

Route discovery is unaffected — `MapSplatDevRoutes` scans for `IRoute`, and `IUmbracoPluginRoute` derives from it, so both kinds are still found.
