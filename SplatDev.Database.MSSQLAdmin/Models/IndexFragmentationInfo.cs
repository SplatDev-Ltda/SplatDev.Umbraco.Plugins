namespace SplatDev.Database.MSSQLAdmin.Models;

public sealed class IndexFragmentationInfo
{
    public string SchemaName { get; set; } = string.Empty;

    public string TableName { get; set; } = string.Empty;

    public string IndexName { get; set; } = string.Empty;

    public float FragmentationPercent { get; set; }

    public int PageCount { get; set; }

    public string RecommendedAction { get; set; } = string.Empty;
}
