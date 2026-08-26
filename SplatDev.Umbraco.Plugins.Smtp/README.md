# Smtp

SMTP email configuration UI for Umbraco backoffice — configure, test, and manage SMTP email settings directly from the backoffice dashboard.


<!-- screenshot:start -->

![Smtp dashboard](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.Smtp/docs/screenshots/01-dashboard.png)

<!-- screenshot:end -->

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Plugins.Smtp.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.Smtp)

## Compatibility

| Umbraco | .NET | Package Version |
|---------|------|-----------------|
| 13.x    | 8.0  | 2.4.5           |
| 17.x    | 10.0 | 2.4.5           |

## Installation

```sh
dotnet add package SplatDev.Umbraco.Plugins.Smtp
```

## Quick Start

No registration call is needed. The package ships Umbraco composers, so the `AddComposers()` already in the default `Program.cs` picks the plugin up as soon as the package is referenced.

## Configuration

Add to `appsettings.json`:

```json
{
  "Smtp": {
    "Host": "smtp.example.com",
    "Port": 587,
    "Username": "your-smtp-username",
    "Password": "your-smtp-password",
    "EnableSsl": true,
    "FromAddress": "noreply@example.com"
  }
}
```

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `Host` | string | (required) | SMTP server hostname |
| `Port` | int | 587 | SMTP server port |
| `Username` | string | (optional) | SMTP authentication username |
| `Password` | string | (optional) | SMTP authentication password |
| `EnableSsl` | bool | true | Use TLS/SSL |
| `FromAddress` | string | (required) | Default sender email address |

## Usage

After registration, the Smtp dashboard appears in the Umbraco backoffice. Navigate to the dashboard to:
- View and edit SMTP configuration
- Send a test email to verify settings
- Update SMTP credentials without restarting the application

## Known Limitations

- SMTP credentials are stored in `appsettings.json` — consider using User Secrets or Azure Key Vault in production
- Single SMTP server configuration only — no support for multiple providers or per-domain SMTP settings
- No built-in email queue or retry mechanism; email delivery depends on the configured SMTP server

## Changelog

### 2.4.5 — 2026-08-26

The NuGet listing now shows the dashboard. It had no screenshot before, so the listing gave no picture of what the plugin looks like in the backoffice.

### 2.4.4 — 2026-08-26

Fixes a duplicate registration on sites that still have a physical App_Plugins folder for this plugin, left behind by an older release that copied content into the site. Umbraco registered those extensions twice - once from its own scan of the folder, once from this package's embedded manifest - and logged "Extension with alias ... is already registered". The embedded manifest now yields to the physical copy.

### 2.4.3 — 2026-08-25

Documentation only, no code change. The README's Quick Start told you to call a registration method that does not exist in this package — following it produced a compile error on the first build. There is nothing to register: the package ships Umbraco composers and the `AddComposers()` already in the default `Program.cs` finds it. The Compatibility table also now shows the version actually being shipped instead of the one it was written at.

### 2.4.2 — 2026-08-24

Removes a dashboard screenshot that showed an error toast. It was captured against a site where this plugin's API was unreachable, so it advertised a broken dashboard. No screenshot is better than a misleading one; a replacement will be taken against a working install.

### 2.4.1 — 2026-08-24

Package metadata only: the listing now carries an icon and search tags, and the project and repository links point at the organisation that actually hosts this code. No code changes.

### 2.4.0 — 2026-08-23

The Umbraco Marketplace listing now carries this plugin's screenshots. The listing keeps its own screenshot list rather than reading the README, and this one was empty — so the entry showed no images at all.

### 2.3.2 — 2026-08-21
- Dashboard now sends the backoffice token with its API calls. On Umbraco 17 those calls were arriving unauthenticated and coming back 401, which the dashboard rendered as an empty state rather than an error.
- A failed request now raises a notification instead of leaving the dashboard looking like there is simply no data.

## License

MIT © [SplatDev](https://github.com/SplatDev-Ltda)