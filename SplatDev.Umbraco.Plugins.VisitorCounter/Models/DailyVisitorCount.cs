using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SplatDev.Umbraco.Plugins.VisitorCounter.Models;

[Table("VisitorCounter_DailyCount")]
public class DailyVisitorCount
{
    [Key]
    public int Id { get; set; }

    public DateOnly Date { get; set; }

    public long TotalVisits { get; set; }

    public long UniqueVisits { get; set; }
}
