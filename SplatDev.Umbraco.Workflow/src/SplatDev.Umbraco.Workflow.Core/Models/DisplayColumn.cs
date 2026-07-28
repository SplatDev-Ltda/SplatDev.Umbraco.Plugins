namespace SplatDev.Umbraco.Workflow.Core.Models;

/// <summary>A column descriptor used by the queue UI.</summary>
public sealed record DisplayColumn(
    string Key,
    string Label,
    string Type,
    bool IsSortable);
