namespace SplatDev.Database.MSSQLAdmin.Models;

public sealed class MssqlAdminOptions
{
    public string ConnectionString { get; set; } = string.Empty;

    public bool IndexMaintenanceEnabled { get; set; } = true;

    public bool IntegrityChecksEnabled { get; set; } = true;

    public bool SizeMonitoringEnabled { get; set; } = true;

    public float RebuildThresholdPercent { get; set; } = 30.0f;

    public float ReorganizeThresholdPercent { get; set; } = 10.0f;
}
