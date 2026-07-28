# FormBuilder for Umbraco

An open-source Umbraco Forms alternative — a fully functional form builder for Umbraco CMS without any per-site licensing requirements.

> **Headless plugin** — Operates primarily as a service layer with API endpoints. The optional backoffice UI and Swagger dashboard are provided via the companion client package. Core functionality (form definitions, workflows, migrations, frontend submissions) runs headless.

## Overview

FormBuilder provides the same core capabilities as Umbraco Forms (form definition, field types, workflows, email notifications, submission storage) as a free, MIT-licensed NuGet package. It targets Umbraco 13 LTS and Umbraco 17 LTS via multi-targeted builds.

## Projects

| Project | Purpose |
|---|---|
| `FormBuilder.Extension` | The installable NuGet package. Targets `net8.0` (Umbraco 13) and `net10.0` (Umbraco 17). |
| `FormBuilder` | Reference web application running Umbraco 15 (net9.0). Used for local development and smoke-testing the extension. Do not change its target framework — it is a dev harness only. |
| `FormBuilder.Tests` | Unit and integration tests. |

## Installation

Install the NuGet package into your Umbraco 13 or Umbraco 17 site:

```sh
dotnet add package FormBuilder.Extension
```

No additional license file or license key is required.

## Features

- Define forms with multiple field types (text, dropdown, etc.)
- Configurable workflows triggered on submission (e.g. send email)
- Automatic database table creation via Umbraco migration pipeline
- Back-office API with Swagger UI and versioned endpoints
- Front-end submission endpoint with CSRF protection

## Compatibility

| FormBuilder.Extension version | Umbraco version | .NET TFM |
|---|---|---|
| 2.x | 13.x LTS | net8.0 |
| 2.x | 17.x LTS | net10.0 |

## License

MIT
