using Xunit;

namespace SplatDev.Tests.Search;

public class SearchQueryTests
{
    [Fact]
    public void FluentBuilder_TextFilterSortPage_BuildsCorrectly()
    {
        var query = new SplatDev.Search.SearchQuery()
            .WithText("running shoes")
            .Where("brand")
            .Eq("adidas")
            .OrderBy("rating", SplatDev.Search.SortDirection.Desc)
            .Page(1, 10);

        Assert.Equal("running shoes", query.Text);
        Assert.Single(query.Filters);
        Assert.Equal("brand", query.Filters[0].Field);
        Assert.Equal(SplatDev.Search.FieldOp.Eq, query.Filters[0].Op);
        Assert.Equal("adidas", query.Filters[0].Value);
        Assert.Single(query.Sort);
        Assert.Equal("rating", query.Sort[0].Field);
        Assert.Equal(SplatDev.Search.SortDirection.Desc, query.Sort[0].Direction);
        Assert.Equal(10, query.From);
        Assert.Equal(10, query.Size);
    }

    [Fact]
    public void Where_Neq_BuildsNotEqualFilter()
    {
        var query = new SplatDev.Search.SearchQuery()
            .Where("status")
            .Neq("deleted");

        Assert.Equal(SplatDev.Search.FieldOp.Neq, query.Filters[0].Op);
        Assert.Equal("deleted", query.Filters[0].Value);
    }

    [Fact]
    public void Where_In_BuildsInFilter()
    {
        var query = new SplatDev.Search.SearchQuery()
            .Where("category")
            .In(["books", "movies"]);

        Assert.Equal(SplatDev.Search.FieldOp.In, query.Filters[0].Op);
        Assert.NotNull(query.Filters[0].Values);
    }

    [Fact]
    public void Where_Range_BuildsRangeFilter()
    {
        var query = new SplatDev.Search.SearchQuery()
            .Where("price")
            .Range(10, 100);

        Assert.Equal(SplatDev.Search.FieldOp.Range, query.Filters[0].Op);
        Assert.Equal(10, query.Filters[0].Value);
        Assert.Equal(100, query.Filters[0].To);
    }

    [Fact]
    public void Where_Exists_BuildsExistsFilter()
    {
        var query = new SplatDev.Search.SearchQuery()
            .Where("description")
            .Exists();

        Assert.Equal(SplatDev.Search.FieldOp.Exists, query.Filters[0].Op);
    }

    [Fact]
    public void WithHighlight_SetsHighlightOptions()
    {
        var query = new SplatDev.Search.SearchQuery()
            .WithText("test")
            .WithHighlight(new SplatDev.Search.HighlightOptions
            {
                Fields = ["name", "desc"],
                PreTag = "<b>",
                PostTag = "</b>",
            });

        Assert.NotNull(query.Highlight);
        Assert.Equal(2, query.Highlight.Fields.Count);
        Assert.Equal("<b>", query.Highlight.PreTag);
    }

    [Fact]
    public void WithRefresh_SetsRefreshPolicy()
    {
        var query = new SplatDev.Search.SearchQuery()
            .WithRefresh(SplatDev.Search.RefreshPolicy.WaitFor);

        Assert.Equal(SplatDev.Search.RefreshPolicy.WaitFor, query.Refresh);
    }

    [Fact]
    public void DefaultValues_AreSensible()
    {
        var query = new SplatDev.Search.SearchQuery();

        Assert.Null(query.Text);
        Assert.Empty(query.Filters);
        Assert.Empty(query.Sort);
        Assert.Equal(0, query.From);
        Assert.Equal(20, query.Size);
        Assert.Equal(SplatDev.Search.RefreshPolicy.None, query.Refresh);
    }
}

public class IndexDefinitionTests
{
    private sealed class TestProduct
    {
        [SplatDev.Search.SearchField(Type = SplatDev.Search.FieldType.Keyword)]
        public string Id { get; set; } = string.Empty;

        [SplatDev.Search.SearchField(Type = SplatDev.Search.FieldType.Text, Analyzer = "standard")]
        public string Name { get; set; } = string.Empty;

        [SplatDev.Search.SearchField(Type = SplatDev.Search.FieldType.Double, Sortable = true, Facetable = true)]
        public double Price { get; set; }

        public string Notes { get; set; } = string.Empty;
    }

    [Fact]
    public void FromType_DerivesNameFromClassName()
    {
        var def = SplatDev.Search.IndexDefinition.FromType<TestProduct>();

        Assert.Equal("testproduct", def.Name);
    }

    [Fact]
    public void FromType_DerivesFieldsFromProperties()
    {
        var def = SplatDev.Search.IndexDefinition.FromType<TestProduct>();

        Assert.Equal(4, def.Fields.Count);

        var idField = def.Fields.First(f => f.Name == "Id");
        Assert.Equal(SplatDev.Search.FieldType.Keyword, idField.Type);

        var nameField = def.Fields.First(f => f.Name == "Name");
        Assert.Equal(SplatDev.Search.FieldType.Text, nameField.Type);
        Assert.Equal("standard", nameField.Analyzer);

        var priceField = def.Fields.First(f => f.Name == "Price");
        Assert.Equal(SplatDev.Search.FieldType.Double, priceField.Type);
        Assert.True(priceField.Sortable);
        Assert.True(priceField.Facetable);

        var notesField = def.Fields.First(f => f.Name == "Notes");
        Assert.Equal(SplatDev.Search.FieldType.Text, notesField.Type);
        Assert.False(notesField.Sortable);
    }
}

public class SearchOptionsTests
{
    [Fact]
    public void DefaultValues_MatchSpec()
    {
        var options = new SplatDev.Search.SearchOptions();

        Assert.Equal("splatdev", options.IndexPrefix);
        Assert.Equal("-", options.KeySeparator);
        Assert.Equal(SplatDev.Search.RefreshPolicy.None, options.DefaultRefresh);
        Assert.False(options.ThrowOnEmptyIndex);
        Assert.Equal(500, options.BulkChunkSize);
    }
}

public class SystemTextJsonSearchSerializerTests
{
    private readonly SplatDev.Search.SystemTextJsonSearchSerializer _serializer = new();

    [Fact]
    public void SerializeDeserialize_RoundTrip_ProducesEqualObject()
    {
        var original = new TestPayload { Id = 42, Name = "search-test" };

        var json = _serializer.Serialize(original);
        var result = _serializer.Deserialize<TestPayload>(json);

        Assert.NotNull(result);
        Assert.Equal(original.Id, result.Id);
        Assert.Equal(original.Name, result.Name);
    }

    [Fact]
    public void Serialize_Null_ReturnsNull()
    {
        var json = _serializer.Serialize<TestPayload>(null);

        Assert.Null(json);
    }

    [Fact]
    public void Deserialize_Null_ReturnsDefault()
    {
        var result = _serializer.Deserialize<TestPayload>(null);

        Assert.Null(result);
    }

    [Fact]
    public void Deserialize_EmptyString_ReturnsDefault()
    {
        var result = _serializer.Deserialize<TestPayload>(string.Empty);

        Assert.Null(result);
    }

    private sealed class TestPayload
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;
    }
}

public class HighlightOptionsTests
{
    [Fact]
    public void DefaultTags_AreHtmlEm()
    {
        var options = new SplatDev.Search.HighlightOptions();

        Assert.Equal("<em>", options.PreTag);
        Assert.Equal("</em>", options.PostTag);
        Assert.Equal(100, options.FragmentSize);
        Assert.Equal(5, options.NumberOfFragments);
    }
}

public class FieldTypeTests
{
    [Fact]
    public void AllValues_AreDefined()
    {
        var values = Enum.GetValues<SplatDev.Search.FieldType>();

        Assert.Contains(SplatDev.Search.FieldType.Text, values);
        Assert.Contains(SplatDev.Search.FieldType.Keyword, values);
        Assert.Contains(SplatDev.Search.FieldType.Long, values);
        Assert.Contains(SplatDev.Search.FieldType.Date, values);
        Assert.Contains(SplatDev.Search.FieldType.GeoPoint, values);
    }
}
