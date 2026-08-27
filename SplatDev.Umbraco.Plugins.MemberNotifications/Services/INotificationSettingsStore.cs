using SplatDev.Umbraco.Plugins.MemberNotifications.Models;

namespace SplatDev.Umbraco.Plugins.MemberNotifications.Services;

public interface INotificationSettingsStore
{
    NotificationSettings Get();

    void Save(NotificationSettings settings);
}
