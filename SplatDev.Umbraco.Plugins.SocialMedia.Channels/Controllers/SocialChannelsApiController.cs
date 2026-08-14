using Microsoft.AspNetCore.Authorization;
using Umbraco.Cms.Web.Common.Authorization;
using Microsoft.AspNetCore.Mvc;

using Umbraco.Cms.Web.Common.Controllers;

using SplatDev.Umbraco.Plugins.SocialMedia.Channels.Models;
using SplatDev.Umbraco.Plugins.SocialMedia.Channels.Services;

namespace SplatDev.Umbraco.Plugins.SocialMedia.Channels.Controllers
{
    /// <remarks>
    /// Previously anonymous. AddChannel and RemoveChannel rewrote the connected accounts, and SchedulePost and DeletePost published or withdrew posts to them.
    /// </remarks>
    [Authorize(Policy = AuthorizationPolicies.BackOfficeAccess)]
    [Route("umbraco/api/SocialChannelsApi/[action]")]
    public class SocialChannelsApiController(ISocialChannelsService socialChannelsService) : ControllerBase
    {
        private readonly ISocialChannelsService _socialChannelsService = socialChannelsService;

        [HttpGet]
        public async Task<IActionResult> GetChannels()
        {
            var channels = await _socialChannelsService.GetChannelsAsync();
            return Ok(channels);
        }

        [HttpPost]
        public async Task<IActionResult> AddChannel([FromBody] SocialChannel channel)
        {
            var created = await _socialChannelsService.AddChannelAsync(channel);
            return Ok(created);
        }

        [HttpDelete]
        public async Task<IActionResult> RemoveChannel(int id)
        {
            await _socialChannelsService.RemoveChannelAsync(id);
            return NoContent();
        }

        [HttpGet]
        public async Task<IActionResult> GetPosts()
        {
            var posts = await _socialChannelsService.GetScheduledPostsAsync();
            return Ok(posts);
        }

        [HttpPost]
        public async Task<IActionResult> SchedulePost([FromBody] ScheduledPost post)
        {
            var scheduled = await _socialChannelsService.SchedulePostAsync(post);
            return Ok(scheduled);
        }

        [HttpDelete]
        public async Task<IActionResult> DeletePost(int id)
        {
            await _socialChannelsService.DeletePostAsync(id);
            return NoContent();
        }
    }
}
