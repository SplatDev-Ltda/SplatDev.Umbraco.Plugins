# Schema2Yaml

Export Umbraco document types to YAML format — reverse operation of Yaml2Schema. Exports content types, media types, members, and content to YAML files for version control or migration.


<!-- screenshot:start -->

![Schema2Yaml dashboard](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.Yaml/SplatDev.Umbraco.Plugins.Schema2Yaml/docs/screenshots/01-dashboard.png)

<!-- screenshot:end -->

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Plugins.Schema2Yaml.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.Schema2Yaml)

## Compatibility

| Umbraco | .NET | Package Version |
|---------|------|-----------------|
| 13.x    | 8.0  | 2.1.3           |
| 17.x    | 10.0 | 2.1.3           |

## Installation

```sh
dotnet add package SplatDev.Umbraco.Plugins.Schema2Yaml
```

## Quick Start

No explicit registration required — the plugin self-registers via `Schema2YamlComposer` on startup and the dashboard appears automatically in the Settings section of the backoffice.

## Configuration

Add to `appsettings.json`:

```json
{
  "UmbracoSchema2Yaml": {
    "ExportPath": "exports/umbraco.yml",
    "IncludeMedia": true,
    "IncludeContent": true,
    "IncludeMembers": true,
    "IncludeUsers": false
  }
}
```

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `ExportPath` | string | `exports/umbraco.yml` | Output file path |
| `IncludeMedia` | bool | true | Export media types |
| `IncludeContent` | bool | true | Export document types |
| `IncludeMembers` | bool | true | Export member types |
| `IncludeUsers` | bool | false | Export user definitions |

## Usage

Access the Schema2Yaml dashboard from the Umbraco Settings section. Select the entity types to export and click "Export" to generate a YAML file at the configured path. Use the resulting YAML with `Yaml2Schema` to import into another Umbraco instance.

## Known Limitations

- Exports to a single YAML file — no support for splitting into multiple files per content type
- Export path is relative to the application root; ensure the directory is writable
- No incremental/delta export; always exports the full schema

## Changelog

### 2.1.3 — 2026-08-26

The NuGet listing now shows the dashboard. It had no screenshot before, so the listing gave no picture of what the plugin looks like in the backoffice.

### 2.1.2 — 2026-08-24

Removes a dashboard screenshot that showed an error toast. It was captured against a site where this plugin's API was unreachable, so it advertised a broken dashboard. No screenshot is better than a misleading one; a replacement will be taken against a working install.

### 2.1.1 — 2026-08-24

Package metadata only: the listing now carries an icon and search tags, and the project and repository links point at the organisation that actually hosts this code. No code changes.

### 2.1.0 — 2026-08-23

Fixes the Umbraco Marketplace listing, which pointed its screenshot at a different repository and returned 404 — so the entry showed a broken image.

### 2.0.10 — 2026-08-22
- The backoffice dashboard now appears. Its assets lived under `wwwroot/App_Plugins/`, which is not a path Umbraco or the static-file middleware ever serves from — every request for the manifest and the bundle returned 404, so the dashboard was unreachable on any install.
- The plugin now embeds its `App_Plugins` in the assembly, serves them from there, and registers its own package manifest, matching every other plugin in this repo. It no longer depends on a `buildTransitive` copy step that silently does nothing when it fails.

## License

MIT © [SplatDev](https://github.com/SplatDev-Ltda)