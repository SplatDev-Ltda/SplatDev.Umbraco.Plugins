namespace SplatDev.Umbraco.Plugins.Settings.Models
{
    public class SiteSetting
    {
        public int Id { get; set; }
        public int GroupId { get; set; }
        public string Key { get; set; } = string.Empty;
        public string? Value { get; set; }

        /// <summary>
        /// Allowed values: "text", "boolean", "number", "json"
        /// </summary>
        public string Type { get; set; } = "text";
        public string? Description { get; set; }

        public SettingGroup Group { get; set; } = null!;
    }
}
