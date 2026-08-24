namespace SplatDev.Umbraco.Plugins.DefaultValue;

/// <summary>
/// How a Default Value data type is configured.
/// </summary>
/// <remarks>
/// <c>dValue</c> is the prevalue key the Umbraco 7/8 plugin used. Keeping it means a
/// document type carried over from those versions finds its editor and its configured
/// value rather than an orphaned property.
/// </remarks>
public class DefaultValueConfiguration
{
    /// <summary>The value stamped onto the property.</summary>
    public string? DValue { get; set; }
}
