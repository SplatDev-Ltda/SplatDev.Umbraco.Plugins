namespace SplatDev.Umbraco.Plugins.DictionaryManager.Models;

public class DictionaryItemDto
{
    public string Key { get; set; } = string.Empty;
    public string? ParentKey { get; set; }
    public string Value { get; set; } = string.Empty;
    public string LanguageCode { get; set; } = string.Empty;
    public Dictionary<string, string> Translations { get; set; } = new();
}
