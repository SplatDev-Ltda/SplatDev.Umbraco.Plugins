# SplatDev.Umbraco.Plugins.CustomLogin

Fully customizable Umbraco login page with branding support, SSO integration hooks, and 2FA readiness.


<!-- screenshot:start -->

![CustomLogin dashboard](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.CustomLogin/docs/screenshots/01-dashboard.png)

<!-- screenshot:end -->

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Plugins.CustomLogin.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.CustomLogin)

## Compatibility

| Umbraco | .NET | Package Version |
|---------|------|-----------------|
| 13.x    | 8.0  | 2.0.1           |
| 17.x    | 10.0 | 2.0.1           |

## Installation

```sh
dotnet add package SplatDev.Umbraco.Plugins.CustomLogin
```

## Targets

- **Umbraco 13** (net8.0)
- **Umbraco 17** (net10.0)

## Features

- Branded login page: logo, colors, custom support email
- SSO hook endpoint ready for integration
- Member validation via Umbraco's IMemberService
- Backoffice settings dashboard (AngularJS for U13, Lit 3 Web Component for U17)

## Settings

| Property | Description |
|----------|-------------|
| BrandName | Company/app name shown on login page |
| LogoUrl | URL to the brand logo image |
| BackgroundColor | Page background color (hex) |
| AccentColor | Button and link accent color (hex) |
| SupportEmail | Support contact email |
| EnableSso | Toggle SSO redirect button |

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/umbraco/api/customlogin/GetSettings` | Get current login settings |
| POST | `/umbraco/api/customlogin/SaveSettings` | Update login settings |
| POST | `/umbraco/api/customlogin/Login` | Authenticate a member |
| GET | `/umbraco/api/customlogin/ValidateMember?username=...` | Check if member exists and is not locked |

## Client Build

```bash
cd client
npm install
npm run build
```

## Changelog

### 2.2.3 — 2026-08-21
- A failed request now says so in the dashboard. Previously the dashboard kept its previous (usually empty) state, so a refused or failed call looked identical to having no data.

### 2.2.2 — 2026-08-21
- Dashboard now sends the backoffice token with its API calls. On Umbraco 17 those calls were arriving unauthenticated and coming back 401, which the dashboard rendered as an empty state rather than an error.
- A failed request now raises a notification instead of leaving the dashboard looking like there is simply no data.

## License

MIT © [SplatDev](https://github.com/SplatDev-Ltda)