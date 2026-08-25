# SplatDev.Messaging.Twilio

<!-- screenshot:start -->
<!-- screenshot:end -->

Twilio SMS provider for `SplatDev.Messaging` — sends SMS messages via the Twilio Programmable SMS API using the official `Twilio` SDK.

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Messaging.Twilio.svg)](https://www.nuget.org/packages/SplatDev.Messaging.Twilio)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Compatibility

| .NET | Umbraco | Package Version |
|------|---------|-----------------|
| 8.0  | 13      | 1.0.2           |
| 10.0 | 17      | 1.0.2           |

## Installation

```sh
dotnet add package SplatDev.Messaging.Twilio
```

## Configuration

### Constructor

```csharp
using SplatDev.Messaging.Twilio.Controllers;

var twilio = new TwilioSmsController(
    accountSid: "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    authToken: "your-auth-token");
```

- `accountSid` — Your Twilio Account SID (starts with `AC`)
- `authToken` — Your Twilio Auth Token

### DI registration (recommended)

```csharp
builder.Services.AddSingleton<TwilioSmsController>(sp =>
{
    var accountSid = builder.Configuration["Twilio:AccountSid"];
    var authToken = builder.Configuration["Twilio:AuthToken"];
    return new TwilioSmsController(accountSid!, authToken!);
});
```

### appsettings.json

```json
{
  "Twilio": {
    "AccountSid": "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "AuthToken": "your-auth-token"
  }
}
```

## Usage

```csharp
using SplatDev.Messaging.Twilio.Controllers;
using SplatDev.Messaging.Twilio.Models;

// Send via Sms model
var sms = new Sms
{
    From = new Twilio.Types.PhoneNumber("+1234567890"),
    To = new Twilio.Types.PhoneNumber("+5511999999999"),
    Body = "Your verification code is 123456"
};

var result = twilio.SendMessage(sms);
Console.WriteLine($"SID: {result.Sid}, Status: {result.Status}");

// Send via string parameters (simpler API)
var resultAsync = await twilio.SendMessageAsync(
    subject: "",                          // Not used for SMS
    from: "",
    fromAddress: "+1234567890",
    to: "",
    toAddress: "+5511999999999",
    message: "",                          // Not used for SMS
    plainMessage: "Your order #1234 has shipped!");
```

## Features

- Implements `IMessagingController<Sms, MessageResource>` from `SplatDev.Messaging`
- True async via `MessageResource.CreateAsync`
- Sync wrapper via `MessageResource.Create`
- Uses official `Twilio` SDK v7.x (not REST directly)
- E.164 phone number format required for `fromAddress` and `toAddress`
- The string-parameter API overload maps `plainMessage` to the SMS body (`subject`, `from`, `to`, `message` are ignored for SMS context)

## Dependencies

| Package | Purpose |
|---------|---------|
| `SplatDev.Messaging` | Core messaging abstractions (`IMessagingController<T,U>`) |
| `Twilio` 7.4.1 | Official Twilio SDK for Programmable SMS |

No additional HTTP client library required — the Twilio SDK handles transport.

---

**SplatDev.Messaging.Twilio** — part of the [SplatDev.Umbraco.Plugins](https://github.com/SplatDev-Ltda/SplatDev.Umbraco.Plugins) suite. Licensed under MIT. &copy; SplatDev Ltda.

## Changelog

### 1.0.2 — 2026-08-24

Removes a dashboard screenshot that showed an error toast. It was captured against a site where this plugin's API was unreachable, so it advertised a broken dashboard. No screenshot is better than a misleading one; a replacement will be taken against a working install.

### 1.0.1 — 2026-08-24

Package metadata only: the listing now carries an icon and search tags, and the project and repository links point at the organisation that actually hosts this code. No code changes.

### 1.0.0 — 2026-08-24

This package now keeps a changelog. Earlier releases predate it and are not reconstructed here — consult the repository history for those. From this version on, every release records what changed for someone using it.

