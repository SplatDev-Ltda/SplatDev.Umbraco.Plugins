# SplatDev.Umbraco.Plugins.CodeFirst — DEPRECATED

> **Headless plugin** — No backoffice UI. This was a code-first content-type definition library (C# attributes only). Superseded by YAML-based tooling. Kept for reference; not packable.

> **This package is deprecated and will not receive new features or bug fixes.**
>
> Use [SplatDev.Umbraco.Plugins.Yaml2Schema](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.Yaml2Schema) instead.
> Follow the [migration guide](#migrating-to-yaml2schema) below.

---

## Why this package is deprecated

`SplatDev.Umbraco.Plugins.CodeFirst` defined Umbraco content types (document types, media types, member types) by decorating C# classes with attributes such as `[DocumentType]`, `[MediaType]`, and `[ContentNodeProperty]`. While this was useful for code-first Umbraco projects, it had several drawbacks:

- **Tightly coupled to C# code** — schema changes required a code change, recompile, and deploy.
- **No diff / audit trail** — it was hard to see what changed between runs.
- **Umbraco 17 incompatible** — the underlying APIs changed too significantly. The plugin does not run on `net10.0` / Umbraco 17+.
- **Superseded by a better approach** — the YAML Toolkit exports and imports your entire site structure as a plain YAML file, making schema changes reviewable, versionable, and environment-portable.

The `Migrations.cs` class is explicitly marked `[Obsolete]`. The package is set to `<IsPackable>false</IsPackable>` and will not be published to NuGet.

---

## Version compatibility

| Umbraco | .NET TFM | CodeFirst | Recommended replacement |
|---------|----------|-----------|------------------------|
| 13.x    | net8.0   | Last supported | Yaml2Schema v1.x |
| 14.x+   | net8.0+  | **Not supported** | Yaml2Schema |
| 17.x    | net10.0  | **Not supported** | Yaml2Schema |

---

## Migrating to Yaml2Schema

### Overview

The YAML Toolkit replaces CodeFirst with a declarative, file-based approach:

```
┌──────────────────────────────────────────────────────────────────┐
│  Source Umbraco site  ──Schema2Yaml──▶  umbraco.yml + media/     │
│                                               │                   │
│                                          Git / CI                 │
│                                               │                   │
│  Target Umbraco site  ◀─Yaml2Schema───  umbraco.yml + media/     │
└──────────────────────────────────────────────────────────────────┘
```

Two packages work together:

| Package | Role |
|---------|------|
| [SplatDev.Umbraco.Plugins.Schema2Yaml](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.Schema2Yaml) | Exports your existing Umbraco schema to `umbraco.yml` |
| [SplatDev.Umbraco.Plugins.Yaml2Schema](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.Yaml2Schema) | Reads `umbraco.yml` on startup and creates/updates the schema |

---

### Step-by-step migration

#### Step 1 — Export your existing schema

If you have an Umbraco 13 site with CodeFirst-managed types already applied, use Schema2Yaml to export them:

```bash
dotnet add package SplatDev.Umbraco.Plugins.Schema2Yaml
```

Open **Settings → Schema Export** in the Umbraco back-office, click **Download ZIP**, and unzip the result. You will get `umbraco.yml` and a `media/` folder.

#### Step 2 — Understand the YAML format

A document type that CodeFirst defined like this:

```csharp
[DocumentType("Blog Post", "blogPost", allowAtRoot: false, sortOrder: 0)]
public class BlogPost
{
    [ContentNodePropertyAttributes("title")]
    public string Title { get; set; }

    [ContentNodePropertyAttributes("bodyText")]
    public string Body { get; set; }
}
```

...is expressed in YAML like this:

```yaml
documentTypes:
  - name: Blog Post
    alias: blogPost
    allowAtRoot: false
    icon: icon-document
    properties:
      - alias: title
        name: Title
        dataType: Textstring
        mandatory: false
      - alias: bodyText
        name: Body
        dataType: Textarea
        mandatory: false
```

Media types follow the same pattern under a `mediaTypes:` key.

#### Step 3 — Remove CodeFirst from your project

Remove the NuGet package reference (if you had it as a NuGet dependency) or the project reference:

```bash
dotnet remove package SplatDev.Umbraco.CodeFirst
```

Remove any CodeFirst attributes from your model classes and delete any `[DocumentType]`, `[MediaType]`, or `[ContentNodeProperty]` decorators.

#### Step 4 — Install Yaml2Schema

```bash
dotnet add package SplatDev.Umbraco.Plugins.Yaml2Schema
```

Drop `umbraco.yml` into your Umbraco project root (next to `appsettings.json`). On the next application start, Yaml2Schema reads the file and creates or updates your Umbraco schema automatically.

#### Step 5 — Verify

Start the application. The Yaml2Schema composer runs on startup and logs each entity created or skipped. Review the Umbraco back-office to confirm document types, media types, data types, and templates are present.

---

### Concept mapping

| CodeFirst concept | Yaml2Schema equivalent |
|-------------------|----------------------|
| `[DocumentType("Name", "alias", ...)]` | `documentTypes[].name` + `documentTypes[].alias` |
| `[MediaType("Name", "alias", ...)]` | `mediaTypes[].name` + `mediaTypes[].alias` |
| `[ContentNodePropertyAttributes("alias")]` | `documentTypes[].properties[].alias` |
| `[RestrictNode(...)]` | `documentTypes[].allowedChildren[]` |
| C# class inheritance for compositions | `documentTypes[].compositions[]` |
| Migration runner (Migrations.cs) | No equivalent needed — Yaml2Schema applies changes idempotently on startup |

---

### Further reading

- [Yaml2Schema NuGet](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.Yaml2Schema)
- [Schema2Yaml NuGet](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.Schema2Yaml)
- [GitHub repository](https://github.com/SplatDev-Ltda/umbraco-yaml)

---

## Source code

This directory is retained for reference only. The source will not compile on `net10.0` (Umbraco 17+) and the package is not published to NuGet (`IsPackable=false`). The last supported Umbraco version is **13.x** on `net8.0`.
