# CharLimit

Character limit property editor for Umbraco — enforces max length on text properties with live counter display.


<!-- screenshot:start -->

![CharLimit dashboard](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.CharLimit/docs/screenshots/01-dashboard.png)

![CharLimit property editor](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.CharLimit/docs/screenshots/02-property-editor.png)

![CharLimit data type](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.CharLimit/docs/screenshots/03-data-type.png)

<!-- screenshot:end -->

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Plugins.CharLimit.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.CharLimit)

## Compatibility

| Umbraco | .NET | Package Version |
|---------|------|-----------------|
| 13.x    | 8.0  | 1.0.0           |
| 17.x    | 10.0 | 1.0.0           |

## Installation

```sh
dotnet add package SplatDev.Umbraco.Plugins.CharLimit
```

## Quick Start

Register in `Program.cs`:

```csharp
builder.CreateUmbracoBuilder()
    .AddBackOffice()
    .AddWebsite()
    .AddCharLimit()   // <-- add this
    .Build();
```

## Configuration

The plugin auto-registers via `CharLimitComposer`. Configure per-property via the Umbraco backoffice Data Type settings:

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `maxChars` | int | 200 | Maximum character length |
| `showCountdown` | bool | true | Display live character counter |

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/umbraco/api/charlimit/GetConfig` | Returns the current CharLimit configuration |

## Usage

Add a CharLimit data type to any text property on a document type. The property editor displays a live character counter and enforces the configured maximum length at the editor level.

## Known Limitations

- The `GetConfig` endpoint returns a hardcoded default configuration (MaxChars=200) rather than reading from the data type's saved settings
- Editor validation is client-side only — backend enforcement must be handled separately
- Different `DataEditor` attribute signatures are used via conditional compilation for net8.0 vs net10.0

## Changelog

### 1.4.0 — 2026-08-23

The Umbraco Marketplace listing now shows every screenshot for this plugin, not just the dashboard. The listing keeps its own screenshot list rather than reading the README.

### 1.3.0 — 2026-08-23
- The character limit is enforced on Umbraco 17. The package registered its schema there but no editor UI for it, and the schema pointed at Umbraco's plain text box — so a Character Limit property rendered as an ordinary text box with no limit and no counter. The plugin's whole purpose did nothing on 17, quietly, while continuing to work on 13.
- Behaviour matches the Umbraco 13 editor rather than improving on it, so a site upgrading does not find the field behaving differently: same maximum, same countdown, same wording.
- A data type configured on Umbraco 13 keeps its settings — the limit is read whether it was stored as a number or a string.

### 1.2.2 — 2026-08-21
- Dashboard now sends the backoffice token with its API calls. On Umbraco 17 those calls were arriving unauthenticated and coming back 401, which the dashboard rendered as an empty state rather than an error.
- A failed request now raises a notification instead of leaving the dashboard looking like there is simply no data.
- The backoffice manifest now points at the dashboard the build actually produces; it referenced an older hand-written file that shadowed it.

## License

MIT © [SplatDev](https://github.com/SplatDev-Ltda)