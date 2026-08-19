# AdminBar

Fixed admin bar for Umbraco — injects a toolbar at the top of front-end pages for logged-in backoffice users with Edit Page, Preview, and Publish shortcuts.


<!-- screenshot:start -->

![AdminBar dashboard](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.AdminBar/docs/screenshots/01-dashboard.png)

<!-- screenshot:end -->

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Plugins.AdminBar.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.AdminBar)

## Compatibility

| Umbraco | .NET | Package Version |
|---------|------|-----------------|
| 13.x    | 8.0  | 2.0.0           |
| 17.x    | 10.0 | 2.0.0           |

## Installation

```sh
dotnet add package SplatDev.Umbraco.Plugins.AdminBar
```

## Quick Start

Register in `Program.cs`:

```csharp
builder.CreateUmbracoBuilder()
    .AddBackOffice()
    .AddWebsite()
    .AddAdminBar()   // <-- add this
    .Build();
```

## Configuration

Add to `appsettings.json`:

```json
{
  "AdminBar": {
    "Enabled": true,
    "ShowEditPage": true,
    "ShowPreview": true,
    "ShowPublish": true,
    "Position": "top"
  }
}
```

## Usage

After registration, the admin bar automatically appears at the top of every front-end page when a backoffice user is logged in. The bar provides:

- **Edit Page** — navigates to the backoffice content editor for the current page
- **Preview** — toggles preview mode for unpublished content
- **Publish** — publishes the current page directly from the front-end

## Known Limitations

- Admin bar visibility is determined by backoffice authentication cookies — no separate authorization mechanism
- Publish action bypasses Umbraco's workflow/approval if one is configured
- Position customization (top vs bottom) requires the `Position` config key

## License

MIT © [SplatDev](https://github.com/SplatDev-Ltda)