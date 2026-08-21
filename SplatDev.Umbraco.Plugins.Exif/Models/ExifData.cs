namespace SplatDev.Umbraco.Plugins.Exif.Models;

public class ExifData
{
    public string? Camera { get; set; }
    public string? Lens { get; set; }
    public string? DateTaken { get; set; }
    public string? ExposureTime { get; set; }
    public string? FNumber { get; set; }
    public string? Iso { get; set; }
    public string? GpsLatitude { get; set; }
    public string? GpsLongitude { get; set; }
    public int? Width { get; set; }
    public int? Height { get; set; }
}
