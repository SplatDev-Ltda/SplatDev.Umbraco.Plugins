using System.ComponentModel.DataAnnotations;

namespace SplatDev.Umbraco.Plugins.PdfCurator.Entities;

public class MemberProgress
{
    [Key]
    public int Id { get; set; }

    public Guid MemberKey { get; set; }

    public int BookId { get; set; }

    public int Page { get; set; }

    public int PageCount { get; set; }

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
