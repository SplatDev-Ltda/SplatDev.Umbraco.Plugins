namespace SplatDev.Database.MSSQLAdmin.Models;

public sealed class IndexMaintenanceResult
{
    public bool Success { get; set; }

    public int RebuiltCount { get; set; }

    public int ReorganizedCount { get; set; }

    public int StatisticsRefreshedCount { get; set; }

    public List<string> Actions { get; set; } = [];

    public string? Error { get; set; }

    public Dictionary<string, string> Details { get; set; } = [];
}
