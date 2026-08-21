using Microsoft.AspNetCore.Mvc;

using Umbraco.Cms.Web.Common.Controllers;

using SplatDev.Umbraco.Plugins.SocialMedia.Share.Services;

namespace SplatDev.Umbraco.Plugins.SocialMedia.Share.Controllers
{
    [Route("umbraco/api/ShareApi/[action]")]
    public class ShareApiController(IShareService shareService) : ControllerBase
    {
        private readonly IShareService _shareService = shareService;

        [HttpGet]
        public IActionResult GetShareLinks(string pageUrl, string pageTitle)
        {
            if (string.IsNullOrWhiteSpace(pageUrl))
                return BadRequest("pageUrl is required.");

            if (string.IsNullOrWhiteSpace(pageTitle))
                return BadRequest("pageTitle is required.");

            var links = _shareService.GetShareLinks(pageUrl, pageTitle);
            return Ok(links);
        }
    }
}
