using Microsoft.Extensions.DependencyInjection;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using SplatDev.Umbraco.Plugins.PropertiesReport.Services;

namespace SplatDev.Umbraco.Plugins.PropertiesReport.Composers;

public class PropertiesReportComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.Services.AddScoped<IPropertiesReportService, PropertiesReportService>();
    }
}
