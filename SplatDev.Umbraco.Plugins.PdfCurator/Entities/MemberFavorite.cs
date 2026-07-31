using System.ComponentModel.DataAnnotations;

namespace SplatDev.Umbraco.Plugins.PdfCurator.Entities;

public class MemberFavorite
{
    [Key]
    public int Id { get; set; }

    public Guid MemberKey { get; set; }

    public int BookId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
