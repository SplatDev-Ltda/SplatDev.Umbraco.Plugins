# SplatDev.Messaging.SMSTools

<!-- screenshot:start -->
<!-- screenshot:end -->

SMSTools SMS provider for the `SplatDev.Messaging` framework. Sends SMS messages via the SMSTools REST API using `RestSharp`.

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Messaging.SMSTools.svg)](https://www.nuget.org/packages/SplatDev.Messaging.SMSTools)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Compatibility

| .NET | Umbraco | Package Version |
|------|---------|-----------------|
| 8.0  | 13      | 1.0.0           |
| 10.0 | 17      | 1.0.0           |

## Installation

```sh
dotnet add package SplatDev.Messaging.SMSTools
```

## Configuration

Add to `appsettings.json`:

```json
{
  "SMSTools": {
    "ApiKey": "your-sms-tools-api-key",
    "ApiUrl": "https://api.smstools.com/v1",
    "From": "+1234567890"
  }
}
```

| Key | Required | Description |
|-----|----------|-------------|
| `ApiKey` | Yes | SMSTools API key |
| `ApiUrl` | Yes | SMSTools API base URL |
| `From` | Yes | Sender phone number (E.164 format) |

## Usage

```csharp
using SplatDev.Messaging.Interfaces;
using SplatDev.Messaging.SMSTools;

var smsService = new SMSToolsController(apiKey, apiUrl);

var result = await smsService.SendMessageAsync(new Sms
{
    From = "+1234567890",
    To = "+5511999999999",
    Body = "Your verification code is 123456"
});

if (result.Success)
    Console.WriteLine($"SMS sent. SID: {result.MessageId}");
```

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

### 1.0.2 — 2026-08-24

Removes a dashboard screenshot that showed an error toast. It was captured against a site where this plugin's API was unreachable, so it advertised a broken dashboard. No screenshot is better than a misleading one; a replacement will be taken against a working install.

### 1.0.1 — 2026-08-24

Package metadata only: the listing now carries an icon and search tags, and the project and repository links point at the organisation that actually hosts this code. No code changes.

### 1.0.0 — 2026-08-24

This package now keeps a changelog. Earlier releases predate it and are not reconstructed here — consult the repository history for those. From this version on, every release records what changed for someone using it.

