# Umbraco YAML Toolkit

<!-- screenshot:start -->
<!-- screenshot:end -->

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/SplatDev-Ltda/umbraco-yaml/actions/workflows/ci.yml/badge.svg)](https://github.com/SplatDev-Ltda/umbraco-yaml/actions/workflows/ci.yml)

A pair of complementary **Infrastructure-as-Code** plugins that let you export and import your entire Umbraco site structure as a human-readable YAML file.

```
┌──────────────────────────────────────────────────────────────────┐
│  Source Umbraco site  ──Schema2Yaml──▶  umbraco.yml + media/     │
│                                               │                   │
│                                          Git / CI                 │
│                                               │                   │
│  Target Umbraco site  ◀─Yaml2Schema───  umbraco.yml + media/     │
└──────────────────────────────────────────────────────────────────┘
```

---

## Packages

### [SplatDev.Umbraco.Plugins.Schema2Yaml](SplatDev.Umbraco.Plugins.Schema2Yaml/README.md)

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Plugins.Schema2Yaml.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.Schema2Yaml)
[![NuGet Downloads](https://img.shields.io/nuget/dt/SplatDev.Umbraco.Plugins.Schema2Yaml.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.Schema2Yaml)

Exports your existing Umbraco site structure to YAML. Adds a **Schema Export** dashboard in the Settings section. One click produces a ZIP with a complete `umbraco.yml` and all media files.
_For Umbraco 13, use v1.x._

```bash
dotnet add package SplatDev.Umbraco.Plugins.Schema2Yaml
```

**Umbraco compatibility:**

| Umbraco | .NET TFM |
|---------|----------|
| 13.x    | net8.0 — use [v1.x](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.Schema2Yaml/1.0.9) |
| 14.x    | net8.0   |
| 15.x    | net9.0   |
| 16.x    | net9.0   |
| 17.x    | net10.0  |

→ [Full documentation](SplatDev.Umbraco.Plugins.Schema2Yaml/README.md)

---

### [SplatDev.Umbraco.Plugins.Yaml2Schema](Umbraco.Plugins.Yaml2Schema/README.md)

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Plugins.Yaml2Schema.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.Yaml2Schema)
[![NuGet Downloads](https://img.shields.io/nuget/dt/SplatDev.Umbraco.Plugins.Yaml2Schema.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.Yaml2Schema)

Reads a YAML file on application startup and bootstraps your entire Umbraco site structure automatically. Supports create, upsert (`update: true`), and delete (`remove: true`) for every entity type.

```bash
dotnet add package SplatDev.Umbraco.Plugins.Yaml2Schema
```

**Umbraco compatibility:** Umbraco 17 (net10.0)

→ [Full documentation](Umbraco.Plugins.Yaml2Schema/README.md)

---

## Typical Workflow

1. Install **Schema2Yaml** on your source Umbraco site
2. Open the **Settings → Schema Export** dashboard and click **Download ZIP**
3. Unzip — you get `umbraco.yml` and a `media/` folder
4. Commit to your repository
5. Install **Yaml2Schema** on the target site
6. Drop `umbraco.yml` (and optionally `media/`) into the project
7. Run — everything is created on startup

---

## Repository Structure

```
umbraco-yaml/
├── SplatDev.Umbraco.Plugins.Schema2Yaml/          # Exporter package (Umbraco 14–17)
├── SplatDev.Umbraco.Plugins.Schema2Yaml.Tests/    # Tests (net8.0 / net9.0 / net10.0)
├── Umbraco.Plugins.Yaml2Schema/                   # Importer package (Umbraco 17)
├── Umbraco.Plugins.Yaml2Schema.Tests/             # Tests (net10.0)
├── docs/                                          # Authoring guide and images
└── .github/workflows/                             # CI + NuGet publish workflows
```

---

## Contributing

Issues and pull requests welcome at <https://github.com/SplatDev-Ltda/umbraco-yaml>.

## License

MIT © 2026 SplatDev