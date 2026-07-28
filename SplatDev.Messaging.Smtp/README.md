# SplatDev.Messaging.Smtp

SMTP email provider for `SplatDev.Messaging` — sends emails via `System.Net.Mail.SmtpClient` over SMTP. Supports authentication, TLS, custom ports, and event-driven error handling with the `MailerSent` event and `SendException` type.

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Messaging.Smtp.svg)](https://www.nuget.org/packages/SplatDev.Messaging.Smtp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Compatibility

| .NET | Umbraco | Package Version |
|------|---------|-----------------|
| 8.0  | 13      | 1.0.0           |
| 10.0 | 17      | 1.0.0           |

## Installation

```sh
dotnet add package SplatDev.Messaging.Smtp
```

## Configuration

### Constructor

```csharp
using SplatDev.Messaging.Smtp.Controllers;

var smtp = new SmtpController(
    host: "smtp.example.com",
    port: 587,
    username: "user@example.com",
    password: "your-password",
    useSsl: true);
```

- `host` — SMTP server hostname
- `port` — SMTP server port (typically 25, 465, or 587)
- `username` — SMTP authentication username
- `password` — SMTP authentication password
- `useSsl` — Enable SSL/TLS

### DI registration (recommended)

```csharp
builder.Services.AddSingleton<ISmtpController>(sp =>
{
    var config = builder.Configuration.GetSection("Smtp");
    return new SmtpController(
        config["Host"]!,
        int.Parse(config["Port"]!),
        config["Username"]!,
        config["Password"]!,
        bool.Parse(config["UseSsl"]!));
});
```

## Usage

The `SmtpController` implements `IMessagingController<MailMessage, SmtpResult>`, wrapping `System.Net.Mail.SmtpClient` for SMTP delivery.

### Send an email

```csharp
using System.Net.Mail;
using SplatDev.Messaging.Interfaces;

var mail = new MailMessage
{
    From = new MailAddress("no-reply@example.com", "SplatDev"),
    Subject = "Welcome!",
    Body = "<h1>Welcome aboard!</h1>",
    IsBodyHtml = true,
};

mail.To.Add(new MailAddress("customer@example.com", "Customer"));
mail.CC.Add(new MailAddress("admin@example.com"));
mail.Bcc.Add(new MailAddress("archive@example.com"));

var result = await smtp.SendMessageAsync(mail);

if (result.Success)
    Console.WriteLine("Email sent successfully");
else
    Console.WriteLine($"Failed: {result.ErrorMessage}");
```

### Handling the MailerSent event

```csharp
smtp.MailerSent += (sender, args) =>
{
    Console.WriteLine($"Email sent to {args.To} at {args.SentAt}");
};
```

### Error handling with SendException

```csharp
try
{
    smtp.SendMessage(mail);
}
catch (SendException ex)
{
    Console.WriteLine($"SMTP error: {ex.Message}");
    Console.WriteLine($"Failed recipients: {string.Join(", ", ex.FailedRecipients)}");
}
```

### Sync version

```csharp
var result = smtp.SendMessage(mail); // synchronous wrapper
```

## Features

- Full `IMessagingController<MailMessage, SmtpResult>` implementation
- Event-driven notification via `MailerSent` event (fires after each successful send)
- Custom `SendException` for structured error reporting including failed recipients
- SSL/TLS support via `useSsl` constructor parameter
- HTML and plain-text body support via `MailMessage.IsBodyHtml`
- Uses `System.Net.Mail.SmtpClient` — no third-party SMTP library needed
- Async via `SendMessageAsync` with sync convenience wrappers

## Dependencies

| Package | Purpose |
|---------|---------|
| `Microsoft.AspNetCore.App` | Framework reference providing `System.Net.Mail` |
| `SplatDev.Messaging` | Core messaging abstractions (`IMessagingController<T,U>`) |

## Target Frameworks

- `net8.0` — for Umbraco 13 applications
- `net10.0` — for Umbraco 17 applications

---

**SplatDev.Messaging.Smtp** — part of the [SplatDev.Umbraco.Plugins](https://github.com/SplatDev-Ltda/SplatDev.Umbraco.Plugins) suite. Licensed under MIT. &copy; SplatDev Ltda.
