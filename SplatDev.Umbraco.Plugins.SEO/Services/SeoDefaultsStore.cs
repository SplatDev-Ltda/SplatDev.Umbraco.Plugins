// Usings sit above the namespace deliberately. Inside SplatDev.Umbraco.Plugins.SEO.Services
// the token "Umbraco" binds to SplatDev.Umbraco first, so a using written below the
// namespace declaration cannot resolve Umbraco.Cms.Core.Services at all.
using System.Text.Json;
using SplatDev.Umbraco.Plugins.SEO.Models;
using Umbraco.Cms.Core.Services;

namespace SplatDev.Umbraco.Plugins.SEO.Services;

/// <summary>
/// Reads and writes the site-wide SEO defaults.
/// </summary>
/// <remarks>
/// Backed by Umbraco's key-value store rather than a table of its own. A table would need a
/// migration, and this repository has been bitten more than once by a migration that
/// succeeds, records itself as done, and leaves the plugin querying a name that does not
/// exist — because Create.Table&lt;T&gt;() names after the entity while EF names from the
/// [Table] attribute. One JSON value under one key has no such failure mode.
/// </remarks>
public sealed class SeoDefaultsStore
{
    /// <summary>Namespaced so it cannot collide with another plugin's key.</summary>
    public const string Key = "SplatDev.Umbraco.Plugins.SEO/defaults";

    private static readonly JsonSerializerOptions Json = new() { WriteIndented = false };

    private readonly IKeyValueService _keyValues;

    public SeoDefaultsStore(IKeyValueService keyValues) => _keyValues = keyValues;

    /// <summary>
    /// The stored defaults, or a fresh set when nothing has been saved yet.
    /// </summary>
    /// <remarks>
    /// Unreadable stored JSON returns defaults rather than throwing. A dashboard that 500s
    /// because a value was hand-edited is worse than one that shows empty fields the user
    /// can simply save over.
    /// </remarks>
    public SeoDefaults Get()
    {
        var raw = _keyValues.GetValue(Key);
        if (string.IsNullOrWhiteSpace(raw)) return new SeoDefaults();

        try
        {
            return JsonSerializer.Deserialize<SeoDefaults>(raw, Json) ?? new SeoDefaults();
        }
        catch (JsonException)
        {
            return new SeoDefaults();
        }
    }

    public void Save(SeoDefaults defaults)
    {
        ArgumentNullException.ThrowIfNull(defaults);
        _keyValues.SetValue(Key, JsonSerializer.Serialize(defaults, Json));
    }
}
