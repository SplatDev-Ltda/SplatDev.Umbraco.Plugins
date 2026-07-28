namespace SplatDev.Umbraco.Workflow.Core.Models;

/// <summary>Host-supplied configuration for the JSON metadata data provider.</summary>
public sealed record JsonMetadataProviderOptions(
    IReadOnlyDictionary<string, IReadOnlyList<DisplayColumn>> ColumnsByWorkflow,
    IReadOnlyList<string> SearchableFieldKeys);
