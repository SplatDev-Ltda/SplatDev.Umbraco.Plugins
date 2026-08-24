# SplatDev.Messaging

<!-- screenshot:start -->
<!-- screenshot:end -->

Core messaging abstractions for the SplatDev Umbraco Plugins ecosystem. Provides contracts for email sending (single and bulk), SMS messaging, and canned/template-based message generation with placeholder replacement.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Compatibility

| .NET | Umbraco | Package Version |
|------|---------|-----------------|
| 8.0  | 13      | 1.0.0           |
| 10.0 | 17      | 1.0.0           |

## Installation

```sh
dotnet add package SplatDev.Messaging
```

## Interfaces

### IMessagingController<TMessage, TResult>

Core email sending contract with sync and async overloads:

```csharp
public interface IMessagingController<TMessage, TResult>
{
    TResult SendMessage(string subject, string from, string fromAddress,
        string to, string toAddress, string message, string? plainMessage = null);

    TResult SendMessage(string subject, string from, string fromAddress,
        string to, string toAddress, string message, string? plainMessage,
        string? cc, string? bcc);

    TResult SendMessage(IAddress from, IAddress to, string subject,
        string message, string? plainMessage = null);

    TResult SendMessage(IAddress from, IAddress to, string subject,
        string message, string? plainMessage, IBulkAddress? cc, IBulkAddress? bcc);

    Task<TResult> SendMessageAsync(...);
    TResult SendMessage(TMessage message);
    Task<TResult> SendMessageAsync(TMessage message);
}
```

### IBulkMessagingController<TMessage, TResult>

Bulk email sending with multiple recipients:

```csharp
public interface IBulkMessagingController<TMessage, TResult>
{
    IEnumerable<TResult> SendMessage(IAddress from, string subject,
        string message, string? plainMessage, IEnumerable<IAddress> to);

    Task<IEnumerable<TResult>> SendMessageAsync(...);
}
```

### ISmsService

SMS sending contract:

```csharp
public interface ISmsService
{
    Task<SmsSendResult> SendSmsAsync(string to, string message);
}
```

## Canned Message Templates

The library includes a template system for generating messages with placeholder replacement:

```csharp
// Define placeholders
var placeholders = DefaultPlaceholders.Get(new Dictionary<string, string>
{
    { "name", "John" },
    { "email", "john@example.com" }
});

// Generate message from template
var message = CannedMessageHelpers.GenerateMessageFromTemplate(
    "Hello ##NAME##, welcome to ##SITENAME##", placeholders);
```

### Built-in placeholders

| Placeholder | Description |
|-------------|-------------|
| `##NAME##` | Recipient name |
| `##EMAIL##` | Recipient email |
| `##DATE##` | Current date |
| `##SITENAME##` | Site name |
| `##PAYLINK##` | Payment link |

## Provider Implementations

| Package | Description |
|---------|-------------|
| `SplatDev.Messaging.Mailgun` | Mailgun REST API provider |
| `SplatDev.Messaging.SendGrid` | SendGrid API provider |
| `SplatDev.Messaging.Smtp` | SMTP provider using `System.Net.Mail` |
| `SplatDev.Messaging.SocketLabs` | SocketLabs API provider |
| `SplatDev.Messaging.Twilio` | Twilio SendGrid provider |
| `SplatDev.Messaging.ClickSend` | ClickSend SMS provider |
| `SplatDev.Messaging.SMSTools` | SMSTools provider |

## Dependencies

None. This package has zero NuGet dependencies — it defines pure abstractions and interfaces.

---

**SplatDev.Messaging** — part of the [SplatDev.Umbraco.Plugins](https://github.com/SplatDev-Ltda/SplatDev.Umbraco.Plugins) suite. Licensed under MIT. &copy; SplatDev Ltda.

## Changelog

### 1.0.2 — 2026-08-24

Removes a dashboard screenshot that showed an error toast. It was captured against a site where this plugin's API was unreachable, so it advertised a broken dashboard. No screenshot is better than a misleading one; a replacement will be taken against a working install.

### 1.0.1 — 2026-08-24

Package metadata only: the listing now carries an icon and search tags, and the project and repository links point at the organisation that actually hosts this code. No code changes.

### 1.0.0 — 2026-08-24

This package now keeps a changelog. Earlier releases predate it and are not reconstructed here — consult the repository history for those. From this version on, every release records what changed for someone using it.

