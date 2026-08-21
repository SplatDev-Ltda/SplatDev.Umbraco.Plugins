using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using SplatDev.Umbraco.Plugins.ToastNotifications.Data;
using SplatDev.Umbraco.Plugins.ToastNotifications.Services;
using SplatDev.Umbraco.Plugins.ToastNotifications.Components;
using SplatDev.Umbraco.Plugins.ToastNotifications.Persistence;

namespace SplatDev.Umbraco.Plugins.ToastNotifications.Composers;

public class ToastNotificationsComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.Services.AddDbContext<ToastNotificationsDbContext>(o =>
            SplatDevDbContextConfig.UseUmbracoDatabase(o, builder.Config));

        builder.Components().Append<ToastNotificationsSchemaComponent>();

        builder.Services.AddScoped<IToastNotificationsService, ToastNotificationsService>();
    }
}
