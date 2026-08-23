using System.ComponentModel.DataAnnotations;

namespace SplatDev.Umbraco.Plugins.Faqs.Models;

/// <summary>
/// A category as the API returns it.
/// </summary>
/// <remarks>
/// The endpoints returned the entity straight out of EF. The queries Include the items,
/// and every item carries a Category back-reference, so serializing a category with even
/// one item walks Category to Item to Category. An install with no FAQs serialises fine,
/// which is why this was not noticed.
/// </remarks>
public class FaqCategoryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public int ItemCount { get; set; }
    public List<FaqItemDto> Items { get; set; } = new();

    public static FaqCategoryDto From(FaqCategory category) => new()
    {
        Id = category.Id,
        Name = category.Name,
        Slug = category.Slug,
        SortOrder = category.SortOrder,
        ItemCount = category.Items?.Count ?? 0,
        Items = category.Items?
            .OrderBy(i => i.SortOrder)
            .Select(FaqItemDto.From)
            .ToList() ?? new List<FaqItemDto>(),
    };
}

/// <summary>An item, without the back-reference to its category.</summary>
public class FaqItemDto
{
    public int Id { get; set; }
    public int CategoryId { get; set; }
    public string? CategoryName { get; set; }
    public string Question { get; set; } = string.Empty;
    public string Answer { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public bool IsPublished { get; set; }

    public static FaqItemDto From(FaqItem item) => new()
    {
        Id = item.Id,
        CategoryId = item.CategoryId,
        // Only when the query asked for it; reading it here must not trigger a load.
        CategoryName = item.Category?.Name,
        Question = item.Question,
        Answer = item.Answer,
        SortOrder = item.SortOrder,
        IsPublished = item.IsPublished,
    };
}

/// <summary>
/// What a caller sends to create or change an item.
/// </summary>
/// <remarks>
/// Taking <see cref="FaqItem"/> from the body made creating one impossible: its Category
/// navigation property is non-nullable, so model validation demanded it and the endpoint
/// answered
///
///     400 {"Category":["The Category field is required."]}
///
/// for every request. A caller has no business sending a whole category to attach an
/// item to one — the id is what identifies it.
/// </remarks>
public class FaqItemRequest
{
    public int Id { get; set; }

    [Required]
    public int CategoryId { get; set; }

    [Required, MaxLength(1000)]
    public string Question { get; set; } = string.Empty;

    [Required]
    public string Answer { get; set; } = string.Empty;

    public int SortOrder { get; set; }
    public bool IsPublished { get; set; } = true;

    public FaqItem ToEntity() => new()
    {
        Id = Id,
        CategoryId = CategoryId,
        Question = Question,
        Answer = Answer,
        SortOrder = SortOrder,
        IsPublished = IsPublished,
    };
}

/// <summary>What a caller sends to create or rename a category.</summary>
public class FaqCategoryRequest
{
    public int Id { get; set; }

    [Required, MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required, MaxLength(200)]
    public string Slug { get; set; } = string.Empty;

    public int SortOrder { get; set; }

    public FaqCategory ToEntity() => new()
    {
        Id = Id,
        Name = Name,
        Slug = Slug,
        SortOrder = SortOrder,
    };
}
