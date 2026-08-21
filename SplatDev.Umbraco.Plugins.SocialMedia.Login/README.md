# SocialMedia.Login

Umbraco social login integration plugin — configure OAuth providers (Facebook, Google, Twitter/X, Apple) for member sign-in. Supports Umbraco 13 (net8.0) and Umbraco 17 (net10.0).


<!-- screenshot:start -->

![SocialMedia.Login dashboard](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.SocialMedia.Login/docs/screenshots/01-dashboard.png)

<!-- screenshot:end -->

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Plugins.SocialMedia.Login.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.SocialMedia.Login)

## Compatibility

| Umbraco | .NET | Package Version |
|---------|------|-----------------|
| 13.x    | 8.0  | 2.0.0           |
| 17.x    | 10.0 | 2.0.0           |

## Installation

```sh
dotnet add package SplatDev.Umbraco.Plugins.SocialMedia.Login
```

## Quick Start

Register in `Program.cs`:

```csharp
builder.CreateUmbracoBuilder()
    .AddBackOffice()
    .AddWebsite()
    .AddSocialMediaLogin()   // <-- add this
    .Build();
```

## Configuration

Add to `appsettings.json`:

```json
{
  "SocialMedia": {
    "Login": {
      "Google": {
        "ClientId": "",
        "ClientSecret": ""
      },
      "Facebook": {
        "AppId": "",
        "AppSecret": ""
      }
    }
  }
}
```

## License

MIT © [SplatDev](https://github.com/SplatDev-Ltda)