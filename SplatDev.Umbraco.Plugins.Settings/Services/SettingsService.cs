using Microsoft.EntityFrameworkCore;

using SplatDev.Umbraco.Plugins.Settings.Models;

namespace SplatDev.Umbraco.Plugins.Settings.Services
{
    public class SettingsService(SettingsDbContext dbContext) : ISettingsService
    {
        private readonly SettingsDbContext _dbContext = dbContext;

        public async Task<IEnumerable<SettingGroup>> GetAllGroupsAsync()
        {
            return await _dbContext.SettingGroups
                .OrderBy(g => g.SortOrder)
                .ThenBy(g => g.Name)
                .ToListAsync();
        }

        public async Task<IEnumerable<SiteSetting>> GetSettingsByGroupAsync(int groupId)
        {
            return await _dbContext.SiteSettings
                .Where(s => s.GroupId == groupId)
                .OrderBy(s => s.Key)
                .ToListAsync();
        }

        public async Task<IEnumerable<SiteSetting>> GetAllSettingsAsync()
        {
            // Deliberately no Include(s => s.Group). SiteSetting.Group is declared non-nullable,
            // so EF treats the relationship as required and turns the Include into an inner
            // join — which silently drops every setting with GroupId 0. Those are exactly the
            // orphans the legacy SetSettingAsync creates, so the one screen that could fix
            // them would never show them. The dashboard resolves group names from GetGroups.
            return await _dbContext.SiteSettings
                .OrderBy(s => s.GroupId)
                .ThenBy(s => s.Key)
                .ToListAsync();
        }

        public async Task<SiteSetting?> GetSettingAsync(string key)
        {
            return await _dbContext.SiteSettings
                .Include(s => s.Group)
                .FirstOrDefaultAsync(s => s.Key == key);
        }

        // ── groups ───────────────────────────────────────────────────────────

        public async Task<SaveResult<SettingGroup>> SaveGroupAsync(SettingGroup group)
        {
            if (string.IsNullOrWhiteSpace(group.Name))
                return SaveResult<SettingGroup>.Fail("Give the group a name.");

            var alias = string.IsNullOrWhiteSpace(group.Alias)
                ? Slug(group.Name)
                : Slug(group.Alias);

            // The alias is uniquely indexed, so a clash would surface as a DbUpdateException
            // rather than something an editor could act on.
            var clash = await _dbContext.SettingGroups
                .FirstOrDefaultAsync(g => g.Alias == alias && g.Id != group.Id);
            if (clash is not null)
                return SaveResult<SettingGroup>.Fail($"Another group already uses the alias \"{alias}\".");

            var existing = group.Id > 0
                ? await _dbContext.SettingGroups.FindAsync(group.Id)
                : null;

            if (existing is null)
            {
                var created = new SettingGroup
                {
                    Name = group.Name.Trim(),
                    Alias = alias,
                    Description = group.Description,
                    SortOrder = group.SortOrder,
                };
                _dbContext.SettingGroups.Add(created);
                await _dbContext.SaveChangesAsync();
                return SaveResult<SettingGroup>.Ok(created, $"Group \"{created.Name}\" created.");
            }

            existing.Name = group.Name.Trim();
            existing.Alias = alias;
            existing.Description = group.Description;
            existing.SortOrder = group.SortOrder;
            await _dbContext.SaveChangesAsync();
            return SaveResult<SettingGroup>.Ok(existing, $"Group \"{existing.Name}\" saved.");
        }

        public async Task<SaveResult<SettingGroup>> DeleteGroupAsync(int id)
        {
            var group = await _dbContext.SettingGroups.FindAsync(id);
            if (group is null)
                return SaveResult<SettingGroup>.Fail("That group no longer exists.");

            // Deleting the group would orphan its settings onto GroupId 0, where nothing
            // lists them — they would still be readable by key and invisible in the UI.
            var count = await _dbContext.SiteSettings.CountAsync(s => s.GroupId == id);
            if (count > 0)
                return SaveResult<SettingGroup>.Fail(
                    $"\"{group.Name}\" still holds {count} setting(s). Move or delete them first.");

            _dbContext.SettingGroups.Remove(group);
            await _dbContext.SaveChangesAsync();
            return SaveResult<SettingGroup>.Ok(group, $"Group \"{group.Name}\" deleted.");
        }

        // ── settings ─────────────────────────────────────────────────────────

        private static readonly string[] AllowedTypes = ["text", "boolean", "number", "json"];

        public async Task<SaveResult<SiteSetting>> SaveSettingAsync(SiteSetting setting)
        {
            if (string.IsNullOrWhiteSpace(setting.Key))
                return SaveResult<SiteSetting>.Fail("Give the setting a key.");

            var key = setting.Key.Trim();
            var type = string.IsNullOrWhiteSpace(setting.Type) ? "text" : setting.Type.Trim().ToLowerInvariant();

            if (!AllowedTypes.Contains(type))
                return SaveResult<SiteSetting>.Fail(
                    $"\"{type}\" is not a valid type. Use one of: {string.Join(", ", AllowedTypes)}.");

            var invalid = ValidateValue(type, setting.Value);
            if (invalid is not null)
                return SaveResult<SiteSetting>.Fail(invalid);

            if (setting.GroupId > 0 && !await _dbContext.SettingGroups.AnyAsync(g => g.Id == setting.GroupId))
                return SaveResult<SiteSetting>.Fail("That group no longer exists.");

            var clash = await _dbContext.SiteSettings
                .FirstOrDefaultAsync(s => s.Key == key && s.Id != setting.Id);
            if (clash is not null)
                return SaveResult<SiteSetting>.Fail($"Another setting already uses the key \"{key}\".");

            var existing = setting.Id > 0
                ? await _dbContext.SiteSettings.FindAsync(setting.Id)
                : null;

            if (existing is null)
            {
                var created = new SiteSetting
                {
                    Key = key,
                    Value = setting.Value,
                    Type = type,
                    GroupId = setting.GroupId,
                    Description = setting.Description,
                };
                _dbContext.SiteSettings.Add(created);
                await _dbContext.SaveChangesAsync();
                return SaveResult<SiteSetting>.Ok(created, $"\"{key}\" created.");
            }

            existing.Key = key;
            existing.Value = setting.Value;
            existing.Type = type;
            existing.GroupId = setting.GroupId;
            existing.Description = setting.Description;
            await _dbContext.SaveChangesAsync();
            return SaveResult<SiteSetting>.Ok(existing, $"\"{key}\" saved.");
        }

        /// <summary>Checks a value against its declared type. Public so it can be exercised directly.</summary>
        public static string? ValidateValue(string type, string? value)
        {
            if (string.IsNullOrWhiteSpace(value)) return null;

            switch (type)
            {
                case "boolean":
                    return bool.TryParse(value, out _) || value is "0" or "1"
                        ? null
                        : $"\"{value}\" is not a boolean. Use true or false.";
                case "number":
                    return decimal.TryParse(value, System.Globalization.NumberStyles.Any,
                                            System.Globalization.CultureInfo.InvariantCulture, out _)
                        ? null
                        : $"\"{value}\" is not a number.";
                case "json":
                    try
                    {
                        using var _ = System.Text.Json.JsonDocument.Parse(value);
                        return null;
                    }
                    catch (System.Text.Json.JsonException ex)
                    {
                        return $"That is not valid JSON: {ex.Message}";
                    }
                default:
                    return null;
            }
        }

        public async Task<SiteSetting> SetSettingAsync(string key, string value)
        {
            var existing = await _dbContext.SiteSettings.FirstOrDefaultAsync(s => s.Key == key);
            if (existing is not null)
            {
                existing.Value = value;
                _dbContext.SiteSettings.Update(existing);
                await _dbContext.SaveChangesAsync();
                return existing;
            }

            var setting = new SiteSetting
            {
                Key = key,
                Value = value,
                Type = "text"
            };
            _dbContext.SiteSettings.Add(setting);
            await _dbContext.SaveChangesAsync();
            return setting;
        }

        public async Task DeleteSettingAsync(int id)
        {
            var setting = await _dbContext.SiteSettings.FindAsync(id);
            if (setting is null) return;

            _dbContext.SiteSettings.Remove(setting);
            await _dbContext.SaveChangesAsync();
        }

        /// <summary>Lowercase, hyphenated, safe for a uniquely-indexed alias column.</summary>
        private static string Slug(string input)
        {
            var cleaned = new string(input.Trim().ToLowerInvariant()
                .Select(c => char.IsLetterOrDigit(c) ? c : '-').ToArray());
            while (cleaned.Contains("--")) cleaned = cleaned.Replace("--", "-");
            return cleaned.Trim('-');
        }
    }
}
