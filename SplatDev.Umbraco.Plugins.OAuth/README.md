# OAuth

Umbraco OAuth social login plugin — member authentication via Google, Facebook, and X (Twitter) with configurable provider settings.


<!-- screenshot:start -->

![OAuth dashboard](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.OAuth/docs/screenshots/01-dashboard.png)

<!-- screenshot:end -->

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Plugins.OAuth.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.OAuth)

## Compatibility

| Umbraco | .NET | Package Version |
|---------|------|-----------------|
| 13.x    | 8.0  | 2.2.4           |
| 17.x    | 10.0 | 2.2.4           |

## Installation

```sh
dotnet add package SplatDev.Umbraco.Plugins.OAuth
```

## Quick Start

Register individual providers in `Program.cs`:

```csharp
builder.CreateUmbracoBuilder()
    .AddBackOffice()
    .AddWebsite()
    .AddGoogleMemberAuthentication()    // Google OAuth
    .AddFacebookMemberAuthentication()  // Facebook OAuth
    .AddXMemberAuthentication()         // X / Twitter OAuth
    .Build();
```

## Configuration

Add to `appsettings.json`:

```json
{
  "OAuth": {
    "Applications": {
      "Google": {
        "ClientId": "your-google-client-id",
        "ClientSecret": "your-google-client-secret",
        "CallbackPath": "/signin-google"
      },
      "Facebook": {
        "AppId": "your-facebook-app-id",
        "AppSecret": "your-facebook-app-secret",
        "CallbackPath": "/signin-facebook"
      },
      "X": {
        "ConsumerKey": "your-x-api-key",
        "ConsumerSecret": "your-x-api-secret",
        "CallbackPath": "/signin-twitter"
      }
    }
  }
}
```

## Supported Providers

| Provider | Extension Method | Required NuGet Dependency |
|----------|-----------------|---------------------------|
| Google | `.AddGoogleMemberAuthentication()` | `Microsoft.AspNetCore.Authentication.Google` |
| Facebook | `.AddFacebookMemberAuthentication()` | `Microsoft.AspNetCore.Authentication.Facebook` |
| X (Twitter) | `.AddXMemberAuthentication()` | `Microsoft.AspNetCore.Authentication.Twitter` |

## Usage

Authentication happens via browser redirects — the OAuth flow is handled by ASP.NET Core's authentication middleware. Call `/signin-google`, `/signin-facebook`, or `/signin-twitter` to trigger the OAuth login flow for the respective provider.

## Known Limitations

- Only supports Google, Facebook, and X (Twitter) — no generic OpenID Connect provider support
- No API endpoints for front-end consumption; authentication is strictly browser-based
- Member account linking (connecting multiple social accounts to one Umbraco member) is not supported

## Changelog

### 2.2.4 — 2026-08-26

Fixes a duplicate registration on sites that still have a physical App_Plugins folder for this plugin, left behind by an older release that copied content into the site. Umbraco registered those extensions twice - once from its own scan of the folder, once from this package's embedded manifest - and logged "Extension with alias ... is already registered". The embedded manifest now yields to the physical copy.

### 2.2.3 — 2026-08-26

The NuGet listing now shows the OAuth configuration dashboard, with the Google, Facebook and X provider cards.

### 2.2.2 — 2026-08-24

Removes a dashboard screenshot that showed an error toast. It was captured against a site where this plugin's API was unreachable, so it advertised a broken dashboard. No screenshot is better than a misleading one; a replacement will be taken against a working install.

### 2.2.1 — 2026-08-24

Package metadata only: the listing now carries an icon and search tags, and the project and repository links point at the organisation that actually hosts this code. No code changes.

### 2.2.0 — 2026-08-23

Rebuilds the backoffice bundle so the shipped JavaScript matches the source it is built from.

## License

MIT © [SplatDev](https://github.com/SplatDev-Ltda)