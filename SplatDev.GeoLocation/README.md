# SplatDev.GeoLocation

IP geolocation for .NET applications — resolves IP addresses to city, region, country, coordinates, ISP organization, postal code, and timezone via the ipinfo.io API.

[![NuGet](https://img.shields.io/nuget/v/SplatDev.GeoLocation.svg)](https://www.nuget.org/packages/SplatDev.GeoLocation)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Compatibility

| .NET | Umbraco | Package Version |
|------|---------|-----------------|
| 8.0  | 13      | 1.0.0           |
| 10.0 | 17      | 1.0.0           |

## Installation

```sh
dotnet add package SplatDev.GeoLocation
```

## Configuration

### Basic usage

```csharp
using SplatDev.GeoLocation;

// Resolve the caller's IP (or provide a specific one)
var result = await GeoLocator.GetIpInfoGeoLocation();
Console.WriteLine($"City: {result.City}, Country: {result.Country}");
```

## Usage

### Look up a specific IP address

```csharp
using SplatDev.GeoLocation;

var result = await GeoLocator.GetIpInfoGeoLocation("8.8.8.8");

Console.WriteLine($"IP:        {result.Ip}");
Console.WriteLine($"Hostname:  {result.Hostname}");
Console.WriteLine($"City:      {result.City}");
Console.WriteLine($"Region:    {result.Region}");
Console.WriteLine($"Country:   {result.Country}");
Console.WriteLine($"Location:  {result.Loc}");
Console.WriteLine($"Org:       {result.Org}");
Console.WriteLine($"Postal:    {result.Postal}");
Console.WriteLine($"Timezone:  {result.Timezone}");
```

### With an API token

```csharp
using SplatDev.GeoLocation;

// For higher rate limits (50k req/month with free tier token)
var result = await GeoLocator.GetIpInfoGeoLocation(
    ip: "1.1.1.1",
    apiToken: "your-ipinfo-token");

Console.WriteLine($"ISP: {result.Org}");
```

### Register as a service

```csharp
// Program.cs
builder.Services.AddSingleton<GeoLocator>();

// In a controller
public class LocationController : Controller
{
    private readonly GeoLocator _geoLocator;

    public LocationController(GeoLocator geoLocator)
    {
        _geoLocator = geoLocator;
    }

    public async Task<IActionResult> Index()
    {
        var location = await _geoLocator.GetIpInfoGeoLocation();
        return Json(location);
    }
}
```

### Batch IP resolution

```csharp
using SplatDev.GeoLocation;

var ips = new[] { "8.8.8.8", "1.1.1.1", "208.67.222.222" };

foreach (var ip in ips)
{
    var result = await GeoLocator.GetIpInfoGeoLocation(ip);
    Console.WriteLine($"{ip} → {result.City}, {result.Country} ({result.Org})");
}
```

## Features

- Resolve IP addresses to **city, region, country, geographic coordinates, organization, postal code, and timezone**
- Auto-detects the caller's public IP when no IP is specified
- Optional **ipinfo.io API token** for higher rate limits (free tier: 50k requests/month)
- Uses `RestSharp` for reliable HTTP communication
- Structured response via `GeoLocationResult` with strongly-typed properties
- `Loc` field returns `"latitude,longitude"` format ready for mapping or distance calculations
- Lightweight — single dependency on `RestSharp`
- No database or local file required — pure API-based resolution

## GeoLocationResult Properties

| Property | Type | Description |
|----------|------|-------------|
| `Ip` | `string` | IP address queried |
| `Hostname` | `string` | Reverse DNS hostname |
| `City` | `string` | City name |
| `Region` | `string` | Region or state name |
| `Country` | `string` | Country code (ISO 3166 alpha-2) |
| `Loc` | `string` | Latitude,longitude coordinates |
| `Org` | `string` | ISP or organization name |
| `Postal` | `string` | Postal/ZIP code |
| `Timezone` | `string` | IANA timezone identifier |

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `RestSharp` | 112.1.0 | HTTP client for ipinfo.io API calls |

No other NuGet dependencies.

---

**SplatDev.GeoLocation** — part of the [SplatDev.Umbraco.Plugins](https://github.com/SplatDev-Ltda/SplatDev.Umbraco.Plugins) suite. Licensed under MIT. &copy; SplatDev Ltda.
