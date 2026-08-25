# SplatDev.Messaging.Newsletter

<!-- screenshot:start -->
<!-- screenshot:end -->

Newsletter/mailing-list foundation library for the SplatDev.Messaging ecosystem. Ships only interfaces, DTOs, and plain C# events — **no provider implementations, no external dependencies**. Provider packages (Mailchimp, Brevo, SendGrid, etc.) implement `INewsletterProvider` and map their APIs to this contract.

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Messaging.Newsletter.svg)](https://www.nuget.org/packages/SplatDev.Messaging.Newsletter)

## Compatibility

| .NET | Package Version |
|------|-----------------|
| 8.0  | 1.0.0           |
| 10.0 | 1.0.0           |

## Installation

```sh
dotnet add package SplatDev.Messaging.Newsletter
```

## Architecture

```
SplatDev.Messaging.Newsletter (foundation — zero deps)
├── Models/          # DTOs: NewsletterList, Subscriber, Campaign, CampaignStats
├── Interfaces/      # INewsletterProvider contract
├── Events/          # Plain C# events (no MediatR)
│
└── consumed by →
    SplatDev.Messaging.Newsletter.Mailchimp   (provider impl)
    SplatDev.Messaging.Newsletter.Brevo       (provider impl)
    SplatDev.Messaging.Newsletter.SendGrid    (provider impl)
```

## Models

### Enums

| Enum | Values |
|------|--------|
| `OptInPolicy` | `SingleOptIn`, `DoubleOptIn` |
| `SubscriberStatus` | `Subscribed`, `Unsubscribed`, `Pending`, `Bounced`, `Complained` |

### DTOs

| DTO | Key Properties |
|-----|---------------|
| `NewsletterList` | `Id`, `Name`, `Description`, `OptInPolicy`, `CustomFields`, `ProviderExternalId` |
| `NewsletterSubscriber` | `Id`, `Email`, `Name`, `CustomFields`, `Status`, `SubscribedAt`, `UnsubscribedAt`, `ListId` |
| `NewsletterCampaign` | `Id`, `ListId`, `Subject`, `FromName`, `FromEmail`, `BodyHtml`, `BodyPlain`, `ScheduledAt`, `TrackOpens`, `TrackClicks`, `TemplateId`, `ProviderCampaignId` |
| `CampaignStats` | `CampaignId`, `SentCount`, `OpenCount`, `ClickCount`, `BounceCount`, `ComplaintCount`, `UnsubscribeCount`, `OpenRate`, `ClickRate` |

## Provider Contract

`INewsletterProvider` exposes async-only operations:

| Method | Description |
|--------|-------------|
| `CreateListAsync` | Create a mailing list |
| `GetListAsync` / `GetListsAsync` | Retrieve list(s) |
| `UpdateListAsync` / `DeleteListAsync` | Modify or remove a list |
| `SubscribeAsync` / `UnsubscribeAsync` | Manage subscribers |
| `GetSubscriberAsync` / `GetSubscribersAsync` | Retrieve subscriber(s), optional status filter |
| `CreateCampaignAsync` / `GetCampaignAsync` | Create or retrieve a campaign |
| `SendCampaignAsync` | Send a scheduled campaign immediately |
| `GetCampaignStatsAsync` | Retrieve open/click/bounce/complaint stats |

## Events

Zero-dependency plain C# events. Provider implementations raise these; consumers subscribe:

| Event | EventArgs | Description |
|-------|-----------|-------------|
| `OnSubscribed` | `SubscribedEventArgs` | New subscriber confirmed |
| `OnUnsubscribed` | `UnsubscribedEventArgs` | Subscriber opted out |
| `OnBounced` | `BouncedEventArgs` | Email bounced (includes `BounceReason`) |
| `OnOpened` | `OpenedEventArgs` | Campaign email opened |
| `OnClicked` | `ClickedEventArgs` | Link clicked (includes `ClickedUrl`) |

## Usage (with a provider)

This package is **contracts only** — `INewsletterProvider`, the models and the events. It
ships no implementation, and there is no provider package alongside it yet. `AddMailchimp()`
does not exist anywhere in this repository; register your own implementation:

```csharp
builder.Services.AddScoped<INewsletterProvider, MyNewsletterProvider>();

// Access via interface
public class MyController(INewsletterProvider provider)
{
    [HttpPost("subscribe")]
    public async Task<IActionResult> Subscribe(string email)
    {
        var subscriber = await provider.SubscribeAsync("list-123", email, "John");
        return Ok(subscriber);
    }
}
```

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `SplatDev.Messaging` | 1.0.0 | Parent messaging framework |

No other dependencies. No MediatR, no HTTP client, no third-party SDKs. Provider packages add their own.

---

**SplatDev.Messaging.Newsletter** — part of the [SplatDev.Umbraco.Plugins](https://github.com/SplatDev-Ltda/SplatDev.Umbraco.Plugins) suite. Licensed under MIT. © SplatDev Ltda.

## Changelog

### 1.0.3 — 2026-08-25

Documentation only, no code change. The README showed `AddMailchimp(...)`. There is no such method and no Mailchimp provider — this package is contracts only, and now says so.

### 1.0.2 — 2026-08-24

Removes a dashboard screenshot that showed an error toast. It was captured against a site where this plugin's API was unreachable, so it advertised a broken dashboard. No screenshot is better than a misleading one; a replacement will be taken against a working install.

### 1.0.1 — 2026-08-24

Package metadata only: the listing now carries an icon and search tags, and the project and repository links point at the organisation that actually hosts this code. No code changes.

### 1.0.0 — 2026-08-24

This package now keeps a changelog. Earlier releases predate it and are not reconstructed here — consult the repository history for those. From this version on, every release records what changed for someone using it.

