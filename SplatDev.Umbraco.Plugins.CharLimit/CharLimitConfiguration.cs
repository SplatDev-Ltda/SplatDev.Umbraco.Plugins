namespace SplatDev.Umbraco.Plugins.CharLimit;

/// <summary>
/// How a Character Limit data type is configured.
/// </summary>
/// <remarks>
/// The Umbraco 7/8 plugin had a single required prevalue keyed <c>limit</c> — "Number of
/// Characters". This build had renamed it to <c>maxChars</c>, which silently orphaned the
/// configuration of every data type carried over from those versions: the editor read a
/// key that was not there and fell back to its default. Both keys are accepted,
/// <c>limit</c> first, so a migrated data type keeps its setting and one configured on
/// Umbraco 17 keeps working too.
/// </remarks>
public class CharLimitConfiguration
{
    /// <summary>The original prevalue key, kept so Umbraco 7/8 data types still resolve.</summary>
    public int? Limit { get; set; }

    public int MaxChars { get; set; } = 200;

    public bool ShowCountdown { get; set; } = true;

    /// <summary>
    /// Renders a multi-line box instead of a single-line field once the limit reaches this
    /// many characters. The original switched at 100, on the reasoning that a longer limit
    /// implies prose rather than a heading.
    /// </summary>
    public int TextareaThreshold { get; set; } = 100;

    /// <summary>The limit actually in force, preferring the original key.</summary>
    public int EffectiveLimit => Limit is > 0 ? Limit.Value : MaxChars;
}
