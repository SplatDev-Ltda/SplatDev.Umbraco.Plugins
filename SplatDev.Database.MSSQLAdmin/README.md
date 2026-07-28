# SplatDev.Database.MSSQLAdmin

MSSQL database administration utilities for .NET, extending [`SplatDev.Database`](https://www.nuget.org/packages/SplatDev.Database). Provides index maintenance, integrity checks, and size monitoring via `Microsoft.Data.SqlClient`.

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Database.MSSQLAdmin.svg)](https://www.nuget.org/packages/SplatDev.Database.MSSQLAdmin)

## Compatibility

| .NET | Package Version |
|------|-----------------|
| 8.0  | 1.0.0           |
| 10.0 | 1.0.0           |

## Installation

```sh
dotnet add package SplatDev.Database.MSSQLAdmin
```

## Configuration

Add to `appsettings.json`:

```json
{
  "MSSQLAdmin": {
    "ConnectionString": "Server=localhost;Database=MyDb;Trusted_Connection=true;TrustServerCertificate=true",
    "IndexMaintenanceEnabled": true,
    "IntegrityChecksEnabled": true,
    "SizeMonitoringEnabled": true,
    "RebuildThresholdPercent": 30.0,
    "ReorganizeThresholdPercent": 10.0
  }
}
```

| Key | Required | Default | Description |
|-----|----------|---------|-------------|
| `ConnectionString` | Yes | — | MSSQL connection string |
| `IndexMaintenanceEnabled` | No | `true` | Enable index rebuild/reorganize |
| `IntegrityChecksEnabled` | No | `true` | Enable DBCC CHECKDB |
| `SizeMonitoringEnabled` | No | `true` | Enable size/growth monitoring |
| `RebuildThresholdPercent` | No | `30.0` | Fragmentation % threshold for REBUILD |
| `ReorganizeThresholdPercent` | No | `10.0` | Fragmentation % threshold for REORGANIZE |

## Registration

```csharp
builder.Services.AddSplatDevMssqlAdmin(options =>
{
    options.ConnectionString = builder.Configuration["MSSQLAdmin:ConnectionString"] ?? "";
    options.RebuildThresholdPercent = 30.0f;
    options.ReorganizeThresholdPercent = 10.0f;
});
```

## Usage

```csharp
public class DatabaseMaintenanceJob(
    MssqlAdminService mssqlAdmin,
    ILogger<DatabaseMaintenanceJob> logger)
{
    public async Task RunAsync()
    {
        // 1. Index maintenance
        var indexResult = await mssqlAdmin.MaintainIndexesAsync();
        logger.LogInformation("Rebuilt {Rebuilt}, Reorganized {Reorganized}",
            indexResult.RebuiltCount, indexResult.ReorganizedCount);

        // 2. Integrity check
        var integrity = await mssqlAdmin.CheckDatabaseIntegrityAsync();
        if (!integrity.AllChecksPassed)
            logger.LogWarning("DBCC CHECKDB found {Count} errors", integrity.ErrorCount);

        // 3. Size monitoring
        var size = await mssqlAdmin.GetDatabaseSizeInfoAsync();
        logger.LogInformation("DB size: {Total} across {Count} tables",
            size.TotalSizeFormatted, size.TableSizes.Count);
    }
}
```

## API

### Index Maintenance

| Method | Description |
|--------|-------------|
| `GetFragmentedIndexesAsync()` | Query `sys.dm_db_index_physical_stats` for fragmented indexes above thresholds |
| `MaintainIndexesAsync()` | Rebuild/reorganize all fragmented indexes + refresh statistics |
| `RebuildIndexAsync(schema, table, index)` | `ALTER INDEX ... REBUILD` for a specific index |
| `ReorganizeIndexAsync(schema, table, index)` | `ALTER INDEX ... REORGANIZE` for a specific index |
| `RefreshAllStatisticsAsync()` | `UPDATE STATISTICS` on all user tables |

### Integrity Checks

| Method | Description |
|--------|-------------|
| `CheckDatabaseIntegrityAsync()` | `DBCC CHECKDB WITH NO_INFOMSGS, TABLERESULTS` |
| `CheckTableIntegrityAsync(tableName)` | `DBCC CHECKTABLE` for a specific table |

### Size Monitoring

| Method | Description |
|--------|-------------|
| `GetDatabaseSizeInfoAsync()` | Database size (data + log files) and per-table sizes |
| `GetTableSizesAsync()` | Row counts and storage per table |

## Dependencies

| Package | Purpose |
|---------|---------|
| `SplatDev.Database` | Base database abstraction library |
| `Microsoft.Data.SqlClient` | MSSQL ADO.NET provider |

---

**SplatDev.Database.MSSQLAdmin** — part of the [SplatDev.Umbraco.Plugins](https://github.com/SplatDev-Ltda/SplatDev.Umbraco.Plugins) suite. Licensed under MIT. © SplatDev Ltda.
