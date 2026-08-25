# SplatDev.Umbraco.Plugins.CustomLogin

Fully customizable Umbraco login page with branding support, SSO integration hooks, and 2FA readiness.


<!-- screenshot:start -->

![CustomLogin on the front end](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.CustomLogin/docs/screenshots/04-front-end.png)

<!-- screenshot:end -->

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Plugins.CustomLogin.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.CustomLogin)

## Compatibility

| Umbraco | .NET | Package Version |
|---------|------|-----------------|
| 13.x    | 8.0  | 2.3.2           |
| 17.x    | 10.0 | 2.3.2           |

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

### 2.3.2 — 2026-08-24

Removes a dashboard screenshot that showed an error toast. It was captured against a site where this plugin's API was unreachable, so it advertised a broken dashboard. No screenshot is better than a misleading one; a replacement will be taken against a working install.

### 2.3.1 — 2026-08-24

Package metadata only: the listing now carries an icon and search tags, and the project and repository links point at the organisation that actually hosts this code. No code changes.

### 2.3.0 — 2026-08-23

The sign-in component no longer emits a whole HTML document. It rendered a doctype, a root element, a head and a body, along with a universal margin/padding reset and a flex layout applied to the body element — so dropping it onto one of your pages flattened every margin on that page and relaid the whole thing out. Its styles are now scoped to the component's own class names, which were renamed to the `splatdev-login__*` prefix; if you had overridden the old `.login-card`, `.login-field`, `.login-btn` or `.login-support` classes, update those selectors.

The Razor view behind `@await Component.InvokeAsync(...)` is now compiled into the package. It was previously carried as a loose file that nothing packed, so the component threw "view not found" on every install and the front-end usage shown in this README could not have worked.

The view also still referenced the package's pre-rename namespace, so it would not have compiled even had it shipped. That is fixed, and the view is now built with the project — a broken view fails the build instead of failing a visitor's request.

### 2.2.4 — 2026-08-22
- You pick the logo from the media library instead of typing a URL. What gets stored is the file's site-relative path, so the login screen keeps working when the site moves domain.

### 2.2.3 — 2026-08-21
- A failed request now says so in the dashboard. Previously the dashboard kept its previous (usually empty) state, so a refused or failed call looked identical to having no data.

### 2.2.2 — 2026-08-21
- Dashboard now sends the backoffice token with its API calls. On Umbraco 17 those calls were arriving unauthenticated and coming back 401, which the dashboard rendered as an empty state rather than an error.
- A failed request now raises a notification instead of leaving the dashboard looking like there is simply no data.

## License

MIT © [SplatDev](https://github.com/SplatDev-Ltda)