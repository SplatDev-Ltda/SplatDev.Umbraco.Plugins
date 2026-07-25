# SplatDev.Messaging.SocketLabs

SocketLabs email provider for `SplatDev.Messaging` — sends transactional and bulk emails via the SocketLabs Injection API using the `SocketLabs.EmailDelivery` SDK.

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Messaging.SocketLabs.svg)](https://www.nuget.org/packages/SplatDev.Messaging.SocketLabs)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Compatibility

| .NET | Umbraco | Package Version |
|------|---------|-----------------|
| 8.0  | 13      | 1.0.0           |
| 10.0 | 17      | 1.0.0           |

## Installation

```sh
dotnet add package SplatDev.Messaging.SocketLabs
```

## Configuration

### Constructor

```csharp
using SplatDev.Messaging.SocketLabs.Controllers;

var socketLabs = new SocketLabsController(
    serverId: 12345,
    injectionApiKey: "your-socketlabs-injection-api-key");
```

- `serverId` — Your SocketLabs server ID (integer)
- `injectionApiKey` — Your SocketLabs Injection API key

### DI registration (recommended)

```csharp
builder.Services.AddSingleton<SocketLabsController>(sp =>
{
    var serverId = int.Parse(builder.Configuration["SocketLabs:ServerId"]!);
    var apiKey = builder.Configuration["SocketLabs:InjectionApiKey"];
    return new SocketLabsController(serverId, apiKey!);
});
```

### appsettings.json

```json
{
  "SocketLabs": {
    "ServerId": "12345",
    "InjectionApiKey": "your-injection-api-key"
  }
}
```

## Usage

### Single message

```csharp
using SplatDev.Messaging.Interfaces;

var result = socketLabs.SendMessage(
    subject: "Welcome!",
    from: "SplatDev",
    fromAddress: "no-reply@example.com",
    to: "Customer",
    toAddress: "customer@example.com",
    message: "<h1>Welcome aboard!</h1>",
    plainMessage: "Welcome aboard!");

// Async
var resultAsync = await socketLabs.SendMessageAsync(
    subject: "Invoice",
    from: "Billing",
    fromAddress: "billing@example.com",
    to: "Customer",
    toAddress: "customer@example.com",
    message: "<p>Your invoice is ready</p>",
    plainMessage: "Your invoice is ready");
```

### Bulk message

```csharp
using SplatDev.Messaging.SocketLabs.Controllers;
using SplatDev.Messaging.SocketLabs.Models;

var bulk = new SocketLabsBulkController(serverId, injectionApiKey);

var addresses = new List<BulkAddress>
{
    new BulkAddress { Email = "user1@example.com", FriendlyName = "User One" },
    new BulkAddress { Email = "user2@example.com", FriendlyName = "User Two" }
};

var message = new BulkMessageData
{
    Subject = "Newsletter #42",
    HtmlBody = "<h1>Latest updates</h1>",
    PlainTextBody = "Latest updates",
    From = new BulkAddress { Email = "newsletter@example.com" }
};

var response = bulk.SendBulkMessage(addresses, message);
```

## Features

- `SocketLabsController` — single-message `IMessagingController<BasicMessage, SendResponse>` implementation
- `SocketLabsBulkController` — bulk email via `IBulkMessagingController<BulkMessageData, SendResponse>`
- `BulkAddress` and `BulkMessageData` models for merge-style bulk sending
- Sync and async delivery methods
- Uses official `SocketLabs.EmailDelivery` SDK

## Supported operations

| Operation | Controller | Method |
|-----------|-----------|--------|
| Send single email | `SocketLabsController` | `SendMessage` / `SendMessageAsync` |
| Send bulk email | `SocketLabsBulkController` | `SendBulkMessage` |

## Dependencies

| Package | Purpose |
|---------|---------|
| `SplatDev.Messaging` | Core messaging abstractions (`IMessagingController<T,U>`, `IBulkMessagingController<T,U>`) |
| `SocketLabs.EmailDelivery` 1.4.2 | Official SocketLabs Injection API SDK |

---

**SplatDev.Messaging.SocketLabs** — part of the [SplatDev.Umbraco.Plugins](https://github.com/SplatDev-Ltda/SplatDev.Umbraco.Plugins) suite. Licensed under MIT. &copy; SplatDev Ltda.
