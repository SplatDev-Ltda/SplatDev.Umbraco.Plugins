using Microsoft.AspNetCore.Authorization;
using Umbraco.Cms.Web.Common.Authorization;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core.Web;
using Umbraco.Cms.Web.Common.Controllers;

#if NET10_0_OR_GREATER
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Models.ContentPublishing;
using Umbraco.Cms.Core.Routing;
#else
using Umbraco.Extensions;
#endif

namespace SplatDev.Umbraco.Plugins.AdminBar.Controllers;

/// <summary>
/// The editor admin bar's server side.
/// </summary>
/// <remarks>
/// Previously anonymous, which meant UnpublishPage took any node id from any caller —
/// an unauthenticated visitor could take pages off the live site one id at a time —
/// and PublishPage could push unreviewed content live.
/// </remarks>
[Authorize(Policy = AuthorizationPolicies.BackOfficeAccess)]
[Route("umbraco/api/adminbar/[action]")]
public class AdminBarApiController : ControllerBase
{
    private readonly IContentService _contentService;
    private readonly IUmbracoContextAccessor _umbracoContextAccessor;
#if NET10_0_OR_GREATER
    private readonly IPublishedUrlProvider _publishedUrlProvider;
    private readonly IContentPublishingService _contentPublishingService;

    public AdminBarApiController(
        IContentService contentService,
        IUmbracoContextAccessor umbracoContextAccessor,
        IPublishedUrlProvider publishedUrlProvider,
        IContentPublishingService contentPublishingService)
    {
        _contentService = contentService;
        _umbracoContextAccessor = umbracoContextAccessor;
        _publishedUrlProvider = publishedUrlProvider;
        _contentPublishingService = contentPublishingService;
    }
#else
    public AdminBarApiController(
        IContentService contentService,
        IUmbracoContextAccessor umbracoContextAccessor)
    {
        _contentService = contentService;
        _umbracoContextAccessor = umbracoContextAccessor;
    }
#endif

    [HttpGet]
    public IActionResult GetCurrentPageInfo([FromQuery] int nodeId)
    {
        if (nodeId <= 0)
            return BadRequest("nodeId must be greater than 0.");

        _umbracoContextAccessor.TryGetUmbracoContext(out var ctx);
        var published = ctx?.Content?.GetById(nodeId);

        if (published is null)
        {
            var content = _contentService.GetById(nodeId);
            if (content is null)
                return NotFound();

            return Ok(new
            {
                id = content.Id,
                name = content.Name,
                published = content.Published,
                url = (string?)null
            });
        }

        return Ok(new
        {
            id = published.Id,
            name = published.Name,
            published = true,
#if NET10_0_OR_GREATER
            url = _publishedUrlProvider.GetUrl(published)
#else
            url = published.Url()
#endif
        });
    }

    [HttpPost]
#if NET10_0_OR_GREATER
    public async Task<IActionResult> PublishPage([FromQuery] int nodeId)
    {
        if (nodeId <= 0)
            return BadRequest("nodeId must be greater than 0.");

        var content = _contentService.GetById(nodeId);
        if (content is null)
            return NotFound();

        _contentService.Save(content);
        var cultures = new[] { new CulturePublishScheduleModel { Culture = null, Schedule = null } };
        var result = await _contentPublishingService.PublishAsync(content.Key, cultures, Constants.Security.SuperUserKey);

        if (result.Success)
            return Ok(new { message = $"'{content.Name}' published successfully." });

        return StatusCode(500, new { message = $"Publish failed: {result.Status}" });
    }
#else
    public IActionResult PublishPage([FromQuery] int nodeId)
    {
        if (nodeId <= 0)
            return BadRequest("nodeId must be greater than 0.");

        var content = _contentService.GetById(nodeId);
        if (content is null)
            return NotFound();

        var result = _contentService.SaveAndPublish(content);

        if (result.Success)
            return Ok(new { message = $"'{content.Name}' published successfully." });

        return StatusCode(500, new { message = $"Publish failed: {result.Result}" });
    }
#endif

    [HttpPost]
    public IActionResult UnpublishPage([FromQuery] int nodeId)
    {
        if (nodeId <= 0)
            return BadRequest("nodeId must be greater than 0.");

        var content = _contentService.GetById(nodeId);
        if (content is null)
            return NotFound();

        var result = _contentService.Unpublish(content);

        if (result.Success)
            return Ok(new { message = $"'{content.Name}' unpublished successfully." });

        return StatusCode(500, new { message = $"Unpublish failed: {result.Result}" });
    }
}
