# SplatDev.Umbraco.Tools.Packager

A .NET CLI tool for creating Umbraco NuGet packages — generates `package.manifest`, bundles `App_Plugins` assets, and wraps `dotnet pack` to produce installable Umbraco Marketplace packages from your plugin projects.

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Tools.Packager.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Tools.Packager)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Compatibility

| .NET | Umbraco | Package Version |
|------|---------|-----------------|
| 8.0  | 13      | 1.0.0           |
| 10.0 | 17      | 1.0.0           |

## Installation

```sh
dotnet tool install -g SplatDev.Umbraco.Tools.Packager
```

Or install locally to a project:

```sh
dotnet new tool-manifest
dotnet tool install SplatDev.Umbraco.Tools.Packager
```

## Usage

### Basic package creation

```sh
# Navigate to your Umbraco plugin project and run:
umbraco-packager pack
```

### With explicit options

```sh
umbraco-packager pack \
    --project ./src/MyPlugin/MyPlugin.csproj \
    --output ./dist \
    --version 1.2.0
```

### Generate package manifest only

```sh
umbraco-packager generate-manifest \
    --project ./src/MyPlugin/MyPlugin.csproj
```

### Validate an existing package

```sh
umbraco-packager validate \
    --package ./dist/MyPlugin.1.0.0.nupkg
```

## Configuration

### Project structure requirements

The packager expects the standard Umbraco plugin layout:

```
MyPlugin/
  App_Plugins/
    MyPlugin/
      package.manifest
      controller.js
      styles.css
  MyPlugin.csproj
```

### package.manifest generation

The `generate-manifest` command inspects your project and creates a `package.manifest` JSON file with metadata extracted from the `.csproj`:

```json
{
  "name": "MyPlugin",
  "version": "1.0.0",
  "author": "SplatDev Ltda",
  "controls": {
    "javascript": [
      "~/App_Plugins/MyPlugin/controller.js"
    ],
    "css": [
      "~/App_Plugins/MyPlugin/styles.css"
    ]
  }
}
```

## Features

- **Generate `package.manifest`** from project metadata and App_Plugins file inventory
- **Bundle App_Plugins assets** — automatically discovers and includes JavaScript, CSS, views, and configuration files
- **Wrap `dotnet pack`** with Umbraco-specific conventions and property injection
- **Validate packages** to ensure they meet Umbraco Marketplace requirements
- Support for multiple build configurations (`Debug`, `Release`)
- Output path customization via `--output` flag
- Version override for CI/CD pipelines via `--version` flag
- `umbraco-packager` global CLI command for quick access

## Commands

| Command | Description |
|---------|-------------|
| `pack` | Full package creation: manifest + asset bundle + dotnet pack |
| `generate-manifest` | Generates `package.manifest` from project metadata |
| `validate` | Validates an existing NuGet package for Umbraco compliance |

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `System.CommandLine` | 2.0.0-beta4.22272.1 | CLI argument parsing and command routing |

No other NuGet dependencies — the tool leverages the .NET SDK build infrastructure directly.

---

**SplatDev.Umbraco.Tools.Packager** — part of the [SplatDev.Umbraco.Plugins](https://github.com/SplatDev-Ltda/SplatDev.Umbraco.Plugins) suite. Licensed under MIT. &copy; SplatDev Ltda.
