using SplatDev.Umbraco.Plugins.Settings.Models;

namespace SplatDev.Umbraco.Plugins.Settings.Services
{
    public interface ISettingsService
    {
        // ── groups ───────────────────────────────────────────────────────────

        Task<IEnumerable<SettingGroup>> GetAllGroupsAsync();

        /// <summary>
        /// Creates or updates a group.
        /// </summary>
        /// <remarks>
        /// There was no way to create one. GetAllGroupsAsync existed and nothing wrote a
        /// group, so the concept was inert: settings carried a GroupId that could only ever
        /// be zero, and the dashboard could list groups it was impossible to add to.
        /// </remarks>
        Task<SaveResult<SettingGroup>> SaveGroupAsync(SettingGroup group);

        /// <summary>Deletes a group. Refuses while settings still belong to it.</summary>
        Task<SaveResult<SettingGroup>> DeleteGroupAsync(int id);

        // ── settings ─────────────────────────────────────────────────────────

        Task<IEnumerable<SiteSetting>> GetSettingsByGroupAsync(int groupId);

        /// <summary>Every setting, with its group, for the management dashboard.</summary>
        Task<IEnumerable<SiteSetting>> GetAllSettingsAsync();

        Task<SiteSetting?> GetSettingAsync(string key);

        /// <summary>
        /// Creates or updates a setting including its group, type and description.
        /// </summary>
        /// <remarks>
        /// SetSettingAsync only ever took a key and a value, so anything it created landed
        /// with GroupId 0 and Type "text" — orphaned and untyped — even though the model
        /// carries both fields and the type is what tells an editor whether it is looking
        /// at a boolean, a number or JSON.
        /// </remarks>
        Task<SaveResult<SiteSetting>> SaveSettingAsync(SiteSetting setting);

        /// <summary>
        /// Sets a value by key, creating the setting if needed.
        /// </summary>
        /// <remarks>
        /// Kept as-is for callers scripted against the original API. New work should use
        /// <see cref="SaveSettingAsync"/>, which can express the group and the type.
        /// </remarks>
        Task<SiteSetting> SetSettingAsync(string key, string value);

        Task DeleteSettingAsync(int id);
    }

    /// <summary>The outcome of a write, with a message meant for an editor.</summary>
    public sealed class SaveResult<T>
    {
        public bool Success { get; init; }
        public string Message { get; init; } = string.Empty;
        public T? Value { get; init; }

        public static SaveResult<T> Ok(T value, string message = "") =>
            new() { Success = true, Value = value, Message = message };

        public static SaveResult<T> Fail(string message) =>
            new() { Success = false, Message = message };
    }
}
