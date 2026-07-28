using Microsoft.Extensions.Logging;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Services;
using SplatDev.Umbraco.Plugins.Schema2Yaml.Models;
using System.Text.Json;
using System.Text.Json.Nodes;

namespace SplatDev.Umbraco.Plugins.Schema2Yaml.Services;

/// <summary>
/// Exports Umbraco DataTypes to YAML format.
/// </summary>
public class DataTypeExporter
{
    private readonly IDataTypeService _dataTypeService;
    private readonly UmbracoVersionDetector _versionDetector;
    private readonly ILogger<DataTypeExporter> _logger;

    public DataTypeExporter(
        IDataTypeService dataTypeService,
        UmbracoVersionDetector versionDetector,
        ILogger<DataTypeExporter> logger)
    {
        _dataTypeService = dataTypeService ?? throw new ArgumentNullException(nameof(dataTypeService));
        _versionDetector = versionDetector ?? throw new ArgumentNullException(nameof(versionDetector));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <summary>
    /// Exports all DataTypes from Umbraco.
    /// </summary>
    public async Task<List<ExportDataType>> ExportAsync()
    {
        _logger.LogInformation("Starting DataType export");

        var dataTypes = await _dataTypeService.GetAllAsync();
        var exported = new List<ExportDataType>();

        foreach (var dataType in dataTypes)
        {
            try
            {
                var export = new ExportDataType
                {
                    Alias = GenerateAlias(dataType.Name ?? string.Empty),
                    Name = dataType.Name ?? string.Empty,
                    EditorUiAlias = GetEditorAlias(dataType),
                    Config = ExtractConfiguration(dataType),
                    ValueType = dataType.DatabaseType.ToString()
                };

                exported.Add(export);
                _logger.LogDebug("Exported DataType: {Name} ({Alias})", export.Name, export.Alias);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to export DataType: {Name}", dataType.Name);
            }
        }

        _logger.LogInformation("Exported {Count} DataTypes", exported.Count);
        return await Task.FromResult(exported);
    }

    /// <summary>
    /// Exports DataTypes filtered by a CategorySelection.
    /// </summary>
    public virtual async Task<List<ExportDataType>> ExportAsync(CategorySelection filter)
    {
        if (!filter.IncludeAll && filter.Aliases.Count == 0)
            return [];
        var all = await ExportAsync();
        if (filter.IncludeAll) return all;
        return all.Where(x => filter.Aliases.Contains(x.Alias)).ToList();
    }

    /// <summary>
    /// Gets the appropriate editor alias based on Umbraco version.
    /// </summary>
    private string GetEditorAlias(IDataType dataType)
    {
        if (_versionDetector.SupportsEditorUiAlias())
        {
            return dataType.EditorUiAlias ?? dataType.EditorAlias;
        }
        else
        {
            return dataType.EditorAlias;
        }
    }

    /// <summary>
    /// Extracts configuration from a DataType.
    /// </summary>
    private Dictionary<string, object> ExtractConfiguration(IDataType dataType)
    {
        var config = new Dictionary<string, object>();

        var configObj = dataType.ConfigurationObject;

        if (configObj == null)
        {
            return config;
        }

        try
        {
            var json = JsonSerializer.Serialize(configObj);
            var jObject = JsonNode.Parse(json) as JsonObject;

            if (jObject is not null)
            {
                foreach (var property in jObject)
                {
                    config[property.Key] = ConvertJsonNode(property.Value);
                }
            }

            config = ProcessSpecialConfigurations(dataType.EditorAlias ?? string.Empty, config);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to extract configuration for DataType: {Name}", dataType.Name);
        }

        return config;
    }

    /// <summary>
    /// Converts JsonNode to appropriate .NET type for YAML serialization.
    /// </summary>
    private static object ConvertJsonNode(JsonNode? token)
    {
        return token switch
        {
            null => null!,
            JsonObject obj => obj.Aggregate(
                new Dictionary<string, object>(),
                (dict, kvp) =>
                {
                    dict[kvp.Key] = ConvertJsonNode(kvp.Value);
                    return dict;
                }),
            JsonArray arr => arr.Select(ConvertJsonNode).ToList()!,
            JsonValue val when val.TryGetValue<long>(out var l) => l,
            JsonValue val when val.TryGetValue<double>(out var d) => d,
            JsonValue val when val.TryGetValue<bool>(out var b) => b,
            JsonValue val => val.ToString(),
            _ => token.ToString()
        };
    }

    /// <summary>
    /// Processes special configuration cases for specific property editors.
    /// </summary>
    private Dictionary<string, object> ProcessSpecialConfigurations(string editorAlias, Dictionary<string, object> config)
    {
        // Handle Dropdown/CheckBox list items
        if (editorAlias.Contains("DropDown") || editorAlias.Contains("CheckBox"))
        {
            if (config.ContainsKey("items") && config["items"] is List<object> items)
            {
                config["items"] = items.Select(i => i?.ToString() ?? string.Empty).ToList();
            }
        }

        // Handle Block List/Grid - convert element type keys to aliases
        if (editorAlias.Contains("BlockList") || editorAlias.Contains("BlockGrid"))
        {
            if (config.ContainsKey("blocks") && config["blocks"] is List<object> blocks)
            {
                // Note: In a real implementation, you'd resolve contentElementTypeKey to alias
                // For now, we'll keep the structure as-is
                _logger.LogDebug("Block configuration detected for {Alias}", editorAlias);
            }
        }

        return config;
    }

    /// <summary>
    /// Generates a safe alias from a name.
    /// </summary>
    public static string GenerateAlias(string name)
    {
        ArgumentNullException.ThrowIfNull(name);

        // Convert to camelCase and remove special characters
        var alias = name
            .Replace(" ", "")
            .Replace("-", "")
            .Replace("_", "");

        if (string.IsNullOrEmpty(alias))
        {
            return "dataType";
        }

        // Ensure first character is lowercase
        return char.ToLowerInvariant(alias[0]) + alias.Substring(1);
    }
}


