using Microsoft.AspNetCore.Authorization;
using Umbraco.Cms.Web.Common.Authorization;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Web.Common.Controllers;
using SplatDev.Umbraco.Plugins.Forums.Models;
using SplatDev.Umbraco.Plugins.Forums.Services;

namespace SplatDev.Umbraco.Plugins.Forums.Controllers;

/// <remarks>
/// Previously anonymous. LockThread, PinThread, DeleteThread, ApproveReply and DeleteReply let anyone moderate the forums. Reading, posting threads and replying stay open.
/// </remarks>
[Authorize(Policy = AuthorizationPolicies.BackOfficeAccess)]
[Route("umbraco/api/forums/[action]")]
public class ForumsApiController : ControllerBase
{
    private readonly IForumsService _service;

    public ForumsApiController(IForumsService service)
    {
        _service = service;
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
    public async Task<IActionResult> GetCategory([FromQuery] string slug)
    {
        if (string.IsNullOrWhiteSpace(slug))
            return BadRequest("Slug is required.");

        var category = await _service.GetCategoryBySlugAsync(slug);
        if (category is null) return NotFound();
        return Ok(category);
    }

    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> GetThreads(
        [FromQuery] int categoryId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var threads = await _service.GetThreadsAsync(categoryId, page, pageSize);
        var total = await _service.GetTotalThreadCountAsync(categoryId);
        return Ok(new { threads, total, page, pageSize });
    }

    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> GetThread([FromQuery] string slug)
    {
        if (string.IsNullOrWhiteSpace(slug))
            return BadRequest("Slug is required.");

        var thread = await _service.GetThreadBySlugAsync(slug);
        if (thread is null) return NotFound();

        await _service.IncrementThreadViewCountAsync(thread.Id);
        return Ok(thread);
    }

    [AllowAnonymous]
    [HttpPost]
    public async Task<IActionResult> CreateThread([FromBody] ForumThread thread)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var created = await _service.CreateThreadAsync(thread);
        return Ok(created);
    }

    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> GetReplies([FromQuery] int threadId)
    {
        var replies = await _service.GetRepliesAsync(threadId, includeDeleted: false);
        return Ok(replies);
    }

    [AllowAnonymous]
    [HttpPost]
    public async Task<IActionResult> AddReply([FromBody] ForumReply reply)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var thread = await _service.GetThreadByIdAsync(reply.ThreadId);
        if (thread is null) return NotFound("Thread not found.");
        if (thread.IsLocked) return BadRequest("Thread is locked.");

        var created = await _service.AddReplyAsync(reply);
        return Ok(created);
    }

    [HttpPost]
    public async Task<IActionResult> LockThread([FromQuery] int threadId, [FromQuery] bool locked = true)
    {
        await _service.LockThreadAsync(threadId, locked);
        return Ok();
    }

    [HttpPost]
    public async Task<IActionResult> PinThread([FromQuery] int threadId, [FromQuery] bool pinned = true)
    {
        await _service.PinThreadAsync(threadId, pinned);
        return Ok();
    }

    [HttpDelete]
    public async Task<IActionResult> DeleteThread([FromQuery] int threadId)
    {
        await _service.DeleteThreadAsync(threadId);
        return Ok();
    }

    [HttpPost]
    public async Task<IActionResult> ApproveReply([FromQuery] int replyId)
    {
        await _service.ApproveReplyAsync(replyId);
        return Ok();
    }

    [HttpDelete]
    public async Task<IActionResult> DeleteReply([FromQuery] int replyId, [FromQuery] bool hard = false)
    {
        if (hard)
            await _service.HardDeleteReplyAsync(replyId);
        else
            await _service.SoftDeleteReplyAsync(replyId);
        return Ok();
    }
}
