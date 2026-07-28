namespace SplatDev.Database.MSSQLAdmin.Models;

public sealed class DatabaseSizeInfo
{
    public string DatabaseName { get; set; } = string.Empty;

    public long DataSizeBytes { get; set; }

    public long LogSizeBytes { get; set; }

    public long TotalSizeBytes { get; set; }

    public string DataSizeFormatted { get; set; } = string.Empty;

    public string LogSizeFormatted { get; set; } = string.Empty;

    public string TotalSizeFormatted { get; set; } = string.Empty;

    public int DataFiles { get; set; }

    public int LogFiles { get; set; }

    public List<TableSizeInfo> TableSizes { get; set; } = [];
}
