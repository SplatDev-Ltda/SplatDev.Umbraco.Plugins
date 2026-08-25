# SplatDev.Security

<!-- screenshot:start -->
<!-- screenshot:end -->

Security utilities for .NET applications — phishing detection via CheckPhish.ai, Google Safe Browsing integration, IP quality scoring via IPQualityScore, IP blacklist/whitelist management with EF Core persistence, HTTP basic auth encoding, and API response validation.

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Security.svg)](https://www.nuget.org/packages/SplatDev.Security)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Compatibility

| .NET | Umbraco | Package Version |
|------|---------|-----------------|
| 8.0  | 13      | 1.0.3           |
| 10.0 | 17      | 1.0.3           |

## Installation

```sh
dotnet add package SplatDev.Security
```

## Usage

`Tools` is a **static** class. There is nothing to register in DI and nothing to construct —
`new Tools()` does not compile, and neither does `AddSingleton<Tools>()`. Every method takes
the API key for the service it calls; this package does not read configuration or hold
credentials.

Every network method also accepts an optional `HttpMessageHandler`, which is how the tests
exercise them without calling the live services.

One trap worth knowing before the first `using`: the two response models are declared in
**`SplatDev.UrlShortening.Models`**, not `SplatDev.Security.Models`, even though they ship in
this package. `using SplatDev.Security;` on its own gets you `Tools` and a
`CS0246: The type or namespace name 'CheckPhishResponse' could not be found`.

```csharp
using SplatDev.Security;                // Tools, Constants
using SplatDev.Security.Models;         // IpBlacklist, IpWhitelist, IpHistory
using SplatDev.UrlShortening.Models;    // CheckPhishResponse, IpQualityScoreResponse
```

### Phishing detection via CheckPhish.ai

```csharp
CheckPhishResponse result = await Tools.CheckPhish(apiKey, "https://suspicious-site.com");

// disposition is "clean", "phish", "suspicious" — status is "DONE" when the scan finished
Console.WriteLine($"{result.disposition} (job {result.jobID}, status {result.status})");
```

A scan that has not finished returns `status` other than `"DONE"`; poll it with the job id:

```csharp
var polled = await Tools.CheckPhishPendingJob(apiKey, result.jobID);
```

### Google Safe Browsing lookup

```csharp
var result = await Tools.GoogleSafeBrowing(apiKey, new[] { "https://malware-site.com" });

if (result.Matches?.Any() == true)
    Console.WriteLine("URL flagged by Google Safe Browsing");
```

The method name is `GoogleSafeBrowing` — the typo is in the shipped API and renaming it would
be a breaking change.

It returns Google's own `GoogleSecuritySafebrowsingV4FindThreatMatchesResponse` from
`Google.Apis.Safebrowsing.v4`, not a type defined here.

### IP quality scoring via IPQualityScore

```csharp
IpQualityScoreResponse score = await Tools.IpQualityScore(apiKey, "https://example.com/");

Console.WriteLine($"Risk score: {score.Risk_score}");
Console.WriteLine($"Phishing:   {score.Phishing}");
Console.WriteLine($"Malware:    {score.Malware}");
Console.WriteLine($"Suspicious: {score.Suspicious}");
```

The property names follow IPQualityScore's own JSON, so they are snake-cased with a leading
capital — `Risk_score`, `Ip_address`, `Dns_valid`.

### HTTP basic auth encoding

```csharp
string encoded = Tools.EncodeAuthHeader("username", "password");
// "dXNlcm5hbWU6cGFzc3dvcmQ=" — the value only, without the "Basic " prefix

Tuple<string, string> decoded = Tools.DecodeAuthHeader(encoded);
// decoded.Item1 = "username", decoded.Item2 = "password"
```

### Password helpers

```csharp
string generated = await Tools.GeneratePasswordAsync();
string hashed    = await Tools.EncrypPasswordAsync(password, salt: "…");
```

`EncrypPasswordAsync` is spelled that way in the shipped API.

## IP list entities

`IpBlacklist`, `IpWhitelist` and `IpHistory` are **EF Core entity classes and nothing more**.
This package ships no `DbContext`, no repository and no lookup methods — add them to your own
context and query them yourself:

```csharp
public class MyDbContext : DbContext
{
    public DbSet<IpBlacklist> IpBlacklist => Set<IpBlacklist>();
    public DbSet<IpWhitelist> IpWhitelist => Set<IpWhitelist>();
    public DbSet<IpHistory>   IpHistory   => Set<IpHistory>();
}

bool blocked = await db.IpBlacklist.AnyAsync(x => x.Ip == candidate && x.ReleaseOn > DateTime.UtcNow);
```

## Features

- **CheckPhish.ai integration** — real-time phishing URL detection with detailed threat resolution
- **Google Safe Browsing** lookup against Google's continuously updated malware and phishing database
- **IPQualityScore** scoring: fraud score, proxy/VPN detection, ISP lookup, bot detection
- **EF Core entities** for IP blacklist, whitelist and lookup history (`IpBlacklist`,
  `IpWhitelist`, `IpHistory`) — entity definitions only; the `DbContext` and the queries are
  yours
- HTTP Basic Authentication header encoding and decoding
- Password generation and hashing helpers
- Structured API response models (`CheckPhishResponse`, `IpQualityScoreResponse`)

## Key Classes

| Class | Purpose |
|-------|---------|
| `Tools` | Static facade for the three lookup services, auth-header encoding and the password helpers |
| `CheckPhishResponse` | Response model from CheckPhish.ai — namespace `SplatDev.UrlShortening.Models` |
| `IpQualityScoreResponse` | Response model from IPQualityScore — namespace `SplatDev.UrlShortening.Models` |
| `IpBlacklist` | EF Core entity for blocked IP addresses — definition only |
| `IpWhitelist` | EF Core entity for allowed IP addresses — definition only |
| `IpHistory` | EF Core entity for an IP lookup audit trail — definition only |

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `Microsoft.EntityFrameworkCore` | 8.0.13 | ORM for IP list persistence |
| `Microsoft.EntityFrameworkCore.SqlServer` | 8.0.13 | SQL Server database provider |
| `Google.Apis.Safebrowsing.v4` | 1.68.0.2968 | Google Safe Browsing API client |
| `RestSharp` | 112.1.0 | HTTP client for CheckPhish.ai and IPQualityScore APIs |

---

**SplatDev.Security** — part of the [SplatDev.Umbraco.Plugins](https://github.com/SplatDev-Ltda/SplatDev.Umbraco.Plugins) suite. Licensed under MIT. &copy; SplatDev Ltda.

## Changelog

### 1.0.3 — 2026-08-25

Documentation only, no code change. The README's usage section did not contain a single call that compiled: it constructed `Tools`, which is static, and named eight methods that do not exist. Every example is now the real API, checked by compiling it. It also documents two traps this package genuinely ships with — the response models live in namespace `SplatDev.UrlShortening.Models` rather than `SplatDev.Security.Models`, and the IP blacklist and whitelist types are entity definitions with no lookup methods behind them.

### 1.0.2 — 2026-08-24

Removes a dashboard screenshot that showed an error toast. It was captured against a site where this plugin's API was unreachable, so it advertised a broken dashboard. No screenshot is better than a misleading one; a replacement will be taken against a working install.

### 1.0.1 — 2026-08-24

Package metadata only: the listing now carries an icon and search tags, and the project and repository links point at the organisation that actually hosts this code. No code changes.

### 1.0.0 — 2026-08-24

This package now keeps a changelog. Earlier releases predate it and are not reconstructed here — consult the repository history for those. From this version on, every release records what changed for someone using it.

