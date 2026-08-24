# SplatDev.Umbraco.Membership

<!-- screenshot:start -->
<!-- screenshot:end -->

Membership utilities for Umbraco 13 and Umbraco 17 — assign members to groups and manage opt-in preferences via `IMemberService`.

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Membership.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Membership)

## Compatibility

| .NET | Umbraco | Package Version |
|------|---------|-----------------|
| 8.0  | 13      | 2.0.0           |
| 10.0 | 17      | 2.0.0           |

## Installation

```sh
dotnet add package SplatDev.Umbraco.Membership
```

## What's implemented

### RegisterExtensions

A single service class that wraps `IMemberService` to provide two helper methods:

- **`AssignMemberGroup(string email, string group)`** — assigns a member (looked up by email) to a group/role. Uses `IMemberService.AssignRole()`. Silently logs errors if the assignment fails.
- **`QuoteInABoxOptIn(string email)`** — looks up a member by email and sets the custom property `quoteInABox` to `true`. Saves the member via `IMemberService.Save()`.

## Configuration

### DI registration

This package does **not** auto-register via `IComposer`. Register `RegisterExtensions` manually in your Umbraco composer or startup:

```csharp
using SplatDev.Umbraco.Membership.Extensions;

public class MembershipComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.Services.AddScoped<RegisterExtensions>();
    }
}
```

`RegisterExtensions` depends on `IMemberService` (provided by Umbraco) and `ILogger<RegisterExtensions>` (provided by the framework). Both are satisfied automatically via DI when you register the class.

### Appsettings

No appsettings keys are required. The package does not read any configuration.

## Usage

```csharp
using SplatDev.Umbraco.Membership.Extensions;

public class RegistrationService
{
    private readonly RegisterExtensions _memberExtensions;

    public RegistrationService(RegisterExtensions memberExtensions)
    {
        _memberExtensions = memberExtensions;
    }

    public async Task OnMemberRegistered(string email)
    {
        // Assign to a role
        _memberExtensions.AssignMemberGroup(email, "Members");

        // Opt-in to content feature
        _memberExtensions.QuoteInABoxOptIn(email);
    }
}
```

## Dependencies

| Package | Purpose |
|---------|---------|
| `Umbraco.Cms.Core` | `IMemberService` |
| `Microsoft.Extensions.Logging` | Error logging |

## Caveats

- **No automatic DI registration.** You must register `RegisterExtensions` in your own composer. There is no `AddMembership()` extension method.
- **`QuoteInABoxOptIn`** sets a hardcoded property name (`"quoteInABox"`) and a hardcoded value (`true`). If your member type uses a different alias or type, you will need to customize this method.
- **Silent failures.** Both methods catch `Exception` and only log the error — they do not re-throw. Assumption is that membership setup failures should not block the calling flow.

---

**SplatDev.Umbraco.Membership** — part of the [SplatDev.Umbraco.Plugins](https://github.com/SplatDev-Ltda/SplatDev.Umbraco.Plugins) suite. Licensed under MIT. &copy; SplatDev Ltda.

## Changelog

### 2.0.5 — 2026-08-24

Removes a dashboard screenshot that showed an error toast. It was captured against a site where this plugin's API was unreachable, so it advertised a broken dashboard. No screenshot is better than a misleading one; a replacement will be taken against a working install.

### 2.0.4 — 2026-08-24

Package metadata only: the listing now carries an icon and search tags, and the project and repository links point at the organisation that actually hosts this code. No code changes.

### 2.0.2 — 2026-08-22
- This package's README now reaches NuGet. The publish workflow discovered packages by a list of name patterns, and this one matched none of them, so it was never built or pushed by CI — the version on NuGet was placed there by hand before the README was wired up, and no release could refresh it. Discovery is now by prefix, so the package ships whenever the repo is tagged.

