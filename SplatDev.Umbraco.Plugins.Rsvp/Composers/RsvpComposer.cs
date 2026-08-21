using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using SplatDev.Umbraco.Plugins.Rsvp.Models;
using SplatDev.Umbraco.Plugins.Rsvp.Services;
using SplatDev.Umbraco.Plugins.Rsvp.Components;
using SplatDev.Umbraco.Plugins.Rsvp.Persistence;

namespace SplatDev.Umbraco.Plugins.Rsvp.Composers;

public class RsvpComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.Services.AddDbContext<RsvpDbContext>(options =>
            SplatDevDbContextConfig.UseUmbracoDatabase(options, builder.Config));

        builder.Components().Append<RsvpSchemaComponent>();

        builder.Services.AddScoped<IRsvpService, RsvpService>();
    }
}
