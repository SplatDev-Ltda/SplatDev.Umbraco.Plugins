using Microsoft.AspNetCore.Authorization;
using Umbraco.Cms.Web.Common.Authorization;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Web.Common.Controllers;
using SplatDev.Umbraco.Plugins.Blog.Models;
using SplatDev.Umbraco.Plugins.Blog.Services;

namespace SplatDev.Umbraco.Plugins.Blog.Controllers;

/// <remarks>
/// Previously anonymous. ApproveComment and DeleteComment let anyone moderate the blog. Reads and visitor comments stay open.
/// </remarks>
[Authorize(Policy = AuthorizationPolicies.BackOfficeAccess)]
[Route("umbraco/api/blog/[action]")]
public class BlogApiController : ControllerBase
{
    private readonly IBlogService _service;

    public BlogApiController(IBlogService service)
    {
        _service = service;
    }

    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> GetPosts(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] bool publishedOnly = true)
    {
        var posts = await _service.GetPostsAsync(page, pageSize, publishedOnly);
        var total = await _service.GetTotalPostCountAsync(publishedOnly);
        return Ok(new { posts, total, page, pageSize });
    }

    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> GetPost([FromQuery] string slug)
    {
        if (string.IsNullOrWhiteSpace(slug))
            return BadRequest("Slug is required.");

        var post = await _service.GetPostBySlugAsync(slug);
        if (post is null)
            return NotFound();

        await _service.IncrementViewCountAsync(post.Id);
        return Ok(post);
    }

    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> GetCategories()
    {
        var categories = await _service.GetCategoriesAsync();
        return Ok(categories);
    }

    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> GetTags()
    {
        var tags = await _service.GetTagsAsync();
        return Ok(tags);
    }

    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> GetPostsByCategory(
        [FromQuery] string categorySlug,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        if (string.IsNullOrWhiteSpace(categorySlug))
            return BadRequest("Category slug is required.");

        var posts = await _service.GetPostsByCategoryAsync(categorySlug, page, pageSize);
        return Ok(posts);
    }

    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> GetPostsByTag(
        [FromQuery] string tagSlug,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        if (string.IsNullOrWhiteSpace(tagSlug))
            return BadRequest("Tag slug is required.");

        var posts = await _service.GetPostsByTagAsync(tagSlug, page, pageSize);
        return Ok(posts);
    }

    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> GetArchive(
        [FromQuery] int year,
        [FromQuery] int? month = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var posts = await _service.GetPostsByArchiveAsync(year, month, page, pageSize);
        return Ok(posts);
    }

    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> GetComments([FromQuery] int postId)
    {
        var comments = await _service.GetCommentsAsync(postId, approvedOnly: true);
        return Ok(comments);
    }

    [AllowAnonymous]
    [HttpPost]
    public async Task<IActionResult> AddComment([FromBody] BlogComment comment)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var created = await _service.AddCommentAsync(comment);
        return Ok(new { id = created.Id, message = "Comment submitted for moderation." });
    }

    [HttpPost]
    public async Task<IActionResult> ApproveComment([FromQuery] int commentId)
    {
        await _service.ApproveCommentAsync(commentId);
        return Ok();
    }

    [HttpDelete]
    public async Task<IActionResult> DeleteComment([FromQuery] int commentId)
    {
        await _service.DeleteCommentAsync(commentId);
        return Ok();
    }
}
