# SplatDev.Messaging.SMSTools

<!-- screenshot:start -->
<!-- screenshot:end -->

SMSTools SMS provider for the `SplatDev.Messaging` framework. Sends SMS messages via the SMSTools REST API using `RestSharp`.

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Messaging.SMSTools.svg)](https://www.nuget.org/packages/SplatDev.Messaging.SMSTools)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Compatibility

| .NET | Umbraco | Package Version |
|------|---------|-----------------|
| 8.0  | 13      | 1.1.0           |
| 10.0 | 17      | 1.1.0           |

## Installation

```sh
dotnet add package SplatDev.Messaging.SMSTools
```

## Configuration

Bind `SmsToolsOptions` from configuration and register the controller:

```csharp
builder.Services.AddSplatDevSmsTools(builder.Configuration);
```

It reads `SplatDev:Messaging:SMSTools` by default; pass a section name to override.

```json
{
  "SplatDev": {
    "Messaging": {
      "SMSTools": {
        "ApiKey": "your-sms-tools-api-key",
        "BaseUrl": "https://api.smstools24.com",
        "DefaultFrom": "+1234567890"
      }
    }
  }
}
```

| Key | Required | Description |
|-----|----------|-------------|
| `ApiKey` | Yes | SMSTools API key |
| `BaseUrl` | No | API base URL. Defaults to `https://api.smstools24.com` |
| `DefaultFrom` | No | Sender used when a message does not set `From` |

## Usage

`SmsToolsController` implements `ISmsMessagingController<Sms, SmsToolsResult>` from
`SplatDev.Messaging`, so the calling code does not depend on this provider:

```csharp
using SplatDev.Messaging.Models;
using SplatDev.Messaging.SMSTools.Controllers;
using SplatDev.Messaging.SMSTools.Models;

public class Notifier(SmsToolsController sms)
{
    public async Task SendCode(string to, string code)
    {
        SmsToolsResult result = await sms.SendMessageAsync(new Sms
        {
            From = "+1234567890",
            To = to,
            Body = $"Your verification code is {code}",
        });

        if (result.Success)
            Console.WriteLine($"SMS sent. Id: {result.MessageId}");
        else
            Console.WriteLine($"Failed: {result.Status} {result.Message}");
    }
}
```

There is a `SendMessage` overload pair taking `(from, to, body)` directly, and a
synchronous `SendMessage` for each — the synchronous ones block on the async call, so
prefer the async form.

## Features

- Implements `IMessagingController<Sms, SmsResult>` from `SplatDev.Messaging`
- Async SMS delivery via `RestSharp`
- Sync and async send methods
- Status code and error reporting in result

## Dependencies

| Package | Purpose |
|---------|---------|
| `SplatDev.Messaging` | Core messaging abstractions (`IMessagingController<T,U>`, `ISmsService`) |
| `RestSharp` 112.1.0 | HTTP client for SMSTools REST API |

No additional SMS SDK required — uses SMSTools REST API directly.

## Limitations

- Currently a scaffold/placeholder provider. The `SMSToolsController` implementation is pending.
- No DI extension methods yet — register manually in `Program.cs`.
- Single-message only; bulk SMS not yet implemented.

---

**SplatDev.Messaging.SMSTools** — part of the [SplatDev.Umbraco.Plugins](https://github.com/SplatDev-Ltda/SplatDev.Umbraco.Plugins) suite. Licensed under MIT. &copy; SplatDev Ltda.

## Changelog

### 1.1.0 — 2026-08-25

This package has shipped since 1.0.0 with a csproj, a README, an icon and no code at all — every release was an empty assembly. It now contains the SMSTools client it always claimed to: `SmsToolsController`, implementing `ISmsMessagingController<Sms, SmsToolsResult>` from SplatDev.Messaging, with `SmsToolsOptions` bound from `SplatDev:Messaging:SMSTools` and an `AddSplatDevSmsTools(configuration)` registration. The README documented a constructor and class name that did not exist; every example in it is now compiled against the real API.

### 1.0.2 — 2026-08-24

Removes a dashboard screenshot that showed an error toast. It was captured against a site where this plugin's API was unreachable, so it advertised a broken dashboard. No screenshot is better than a misleading one; a replacement will be taken against a working install.

### 1.0.1 — 2026-08-24

Package metadata only: the listing now carries an icon and search tags, and the project and repository links point at the organisation that actually hosts this code. No code changes.

### 1.0.0 — 2026-08-24

This package now keeps a changelog. Earlier releases predate it and are not reconstructed here — consult the repository history for those. From this version on, every release records what changed for someone using it.

