# SplatDev.Messaging.Mailgun

<!-- screenshot:start -->
<!-- screenshot:end -->

Mailgun email provider for `SplatDev.Messaging` — sends emails via the Mailgun REST API using `HttpClient`. No third-party Mailgun SDK required.

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Messaging.Mailgun.svg)](https://www.nuget.org/packages/SplatDev.Messaging.Mailgun)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Compatibility

| .NET | Umbraco | Package Version |
|------|---------|-----------------|
| 8.0  | 13      | 1.0.2           |
| 10.0 | 17      | 1.0.2           |

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

## Changelog

### 1.0.2 — 2026-08-24

Removes a dashboard screenshot that showed an error toast. It was captured against a site where this plugin's API was unreachable, so it advertised a broken dashboard. No screenshot is better than a misleading one; a replacement will be taken against a working install.

### 1.0.1 — 2026-08-24

Package metadata only: the listing now carries an icon and search tags, and the project and repository links point at the organisation that actually hosts this code. No code changes.

### 1.0.0 — 2026-08-24

This package now keeps a changelog. Earlier releases predate it and are not reconstructed here — consult the repository history for those. From this version on, every release records what changed for someone using it.

