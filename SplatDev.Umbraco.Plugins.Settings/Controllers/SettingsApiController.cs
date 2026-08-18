using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SplatDev.Umbraco.Plugins.Settings.Models;
using SplatDev.Umbraco.Plugins.Settings.Services;
using Umbraco.Cms.Web.Common.Authorization;

namespace SplatDev.Umbraco.Plugins.Settings.Controllers
{
    /// <remarks>
    /// Previously anonymous. Get, Set and Delete on arbitrary site settings keys, anonymously.
    /// </remarks>
    [Authorize(Policy = AuthorizationPolicies.BackOfficeAccess)]
    [Route("umbraco/api/SettingsApi/[action]")]
    public class SettingsApiController(ISettingsService settingsService) : ControllerBase
    {
        private readonly ISettingsService _settingsService = settingsService;

        // ── groups ───────────────────────────────────────────────────────────

        [HttpGet]
        public async Task<IActionResult> GetGroups()
            => Ok(await _settingsService.GetAllGroupsAsync());

        [HttpPost]
        public async Task<IActionResult> SaveGroup([FromBody] SettingGroup group)
        {
            var result = await _settingsService.SaveGroupAsync(group);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpDelete]
        public async Task<IActionResult> DeleteGroup(int id)
        {
            var result = await _settingsService.DeleteGroupAsync(id);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        // ── settings ─────────────────────────────────────────────────────────

        /// <summary>Every setting with its group — what the dashboard renders.</summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
            => Ok(await _settingsService.GetAllSettingsAsync());

        [HttpGet]
        public async Task<IActionResult> GetByGroup(int groupId)
            => Ok(await _settingsService.GetSettingsByGroupAsync(groupId));

        [HttpGet]
        public async Task<IActionResult> Get(string key)
        {
            var setting = await _settingsService.GetSettingAsync(key);
            return setting is null ? NotFound() : Ok(setting);
        }

        /// <summary>Creates or updates a setting including its group, type and description.</summary>
        [HttpPost]
        public async Task<IActionResult> Save([FromBody] SiteSetting setting)
        {
            var result = await _settingsService.SaveSettingAsync(setting);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        /// <summary>
        /// Sets a value by key.
        /// </summary>
        /// <remarks>
        /// Kept for callers scripted against the original API. It cannot express a group or
        /// a type, so anything it creates is untyped and ungrouped — use Save instead.
        /// </remarks>
        [HttpPost]
        public async Task<IActionResult> Set([FromBody] SetSettingRequest request)
            => Ok(await _settingsService.SetSettingAsync(request.Key, request.Value));

        [HttpDelete]
        public async Task<IActionResult> Delete(int id)
        {
            await _settingsService.DeleteSettingAsync(id);
            return NoContent();
        }
    }

    public record SetSettingRequest(string Key, string Value);
}
