# MemberLogin

Custom member login plugin for Umbraco — login form with username/email authentication, password reset, remember-me support, account lockout detection, and approval workflow integration.


<!-- screenshot:start -->

![MemberLogin on the front end](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.MemberLogin/docs/screenshots/04-front-end.png)

<!-- screenshot:end -->

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Plugins.MemberLogin.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.MemberLogin)

## Compatibility

| Umbraco | .NET | Package Version |
|---------|------|-----------------|
| 13.x    | 8.0  | 2.2.2           |
| 17.x    | 10.0 | 2.2.2           |

## Installation

```sh
dotnet add package SplatDev.Umbraco.Plugins.MemberLogin
```

## Quick Start

The plugin auto-registers via Umbraco's composition system (`MemberLoginComposer`). No explicit `Program.cs` registration required.

## Features

- Login form with username/email and password
- Remember-me support via persistent cookies
- Forgot password with token-based email reset
- Account lockout detection and user feedback (HTTP 423)
- Approval workflow support — unapproved members see a clear status message

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/umbraco/api/memberlogin/Login` | Authenticate a member (returns 200, 401, or 423) |
| POST | `/umbraco/api/memberlogin/Logout` | Sign out the current member |
| POST | `/umbraco/api/memberlogin/ForgotPassword` | Request a password reset link |
| POST | `/umbraco/api/memberlogin/ResetPassword` | Reset password with token |

## View Component

```cshtml
@await Component.InvokeAsync("MemberLogin", new { returnUrl = "/members" })
```

The view component renders the login form and sets `ViewBag` properties for status messages (error, locked, unapproved). Implement the actual login UI in the corresponding partial view.

## Known Limitations

- Uses Umbraco's built-in membership directly — no support for external identity providers
- The `ForgotPassword` endpoint uses an email-obscured response pattern (always returns success) to prevent enumeration
- View component only sets `ViewBag` properties; does not perform authentication server-side (delegates to API)

## Changelog

### 2.2.2 — 2026-08-24

Removes a dashboard screenshot that showed an error toast. It was captured against a site where this plugin's API was unreachable, so it advertised a broken dashboard. No screenshot is better than a misleading one; a replacement will be taken against a working install.

### 2.2.1 — 2026-08-24

Package metadata only: the listing now carries an icon and search tags, and the project and repository links point at the organisation that actually hosts this code. No code changes.

### 2.2.0 — 2026-08-23

The Razor view behind `@await Component.InvokeAsync(...)` is now compiled into the package. It was previously carried as a loose file that nothing packed, so the component threw "view not found" on every install and the front-end usage shown in this README could not have worked.

### 2.1.5 — 2026-08-21
- Dashboard now sends the backoffice token with its API calls. On Umbraco 17 those calls were arriving unauthenticated and coming back 401, which the dashboard rendered as an empty state rather than an error.
- A failed request now raises a notification instead of leaving the dashboard looking like there is simply no data.

## License

MIT © [SplatDev](https://github.com/SplatDev-Ltda)