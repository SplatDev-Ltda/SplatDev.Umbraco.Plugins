namespace SplatDev.Database.MSSQLAdmin.Models;

public sealed class TableSizeInfo
{
    public string SchemaName { get; set; } = string.Empty;

    public string TableName { get; set; } = string.Empty;

    public long RowCount { get; set; }

    public long DataSizeBytes { get; set; }

    public long IndexSizeBytes { get; set; }

    public long TotalSizeBytes { get; set; }

    public string DataSizeFormatted { get; set; } = string.Empty;

    public string IndexSizeFormatted { get; set; } = string.Empty;

    public string TotalSizeFormatted { get; set; } = string.Empty;
}
