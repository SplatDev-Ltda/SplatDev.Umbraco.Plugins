# SplatDev.Umbraco.2FA

Two-factor authentication (2FA) utilities and extensions for Umbraco CMS.

## Package

**NuGet:** `SplatDev.Umbraco.2FA` (v2.0.0)

## Compatibility

| Umbraco Version | .NET | Status |
|----------------|------|--------|
| v13 | net8.0 | Supported |
| v17 | net10.0 | Supported |

## Installation

```bash
dotnet add package SplatDev.Umbraco.2FA
```

## Usage

This package provides extension methods and infrastructure for integrating two-factor authentication into Umbraco backoffice and member login flows.

```csharp
using SplatDev.Umbraco._2FA.Extensions;

// Register 2FA services
builder.Services.AddTwoFactorAuthentication();
```

## What's Included

- `TwoFactorAuthorizationExtensions` — Extension methods for configuring 2FA providers
- Multi-targeting for Umbraco 13 (net8.0) and Umbraco 17 (net10.0)

## Dependencies

- Umbraco.Cms.Core
- Umbraco.Cms.Web.Common

## Known Limitations

- This is a library package — no backoffice UI. 2FA configuration is done via code or appsettings.
- No `client/` folder or Bellissima dashboard (intentional — headless library).
