using Microsoft.Extensions.Logging;
using Umbraco.Cms.Core.Services;
using SplatDev.Umbraco.Plugins.Schema2Yaml.Models;

namespace SplatDev.Umbraco.Plugins.Schema2Yaml.Services;

/// <summary>
/// Exports Umbraco Templates to YAML format.
/// </summary>
public class TemplateExporter
{
    // Templates moved from IFileService to a dedicated ITemplateService in Umbraco 14.
#if NET8_0
    private readonly IFileService _templateService;
#else
    private readonly ITemplateService _templateService;
#endif
    private readonly ILogger<TemplateExporter> _logger;

    public TemplateExporter(
#if NET8_0
        IFileService templateService,
#else
        ITemplateService templateService,
#endif
        ILogger<TemplateExporter> logger)
    {
        _templateService = templateService ?? throw new ArgumentNullException(nameof(templateService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <summary>
    /// Exports all Templates from Umbraco.
    /// </summary>
    public async Task<List<ExportTemplate>> ExportAsync()
    {
        _logger.LogInformation("Starting Template export");

#if NET8_0
        var templates = _templateService.GetTemplates();
        await Task.CompletedTask;
#else
        var templates = await _templateService.GetAllAsync(Array.Empty<string>());
#endif
        var exported = new List<ExportTemplate>();

        foreach (var template in templates)
        {
            try
            {
                var export = new ExportTemplate
                {
                    Alias = template.Alias,
                    Name = template.Name ?? string.Empty,
                    MasterTemplate = template.MasterTemplateAlias,
                    Content = template.Content
                };

                exported.Add(export);
                _logger.LogDebug("Exported Template: {Name} ({Alias})", export.Name, export.Alias);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to export Template: {Name}", template.Name);
            }
        }

        _logger.LogInformation("Exported {Count} Templates", exported.Count);
        return exported;
    }

    /// <summary>
    /// Exports Templates filtered by a CategorySelection.
    /// </summary>
    public virtual async Task<List<ExportTemplate>> ExportAsync(CategorySelection filter)
    {
        if (!filter.IncludeAll && filter.Aliases.Count == 0)
            return [];
        var all = await ExportAsync();
        if (filter.IncludeAll) return all;
        return all.Where(x => filter.Aliases.Contains(x.Alias)).ToList();
    }
}
