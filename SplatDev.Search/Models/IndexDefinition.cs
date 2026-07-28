namespace SplatDev.Search;

public sealed class IndexDefinition
{
    public string Name { get; init; } = string.Empty;

    public List<FieldDefinition> Fields { get; init; } = [];

    public static IndexDefinition FromType<TDoc>() where TDoc : class
    {
        var def = new IndexDefinition { Name = typeof(TDoc).Name.ToLowerInvariant() };

        foreach (var prop in typeof(TDoc).GetProperties())
        {
            var attr = prop.GetCustomAttributes(typeof(SearchFieldAttribute), false)
                .Cast<SearchFieldAttribute>()
                .FirstOrDefault();

            def.Fields.Add(new FieldDefinition
            {
                Name = prop.Name,
                Type = attr?.Type ?? FieldType.Text,
                Analyzer = attr?.Analyzer,
                Sortable = attr?.Sortable ?? false,
                Facetable = attr?.Facetable ?? false,
            });
        }

        return def;
    }
}

public sealed class FieldDefinition
{
    public string Name { get; init; } = string.Empty;

    public FieldType Type { get; init; } = FieldType.Text;

    public string? Analyzer { get; init; }

    public bool Sortable { get; init; }

    public bool Facetable { get; init; }
}
