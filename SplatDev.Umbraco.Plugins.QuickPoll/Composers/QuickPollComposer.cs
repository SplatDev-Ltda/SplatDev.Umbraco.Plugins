using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using SplatDev.Umbraco.Plugins.QuickPoll.Models;
using SplatDev.Umbraco.Plugins.QuickPoll.Services;
using SplatDev.Umbraco.Plugins.QuickPoll.Components;
using SplatDev.Umbraco.Plugins.QuickPoll.Persistence;

namespace SplatDev.Umbraco.Plugins.QuickPoll.Composers;

public class QuickPollComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.Services.AddDbContext<QuickPollDbContext>(options =>
            SplatDevDbContextConfig.UseUmbracoDatabase(options, builder.Config));

        builder.Components().Append<QuickPollSchemaComponent>();

        builder.Services.AddScoped<IQuickPollService, QuickPollService>();
    }
}
