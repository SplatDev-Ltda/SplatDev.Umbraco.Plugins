using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using SplatDev.Umbraco.Plugins.Slider.Models;
using SplatDev.Umbraco.Plugins.Slider.Services;
using SplatDev.Umbraco.Plugins.Slider.Components;
using SplatDev.Umbraco.Plugins.Slider.Persistence;

namespace SplatDev.Umbraco.Plugins.Slider.Composers;

public class SliderComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        var connectionString = builder.Config.GetSection("ConnectionStrings")["umbracoDbDSN"];

        builder.Services.AddDbContext<SliderDbContext>(options =>
            SplatDevDbContextConfig.UseUmbracoDatabase(options, builder.Config));

        builder.Components().Append<SliderSchemaComponent>();

        builder.Services.AddScoped<ISliderService, SliderService>();
    }
}
