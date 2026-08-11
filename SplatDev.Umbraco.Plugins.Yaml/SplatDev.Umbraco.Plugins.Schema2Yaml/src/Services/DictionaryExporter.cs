using Microsoft.Extensions.Logging;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Services;
using SplatDev.Umbraco.Plugins.Schema2Yaml.Models;

namespace SplatDev.Umbraco.Plugins.Schema2Yaml.Services;

/// <summary>
/// Exports Umbraco Dictionary Items to YAML format.
/// </summary>
public class DictionaryExporter
{
    // Umbraco 14 split dictionary items out of ILocalizationService into their own service.
#if NET8_0
    private readonly ILocalizationService _dictionaryItemService;
#else
    private readonly IDictionaryItemService _dictionaryItemService;
#endif
    private readonly ILogger<DictionaryExporter> _logger;

    public DictionaryExporter(
#if NET8_0
        ILocalizationService dictionaryItemService,
#else
        IDictionaryItemService dictionaryItemService,
#endif
        ILogger<DictionaryExporter> logger)
    {
        _dictionaryItemService = dictionaryItemService ?? throw new ArgumentNullException(nameof(dictionaryItemService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <summary>
    /// Exports all Dictionary Items from Umbraco.
    /// </summary>
    public async Task<List<ExportDictionaryItem>> ExportAsync()
    {
        _logger.LogInformation("Starting Dictionary Item export");

#if NET8_0
        var rootItems = _dictionaryItemService.GetRootDictionaryItems();
        await Task.CompletedTask;
#else
        var rootItems = await _dictionaryItemService.GetAtRootAsync();
#endif
        var exported = new List<ExportDictionaryItem>();

        foreach (var item in rootItems)
        {
            await ExportDictionaryItemAsync(item, exported);
        }

        _logger.LogInformation("Exported {Count} Dictionary Items", exported.Count);
        return exported;
    }

    /// <summary>
    /// Exports Dictionary Items filtered by a CategorySelection.
    /// </summary>
    public virtual async Task<List<ExportDictionaryItem>> ExportAsync(CategorySelection filter)
    {
        if (!filter.IncludeAll && filter.Aliases.Count == 0)
            return [];
        var all = await ExportAsync();
        if (filter.IncludeAll) return all;
        return all.Where(x => filter.Aliases.Contains(x.Key)).ToList();
    }

    /// <summary>
    /// Recursively exports a dictionary item and its children.
    /// </summary>
    private async Task ExportDictionaryItemAsync(IDictionaryItem item, List<ExportDictionaryItem> exported)
    {
        try
        {
            var translations = new Dictionary<string, string>();

            foreach (var translation in item.Translations)
            {
                if (!string.IsNullOrEmpty(translation.LanguageIsoCode))
                {
                    translations[translation.LanguageIsoCode] = translation.Value ?? string.Empty;
                }
            }

            var export = new ExportDictionaryItem
            {
                Key = item.ItemKey,
                Translations = translations
            };

            exported.Add(export);
            _logger.LogDebug("Exported Dictionary Item: {Key}", export.Key);

#if NET8_0
            var children = _dictionaryItemService.GetDictionaryItemChildren(item.Key);
#else
            var children = await _dictionaryItemService.GetChildrenAsync(item.Key);
#endif
            foreach (var child in children)
            {
                await ExportDictionaryItemAsync(child, exported);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to export Dictionary Item: {Key}", item.ItemKey);
        }
    }
}
