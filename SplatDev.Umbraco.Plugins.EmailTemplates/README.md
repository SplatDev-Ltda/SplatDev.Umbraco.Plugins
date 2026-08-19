# EmailTemplates

Email template engine with variable substitution, preview, and singleton style settings for Umbraco 17 (net10.0).


<!-- screenshot:start -->

![EmailTemplates dashboard](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.EmailTemplates/docs/screenshots/01-dashboard.png)

<!-- screenshot:end -->

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Plugins.EmailTemplates.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.EmailTemplates)

## Compatibility

| Umbraco | .NET | Package Version |
|---------|------|-----------------|
| 17.x    | 10.0 | 1.0.0           |

## Installation

```sh
dotnet add package SplatDev.Umbraco.Plugins.EmailTemplates
```

## Quick Start

Register in `Program.cs`:

```csharp
builder.CreateUmbracoBuilder()
    .AddBackOffice()
    .AddWebsite()
    .AddEmailTemplates()   // <-- add this
    .Build();
```

## Configuration

Add to `appsettings.json`:

```json
{
  "EmailTemplates": {
    "DefaultFromAddress": "noreply@example.com",
    "DefaultFromName": "My Site"
  }
}
```

## License

MIT © [SplatDev](https://github.com/SplatDev-Ltda)