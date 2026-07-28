using SplatDev.Umbraco.Workflow.Core.Enums;

namespace SplatDev.Umbraco.Workflow.Core.Contracts;

/// <summary>A named notification intent attached to a step transition.</summary>
public interface IActionMessage
{
    /// <summary>Gets the notification alias.</summary>
    string Alias { get; }

    /// <summary>Gets the notification label.</summary>
    string Label { get; }

    /// <summary>Gets the target audience for this notification.</summary>
    ActionMessageAudience Audience { get; }
}
