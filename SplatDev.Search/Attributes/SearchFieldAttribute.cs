namespace SplatDev.Search;

[AttributeUsage(AttributeTargets.Property, AllowMultiple = false, Inherited = true)]
public sealed class SearchFieldAttribute : Attribute
{
    public FieldType Type { get; set; } = FieldType.Text;

    public string? Analyzer { get; set; }

    public bool Sortable { get; set; }

    public bool Facetable { get; set; }
}
