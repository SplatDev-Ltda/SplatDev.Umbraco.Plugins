using Microsoft.Extensions.Configuration;
using SplatDev.Umbraco.Plugins.LazyLoad.Models;

namespace SplatDev.Umbraco.Plugins.LazyLoad.Services;

public class LazyLoadService : ILazyLoadService
{
    private const string SectionKey = "LazyLoad";
    private const string EnabledKey = "LazyLoad:Enabled";
    private const string PlaceholderKey = "LazyLoad:Placeholder";
    private const string LazyLoadIframesKey = "LazyLoad:LazyLoadIframes";

    private readonly IConfiguration _configuration;
    private LazyLoadSettings _settings;

    public LazyLoadService(IConfiguration configuration)
    {
        _configuration = configuration;
        _settings = ReadSettings();
    }

    public LazyLoadSettings GetSettings() => _settings;

    public void SaveSettings(LazyLoadSettings settings)
    {
        _settings = settings;

        if (_configuration is IConfigurationRoot root)
        {
            root[EnabledKey] = settings.Enabled.ToString().ToLowerInvariant();
            root[PlaceholderKey] = settings.Placeholder;
            root[LazyLoadIframesKey] = settings.LazyLoadIframes.ToString().ToLowerInvariant();
        }
    }

    private LazyLoadSettings ReadSettings()
    {
        var section = _configuration.GetSection(SectionKey);
        return new LazyLoadSettings
        {
            Enabled = section.GetValue<bool>(nameof(LazyLoadSettings.Enabled), true),
            Placeholder = section.GetValue<string>(nameof(LazyLoadSettings.Placeholder))
                ?? "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=",
            LazyLoadIframes = section.GetValue<bool>(nameof(LazyLoadSettings.LazyLoadIframes), true),
        };
    }
}
