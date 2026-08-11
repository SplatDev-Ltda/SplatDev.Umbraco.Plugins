using Microsoft.Extensions.Logging;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core.Models;
using SplatDev.Umbraco.Plugins.Schema2Yaml.Models;

namespace SplatDev.Umbraco.Plugins.Schema2Yaml.Services;

/// <summary>
/// Exports Umbraco DocumentTypes to YAML format.
/// </summary>
public class DocumentTypeExporter
{
    private readonly IContentTypeService _contentTypeService;
    private readonly IDataTypeService _dataTypeService;
    private readonly ILogger<DocumentTypeExporter> _logger;

    public DocumentTypeExporter(
        IContentTypeService contentTypeService,
        IDataTypeService dataTypeService,
        ILogger<DocumentTypeExporter> logger)
    {
        _contentTypeService = contentTypeService ?? throw new ArgumentNullException(nameof(contentTypeService));
        _dataTypeService = dataTypeService ?? throw new ArgumentNullException(nameof(dataTypeService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <summary>
    /// Exports all DocumentTypes from Umbraco.
    /// </summary>
    public async Task<List<ExportDocumentType>> ExportAsync()
    {
        _logger.LogInformation("Starting DocumentType export");

        var contentTypes = _contentTypeService.GetAll();
        var exported = new List<ExportDocumentType>();

        foreach (var contentType in contentTypes)
        {
            try
            {
                var export = new ExportDocumentType
                {
                    Alias = contentType.Alias,
                    Name = contentType.Name ?? string.Empty,
                    Icon = contentType.Icon,
                    IsElement = contentType.IsElement,
                    AllowAsRoot = contentType.AllowedAsRoot,
                    AllowedChildTypes = contentType.AllowedContentTypes?
                        .Select(x => x.Alias)
                        .ToList() ?? [],
                    Compositions = contentType.ContentTypeComposition
                        .Where(c => c.Id != contentType.Id)
                        .Select(c => c.Alias)
                        .ToList(),
                    AllowedTemplates = contentType.AllowedTemplates?
                        .Select(t => t.Alias)
                        .ToList() ?? [],
                    DefaultTemplate = contentType.DefaultTemplate?.Alias,
                    Tabs = await ExportTabsAsync(contentType)
                };

                exported.Add(export);
                _logger.LogDebug("Exported DocumentType: {Name} ({Alias})", export.Name, export.Alias);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to export DocumentType: {Name}", contentType.Name);
            }
        }

        _logger.LogInformation("Exported {Count} DocumentTypes", exported.Count);
        return exported;
    }

    /// <summary>
    /// Exports DocumentTypes filtered by a CategorySelection.
    /// </summary>
    public virtual async Task<List<ExportDocumentType>> ExportAsync(CategorySelection filter)
    {
        if (!filter.IncludeAll && filter.Aliases.Count == 0)
            return [];
        var all = await ExportAsync();
        if (filter.IncludeAll) return all;
        return all.Where(x => filter.Aliases.Contains(x.Alias)).ToList();
    }

    private async Task<List<ExportTab>> ExportTabsAsync(IContentType contentType)
    {
        var tabs = new List<ExportTab>();

        foreach (var group in contentType.PropertyGroups.OrderBy(g => g.SortOrder))
        {
            var tab = new ExportTab
            {
                Name = group.Name ?? string.Empty,
                SortOrder = group.SortOrder,
                Properties = await ExportPropertiesAsync(group.PropertyTypes ?? Enumerable.Empty<IPropertyType>())
            };

            tabs.Add(tab);
        }

        var genericProperties = contentType.PropertyTypes
            .Where(p => string.IsNullOrEmpty(p.PropertyGroupId?.ToString()))
            .ToList();

        if (genericProperties.Any())
        {
            tabs.Add(new ExportTab
            {
                Name = "Generic",
                SortOrder = 999,
                Properties = await ExportPropertiesAsync(genericProperties)
            });
        }

        return tabs;
    }

    private async Task<List<ExportProperty>> ExportPropertiesAsync(IEnumerable<IPropertyType> propertyTypes)
    {
        var properties = new List<ExportProperty>();

        foreach (var prop in propertyTypes.OrderBy(p => p.SortOrder))
        {
            try
            {
#if NET8_0
                var dataType = _dataTypeService.GetDataType(prop.DataTypeKey);
                await Task.CompletedTask;
#else
                var dataType = await _dataTypeService.GetAsync(prop.DataTypeKey);
#endif
                var dataTypeName = dataType?.Name ?? "Unknown";

                var exportProp = new ExportProperty
                {
                    Alias = prop.Alias,
                    Name = prop.Name,
                    DataType = dataTypeName,
                    Required = prop.Mandatory,
                    Description = prop.Description,
                    SortOrder = prop.SortOrder
                };

                properties.Add(exportProp);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to export property: {Alias}", prop.Alias);
            }
        }

        return properties;
    }
}
