using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using SplatDev.Umbraco.Plugins.Surveys.Models;
using SplatDev.Umbraco.Plugins.Surveys.Services;
using SplatDev.Umbraco.Plugins.Surveys.Components;
using SplatDev.Umbraco.Plugins.Surveys.Persistence;

namespace SplatDev.Umbraco.Plugins.Surveys.Composers;

public class SurveysComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.Services.AddDbContext<SurveysDbContext>(options =>
            SplatDevDbContextConfig.UseUmbracoDatabase(options, builder.Config));

        builder.Components().Append<SurveysSchemaComponent>();

        builder.Services.AddScoped<ISurveysService, SurveysService>();
    }
}
