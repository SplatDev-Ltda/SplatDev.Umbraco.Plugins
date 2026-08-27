# MemberNotifications

<!-- screenshot:start -->
<!-- screenshot:end -->

Member-facing in-app notification system for Umbraco 17 (net10.0). Stores notifications per member key with read/unread state via IScopeProvider and NPoco.

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Plugins.MemberNotifications.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.MemberNotifications)

## Compatibility

| Umbraco | .NET | Package Version |
|---------|------|-----------------|
| 17.x    | 10.0 | 1.3.0           |

## Installation

```sh
dotnet add package SplatDev.Umbraco.Plugins.MemberNotifications
```

## Quick Start

No registration call is needed. The package ships Umbraco composers, so the `AddComposers()` already in the default `Program.cs` picks the plugin up as soon as the package is referenced.

## Configuration screen

Members → Member Notifications. Nothing is raised until you enable it there: before 1.3.0
this plugin only stored notifications an application created itself, and it still does that
too.

Each event has its own rule — whether it fires, who receives it, and the wording. Recipients
are the member the event happened to, one or more member groups, or both.

**Member events** — signed in, failed sign-in, signed out, two-factor requested, roles
assigned, roles removed.

**Backoffice user events** — signed in, failed sign-in, password changed, password reset,
reset requested, two-factor requested, account locked, account unlocked.

A backoffice event has no member behind it, so it can only go to a member group. The screen
disables "notify the person it happened to" for those rather than offering a setting that
would quietly do nothing.

Titles and bodies accept `{member}`, `{user}`, `{when}`, `{ip}` and — for role
changes — `{roles}`.

Retention matters: failed sign-ins accumulate quickly on a public site, and an inbox nobody
prunes is what eventually makes the members section slow. The default is 90 days; 0 keeps
them forever.

### Umbraco 17.4 or newer

The member sign-in notifications this builds on (`MemberLoginSuccessNotification` and its
siblings) do not exist before Umbraco 17.4, which is why the package now requires it. On
17.3 a handler for them compiles and simply never fires.


## Changelog

### 1.3.0 — 2026-08-27

Adds a configuration screen under Members. Fourteen security events — member and backoffice sign-ins, failed sign-ins, password changes and resets, two-factor requests, account lock and unlock, and member role changes — can each be switched on, addressed to the person concerned or to member groups, and worded with tokens. Retention is configurable. Requires Umbraco 17.4, because the member sign-in notifications it listens to do not exist before that.

### 1.2.4 — 2026-08-26

Fixes a duplicate registration on sites that still have a physical App_Plugins folder for this plugin, left behind by an older release that copied content into the site. Umbraco registered those extensions twice - once from its own scan of the folder, once from this package's embedded manifest - and logged "Extension with alias ... is already registered". The embedded manifest now yields to the physical copy.

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
