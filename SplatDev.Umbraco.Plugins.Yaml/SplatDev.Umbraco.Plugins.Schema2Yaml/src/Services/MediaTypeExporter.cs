using Microsoft.Extensions.Logging;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core.Models;
using SplatDev.Umbraco.Plugins.Schema2Yaml.Models;

namespace SplatDev.Umbraco.Plugins.Schema2Yaml.Services;

/// <summary>
/// Exports Umbraco MediaTypes to YAML format.
/// </summary>
public class MediaTypeExporter
{
    private readonly IMediaTypeService _mediaTypeService;
    private readonly IDataTypeService _dataTypeService;
    private readonly ILogger<MediaTypeExporter> _logger;

    public MediaTypeExporter(
        IMediaTypeService mediaTypeService,
        IDataTypeService dataTypeService,
        ILogger<MediaTypeExporter> logger)
    {
        _mediaTypeService = mediaTypeService ?? throw new ArgumentNullException(nameof(mediaTypeService));
        _dataTypeService = dataTypeService ?? throw new ArgumentNullException(nameof(dataTypeService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <summary>
    /// Exports all MediaTypes from Umbraco.
    /// </summary>
    public async Task<List<ExportMediaType>> ExportAsync()
    {
        _logger.LogInformation("Starting MediaType export");

        var mediaTypes = _mediaTypeService.GetAll();
        var exported = new List<ExportMediaType>();

        foreach (var mediaType in mediaTypes)
        {
            try
            {
                var export = new ExportMediaType
                {
                    Alias = mediaType.Alias,
                    Name = mediaType.Name ?? string.Empty,
                    Icon = mediaType.Icon,
                    AllowedAtRoot = mediaType.AllowedAsRoot,
                    Tabs = await ExportTabsAsync(mediaType)
                };

                exported.Add(export);
                _logger.LogDebug("Exported MediaType: {Name} ({Alias})", export.Name, export.Alias);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to export MediaType: {Name}", mediaType.Name);
            }
        }

        _logger.LogInformation("Exported {Count} MediaTypes", exported.Count);
        return exported;
    }

    /// <summary>
    /// Exports MediaTypes filtered by a CategorySelection.
    /// </summary>
    public virtual async Task<List<ExportMediaType>> ExportAsync(CategorySelection filter)
    {
        if (!filter.IncludeAll && filter.Aliases.Count == 0)
            return [];
        var all = await ExportAsync();
        if (filter.IncludeAll) return all;
        return all.Where(x => filter.Aliases.Contains(x.Alias)).ToList();
    }

    private async Task<List<ExportTab>> ExportTabsAsync(IMediaType mediaType)
    {
        var tabs = new List<ExportTab>();

        foreach (var group in mediaType.PropertyGroups.OrderBy(g => g.SortOrder))
        {
            var tab = new ExportTab
            {
                Name = group.Name ?? string.Empty,
                SortOrder = group.SortOrder,
                Properties = await ExportPropertiesAsync(group.PropertyTypes ?? Enumerable.Empty<IPropertyType>())
            };

            tabs.Add(tab);
        }

        var genericProperties = mediaType.PropertyTypes
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
