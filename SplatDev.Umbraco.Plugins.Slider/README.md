# Slider

Image slider plugin for Umbraco — stores slide data with EF Core, renders via REST API and backoffice dashboard.

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Plugins.Slider.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.Slider)

## Compatibility

| Umbraco | .NET | Package Version |
|---------|------|-----------------|
| 13.x    | 8.0  | 1.0.1           |
| 17.x    | 10.0 | 1.0.1           |

## Installation

```sh
dotnet add package SplatDev.Umbraco.Plugins.Slider
```

The plugin registers automatically via `IComposer` — no manual `Program.cs` registration needed. Just add the package and build.

## Features

- Full CRUD REST API at `umbraco/api/slider/`
- EF Core persistence to SQL Server (reuses the Umbraco `umbracoDbDSN` connection string, schema `"slider"`)
- Backoffice dashboard at **Settings → Slider** (AngularJS for Umbraco 13, LitElement for Umbraco 17)
- Slide configuration: title, subtitle, image URL, link URL, autoplay, autoplay delay, loop, transition effect

## Configuration

Settings are managed through the backoffice dashboard. Each slider supports:

| Setting | Default | Description |
|---------|---------|-------------|
| `Autoplay` | `true` | Auto-advance slides |
| `AutoplayDelay` | `5000` | Delay between slides in ms |
| `Loop` | `true` | Loop back to first slide after last |
| `Effect` | `"slide"` | Transition effect (`"slide"`, `"fade"`) |

## Known limitations

- SQL Server only — no PostgreSQL/SQLite support (hardcoded `UseSqlServer()`)
- No front-end rendering component — only a REST API and backoffice dashboard are provided; site rendering must be implemented in the consuming project
- No pagination on slide lists
- API endpoints are unauthenticated (inherit from `ControllerBase`, not Umbraco's authorized controller)
- `ImageUrl` is a plain string — no Umbraco media picker integration
- No input validation on create/update operations

## License

MIT © [SplatDev](https://github.com/SplatDev-Ltda)
