# Security

<!-- screenshot:start -->
<!-- screenshot:end -->

Umbraco security headers plugin — adds Content-Security-Policy, HSTS, X-Frame-Options, and other HTTP security headers via middleware, plus ASP.NET Data Protection configuration.

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Plugins.Security.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.Security)

## Compatibility

| Umbraco | .NET | Package Version |
|---------|------|-----------------|
| 13.x    | 8.0  | 2.0.5           |
| 17.x    | 10.0 | 2.0.5           |

## Installation

```sh
dotnet add package SplatDev.Umbraco.Plugins.Security
```

## Quick Start

No registration call is needed. The package ships Umbraco composers, so the `AddComposers()` already in the default `Program.cs` picks the plugin up as soon as the package is referenced.

## Configuration

Add to `appsettings.json`:

```json
{
  "CSP": {
    "default-src": "'self'",
    "script-src": "'self' 'unsafe-inline'",
    "font-src": "'self'",
    "frame-src": "'self'",
    "frame-ancestors": "'self'",
    "image-src": "'self' data:",
    "connection-src": "'self'"
  },
  "DataProtection": {
    "Enabled": true,
    "PathToPersistKeys": "/var/data/keys",
    "ApplicationName": "MyUmbracoApp",
    "PathToCertificate": null,
    "Password": null
  }
}
```

## Headers Applied

| Header | Value | Configuration |
|--------|-------|---------------|
| `Content-Security-Policy` | Configured via `CSP:*` keys | Customizable per directive |
| `Strict-Transport-Security` | max-age=604800 (7 days) | Hardcoded |
| `X-Frame-Options` | SAMEORIGIN | Default |
| `X-Content-Type-Options` | nosniff | Always set |
| `Referrer-Policy` | no-referrer-when-downgrade | Default |

## Known Limitations

- CSP is entirely disabled for all `/umbraco` paths (backoffice pages are excluded from policy enforcement)
- HSTS max-age is hardcoded to 7 days with no configuration option; non-production environments skip HSTS entirely
- Uses both `NWebsec.AspNetCore.Middleware` and `Joonasw.SecurityHeaders` for different headers, which is a maintenance concern
- Windows Data Protection key path is hardcoded to `C:\temp`

## Changelog

### 2.0.5 — 2026-08-25

Documentation only, no code change. The README's Quick Start told you to call a registration method that does not exist in this package — following it produced a compile error on the first build. There is nothing to register: the package ships Umbraco composers and the `AddComposers()` already in the default `Program.cs` finds it. The Compatibility table also now shows the version actually being shipped instead of the one it was written at.

### 2.0.4 — 2026-08-24

Removes a dashboard screenshot that showed an error toast. It was captured against a site where this plugin's API was unreachable, so it advertised a broken dashboard. No screenshot is better than a misleading one; a replacement will be taken against a working install.

### 2.0.3 — 2026-08-24

Package metadata only: the listing now carries an icon and search tags, and the project and repository links point at the organisation that actually hosts this code. No code changes.

### 2.0.2 — 2026-08-24

This package now keeps a changelog. Earlier releases predate it and are not reconstructed here — consult the repository history for those. From this version on, every release records what changed for someone using it.

## License

MIT © [SplatDev](https://github.com/SplatDev-Ltda)

## Architecture

This is a **headless middleware plugin** — no backoffice dashboard, property editors, or UI components. It operates as HTTP middleware (security headers + Data Protection configuration), registered via DI composition.
