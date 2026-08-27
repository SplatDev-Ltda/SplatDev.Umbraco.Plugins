using System.Text.Json;
using Microsoft.Extensions.Logging;
using SplatDev.Umbraco.Plugins.MemberNotifications.Models;
using Umbraco.Cms.Core.Services;

namespace SplatDev.Umbraco.Plugins.MemberNotifications.Services;

/// <inheritdoc />
/// <remarks>
/// IKeyValueService rather than a table: this is one small document, and giving it a table
/// means a migration, a DbContext and the table-naming trap that has already bitten several
/// plugins here.
/// </remarks>
public class NotificationSettingsStore(IKeyValueService keyValue, ILogger<NotificationSettingsStore> logger)
    : INotificationSettingsStore
{
    private static readonly JsonSerializerOptions Json = new()
    {
        PropertyNameCaseInsensitive = true,
        WriteIndented = false,
    };

    public NotificationSettings Get()
    {
        var raw = keyValue.GetValue(NotificationSettings.StorageKey);
        if (string.IsNullOrWhiteSpace(raw))
        {
            return new NotificationSettings().WithDefaults();
        }

        try
        {
            return (JsonDeserialize(raw) ?? new NotificationSettings()).WithDefaults();
        }
        catch (JsonException ex)
        {
            // Corrupt settings must not take the site down, and must not silently masquerade
            // as "notifications are switched off" either - the log is the only place anyone
            // would find out.
            logger.LogError(ex, "Member notification settings could not be read; using defaults.");
            return new NotificationSettings().WithDefaults();
        }
    }

    public void Save(NotificationSettings settings) =>
        keyValue.SetValue(NotificationSettings.StorageKey, JsonSerializer.Serialize(settings, Json));

    private static NotificationSettings? JsonDeserialize(string raw) =>
        JsonSerializer.Deserialize<NotificationSettings>(raw, Json);
}
