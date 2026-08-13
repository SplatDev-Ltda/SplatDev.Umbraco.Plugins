using Microsoft.AspNetCore.Authorization;
using Umbraco.Cms.Web.Common.Authorization;
using Microsoft.AspNetCore.Mvc;

using Umbraco.Cms.Web.Common.Controllers;

using SplatDev.Umbraco.Plugins.Settings.Models;
using SplatDev.Umbraco.Plugins.Settings.Services;

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

        [HttpGet]
        public async Task<IActionResult> GetGroups()
        {
            var groups = await _settingsService.GetAllGroupsAsync();
            return Ok(groups);
        }

        [HttpGet]
        public async Task<IActionResult> GetByGroup(int groupId)
        {
            var settings = await _settingsService.GetSettingsByGroupAsync(groupId);
            return Ok(settings);
        }

        [HttpGet]
        public async Task<IActionResult> Get(string key)
        {
            var setting = await _settingsService.GetSettingAsync(key);
            if (setting is null)
                return NotFound();
            return Ok(setting);
        }

        [HttpPost]
        public async Task<IActionResult> Set([FromBody] SetSettingRequest request)
        {
            var setting = await _settingsService.SetSettingAsync(request.Key, request.Value);
            return Ok(setting);
        }

        [HttpDelete]
        public async Task<IActionResult> Delete(int id)
        {
            await _settingsService.DeleteSettingAsync(id);
            return NoContent();
        }
    }

    public record SetSettingRequest(string Key, string Value);
}
