# LazyLoad

Lazy loading image plugin for Umbraco — intercepts content rendering to add loading=lazy to img tags.


<!-- screenshot:start -->

![LazyLoad dashboard](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.LazyLoad/docs/screenshots/01-dashboard.png)

<!-- screenshot:end -->

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Plugins.LazyLoad.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.LazyLoad)

## Compatibility

| Umbraco | .NET | Package Version |
|---------|------|-----------------|
| 13.x    | 8.0  | 1.0.0           |
| 17.x    | 10.0 | 1.0.0           |

## Installation

```sh
dotnet add package SplatDev.Umbraco.Plugins.LazyLoad
```

## Quick Start

Register in `Program.cs`:

```csharp
builder.CreateUmbracoBuilder()
    .AddBackOffice()
    .AddWebsite()
    .AddLazyLoad()   // <-- add this
    .Build();
```

## License

MIT © [SplatDev](https://github.com/SplatDev-Ltda)