namespace SplatDev.Directory.Abstractions;

/// <summary>
/// Picks between the directory providers a site has registered.
/// </summary>
public interface IDirectoryProviderResolver
{
    /// <summary>Every registered provider, configured or not.</summary>
    IReadOnlyList<IDirectoryProvider> All { get; }

    /// <summary>
    /// The provider to use: the one named in configuration when it is usable, otherwise
    /// the first that is configured. Null when nothing is.
    /// </summary>
    IDirectoryProvider? Current { get; }

    /// <summary>A provider by name, or null.</summary>
    IDirectoryProvider? ByName(string? name);
}
