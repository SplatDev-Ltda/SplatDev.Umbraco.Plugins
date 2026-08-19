using SplatDev.Umbraco.Plugins.ToastNotifications.Models;

namespace SplatDev.Umbraco.Plugins.ToastNotifications.Services;

public interface IToastNotificationsService
{
    /// <summary>Toasts that should be showing right now — what the front end asks for.</summary>
    Task<IEnumerable<ToastMessage>> GetActiveToastsAsync();

    /// <summary>
    /// Every toast, whatever its state.
    /// </summary>
    /// <remarks>
    /// The dashboard needs this and only had GetActive, which filters on IsActive and the
    /// start/end window. A toast scheduled for next week, or one that has expired, was
    /// therefore invisible in the only screen that manages them: you could create it, watch
    /// it vanish, and have no way to edit or delete it afterwards.
    /// </remarks>
    Task<IEnumerable<ToastMessage>> GetAllToastsAsync();
    Task<ToastMessage?> GetByIdAsync(int id);
    Task<ToastMessage> CreateToastAsync(ToastMessage toast);
    Task<ToastMessage?> UpdateToastAsync(int id, ToastMessage toast);
    Task<bool> DeleteToastAsync(int id);
}
