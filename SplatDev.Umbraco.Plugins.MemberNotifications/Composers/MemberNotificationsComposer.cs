using Microsoft.Extensions.DependencyInjection;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using SplatDev.Umbraco.Plugins.MemberNotifications.Components;
using SplatDev.Umbraco.Plugins.MemberNotifications.Services;
#if NET10_0_OR_GREATER
using SplatDev.Umbraco.Plugins.MemberNotifications.Notifications;
using Umbraco.Cms.Core.Notifications;
#endif

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
