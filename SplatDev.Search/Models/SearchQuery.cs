namespace SplatDev.Search;

public sealed class SearchQuery
{
    public string? Text { get; private set; }

    public List<FilterClause> Filters { get; } = [];

    public List<SortClause> Sort { get; } = [];

    public int From { get; private set; }

    public int Size { get; private set; } = 20;

    public List<string> Fields { get; } = [];

    public HighlightOptions? Highlight { get; private set; }

    public RefreshPolicy Refresh { get; private set; } = RefreshPolicy.None;

    public SearchQuery WithText(string text)
    {
        Text = text;
        return this;
    }

    public SearchQuery Where(string field)
    {
        Filters.Add(new FilterClause { Field = field });
        return this;
    }

    public SearchQuery Eq(object value)
    {
        if (Filters.Count > 0)
        {
            Filters[^1] = Filters[^1] with { Op = FieldOp.Eq, Value = value };
        }

        return this;
    }

    public SearchQuery Neq(object value)
    {
        if (Filters.Count > 0)
        {
            Filters[^1] = Filters[^1] with { Op = FieldOp.Neq, Value = value };
        }

        return this;
    }

    public SearchQuery In(IEnumerable<object> values)
    {
        if (Filters.Count > 0)
        {
            Filters[^1] = Filters[^1] with { Op = FieldOp.In, Values = values };
        }

        return this;
    }

    public SearchQuery Range(object from, object to)
    {
        if (Filters.Count > 0)
        {
            Filters[^1] = Filters[^1] with { Op = FieldOp.Range, Value = from, To = to };
        }

        return this;
    }

    public SearchQuery Exists()
    {
        if (Filters.Count > 0)
        {
            Filters[^1] = Filters[^1] with { Op = FieldOp.Exists };
        }

        return this;
    }

    public SearchQuery AddFilter(FilterClause filter)
    {
        Filters.Add(filter);
        return this;
    }

    public SearchQuery OrderBy(string field, SortDirection direction = SortDirection.Asc)
    {
        Sort.Add(new SortClause(field, direction));
        return this;
    }

    public SearchQuery Page(int page, int size)
    {
        From = page * size;
        Size = size;
        return this;
    }

    public SearchQuery WithFields(params string[] fields)
    {
        Fields.AddRange(fields);
        return this;
    }

    public SearchQuery WithHighlight(HighlightOptions? highlight)
    {
        Highlight = highlight;
        return this;
    }

    public SearchQuery WithRefresh(RefreshPolicy refresh)
    {
        Refresh = refresh;
        return this;
    }
}

public sealed record FilterClause
{
    public string Field { get; init; } = string.Empty;

    public FieldOp Op { get; init; } = FieldOp.Eq;

    public object? Value { get; init; }

    public object? To { get; init; }

    public IEnumerable<object>? Values { get; init; }
}

public sealed record SortClause(string Field, SortDirection Direction = SortDirection.Asc);

public enum SortDirection
{
    Asc = 0,
    Ascending = 0,
    Desc = 1,
    Descending = 1,
}
