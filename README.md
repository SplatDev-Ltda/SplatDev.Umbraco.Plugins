# SplatDev.Umbraco.Core

A comprehensive monorepo of Umbraco plugins, extensions, and utilities maintained by **SplatDev Ltda**. Supports **Umbraco 13** (net8.0) and **Umbraco 17** (net10.0).

[![Build & Test](https://github.com/SplatDev-Ltda/SplatDev.Umbraco.Core/actions/workflows/build.yml/badge.svg)](https://github.com/SplatDev-Ltda/SplatDev.Umbraco.Core/actions/workflows/build.yml)
[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Common)](https://www.nuget.org/packages?q=SplatDev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## Installation

All packages are available on [NuGet.org](https://www.nuget.org/packages?q=SplatDev).

```bash
dotnet add package <PackageId>
```

Or via the Package Manager Console:

```powershell
Install-Package <PackageId>
```

---

## Compatibility Matrix

| Package Prefix | Umbraco 13 (net8.0) | Umbraco 17 (net10.0) |
|---|---|---|
| `SplatDev.*` | ✅ | ✅ |
| `UmbracoCms.Plugins.*` | ✅ | ✅ |
| `Umbraco.Plugins.*` | ✅ | ✅ |
| `Umbraco.FormBuilder` | ✅ | ✅ |
| `System.Reflection.Helpers` | ✅ | ✅ |

All packages target `net8.0;net10.0` and use conditional package references to include the correct Umbraco version per target framework.

---

## Packages

### Core Libraries

| Package | Description |
|---|---|
| `System.Reflection.Helpers` | Reflection utility helpers for .NET |
| `SplatDev.Content` | Content management extensions for Umbraco |
| `SplatDev.Database` | Database abstraction and helpers |
| `SplatDev.Database.MSSQLAdmin` | MSSQL administration utilities |
| `SplatDev.GeoLocation` | Geo-location services and helpers |
| `SplatDev.Logger` | Logging extensions and abstractions |
| `SplatDev.Routing` | URL routing utilities |
| `SplatDev.ScheduledTasks` | Scheduled background task infrastructure |
| `SplatDev.Security` | Security utilities and helpers |
| `SplatDev.Mobile.Detection` | Mobile device detection |

### Messaging

| Package | Description |
|---|---|
| `SplatDev.Messaging` | Core messaging abstractions |
| `SplatDev.Messaging.Mailgun` | Mailgun email provider |
| `SplatDev.Messaging.Newsletter` | Newsletter management |
| `SplatDev.Messaging.SendGrid` | SendGrid email provider |
| `SplatDev.Messaging.Smtp` | SMTP email provider |
| `SplatDev.Messaging.SocketLabs` | SocketLabs email provider |
| `SplatDev.Messaging.SMSTools` | SMS tools integration |
| `SplatDev.Messaging.Twilio` | Twilio SMS/voice provider |

### Payments

| Package | Description |
|---|---|
| `SplatDev.Payments` | Core payment abstractions |
| `SplatDev.Payments.MercadoPago` | MercadoPago payment provider |
| `SplatDev.Payments.PagSeguro` | PagSeguro payment provider |
| `SplatDev.Payments.Stripe` | Stripe payment provider |

### Umbraco Extensions

| Package | Description |
|---|---|
| `SplatDev.Umbraco.Common` | Common Umbraco extensions and utilities |
| `SplatDev.Umbraco.2FA` | Two-factor authentication for Umbraco |
| `SplatDev.Umbraco.Authorization.Ldap` | LDAP authorization for Umbraco |
| `SplatDev.Umbraco.DataTypes.USStates` | US States data type for Umbraco |
| `SplatDev.Umbraco.EntityFramework` | Entity Framework integration for Umbraco |
| `SplatDev.Umbraco.Examine` | Examine/Lucene search extensions |
| `SplatDev.Umbraco.Markup` | Markup helpers and extensions |
| `SplatDev.Umbraco.Membership` | Membership/member management extensions |
| `SplatDev.Umbraco.NPoco` | NPoco micro-ORM integration for Umbraco |
| `SplatDev.Umbraco.Pagination` | Pagination utilities for Umbraco |
| `SplatDev.Umbraco.QueryStringFilters` | QueryString filter utilities |

### SplatDev Umbraco Plugins

| Package | Description |
|---|---|
| `SplatDev.Umbraco.Plugins.ExceptionManager` | Exception management and logging plugin |
| `SplatDev.Umbraco.Plugins.IspServices` | ISP services integration plugin |
| `SplatDev.Umbraco.Plugins.OAuth` | OAuth authentication plugin |
| `SplatDev.Umbraco.Plugins.SEO` | SEO optimization plugin |
| `SplatDev.Umbraco.Plugins.Schema2Yaml` | Schema to YAML conversion tool |
| `SplatDev.Umbraco.Plugins.Security` | Security hardening plugin |
| `SplatDev.Umbraco.Plugins.ShortUrls` | Short URL management plugin |
| `SplatDev.Umbraco.Plugins.WordsApi` | Words API integration |
| `SplatDev.Umbraco.Plugins.Yaml2Schema` | YAML to Schema conversion tool |
| `SplatDev.uPlugins.Backups` | Backup management plugin |
| `SplatDev.Plugins.BackupVault` | Backup vault storage plugin |

### Umbraco CMS Plugins

| Package | Description |
|---|---|
| `UmbracoCms.Plugins` | Core plugin infrastructure |
| `UmbracoCms.Plugins.2fa` | Two-factor authentication |
| `UmbracoCms.Plugins.AdminBar` | Custom admin bar extensions |
| `UmbracoCms.Plugins.Analytics` | Analytics integration |
| `UmbracoCms.Plugins.Backups` | Content backup management |
| `UmbracoCms.Plugins.Blog` | Full-featured blog with posts, categories, tags, comments and RSS |
| `UmbracoCms.Plugins.CharLimit` | Character limit property editor |
| `UmbracoCms.Plugins.CopyValue` | Copy value between properties |
| `UmbracoCms.Plugins.CustomLogin` | Custom login page plugin |
| `UmbracoCms.Plugins.DefaultValue` | Default value property editor |
| `UmbracoCms.Plugins.DictionaryManager` | Dictionary/translation manager |
| `UmbracoCms.Plugins.Dropzone` | Drag-and-drop file upload |
| `UmbracoCms.Plugins.ExamineExtensions` | Examine search extensions |
| `UmbracoCms.Plugins.Exif` | EXIF image metadata reader |
| `UmbracoCms.Plugins.Faqs` | FAQ content management |
| `UmbracoCms.Plugins.Forums` | Discussion forum plugin |
| `UmbracoCms.Plugins.Gdrp` | GDPR compliance tools |
| `UmbracoCms.Plugins.HiddenContent` | Hidden/unpublished content management |
| `UmbracoCms.Plugins.JsonRpc` | JSON-RPC endpoint plugin |
| `UmbracoCms.Plugins.LazyLoad` | Lazy loading for media |
| `UmbracoCms.Plugins.LiveVideo` | Live video streaming integration |
| `UmbracoCms.Plugins.MemberGroups` | Member group management |
| `UmbracoCms.Plugins.MemberLogin` | Member login functionality |
| `UmbracoCms.Plugins.MemberRegistration` | Member registration workflow |
| `UmbracoCms.Plugins.MemberTypes` | Custom member type management |
| `UmbracoCms.Plugins.MostViewed` | Most viewed content tracking |
| `UmbracoCms.Plugins.NewsTicker` | News ticker content plugin |
| `UmbracoCms.Plugins.Newsletters` | Newsletter subscription management |
| `UmbracoCms.Plugins.OnOff` | Toggle/on-off switch property editor |
| `UmbracoCms.Plugins.PasswordSettings` | Password policy configuration |
| `UmbracoCms.Plugins.Payments.MercadoPago` | MercadoPago payments for Umbraco |
| `UmbracoCms.Plugins.Payments.PagSeguro` | PagSeguro payments for Umbraco |
| `UmbracoCms.Plugins.PhotoGallery` | Photo gallery with albums |
| `UmbracoCms.Plugins.PropertiesReport` | Content properties reporting |
| `UmbracoCms.Plugins.QuickPoll` | Quick poll/voting plugin |
| `UmbracoCms.Plugins.RdpManager` | Remote Desktop Protocol manager |
| `UmbracoCms.Plugins.Restricted` | Content access restriction |
| `UmbracoCms.Plugins.Rsvp` | RSVP/event registration |
| `UmbracoCms.Plugins.Settings` | Site settings management |
| `UmbracoCms.Plugins.ShopCart` | Shopping cart plugin |
| `UmbracoCms.Plugins.Slider` | Content slider/carousel |
| `UmbracoCms.Plugins.Smtp` | SMTP email configuration |
| `UmbracoCms.Plugins.SocialMedia.Channels` | Social media channel management |
| `UmbracoCms.Plugins.SocialMedia.Login` | Social media login (OAuth) |
| `UmbracoCms.Plugins.SocialMedia.Share` | Social media sharing buttons |
| `UmbracoCms.Plugins.StarRatings` | Star rating plugin |
| `UmbracoCms.Plugins.Surveys` | Survey and form builder |
| `UmbracoCms.Plugins.SvgViewer` | SVG file viewer |
| `UmbracoCms.Plugins.ToastNotifications` | Toast notification system |
| `UmbracoCms.Plugins.Tweets` | Twitter/X feed integration |
| `UmbracoCms.Plugins.VideoPreview` | Video preview and thumbnails |
| `UmbracoCms.Plugins.VisitorCounter` | Visitor counter and analytics |
| `UmbracoCms.Plugins.WhatsApp` | WhatsApp messaging integration |

### Umbraco Plugins (Legacy)

| Package | Description |
|---|---|
| `Umbraco.Plugins.CacheManager` | Cache management tools |
| `Umbraco.Plugins.Countries` | Countries data type |
| `Umbraco.Plugins.CustomLogin` | Custom login page |
| `Umbraco.Plugins.Mailer` | Email sending plugin |
| `Umbraco.Plugins.RedirectManager` | URL redirect management |

### Form Builder

| Package | Description |
|---|---|
| `Umbraco.FormBuilder` | Dynamic form builder for Umbraco |
| `FormBuilder.Extension` | Form builder extensions and custom fields |

### Themes

| Package | Description |
|---|---|
| `UmbracoCms.Themes.Base` | Base theme infrastructure |
| `UmbracoCms.Themes.Blog` | Blog theme |
| `UmbracoCms.Themes.Commerce` | E-commerce theme |
| `UmbracoCms.Themes.Conference` | Conference/event theme |
| `UmbracoCms.Themes.Corporate` | Corporate website theme |
| `UmbracoCms.Themes.Forum` | Forum/community theme |
| `UmbracoCms.Themes.Hotel` | Hotel/hospitality theme |
| `UmbracoCms.Themes.Landing` | Landing page theme |
| `UmbracoCms.Themes.Portfolio` | Portfolio/showcase theme |

### Tools & Utilities

| Package | Description |
|---|---|
| `UmbracoCms.Tools.PackageActions` | Custom package actions for install/uninstall |
| `UmbracoCms.Tools.Packager` | Package build and distribution tools |
| `UmbracoCms.Tools.T4.Plugins` | T4 templates for plugin scaffolding |
| `UmbracoCms.Tools.T4.Themes` | T4 templates for theme scaffolding |
| `Umbraco-Yaml` | YAML import/export for Umbraco content |

---

## Getting Started

### Prerequisites

- .NET 8.0 SDK or .NET 10.0 SDK
- Umbraco 13.x (for net8.0) or Umbraco 17.x (for net10.0)

### Quick Start

1. Install the desired NuGet package(s)
2. Register the services in your `Startup.cs` or `Program.cs`:

```csharp
builder.Services.AddUmbraco(builder.Environment, builder.Configuration)
    .AddBackOffice()
    .AddWebsite()
    .AddSplatDevPlugins()  // adds SplatDev services
    .AddComposer()
    .Build();
```

Refer to each package's documentation for specific configuration options.

---

## Development

### Branch Strategy

This repository uses two major branches:

| Branch | Target | Framework |
|---|---|---|
| `u13` | Umbraco 13 | net8.0, AngularJS backoffice |
| `u17` | Umbraco 17 | net10.0, Lit 3 backoffice |

- **One PR per feature/bug** — always target the correct major branch.
- **Never commit directly to `u13`, `u17`, or `master`** — always use feature branches and PRs.
- Plugins supporting both versions have separate U13 and U17 implementations. Merge U13 work into `u13`, U17 work into `u17`.
- Cross-cutting changes (libs, infra, CI) target both branches via separate PRs.
- Archived feature branches live under `archive/` — revive them by branching off the appropriate major branch.

### Building

```bash
dotnet restore SplatDev.Core.sln
dotnet build SplatDev.Core.sln -c Release
```

### Testing

```bash
dotnet test SplatDev.Core.sln -c Release
```

### Creating a Release

1. Tag the commit with a version tag:

```bash
git tag v2.0.1
git push github v2.0.1
```

2. The [publish workflow](.github/workflows/publish.yml) will automatically pack and push all packages to NuGet.org and GitHub Packages.

### Required Secrets

| Secret | Purpose |
|---|---|
| `NUGET_API_KEY` | NuGet.org API key for publishing |

---

## Contributing

1. Fork the repository
2. Create a feature branch from the correct major branch:
   ```bash
   git checkout u13   # or u17 for Umbraco 17 work
   git checkout -b feature/my-new-plugin
   ```
3. Commit your changes: `git commit -m 'Add new plugin'`
4. Push to the branch: `git push origin feature/my-new-plugin`
5. Open a Pull Request targeting `u13` or `u17` (not `master`)

Please ensure all existing tests pass and add tests for new functionality.

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## About SplatDev

[SplatDev Ltda](https://github.com/SplatDev-Ltda) is a software development company specializing in Umbraco CMS solutions and .NET plugins.
