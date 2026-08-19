# UmbracoCms.Plugins.PasswordSettings

Password policy enforcement plugin for Umbraco 13 (net8.0) and Umbraco 17 (net10.0).


<!-- screenshot:start -->

![PasswordSettings dashboard](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.PasswordSettings/docs/screenshots/01-dashboard.png)

<!-- screenshot:end -->

## Features

- Configurable password complexity rules (length, uppercase, digit, special character)
- Password expiration enforcement
- Password history tracking (prevents reuse of recent passwords)
- Strength meter / validation API
- Backoffice dashboard for managing policy settings

## EF Core Schema

Schema: `passwordsettings`

Tables:
- `PasswordHistories` — tracks password hashes per member
- `PasswordPolicies` — stores the active password policy

## API Endpoints

- `GET /umbraco/api/passwordsettings/GetPolicy`
- `POST /umbraco/api/passwordsettings/SavePolicy`
- `POST /umbraco/api/passwordsettings/ValidatePassword`
- `POST /umbraco/api/passwordsettings/RecordPasswordChange`
- `GET /umbraco/api/passwordsettings/IsPasswordReused`

## Configuration

Add a connection string named `umbracoDbDSN` in your `appsettings.json`.

Run EF Core migrations:

```bash
dotnet ef migrations add InitialCreate --project UmbracoCms.Plugins.PasswordSettings
dotnet ef database update --project UmbracoCms.Plugins.PasswordSettings
```