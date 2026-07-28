# Mailer

Umbraco email integration plugin — send templated HTML emails from Umbraco using SMTP (MailKit) or Microsoft Graph API. Supports Umbraco 13 (net8.0) and Umbraco 17 (net10.0).

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Plugins.Mailer.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.Mailer)

## Compatibility

| Umbraco | .NET | Package Version |
|---------|------|-----------------|
| 13.x    | 8.0  | 2.0.0           |
| 17.x    | 10.0 | 2.0.0           |

## Installation

```sh
dotnet add package SplatDev.Umbraco.Plugins.Mailer
```

## Quick Start

Register in `Program.cs`:

```csharp
builder.CreateUmbracoBuilder()
    .AddBackOffice()
    .AddWebsite()
    .AddMailer()   // <-- add this
    .Build();
```

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

## License

MIT © [SplatDev](https://github.com/splatdevtech)

---

[Feedback](mailto:feedback@splatdev.com)
