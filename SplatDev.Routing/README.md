# SplatDev.Routing

Convention-based route registration for ASP.NET Core applications. Scan assemblies for `IRoute` implementations and auto-register them as conventional MVC controller routes.

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Routing.svg)](https://www.nuget.org/packages/SplatDev.Routing)

## Compatibility

| .NET  | Package Version |
|-------|-----------------|
| 8.0   | 1.0.0           |
| 10.0  | 1.0.0           |

## Installation

```sh
dotnet add package SplatDev.Routing
```

## Quick Start

Implement `IRoute` with your controller mapping, then register on the endpoint builder:

```csharp
using SplatDev.Routing;
using SplatDev.Routing.Interfaces;

public class HomeRoutes : IRoute
{
    public string RouteAlias => "home";
    public string Url => "{controller=Home}/{action=Index}/{id?}";
    public string Controller => "Home";
    public string Action => "Index";
    public object? Defaults => null;
    public int? RootId => null;
    public string? RootAlias => null;
    public bool IsPluginController => false;
}
```

In `Program.cs`:

```csharp
app.MapControllerRoute("default", "{controller=Home}/{action=Index}/{id?}");

app.MapSplatDevRoutes(typeof(HomeRoutes).Assembly);  // scan for IRoute impls
```

Routes are instantiated via DI (`ActivatorUtilities.CreateInstance`), so your `IRoute` implementations can receive registered services through their constructors.

## What's Implemented

### `IRoute` interface (`SplatDev.Routing.Interfaces`)

| Member              | Type      | Description                                      |
|---------------------|-----------|--------------------------------------------------|
| `RouteAlias`        | `string`  | Unique name for the route                        |
| `Url`               | `string`  | URL pattern (must not start with `/`)            |
| `Controller`        | `string`  | Default controller name                          |
| `Action`            | `string`  | Default action name                              |
| `Defaults`          | `object?` | Route defaults (falls back to controller/action) |
| `RootId`            | `int?`    | Umbraco root node ID (set `null` if not Umbraco) |
| `RootAlias`         | `string?` | Umbraco root node alias                          |
| `IsPluginController`| `bool`    | Whether this is an Umbraco plugin controller     |

### `RouteServiceExtensions`

```csharp
public static IEndpointRouteBuilder MapSplatDevRoutes(
    this IEndpointRouteBuilder endpoints,
    params Assembly[] assemblies
)
```

Scans the provided assemblies for concrete `IRoute` implementations and registers each via `MapControllerRoute`. Routes are created through `ActivatorUtilities.CreateInstance` so DI-injected constructors are supported.

At least one assembly must be provided.

## Limitations

- **Umbraco-specific fields on the generic interface.** `RootId`, `RootAlias`, and `IsPluginController` leak Umbraco concepts into what the package description markets as an ASP.NET Core utility. See the design decision below for the planned resolution.
- **No route ordering or priority.** Routes are registered in discovery order; the first-matching route wins. If you need explicit ordering, pass assemblies in the desired sequence.
- **Hard dependency on `Microsoft.AspNetCore.App`.** This package requires the ASP.NET Core shared framework and cannot be used in console / worker-service projects that only reference `Microsoft.NET.Sdk`.

## Design Decision: Interface Shape

**Status:** Recorded, pending implementation in a future release.

The current `IRoute` interface mixes generic ASP.NET route metadata (`RouteAlias`, `Url`, `Controller`, `Action`, `Defaults`) with Umbraco-specific fields (`RootId`, `RootAlias`, `IsPluginController`). This is semantically wrong for a package described as an ASP.NET Core utility.

**Planned resolution (v2.0):**

1. Extract a clean `IRoute` interface with only the generic fields.
2. Create `IUmbracoPluginRoute : IRoute` carrying the three Umbraco-specific members.
3. Update `MapSplatDevRoutes` to scan for both, registering plugin routes with the extra Umbraco metadata only when relevant.

This split keeps the package usable by non-Umbraco consumers while preserving the Umbraco integration for plugin-heavy hosts.

## License

MIT (c) [SplatDev](https://github.com/SplatDev-Ltda)

---

**SplatDev.Routing** — part of the [SplatDev.Umbraco.Plugins](https://github.com/SplatDev-Ltda/SplatDev.Umbraco.Plugins) suite. Licensed under MIT. (c) SplatDev Ltda.
