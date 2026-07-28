# SplatDev.Umbraco.Tools.T4.Plugins

CLI code generator for Umbraco plugin scaffolding. Creates Composer, Controller, Service, `package.manifest`, and language files from T4 templates.

## Package

**NuGet:** `SplatDev.Umbraco.Tools.T4.Plugins` (v1.0.0)  
**CLI command:** `umbraco-gen-plugin`

## Compatibility

| Umbraco Version | .NET | Status |
|----------------|------|--------|
| v13 | net8.0 | Supported |
| v17 | net10.0 | Supported |

## Installation

```bash
dotnet tool install -g SplatDev.Umbraco.Tools.T4.Plugins
```

## Usage

```bash
# Generate a new plugin
umbraco-gen-plugin --name MyPlugin --output ./src/

# Available templates
umbraco-gen-plugin --list-templates
```

The tool generates:
- Plugin `.csproj` with dual-targeting (net8.0 + net10.0)
- Composer class (`IComposer`)
- Management API Controller
- Service layer
- `package.manifest` / `umbraco-package.json`
- Language files (`lang/en-US.xml`)

## Dependencies

- System.CommandLine

## Known Limitations

- Generated code targets the SplatDev convention; may need customization for other projects
- T4 template engine requires the .NET SDK to be installed on the developer machine
- No Bellissima `client/` scaffolding yet — generated plugins are headless by default
