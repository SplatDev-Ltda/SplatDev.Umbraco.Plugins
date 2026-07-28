# SplatDev.Mobile.Detection

Mobile device detection for ASP.NET Core — identifies mobile browsers via User-Agent header parsing and a JSON-based curated device list. Supports both `HttpContext` header inspection and raw User-Agent regex analysis.

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Mobile.Detection.svg)](https://www.nuget.org/packages/SplatDev.Mobile.Detection)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Compatibility

| .NET | Umbraco | Package Version |
|------|---------|-----------------|
| 8.0  | 13      | 1.0.0           |
| 10.0 | 17      | 1.0.0           |

## Installation

```sh
dotnet add package SplatDev.Mobile.Detection
```

## Configuration

### Quick check via HttpContext

```csharp
using SplatDev.Mobile.Detection;

// In a controller or Razor page — inspects the request headers
bool isMobile = MobileDetection.IsMobileBrowser();
```

### Regex-based User-Agent analysis

```csharp
using SplatDev.Mobile.Detection;

// Analyze a raw User-Agent string
string userAgent = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0...";
bool isMobile = MobileDetection.IsMobileBrowserRegex(userAgent);
```

### Register as a middleware service

```csharp
// Program.cs
builder.Services.AddScoped<MobileDetection>();

// In a controller
public class HomeController : Controller
{
    private readonly MobileDetection _mobileDetection;

    public HomeController(MobileDetection mobileDetection)
    {
        _mobileDetection = mobileDetection;
    }

    public IActionResult Index()
    {
        ViewBag.IsMobile = _mobileDetection.IsMobileBrowser();
        return View();
    }
}
```

### Accessing the device list

```csharp
using SplatDev.Mobile.Detection;

// The MobileDevices array contains known mobile device patterns
var deviceList = MobileDetection.MobileDevices;

// Check how many device patterns are registered
Console.WriteLine($"Tracking {deviceList.Length} device patterns");
```

## Features

- Header-based detection via `IsMobileBrowser()` — checks `User-Agent`, `X-Device-User-Agent`, and device-specific headers
- Regex-based detection via `IsMobileBrowserRegex(string userAgent)` — analyzes any User-Agent string
- **JSON-based device list** (`device_list.json`) embedded in the package for offline detection
- `MobileDevices` static array containing curated mobile device User-Agent patterns
- No external API calls — all detection is local and instant
- Seamless ASP.NET Core integration with `HttpContext` access
- Lightweight with no third-party detection services

## How It Works

The detection pipeline uses two complementary strategies:

1. **Header inspection** (`IsMobileBrowser`): Checks `HttpContext.Request.Headers` for known mobile indicators such as device model identifiers, mobile browser tokens, and operating system signatures in the `User-Agent`, `Accept`, and device-specific headers.

2. **Regex analysis** (`IsMobileBrowserRegex`): Applies comprehensive regular expression patterns against a raw User-Agent string, matching against the curated `MobileDevices` list that includes iPhone, iPad, Android devices, Windows Phone, BlackBerry, and other mobile platforms.

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `Newtonsoft.Json` | 13.0.3 | JSON deserialization of the embedded device list |
| `Microsoft.AspNetCore.App` | — | Framework reference for `HttpContext` access |

---

**SplatDev.Mobile.Detection** — part of the [SplatDev.Umbraco.Plugins](https://github.com/SplatDev-Ltda/SplatDev.Umbraco.Plugins) suite. Licensed under MIT. &copy; SplatDev Ltda.
