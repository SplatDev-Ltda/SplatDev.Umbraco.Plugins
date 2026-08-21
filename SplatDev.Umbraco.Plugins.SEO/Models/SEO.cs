namespace SplatDev.Umbraco.Plugins.SEO.Models
{
    public class SEO
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public IEnumerable<string> Tags { get; set; } = [];
        public string Canonical { get; set; } = string.Empty;
        public string Robots { get; set; } = string.Empty;
        public string Charset { get; set; } = string.Empty;
    }
}