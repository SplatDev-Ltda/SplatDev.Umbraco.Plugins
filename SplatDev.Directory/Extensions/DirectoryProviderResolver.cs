using Microsoft.Extensions.Options;

using SplatDev.Directory.Abstractions;
using SplatDev.Directory.Configuration;

namespace SplatDev.Directory.Extensions;

/// <inheritdoc />
internal sealed class DirectoryProviderResolver : IDirectoryProviderResolver
{
    private readonly DirectoryOptions _options;

    public DirectoryProviderResolver(IEnumerable<IDirectoryProvider> providers, IOptions<DirectoryOptions> options)
    {
        All = providers.ToList();
        _options = options.Value;
    }

    public IReadOnlyList<IDirectoryProvider> All { get; }

    public IDirectoryProvider? Current
    {
        get
        {
            // A named provider only wins if it is actually usable. Falling back to
            // whatever is configured beats failing because someone left a stale name in
            // configuration after removing its settings.
            var named = ByName(_options.DefaultProvider);
            if (named is { IsConfigured: true }) return named;

            return All.FirstOrDefault(p => p.IsConfigured);
        }
    }

    public IDirectoryProvider? ByName(string? name) =>
        string.IsNullOrWhiteSpace(name)
            ? null
            : All.FirstOrDefault(p => string.Equals(p.Name, name, StringComparison.OrdinalIgnoreCase));
}
