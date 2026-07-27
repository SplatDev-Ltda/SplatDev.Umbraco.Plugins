# CharLimit

Character limit property editor for Umbraco — enforces max length on text properties with live counter display.

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

## License

MIT © [SplatDev](https://github.com/SplatDev-Ltda)
