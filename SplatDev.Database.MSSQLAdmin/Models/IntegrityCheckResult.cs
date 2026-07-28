namespace SplatDev.Database.MSSQLAdmin.Models;

public sealed class IntegrityCheckResult
{
    public bool Success { get; set; }

    public bool AllChecksPassed { get; set; }

    public int ErrorCount { get; set; }

    public List<IntegrityCheckRow> Rows { get; set; } = [];

    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}

public sealed class IntegrityCheckRow
{
    public string? Error { get; set; }

    public int? Level { get; set; }

    public int? State { get; set; }

    public string? MessageText { get; set; }

    public string? RepairLevel { get; set; }

    public int? Status { get; set; }

    public int? DbId { get; set; }

    public string? DbFragId { get; set; }

    public int? ObjectId { get; set; }

    public int? IndexId { get; set; }

    public int? PartitionId { get; set; }

    public int? AllocUnitId { get; set; }

    public int? RidDbId { get; set; }

    public int? RidPruId { get; set; }

    public int? File { get; set; }

    public int? Page { get; set; }

    public int? Slot { get; set; }

    public int? RefDbId { get; set; }

    public int? RefPruId { get; set; }

    public int? RefFile { get; set; }

    public int? RefPage { get; set; }

    public int? RefSlot { get; set; }

    public int? Allocation { get; set; }
}
