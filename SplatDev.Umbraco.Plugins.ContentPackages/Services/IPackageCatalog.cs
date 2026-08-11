using SplatDev.Umbraco.Plugins.ContentPackages.Models;

namespace SplatDev.Umbraco.Plugins.ContentPackages.Services;

/// <summary>Reads content packages from the configured disk root.</summary>
public interface IPackageCatalog
{
    /// <summary>All known packages, from cache when warm.</summary>
    IReadOnlyList<ContentPackage> GetAll();

    /// <summary>
    /// Resolves a slug against the scanned catalogue. This is the only way a package is
    /// looked up, which is what keeps a user-supplied slug from reaching the file system.
    /// </summary>
    ContentPackage? GetBySlug(string slug);

    /// <summary>Re-reads the root from disk and refreshes the cache.</summary>
    IReadOnlyList<ContentPackage> Scan();
}
