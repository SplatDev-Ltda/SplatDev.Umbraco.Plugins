# SplatDev.Logger

Lightweight, static-class, database-backed logger using Entity Framework Core with SQL Server. Fire-and-forget logging that never crashes the application — all exceptions are silently swallowed.

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Logger.svg)](https://www.nuget.org/packages/SplatDev.Logger)

## Compatibility

| .NET | Package Version |
|------|-----------------|
| 8.0  | 1.0.0           |
| 10.0 | 1.0.0           |

## Installation

```sh
dotnet add package SplatDev.Logger
```

## What's implemented

### Logging API

The static `SplatDev.Logger.Logger` class provides two overloads:

- **`Log(string message, string details = "", LogType type = LogType.Info, string user = "System")`** — writes a log entry with message, optional details, severity, and user identifier.
- **`Log(string message, Exception exception, LogType type = LogType.Error, string user = "System")`** — writes a log entry from an exception, capturing `Message`, `StackTrace`, and `InnerException.Message` in the `Details` column.

Each call creates a short-lived `LoggerDbContext`, inserts the entry, saves changes, and disposes. All exceptions are caught and discarded — logging failures never propagate.

### Log entity

The `Log` entity maps to a SQL Server table:

| Column | Type | Notes |
|--------|------|-------|
| `Id` | `int` (PK, identity) | Auto-increment |
| `DateTime` | `DateTime` | Log timestamp |
| `LogType` | `LogType` enum | `Error`, `Info`, or `Warning` |
| `Message` | `string` | Short summary |
| `Details` | `string` | Stack trace, inner exception, or free-form text |
| `User` | `string` | Who triggered the log entry |

### LogType enum

| Value | Display |
|-------|---------|
| `LogType.Error` | `"Error"` |
| `LogType.Info` | `"Information"` |
| `LogType.Warning` | `"Warning"` |

### LoggerDbContext

A standard EF Core `DbContext` with `DbSet<Log> Logs`. Constructed with `DbContextOptions<LoggerDbContext>`. The static `Logger` creates instances internally using `UseSqlServer(ConnectionString)`.

## Configuration

### Connection string

Set the static `ConnectionString` property **before** any logging calls:

```csharp
SplatDev.Logger.Logger.ConnectionString = "Server=localhost;Database=MyDb;...";
```

This is typically done once at application startup.

### Database table

Create the `Logs` table using EF Core migrations or raw SQL:

```sql
CREATE TABLE [Logs] (
    [Id]       INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [DateTime] DATETIME2         NOT NULL,
    [LogType]  INT               NOT NULL,
    [Message]  NVARCHAR(MAX)     NULL,
    [Details]  NVARCHAR(MAX)     NULL,
    [User]     NVARCHAR(450)     NULL
);
```

### Appsettings

No appsettings keys are required. The package does not bind any options POCO. Connection string management is the consumer's responsibility — wire it from `IConfiguration`, environment variables, or a secrets manager:

```csharp
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
SplatDev.Logger.Logger.ConnectionString = connectionString;
```

## Usage

```csharp
using SplatDev.Logger;

// Info log
Logger.Log("User registered", details: "email=user@example.com");

// Warning log
Logger.Log("Rate limit approaching", type: LogType.Warning);

// Error log from exception
try
{
    // ... risky operation
}
catch (Exception ex)
{
    Logger.Log("Checkout failed", ex, type: LogType.Error, user: "customer@example.com");
}
```

## Dependencies

| Package | Purpose |
|---------|---------|
| `Microsoft.EntityFrameworkCore` 8.0.13 | EF Core ORM |
| `Microsoft.EntityFrameworkCore.SqlServer` 8.0.13 | SQL Server provider |

## Caveats

- **No DI integration.** `Logger` is a static class. It does not support `ILogger<T>` or structured logging. For `ILogger`-based logging, configure the standard ASP.NET Core logging pipeline instead.
- **Swallowed exceptions.** All `catch { }` blocks silently discard logging failures. This guarantees logging never crashes the application, but it means database connection failures or schema mismatches go completely undetected. Monitor your `Logs` table periodically to confirm entries are being written.
- **Short-lived DbContext.** Each `Log()` call creates and disposes its own `DbContext`. This is fine for low-to-moderate volume but may create connection pressure at scale. For high-throughput scenarios, consider a queued background writer.
- **No migration support.** The package does not include EF Core migrations. You are responsible for creating the `Logs` table in your database.
- **`DateTime.Now`.** Timestamps use server-local time, not UTC. If your servers span time zones, convert to UTC at query time.

---

**SplatDev.Logger** — part of the [SplatDev.Umbraco.Plugins](https://github.com/SplatDev-Ltda/SplatDev.Umbraco.Plugins) suite. Licensed under MIT. &copy; SplatDev Ltda.
