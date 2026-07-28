using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Logging;
using SplatDev.Database.MSSQLAdmin.Models;

namespace SplatDev.Database.MSSQLAdmin;

public sealed class MssqlAdminService
{
    private readonly MssqlAdminOptions _options;
    private readonly ILogger<MssqlAdminService> _logger;

    public MssqlAdminService(MssqlAdminOptions options, ILogger<MssqlAdminService> logger)
    {
        _options = options;
        _logger = logger;
    }

    public async Task<List<IndexFragmentationInfo>> GetFragmentedIndexesAsync(
        CancellationToken cancellationToken = default)
    {
        var results = new List<IndexFragmentationInfo>();

        const string sql = """
            SELECT
                s.name AS SchemaName,
                t.name AS TableName,
                i.name AS IndexName,
                ips.avg_fragmentation_in_percent AS FragmentationPercent,
                ips.page_count AS PageCount,
                CASE
                    WHEN ips.avg_fragmentation_in_percent >= @RebuildThreshold THEN 'REBUILD'
                    WHEN ips.avg_fragmentation_in_percent >= @ReorganizeThreshold THEN 'REORGANIZE'
                    ELSE 'NONE'
                END AS RecommendedAction
            FROM sys.dm_db_index_physical_stats(DB_ID(), NULL, NULL, NULL, 'LIMITED') ips
            INNER JOIN sys.tables t ON ips.object_id = t.object_id
            INNER JOIN sys.schemas s ON t.schema_id = s.schema_id
            INNER JOIN sys.indexes i ON ips.object_id = i.object_id AND ips.index_id = i.index_id
            WHERE ips.database_id = DB_ID()
              AND i.name IS NOT NULL
              AND ips.page_count > 100
            ORDER BY ips.avg_fragmentation_in_percent DESC;
            """;

        await using var connection = new SqlConnection(_options.ConnectionString);
        await connection.OpenAsync(cancellationToken);

        await using var command = new SqlCommand(sql, connection);
        command.Parameters.AddWithValue("@RebuildThreshold", _options.RebuildThresholdPercent);
        command.Parameters.AddWithValue("@ReorganizeThreshold", _options.ReorganizeThresholdPercent);

        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        while (await reader.ReadAsync(cancellationToken))
        {
            results.Add(new IndexFragmentationInfo
            {
                SchemaName = reader.GetString(0),
                TableName = reader.GetString(1),
                IndexName = reader.GetString(2),
                FragmentationPercent = (float)reader.GetDouble(3),
                PageCount = reader.GetInt32(4),
                RecommendedAction = reader.GetString(5),
            });
        }

        _logger.LogInformation(
            "Fragmentation scan complete: {Count} indexes exceed thresholds (rebuild={Rebuild}, reorganize={Reorg})",
            results.Count,
            _options.RebuildThresholdPercent,
            _options.ReorganizeThresholdPercent);

        return results;
    }

    public async Task<IndexMaintenanceResult> MaintainIndexesAsync(
        CancellationToken cancellationToken = default)
    {
        var result = new IndexMaintenanceResult();

        try
        {
            var fragmentedIndexes = await GetFragmentedIndexesAsync(cancellationToken);

            foreach (var idx in fragmentedIndexes)
            {
                if (idx.RecommendedAction == "REBUILD")
                {
                    await RebuildIndexAsync(idx.SchemaName, idx.TableName, idx.IndexName, cancellationToken);
                    result.RebuiltCount++;
                    result.Details[$"{idx.SchemaName}.{idx.TableName}.{idx.IndexName}"] = "REBUILD";
                }
                else if (idx.RecommendedAction == "REORGANIZE")
                {
                    await ReorganizeIndexAsync(idx.SchemaName, idx.TableName, idx.IndexName, cancellationToken);
                    result.ReorganizedCount++;
                    result.Details[$"{idx.SchemaName}.{idx.TableName}.{idx.IndexName}"] = "REORGANIZE";
                }
            }

            var statsCount = await RefreshAllStatisticsAsync(cancellationToken);
            result.StatisticsRefreshedCount = statsCount;
            result.Success = true;

            _logger.LogInformation(
                "Index maintenance complete: {Rebuilt} rebuilt, {Reorganized} reorganized, {Stats} statistics refreshed",
                result.RebuiltCount,
                result.ReorganizedCount,
                result.StatisticsRefreshedCount);
        }
        catch (Exception ex)
        {
            result.Success = false;
            result.Error = ex.Message;
            _logger.LogError(ex, "Index maintenance failed");
        }

        return result;
    }

    public async Task RebuildIndexAsync(
        string schemaName,
        string tableName,
        string indexName,
        CancellationToken cancellationToken = default)
    {
        var sql = $"ALTER INDEX [{indexName}] ON [{schemaName}].[{tableName}] REBUILD";
        await ExecuteNonQueryAsync(sql, cancellationToken);
        _logger.LogInformation("Index rebuilt: {Schema}.{Table}.{Index}", schemaName, tableName, indexName);
    }

    public async Task ReorganizeIndexAsync(
        string schemaName,
        string tableName,
        string indexName,
        CancellationToken cancellationToken = default)
    {
        var sql = $"ALTER INDEX [{indexName}] ON [{schemaName}].[{tableName}] REORGANIZE";
        await ExecuteNonQueryAsync(sql, cancellationToken);
        _logger.LogInformation("Index reorganized: {Schema}.{Table}.{Index}", schemaName, tableName, indexName);
    }

    public async Task<int> RefreshAllStatisticsAsync(CancellationToken cancellationToken = default)
    {
        const string sql = """
            DECLARE @sql NVARCHAR(MAX) = '';
            SELECT @sql += 'UPDATE STATISTICS [' + s.name + '].[' + t.name + '];'
            FROM sys.tables t
            INNER JOIN sys.schemas s ON t.schema_id = s.schema_id;
            IF @sql <> '' EXEC sp_executesql @sql;
            """;

        var count = await CountTablesAsync(cancellationToken);
        await ExecuteNonQueryAsync(sql, cancellationToken);
        _logger.LogInformation("Statistics refreshed on {Count} tables", count);
        return count;
    }

    public async Task<IntegrityCheckResult> CheckDatabaseIntegrityAsync(
        CancellationToken cancellationToken = default)
    {
        var result = new IntegrityCheckResult();

        try
        {
            const string sql = "DBCC CHECKDB WITH NO_INFOMSGS, TABLERESULTS";

            await using var connection = new SqlConnection(_options.ConnectionString);
            await connection.OpenAsync(cancellationToken);
            await using var command = new SqlCommand(sql, connection);
            command.CommandTimeout = 300;

            await using var reader = await command.ExecuteReaderAsync(cancellationToken);
            while (await reader.ReadAsync(cancellationToken))
            {
                var row = new IntegrityCheckRow();
                try { row.Error = reader.IsDBNull(0) ? null : reader.GetString(0); } catch { }
                try { row.Level = reader.IsDBNull(1) ? null : reader.GetInt32(1); } catch { }
                try { row.State = reader.IsDBNull(2) ? null : reader.GetInt32(2); } catch { }
                try { row.MessageText = reader.IsDBNull(3) ? null : reader.GetString(3); } catch { }
                try { row.RepairLevel = reader.IsDBNull(4) ? null : reader.GetString(4); } catch { }
                try { row.Status = reader.IsDBNull(5) ? null : reader.GetInt32(5); } catch { }
                try { row.DbId = reader.IsDBNull(6) ? null : reader.GetInt32(6); } catch { }
                try { row.DbFragId = reader.IsDBNull(7) ? null : reader.GetString(7); } catch { }
                try { row.ObjectId = reader.IsDBNull(8) ? null : reader.GetInt32(8); } catch { }
                try { row.IndexId = reader.IsDBNull(9) ? null : reader.GetInt32(9); } catch { }
                try { row.PartitionId = reader.IsDBNull(10) ? null : reader.GetInt32(10); } catch { }
                try { row.AllocUnitId = reader.IsDBNull(11) ? null : reader.GetInt32(11); } catch { }
                try { row.RidDbId = reader.IsDBNull(12) ? null : reader.GetInt32(12); } catch { }
                try { row.RidPruId = reader.IsDBNull(13) ? null : reader.GetInt32(13); } catch { }
                try { row.File = reader.IsDBNull(14) ? null : reader.GetInt32(14); } catch { }
                try { row.Page = reader.IsDBNull(15) ? null : reader.GetInt32(15); } catch { }
                try { row.Slot = reader.IsDBNull(16) ? null : reader.GetInt32(16); } catch { }
                try { row.RefDbId = reader.IsDBNull(17) ? null : reader.GetInt32(17); } catch { }
                try { row.RefPruId = reader.IsDBNull(18) ? null : reader.GetInt32(18); } catch { }
                try { row.RefFile = reader.IsDBNull(19) ? null : reader.GetInt32(19); } catch { }
                try { row.RefPage = reader.IsDBNull(20) ? null : reader.GetInt32(20); } catch { }
                try { row.RefSlot = reader.IsDBNull(21) ? null : reader.GetInt32(21); } catch { }
                try { row.Allocation = reader.IsDBNull(22) ? null : reader.GetInt32(22); } catch { }
                result.Rows.Add(row);
            }

            result.Success = true;
            result.AllChecksPassed = result.Rows.All(r =>
                r.MessageText?.Contains("CHECKDB found 0 allocation errors and 0 consistency errors") == true ||
                r.Level == null);

            result.ErrorCount = result.Rows.Count(r => r.Level > 10);

            _logger.LogInformation(
                "DBCC CHECKDB complete: {Passed}, {ErrorCount} errors, {RowCount} rows",
                result.AllChecksPassed ? "PASSED" : "FAILED",
                result.ErrorCount,
                result.Rows.Count);
        }
        catch (Exception ex)
        {
            result.Success = false;
            result.ErrorCount = 0;
            _logger.LogError(ex, "DBCC CHECKDB failed");
        }

        return result;
    }

    public async Task<IntegrityCheckResult> CheckTableIntegrityAsync(
        string tableName,
        CancellationToken cancellationToken = default)
    {
        var result = new IntegrityCheckResult();

        try
        {
            var sql = $"DBCC CHECKTABLE ('[{tableName}]') WITH NO_INFOMSGS, TABLERESULTS";

            await using var connection = new SqlConnection(_options.ConnectionString);
            await connection.OpenAsync(cancellationToken);
            await using var command = new SqlCommand(sql, connection);
            command.CommandTimeout = 120;

            await using var reader = await command.ExecuteReaderAsync(cancellationToken);
            while (await reader.ReadAsync(cancellationToken))
            {
                var row = new IntegrityCheckRow();
                try { row.Error = reader.IsDBNull(0) ? null : reader.GetString(0); } catch { }
                try { row.Level = reader.IsDBNull(1) ? null : reader.GetInt32(1); } catch { }
                try { row.State = reader.IsDBNull(2) ? null : reader.GetInt32(2); } catch { }
                try { row.MessageText = reader.IsDBNull(3) ? null : reader.GetString(3); } catch { }
                try { row.RepairLevel = reader.IsDBNull(4) ? null : reader.GetString(4); } catch { }
                try { row.Status = reader.IsDBNull(5) ? null : reader.GetInt32(5); } catch { }
                result.Rows.Add(row);
            }

            result.Success = true;
            result.AllChecksPassed = result.Rows.All(r =>
                r.MessageText?.Contains("0 allocation errors and 0 consistency errors") == true ||
                r.Level == null);

            result.ErrorCount = result.Rows.Count(r => r.Level > 10);

            _logger.LogInformation("DBCC CHECKTABLE ({Table}) complete: {Passed}", tableName,
                result.AllChecksPassed ? "PASSED" : "FAILED");
        }
        catch (Exception ex)
        {
            result.Success = false;
            _logger.LogError(ex, "DBCC CHECKTABLE ({Table}) failed", tableName);
        }

        return result;
    }

    public async Task<DatabaseSizeInfo> GetDatabaseSizeInfoAsync(
        CancellationToken cancellationToken = default)
    {
        var info = new DatabaseSizeInfo();

        try
        {
            await using var connection = new SqlConnection(_options.ConnectionString);
            await connection.OpenAsync(cancellationToken);

            info.DatabaseName = connection.Database;

            const string fileSql = """
                SELECT
                    type_desc,
                    SUM(size) * 8 * 1024 AS SizeBytes,
                    COUNT(*) AS FileCount
                FROM sys.database_files
                GROUP BY type_desc;
                """;

            await using (var cmd = new SqlCommand(fileSql, connection))
            await using (var reader = await cmd.ExecuteReaderAsync(cancellationToken))
            {
                while (await reader.ReadAsync(cancellationToken))
                {
                    var type = reader.GetString(0);
                    var size = reader.GetInt64(1);
                    var count = reader.GetInt32(2);

                    if (type == "ROWS")
                    {
                        info.DataSizeBytes = size;
                        info.DataFiles = count;
                    }
                    else if (type == "LOG")
                    {
                        info.LogSizeBytes = size;
                        info.LogFiles = count;
                    }
                }
            }

            info.TotalSizeBytes = info.DataSizeBytes + info.LogSizeBytes;
            info.DataSizeFormatted = FormatBytes(info.DataSizeBytes);
            info.LogSizeFormatted = FormatBytes(info.LogSizeBytes);
            info.TotalSizeFormatted = FormatBytes(info.TotalSizeBytes);

            info.TableSizes = await GetTableSizesAsync(connection, cancellationToken);

            _logger.LogInformation(
                "Database size: {Total} (data={Data}, log={Log}, {TableCount} tables)",
                info.TotalSizeFormatted,
                info.DataSizeFormatted,
                info.LogSizeFormatted,
                info.TableSizes.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve database size information");
            throw;
        }

        return info;
    }

    public async Task<List<TableSizeInfo>> GetTableSizesAsync(
        CancellationToken cancellationToken = default)
    {
        await using var connection = new SqlConnection(_options.ConnectionString);
        await connection.OpenAsync(cancellationToken);
        return await GetTableSizesAsync(connection, cancellationToken);
    }

    private static async Task<List<TableSizeInfo>> GetTableSizesAsync(
        SqlConnection connection,
        CancellationToken cancellationToken)
    {
        var results = new List<TableSizeInfo>();

        const string sql = """
            SELECT
                s.name AS SchemaName,
                t.name AS TableName,
                SUM(p.rows) AS RowCount,
                SUM(COALESCE(au.total_pages, 0)) * 8 * 1024 AS TotalSizeBytes,
                SUM(COALESCE(au.used_pages, 0)) * 8 * 1024 AS UsedSizeBytes,
                SUM(COALESCE(au.total_pages, 0) - COALESCE(au.used_pages, 0)) * 8 * 1024 AS UnusedSizeBytes
            FROM sys.tables t
            INNER JOIN sys.schemas s ON t.schema_id = s.schema_id
            INNER JOIN sys.indexes i ON t.object_id = i.object_id
            INNER JOIN sys.partitions p ON i.object_id = p.object_id AND i.index_id = p.index_id
            LEFT JOIN sys.allocation_units au ON p.hobt_id = au.container_id
            GROUP BY s.name, t.name
            ORDER BY SUM(COALESCE(au.total_pages, 0)) DESC;
            """;

        await using var cmd = new SqlCommand(sql, connection);
        await using var reader = await cmd.ExecuteReaderAsync(cancellationToken);
        while (await reader.ReadAsync(cancellationToken))
        {
            var dataSize = reader.GetInt64(4);
            var unusedSize = reader.GetInt64(5);
            var totalSize = reader.GetInt64(3);

            results.Add(new TableSizeInfo
            {
                SchemaName = reader.GetString(0),
                TableName = reader.GetString(1),
                RowCount = reader.GetInt64(2),
                TotalSizeBytes = totalSize,
                DataSizeBytes = dataSize,
                IndexSizeBytes = unusedSize,
                DataSizeFormatted = FormatBytes(dataSize),
                IndexSizeFormatted = FormatBytes(unusedSize),
                TotalSizeFormatted = FormatBytes(totalSize),
            });
        }

        return results;
    }

    private static string FormatBytes(long bytes)
    {
        string[] sizes = ["B", "KB", "MB", "GB", "TB"];
        double len = bytes;
        var order = 0;
        while (len >= 1024 && order < sizes.Length - 1)
        {
            order++;
            len /= 1024;
        }

        return $"{len:F2} {sizes[order]}";
    }

    private async Task ExecuteNonQueryAsync(string sql, CancellationToken cancellationToken)
    {
        await using var connection = new SqlConnection(_options.ConnectionString);
        await connection.OpenAsync(cancellationToken);
        await using var command = new SqlCommand(sql, connection);
        command.CommandTimeout = 300;
        await command.ExecuteNonQueryAsync(cancellationToken);
    }

    private async Task<int> CountTablesAsync(CancellationToken cancellationToken)
    {
        const string sql = "SELECT COUNT(*) FROM sys.tables";

        await using var connection = new SqlConnection(_options.ConnectionString);
        await connection.OpenAsync(cancellationToken);
        await using var command = new SqlCommand(sql, connection);
        var result = await command.ExecuteScalarAsync(cancellationToken);
        return Convert.ToInt32(result);
    }
}
