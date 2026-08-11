using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core.Models;
using SplatDev.Umbraco.Plugins.Schema2Yaml.Models;
using SplatDev.Umbraco.Plugins.Schema2Yaml.Configuration;

namespace SplatDev.Umbraco.Plugins.Schema2Yaml.Services;

/// <summary>
/// Exports Umbraco Content nodes to YAML format.
/// </summary>
public class ContentExporter
{
    private readonly IContentService _contentService;
    // Templates moved from IFileService to ITemplateService in Umbraco 14.
#if NET8_0
    private readonly IFileService _templateService;
#else
    private readonly ITemplateService _templateService;
#endif
    private readonly Schema2YamlOptions _options;
    private readonly ILogger<ContentExporter> _logger;

    public ContentExporter(
        IContentService contentService,
#if NET8_0
        IFileService templateService,
#else
        ITemplateService templateService,
#endif
        IOptions<Schema2YamlOptions> options,
        ILogger<ContentExporter> logger)
    {
        _contentService = contentService ?? throw new ArgumentNullException(nameof(contentService));
        _templateService = templateService ?? throw new ArgumentNullException(nameof(templateService));
        _options = options?.Value ?? throw new ArgumentNullException(nameof(options));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <summary>
    /// Exports all Content nodes from Umbraco.
    /// </summary>
    public async Task<List<ExportContent>> ExportAsync()
    {
        if (!_options.IncludeContent)
        {
            _logger.LogInformation("Content export is disabled in configuration");
            return [];
        }

        _logger.LogInformation("Starting Content export");

        var roots = _contentService.GetRootContent();
        var exported = new List<ExportContent>();

        foreach (var root in roots)
        {
            await ExportNodeAsync(root, exported, 0);
        }

        _logger.LogInformation("Exported {Count} Content nodes", exported.Count);
        return exported;
    }

    /// <summary>
    /// Exports content nodes that match the provided NodeIds filter.
    /// </summary>
    public virtual async Task<List<ExportContent>> ExportAsync(CategorySelection filter)
    {
        if (!filter.IncludeAll && filter.NodeIds.Count == 0)
            return [];

        if (filter.IncludeAll)
            return await ExportAsync();

        _logger.LogInformation("Filtered content export: {Count} node IDs", filter.NodeIds.Count);

        var result = new List<ExportContent>();
        foreach (var root in _contentService.GetRootContent())
            await CollectFilteredContentAsync(root, filter.NodeIds, result);

        return result;
    }

    private async Task CollectFilteredContentAsync(IContent node, List<int> nodeIds, List<ExportContent> result)
    {
        if (nodeIds.Contains(node.Id))
        {
            var temp = new List<ExportContent>();
            await ExportNodeAsync(node, temp, 0);
            if (temp.Count > 0)
                result.Add(temp[0]);
            return;
        }

        foreach (var child in _contentService.GetPagedChildren(node.Id, 0, int.MaxValue, out _))
            await CollectFilteredContentAsync(child, nodeIds, result);
    }

    /// <summary>
    /// Recursively exports a content node and its children.
    /// </summary>
    private async Task ExportNodeAsync(IContent content, List<ExportContent> exported, int depth)
    {
        if (depth >= _options.MaxHierarchyDepth)
        {
            _logger.LogWarning("Max hierarchy depth reached at node: {Name}", content.Name);
            return;
        }

        try
        {
            var export = new ExportContent
            {
                Name = content.Name ?? string.Empty,
                DocumentType = content.ContentType.Alias,
                Template = await GetTemplateNameAsync(content),
                SortOrder = content.SortOrder,
                IsPublished = content.Published,
                Properties = ExportProperties(content),
                Children = []
            };

            exported.Add(export);
            _logger.LogDebug("Exported Content: {Name} ({DocumentType})", export.Name, export.DocumentType);

            var children = _contentService.GetPagedChildren(content.Id, 0, int.MaxValue, out _);
            foreach (var child in children.OrderBy(c => c.SortOrder))
            {
                await ExportNodeAsync(child, export.Children, depth + 1);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to export Content node: {Name}", content.Name);
        }
    }

    private async Task<string?> GetTemplateNameAsync(IContent content)
    {
        if (!content.TemplateId.HasValue)
            return null;

        try
        {
#if NET8_0
            var template = _templateService.GetTemplate(content.TemplateId.Value);
            await Task.CompletedTask;
#else
            var template = await _templateService.GetAsync(content.TemplateId.Value);
#endif
            return template?.Alias;
        }
        catch
        {
            return null;
        }
    }

    private Dictionary<string, object> ExportProperties(IContent content)
    {
        var properties = new Dictionary<string, object>();

        foreach (var property in content.Properties)
        {
            try
            {
                var value = property.GetValue();
                if (value != null)
                {
                    properties[property.Alias] = ConvertPropertyValue(value);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to export property: {Alias} on {ContentName}",
                    property.Alias, content.Name);
            }
        }

        return properties;
    }

    private object ConvertPropertyValue(object value)
    {
        if (value == null)
            return string.Empty;

        return value switch
        {
            string str => str,
            int or long or decimal or double or float => value,
            bool b => b,
            DateTime dt => dt.ToString("yyyy-MM-dd HH:mm:ss"),
            _ => value.ToString() ?? string.Empty
        };
    }
}
