# SplatDev.Api.Common.ApiVersioning

Centralized API versioning configuration for ASP.NET Core — provides the `AddSplatApiVersioning()` extension method that configures `Asp.Versioning.Mvc` with sensible defaults: default version 1.0, assume version when unspecified, report API versions in responses, and support both query string (`api-version`) and header (`X-API-Version`) version readers.

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Api.Common.ApiVersioning.svg)](https://www.nuget.org/packages/SplatDev.Api.Common.ApiVersioning)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Compatibility

| .NET | Umbraco | Package Version |
|------|---------|-----------------|
| 8.0  | 13      | 2.0.0           |
| 10.0 | 17      | 2.0.0           |

## Installation

```sh
dotnet add package SplatDev.Api.Common.ApiVersioning
```

## Configuration

### Basic registration

```csharp
using SplatDev.Api.Common.ApiVersioning;

// Program.cs
builder.Services.AddSplatApiVersioning();
```

That single line configures all of the following:
- Default API version: **1.0**
- Assume default version when unspecified by the client
- Report supported and deprecated API versions in response headers
- Read version from query string parameter `api-version`
- Read version from request header `X-API-Version`

### Minimal API example

```csharp
// Program.cs
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddSplatApiVersioning();

var app = builder.Build();
app.MapControllers();
app.Run();
```

## Usage

### Version your controllers

```csharp
using Asp.Versioning;

[ApiController]
[Route("api/v{version:apiVersion}/customers")]
[ApiVersion("1.0")]
[ApiVersion("2.0")]
public class CustomersController : ControllerBase
{
    [HttpGet]
    [MapToApiVersion("1.0")]
    public IActionResult GetCustomersV1()
    {
        return Ok(new { version = "1.0", data = new[] { "customer1" } });
    }

    [HttpGet]
    [MapToApiVersion("2.0")]
    public IActionResult GetCustomersV2()
    {
        return Ok(new { version = "2.0", data = new[] { "customer1", "customer2" } });
    }
}
```

### Request via query string

```
GET /api/customers?api-version=1.0
GET /api/customers?api-version=2.0
```

### Request via header

```
GET /api/customers
X-API-Version: 1.0
```

### Omit version for default

```
GET /api/customers
# Defaults to 1.0 — no query string or header required
```

### Report API versions in responses

When API version reporting is enabled (default), the response includes:

```http
api-supported-versions: 1.0, 2.0
api-deprecated-versions:
```

## Features

- **One-line configuration** — `AddSplatApiVersioning()` handles all `Asp.Versioning` setup
- **Default version 1.0** — clients are not required to specify a version
- **Assume default version** when unspecified — backwards-compatible by default
- **Report API versions** in response headers (`api-supported-versions`, `api-deprecated-versions`)
- **Query string reader** — `?api-version=1.0`
- **Header reader** — `X-API-Version: 1.0`
- **URL path versioning** — `[Route("api/v{version:apiVersion}/...")]` route templates supported natively
- Built on **Asp.Versioning.Mvc** and **Asp.Versioning.Mvc.ApiExplorer**
- `Microsoft.AspNetCore.App` framework reference for full ASP.NET Core integration

## Version Reader Precedence

When multiple version sources are present, the following precedence applies:

1. Query string (`api-version` parameter)
2. Header (`X-API-Version`)

If neither is provided, the default version 1.0 is assumed.

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `Asp.Versioning.Mvc` | 8.1.0 | API versioning middleware and attributes |
| `Asp.Versioning.Mvc.ApiExplorer` | 8.1.0 | API Explorer integration for Swagger/Swashbuckle |
| `Microsoft.AspNetCore.App` | — | Framework reference for ASP.NET Core |

---

**SplatDev.Api.Common.ApiVersioning** — part of the [SplatDev.Umbraco.Plugins](https://github.com/SplatDev-Ltda/SplatDev.Umbraco.Plugins) suite. Licensed under MIT. &copy; SplatDev Ltda.
