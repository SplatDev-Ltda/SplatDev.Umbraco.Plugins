# SplatDev.Umbraco.Membership

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
