# MemberNotifications

Member-facing in-app notification system for Umbraco 17 (net10.0). Stores notifications per member key with read/unread state via IScopeProvider and NPoco.

> **Headless plugin** — No backoffice UI. Operates as DI-registered middleware (`AddMemberNotifications()`). Stores and manages per-member notification state via Umbraco IScopeProvider/NPoco.

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Plugins.MemberNotifications.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.MemberNotifications)

## Compatibility

| Umbraco | .NET | Package Version |
|---------|------|-----------------|
| 17.x    | 10.0 | 1.0.0           |

## Installation

```sh
dotnet add package SplatDev.Umbraco.Plugins.MemberNotifications
```

## Quick Start

Register in `Program.cs`:

```csharp
builder.CreateUmbracoBuilder()
    .AddBackOffice()
    .AddWebsite()
    .AddMemberNotifications()   // <-- add this
    .Build();
```

## License

MIT © [SplatDev](https://github.com/SplatDev-Ltda)
