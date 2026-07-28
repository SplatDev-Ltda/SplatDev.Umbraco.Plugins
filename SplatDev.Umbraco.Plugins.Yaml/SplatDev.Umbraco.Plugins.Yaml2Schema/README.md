# Yaml2Schema

Import YAML document type definitions into Umbraco — creates and updates content types, media types, member types, and data types from YAML files.

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Plugins.Yaml2Schema.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.Yaml2Schema)

## Compatibility

| Umbraco | .NET | Package Version |
|---------|------|-----------------|
| 13.x    | 8.0  | 1.0.38          |
| 17.x    | 10.0 | 1.0.38          |

## Installation

```sh
dotnet add package SplatDev.Umbraco.Plugins.Yaml2Schema
```

## Quick Start

Register in `Program.cs`:

```csharp
builder.CreateUmbracoBuilder()
    .AddBackOffice()
    .AddWebsite()
    .AddYaml2Schema()   // <-- add this
    .Build();
```

## Configuration

Add to `appsettings.json`:

```json
{
  "UmbracoYaml2Schema": {
    "YamlPath": "umbraco.yml",
    "RunOnStartup": false,
    "OverwriteExisting": false
  }
}
```

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `YamlPath` | string | `umbraco.yml` | Path to the YAML definition file |
| `RunOnStartup` | bool | false | Import schemas automatically on application startup |
| `OverwriteExisting` | bool | false | Overwrite existing content types that match by alias |

## Usage

Place a YAML file (typically exported with `Schema2Yaml`) at the configured path. Use the Yaml2Schema dashboard in the Umbraco backoffice to review and import the definitions. If `RunOnStartup` is enabled, imports trigger automatically when the application starts.

```yaml
# Example YAML structure (abbreviated)
documentTypes:
  - alias: article
    name: Article
    properties:
      - alias: title
        name: Title
        dataType: Umbraco.TextBox
```

## Known Limitations

- When `OverwriteExisting` is false, matching content types are skipped — no merge or partial update support
- Startup imports block application startup until complete, which may impact boot time for large schemas
- YAML format must match the structure produced by `Schema2Yaml`; hand-written YAML files may fail validation

## License

MIT © [SplatDev](https://github.com/SplatDev-Ltda)
