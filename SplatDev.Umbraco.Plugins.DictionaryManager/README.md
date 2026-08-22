# DictionaryManager

Dictionary import/export/CRUD manager for Umbraco — full rewrite of the Umbraco 8 plugin using ILocalizationService. Supports Umbraco 13 (net8.0) and Umbraco 17 (net10.0).


<!-- screenshot:start -->

![DictionaryManager dashboard](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.DictionaryManager/docs/screenshots/01-dashboard.png)

<!-- screenshot:end -->

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Plugins.DictionaryManager.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.DictionaryManager)

## Compatibility

| Umbraco | .NET | Package Version |
|---------|------|-----------------|
| 13.x    | 8.0  | 2.0.0           |
| 17.x    | 10.0 | 2.0.0           |

## Installation

```sh
dotnet add package SplatDev.Umbraco.Plugins.DictionaryManager
```

## Quick Start

Register in `Program.cs`:

```csharp
builder.CreateUmbracoBuilder()
    .AddBackOffice()
    .AddWebsite()
    .AddDictionaryManager()   // <-- add this
    .Build();
```

## Changelog

### 2.2.1 — 2026-08-21
- The dashboard actually works. It made no requests at all — a Save button that set a flag for three seconds, and on Umbraco 13 a save() carrying a "TODO: implement save via API" comment that reported "Settings saved successfully" having saved nothing.
- List every dictionary item with a column per language, edit a translation in place, add and delete items, and import or export the whole set as JSON with an overwrite option.
- A failed load now says so instead of showing an empty list.

## License

MIT © [SplatDev](https://github.com/SplatDev-Ltda)