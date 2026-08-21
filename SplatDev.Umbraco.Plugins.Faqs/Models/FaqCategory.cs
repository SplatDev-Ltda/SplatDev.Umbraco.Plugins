using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SplatDev.Umbraco.Plugins.Faqs.Models;

public class FaqCategory
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string Slug { get; set; } = string.Empty;

    public int SortOrder { get; set; } = 0;

    public ICollection<FaqItem> Items { get; set; } = new List<FaqItem>();
}
