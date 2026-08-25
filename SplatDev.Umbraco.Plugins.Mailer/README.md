# Mailer

Umbraco email integration plugin — send templated HTML emails from Umbraco using SMTP (MailKit) or Microsoft Graph API. Supports Umbraco 13 (net8.0) and Umbraco 17 (net10.0).


<!-- screenshot:start -->
<!-- screenshot:end -->

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Plugins.Mailer.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.Mailer)

## Compatibility

| Umbraco | .NET | Package Version |
|---------|------|-----------------|
| 13.x    | 8.0  | 2.1.10          |
| 17.x    | 10.0 | 2.1.10          |

## Installation

```sh
dotnet add package SplatDev.Umbraco.Plugins.Mailer
```

## Quick Start

No registration call is needed. The package ships Umbraco composers, so the `AddComposers()` already in the default `Program.cs` picks the plugin up as soon as the package is referenced.

## Configuration

The plugin reads SMTP settings from Umbraco's standard `GlobalSettings:Smtp` block in `appsettings.json`:

```json
{
  "Umbraco": {
    "CMS": {
      "Global": {
        "Smtp": {
          "Host": "smtp.example.com",
          "Port": 587,
          "Username": "noreply@example.com",
          "Password": "<your-password>",
          "SecureSocketOptions": "StartTls"
        }
      }
    }
  }
}
```

## Usage

### Sending Template-Based Email

Inject `IEmailService<T>` and call `SendEmailAsync` with a view-model:

```csharp
using SplatDev.Umbraco.Plugins.Mailer.Models;
using SplatDev.Umbraco.Plugins.Mailer.Services;

public class OrderConfirmationHandler(IEmailService<OrderModel> emailService)
{
    public async Task SendAsync()
    {
        var model = new EmailModel<OrderModel>
        {
            Subject = "Your order has shipped",
            View = "~/Views/Mail/OrderConfirmation.cshtml",
            From = new MailboxAddress("Shop", "noreply@example.com"),
            To = new MailboxAddress("Customer", "customer@example.com"),
            Model = new OrderModel { OrderId = "12345" }
        };

        await emailService.SendEmailAsync(model);
    }
}
```

### Testing Email Configuration

The `MailerApiController` exposes a test endpoint at `/umbraco/backoffice/api/Mailer/SendTestAsync?email=test@example.com` — sends a confirmation HTML email to verify SMTP is wired correctly.

## Architecture

| Component | Role |
|-----------|------|
| `EmailService<T>` | Generates HTML from Razor views via `ViewRenderService` and delivers via MailKit SMTP |
| `MicrosoftGraphMailerService` | Sends email through Microsoft Graph API (Exchange Online) |
| `EmailModel<T>` | Generic container: subject, body, from/to addresses, Razor view path, domain URL |
| `MailerComposer` | Registers both services in DI |

## Dependencies

- MailKit (SMTP delivery)
- Microsoft Graph SDK (Exchange Online delivery)
- Umbraco `GlobalSettings:Smtp` configuration

## Changelog

### 2.1.10 — 2026-08-25

Documentation only, no code change. The README's Quick Start told you to call a registration method that does not exist in this package — following it produced a compile error on the first build. There is nothing to register: the package ships Umbraco composers and the `AddComposers()` already in the default `Program.cs` finds it. The Compatibility table also now shows the version actually being shipped instead of the one it was written at.

### 2.1.9 — 2026-08-24

Removes a dashboard screenshot that showed an error toast. It was captured against a site where this plugin's API was unreachable, so it advertised a broken dashboard. No screenshot is better than a misleading one; a replacement will be taken against a working install.

### 2.1.8 — 2026-08-24

Package metadata only: the listing now carries an icon and search tags, and the project and repository links point at the organisation that actually hosts this code. No code changes.

### 2.1.7 — 2026-08-21
- A failed request now says so in the dashboard. Previously the dashboard kept its previous (usually empty) state, so a refused or failed call looked identical to having no data.

### 2.1.6 — 2026-08-21
- Dashboard now sends the backoffice token with its API calls. On Umbraco 17 those calls were arriving unauthenticated and coming back 401, which the dashboard rendered as an empty state rather than an error.
- A failed request now raises a notification instead of leaving the dashboard looking like there is simply no data.

## License

MIT © [SplatDev](https://github.com/splatdevtech)

---

[Feedback](mailto:feedback@splatdev.com)