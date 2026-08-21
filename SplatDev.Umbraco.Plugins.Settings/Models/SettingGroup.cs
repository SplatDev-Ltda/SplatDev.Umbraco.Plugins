namespace SplatDev.Umbraco.Plugins.Settings.Models
{
    public class SettingGroup
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Alias { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int SortOrder { get; set; }

        public ICollection<SiteSetting> Settings { get; set; } = new List<SiteSetting>();
    }
}
