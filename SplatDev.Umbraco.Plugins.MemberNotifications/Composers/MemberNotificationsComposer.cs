using Microsoft.Extensions.DependencyInjection;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using SplatDev.Umbraco.Plugins.MemberNotifications.Components;
using SplatDev.Umbraco.Plugins.MemberNotifications.Services;

namespace SplatDev.Umbraco.Plugins.MemberNotifications.Composers;

public class MemberNotificationsComponentComposer : ComponentComposer<MemberNotificationsComponent>
{
}

public class MemberNotificationsComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.Services.AddScoped<INotificationService, NotificationService>();
    }
}
