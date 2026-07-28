# SplatDev.Messaging.Mailgun

Mailgun email provider for `SplatDev.Messaging` — sends emails via the Mailgun REST API using `HttpClient`. No third-party Mailgun SDK required.

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Messaging.Mailgun.svg)](https://www.nuget.org/packages/SplatDev.Messaging.Mailgun)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Compatibility

| .NET | Umbraco | Package Version |
|------|---------|-----------------|
| 8.0  | 13      | 1.0.0           |
| 10.0 | 17      | 1.0.0           |

## Installation

```sh
dotnet add package SplatDev.Messaging.Mailgun
```

## Configuration

### Constructor

```csharp
using SplatDev.Messaging.Mailgun.Controllers;

var mailgun = new MailgunController(
    apiKey: "key-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    domain: "mg.yourdomain.com");
```

- `apiKey` — Your Mailgun API key (starts with `key-`)
- `domain` — Your Mailgun sending domain (e.g. `mg.example.com`)

### DI registration (recommended)

```csharp
builder.Services.AddSingleton<IMailgunController>(sp =>
{
    var apiKey = builder.Configuration["Mailgun:ApiKey"];
    var domain = builder.Configuration["Mailgun:Domain"];
    return new MailgunController(apiKey!, domain!);
});
```

## Usage

```csharp
using SplatDev.Messaging.Interfaces;

// Send with string parameters
var result = mailgun.SendMessage(
    subject: "Welcome!",
    from: "SplatDev",
    fromAddress: "no-reply@mg.example.com",
    to: "New Customer",
    toAddress: "customer@example.com",
    message: "<h1>Welcome aboard!</h1>",
    plainMessage: "Welcome aboard!");

// Send with a MailgunMessage object
var msg = new MailgunMessage
{
    From = "SplatDev <no-reply@mg.example.com>",
    To = "customer@example.com",
    Subject = "Your invoice",
    Html = "<h1>Invoice attached</h1>",
    Text = "Invoice attached",
    Cc = "admin@example.com",
};

var result = await mailgun.SendMessageAsync(msg);

if (result.Success)
    Console.WriteLine($"Sent! Message ID: {result.MessageId}");
else
    Console.WriteLine($"Failed ({result.StatusCode}): {result.Message}");
```

## Features

- Full `IMessagingController<MailgunMessage, MailgunResult>` implementation
- Truly async — `SendMessageAsync` awaits the Mailgun HTTP API
- Sync wrappers via `.GetAwaiter().GetResult()`
- CC and BCC support
- HTML and plain-text body support
- Zero third-party Mailgun SDK dependency — uses `HttpClient` directly
- API key sent via HTTP Basic auth (`api:key-...`)

## API Endpoint

Messages are posted to:

```
POST https://api.mailgun.net/v3/{domain}/messages
```

With Basic authentication (`Authorization: Basic base64(api:<key>)`) and form-urlencoded body.

## Dependencies

| Package | Purpose |
|---------|---------|
| `SplatDev.Messaging` | Core messaging abstractions (`IMessagingController<T,U>`) |

No other NuGet dependencies — the `mailgun_csharp` SDK was replaced with direct `HttpClient` usage.

---

**SplatDev.Messaging.Mailgun** — part of the [SplatDev.Umbraco.Plugins](https://github.com/SplatDev-Ltda/SplatDev.Umbraco.Plugins) suite. Licensed under MIT. &copy; SplatDev Ltda.
