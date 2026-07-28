# SplatDev.Security

Security utilities for .NET applications — phishing detection via CheckPhish.ai, Google Safe Browsing integration, IP quality scoring via IPQualityScore, IP blacklist/whitelist management with EF Core persistence, HTTP basic auth encoding, and API response validation.

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Security.svg)](https://www.nuget.org/packages/SplatDev.Security)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Compatibility

| .NET | Umbraco | Package Version |
|------|---------|-----------------|
| 8.0  | 13      | 1.0.0           |
| 10.0 | 17      | 1.0.0           |

## Installation

```sh
dotnet add package SplatDev.Security
```

## Configuration

### Register services in DI

```csharp
// Program.cs
builder.Services.AddDbContext<SecurityDbContext>(options =>
    options.UseSqlServer(connectionString));

builder.Services.AddSingleton<Tools>();
```

## Usage

### Phishing detection via CheckPhish.ai

```csharp
using SplatDev.Security;

var tools = new Tools();
var result = await tools.CheckPhish("https://suspicious-site.com");

if (result.IsPhishing)
    Console.WriteLine($"Phishing detected! Resolution: {result.Resolution}");
else
    Console.WriteLine($"Clean. Job ID: {result.JobId}");
```

### Google Safe Browsing lookup

```csharp
using SplatDev.Security;

var result = await tools.CheckSafeBrowsing("https://malware-site.com");

if (result.IsMalicious)
    Console.WriteLine("URL flagged by Google Safe Browsing");
```

### IP quality scoring via IPQualityScore

```csharp
using SplatDev.Security;

var score = await tools.CheckIpQualityScore("203.0.113.42");

Console.WriteLine($"Fraud score: {score.FraudScore}");
Console.WriteLine($"Is proxy: {score.IsProxy}");
Console.WriteLine($"Is VPN: {score.IsVpn}");
Console.WriteLine($"ISP: {score.Isp}");
```

### IP blacklist/whitelist management

```csharp
using SplatDev.Security;

// Check if an IP is in an allowed or blocked list
bool isBlocked = tools.IsIpBlacklisted("192.168.1.100");
bool isAllowed = tools.IsIpWhitelisted("10.0.0.1");

// Validate IP format
bool valid = tools.IsIpValid("192.168.1.1");

// Add to whitelist
await tools.AddToWhitelistAsync("10.0.0.0/24", description: "Internal network");
```

### Email validation

```csharp
using SplatDev.Security;

bool validEmail = tools.IsEmailValid("user@example.com");
```

### HTTP basic auth encoding

```csharp
using SplatDev.Security;

string authHeader = Tools.EncodeBasicAuth("username", "password");
// Returns "Basic dXNlcm5hbWU6cGFzc3dvcmQ="
```

## Features

- **CheckPhish.ai integration** — real-time phishing URL detection with detailed threat resolution
- **Google Safe Browsing** lookup against Google's continuously updated malware and phishing database
- **IPQualityScore** scoring: fraud score, proxy/VPN detection, ISP lookup, bot detection
- **IP blacklist management** — persistent blacklist with EF Core entities (`IpBlacklist`)
- **IP whitelist management** — persistent whitelist for trusted networks (`IpWhitelist`)
- **IP history tracking** — audit trail of IP lookups via `IpHistory` EF entity
- IP address format validation (`IsIpValid`)
- Email address format validation (`IsEmailValid`)
- HTTP Basic Authentication header encoding
- Structured API response models (`CheckPhishResponse`, `IpQualityScoreResponse`)

## Key Classes

| Class | Purpose |
|-------|---------|
| `Tools` | Main facade for all security checks (CheckPhish, Safe Browsing, IPQS, IP validation) |
| `CheckPhishResponse` | Response model from CheckPhish.ai API |
| `IpQualityScoreResponse` | Response model from IPQualityScore API |
| `IpBlacklist` | EF Core entity for blocked IP addresses |
| `IpWhitelist` | EF Core entity for allowed IP addresses |
| `IpHistory` | EF Core entity for IP lookup audit trail |

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `Microsoft.EntityFrameworkCore` | 8.0.13 | ORM for IP list persistence |
| `Microsoft.EntityFrameworkCore.SqlServer` | 8.0.13 | SQL Server database provider |
| `Google.Apis.Safebrowsing.v4` | 1.68.0.2968 | Google Safe Browsing API client |
| `RestSharp` | 112.1.0 | HTTP client for CheckPhish.ai and IPQualityScore APIs |
| `Newtonsoft.Json` | 13.0.3 | JSON serialization for API responses |

---

**SplatDev.Security** — part of the [SplatDev.Umbraco.Plugins](https://github.com/SplatDev-Ltda/SplatDev.Umbraco.Plugins) suite. Licensed under MIT. &copy; SplatDev Ltda.
