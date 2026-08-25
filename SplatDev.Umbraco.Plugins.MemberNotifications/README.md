# MemberNotifications

<!-- screenshot:start -->
<!-- screenshot:end -->

Member-facing in-app notification system for Umbraco 17 (net10.0). Stores notifications per member key with read/unread state via IScopeProvider and NPoco.

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Plugins.MemberNotifications.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.MemberNotifications)

## Compatibility

| Umbraco | .NET | Package Version |
|---------|------|-----------------|
| 17.x    | 10.0 | 1.2.3           |

## Installation

```sh
dotnet add package SplatDev.Umbraco.Plugins.MemberNotifications
```

## Quick Start

No registration call is needed. The package ships Umbraco composers, so the `AddComposers()` already in the default `Program.cs` picks the plugin up as soon as the package is referenced.

## Changelog

### 1.2.3 — 2026-08-25

Documentation only, no code change. The README's Quick Start told you to call a registration method that does not exist in this package — following it produced a compile error on the first build. There is nothing to register: the package ships Umbraco composers and the `AddComposers()` already in the default `Program.cs` finds it. The Compatibility table also now shows the version actually being shipped instead of the one it was written at.

### 1.2.2 — 2026-08-24

Removes a dashboard screenshot that showed an error toast. It was captured against a site where this plugin's API was unreachable, so it advertised a broken dashboard. No screenshot is better than a misleading one; a replacement will be taken against a working install.

### 1.2.1 — 2026-08-24

Package metadata only: the listing now carries an icon and search tags, and the project and repository links point at the organisation that actually hosts this code. No code changes.

### 1.2.0 — 2026-08-24

This package now keeps a changelog. Earlier releases predate it and are not reconstructed here — consult the repository history for those. From this version on, every release records what changed for someone using it.

## License

MIT © [SplatDev](https://github.com/SplatDev-Ltda)

## Architecture

This is a **headless plugin** — no backoffice dashboard, property editors, or UI components. It operates as a notification handler triggered by Umbraco member events, registered via DI composition.
