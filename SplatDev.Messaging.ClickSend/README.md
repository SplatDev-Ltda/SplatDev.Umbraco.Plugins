# SplatDev.Messaging.ClickSend

ClickSend (Sinch) SMS provider for the SplatDev.Messaging framework. Sends SMS via ClickSend REST API v3.

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Messaging.ClickSend.svg)](https://www.nuget.org/packages/SplatDev.Messaging.ClickSend)

## Compatibility

| .NET | Package Version |
|------|-----------------|
| 8.0  | 1.0.0           |
| 10.0 | 1.0.0           |

## Installation

```sh
dotnet add package SplatDev.Messaging.ClickSend
```

## Configuration

Add to `appsettings.json`:

```json
{
  "ClickSend": {
    "Username": "your-username",
    "ApiKey": "your-api-key",
    "From": "+1234567890"
  }
}
```

| Key | Required | Description |
|-----|----------|-------------|
| `Username` | Yes | ClickSend account username |
| `ApiKey` | Yes | ClickSend API key |
| `From` | Yes | Sender phone number (E.164 format) |

## Registration

```csharp
builder.Services.AddClickSend(options =>
{
    options.Username = builder.Configuration["ClickSend:Username"] ?? "";
    options.ApiKey = builder.Configuration["ClickSend:ApiKey"] ?? "";
    options.From = builder.Configuration["ClickSend:From"] ?? "";
});
```

## Usage

```csharp
public class MyService
{
    private readonly ISmsService _smsService;

    public MyService(ISmsService smsService)
    {
        _smsService = smsService;
    }

    public async Task SendWelcomeSms(string phone)
    {
        var result = await _smsService.SendAsync(phone, "Welcome to our service!");
        if (result.Success)
            Console.WriteLine($"SMS sent: {result.MessageId}");
    }
}
```

## API

Implements `ISmsService`:

| Method | Description |
|--------|-------------|
| `SendAsync(to, body)` | Send SMS using configured `From` number |
| `SendAsync(to, body, from)` | Send SMS with explicit sender override |

Returns `SmsSendResult` with `Success`, `MessageId`, `Error`, `StatusCode`, `RawResponse`.

## Dependencies

| Package | Purpose |
|---------|---------|
| `SplatDev.Messaging` | `ISmsService` interface + `SmsSendResult` |
| `Microsoft.AspNetCore.App` | Framework reference for `IHttpClientFactory` |

---

**SplatDev.Messaging.ClickSend** — part of the [SplatDev.Umbraco.Plugins](https://github.com/SplatDev-Ltda/SplatDev.Umbraco.Plugins) suite. Licensed under MIT. © SplatDev Ltda.
