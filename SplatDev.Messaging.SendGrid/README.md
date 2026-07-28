# SplatDev.Messaging.SendGrid

SendGrid email provider for `SplatDev.Messaging` — sends emails via the SendGrid Web API using the official `SendGridClient`. Supports CC/BCC, HTML and plain-text bodies, and both single and bulk delivery with full async support.

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Messaging.SendGrid.svg)](https://www.nuget.org/packages/SplatDev.Messaging.SendGrid)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Compatibility

| .NET | Umbraco | Package Version |
|------|---------|-----------------|
| 8.0  | 13      | 1.0.0           |
| 10.0 | 17      | 1.0.0           |

## Installation

```sh
dotnet add package SplatDev.Messaging.SendGrid
```

## Configuration

### Constructor

```csharp
using SplatDev.Messaging.SendGrid.Controllers;

var sendGrid = new SendGridController(
    apiKey: "SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
```

- `apiKey` — Your SendGrid API key (starts with `SG.`)

### DI registration (recommended)

```csharp
builder.Services.AddSingleton<ISendGridController>(sp =>
{
    var apiKey = builder.Configuration["SendGrid:ApiKey"];
    return new SendGridController(apiKey!);
});
```

## Usage

The `SendGridController` implements `IMessagingController<SendGridMessage, Response>`, providing a consistent interface across all SplatDev messaging providers.

### Send a single email

```csharp
using SplatDev.Messaging.Interfaces;
using SplatDev.Messaging.SendGrid.Models;

var msg = new SendGridMessage
{
    From = new EmailAddress("no-reply@example.com", "SplatDev"),
    Subject = "Welcome!",
    HtmlContent = "<h1>Welcome aboard!</h1>",
    PlainTextContent = "Welcome aboard!",
};

msg.AddTo(new EmailAddress("customer@example.com", "Customer"));
msg.AddCc(new EmailAddress("admin@example.com", "Admin"));
msg.AddBcc(new EmailAddress("archive@example.com", "Archive"));

var response = await sendGrid.SendMessageAsync(msg);

if (response.IsSuccessStatusCode)
    Console.WriteLine($"Sent! Status: {response.StatusCode}");
else
{
    var body = await response.Body.ReadAsStringAsync();
    Console.WriteLine($"Failed ({response.StatusCode}): {body}");
}
```

### Bulk send

```csharp
var bulk = new SendGridMessage
{
    From = new EmailAddress("news@example.com", "Newsletter"),
    Subject = "Monthly Update",
    HtmlContent = "<p>Hello, %%name%%!</p>",
    PlainTextContent = "Hello, %%name%%!",
    MailSettings = new MailSettings { SandboxMode = new SandboxMode { Enable = false } }
};

// Add multiple tos for bulk delivery
bulk.AddTo(new EmailAddress("user1@example.com", "User One"));
bulk.AddTo(new EmailAddress("user2@example.com", "User Two"));
bulk.AddTo(new EmailAddress("user3@example.com", "User Three"));

var bulkResponse = await sendGrid.SendMessageAsync(bulk);
```

### Sync version

```csharp
var response = sendGrid.SendMessage(msg); // synchronous wrapper
```

## Features

- Full `IMessagingController<SendGridMessage, Response>` implementation
- Truly async via `SendMessageAsync` — awaits the SendGrid Web API
- Sync convenience wrappers
- CC and BCC recipient support
- HTML and plain-text body support
- Single and bulk email delivery
- Uses the official `SendGrid` SDK (`SendGridClient`)
- `Response` object exposes `StatusCode`, `Body`, and `IsSuccessStatusCode`

## Dependencies

| Package | Purpose |
|---------|---------|
| `SendGrid` (v9.29.3) | Official SendGrid API client |
| `SplatDev.Messaging` | Core messaging abstractions (`IMessagingController<T,U>`) |

## Target Frameworks

- `net8.0` — for Umbraco 13 applications
- `net10.0` — for Umbraco 17 applications

---

**SplatDev.Messaging.SendGrid** — part of the [SplatDev.Umbraco.Plugins](https://github.com/SplatDev-Ltda/SplatDev.Umbraco.Plugins) suite. Licensed under MIT. &copy; SplatDev Ltda.
