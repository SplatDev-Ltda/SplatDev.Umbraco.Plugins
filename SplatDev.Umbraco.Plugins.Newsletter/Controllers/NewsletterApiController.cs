using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
#if NET10_0_OR_GREATER
using Umbraco.Cms.Api.Management.Controllers;
#else
using Umbraco.Cms.Web.BackOffice.Controllers;
#endif
using SplatDev.Umbraco.Plugins.Newsletter.Models;
using SplatDev.Umbraco.Plugins.Newsletter.Services;

namespace SplatDev.Umbraco.Plugins.Newsletter.Controllers;

[Route("umbraco/management/api/v1/newsletter")]
public class NewsletterApiController(
    INewsletterService newsletterService,
    ILogger<NewsletterApiController> logger)
#if NET10_0_OR_GREATER
    : ManagementApiControllerBase
#else
    : UmbracoAuthorizedApiController
#endif
{
    // ── Subscriber lists ─────────────────────────────────────────────────────

    [HttpGet("lists")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public IActionResult GetLists() => Ok(newsletterService.GetAllLists());

    [HttpPost("lists")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public IActionResult CreateList([FromBody] CreateListRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Name))
            return BadRequest("Name is required.");
        var list = newsletterService.CreateList(req.Name);
        return CreatedAtAction(nameof(GetLists), new { }, list);
    }

    [HttpDelete("lists/{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult DeleteList(int id) =>
        newsletterService.DeleteList(id) ? NoContent() : NotFound();

    // ── Subscribers ──────────────────────────────────────────────────────────

    [HttpGet("lists/{listId:int}/subscribers")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public IActionResult GetSubscribers(int listId) =>
        Ok(newsletterService.GetSubscribers(listId));

    [HttpPost("lists/{listId:int}/subscribers")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public IActionResult Subscribe(int listId, [FromBody] SubscribeRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Email))
            return BadRequest("Email is required.");
        var subscriber = newsletterService.Subscribe(listId, req.Email, req.Name, req.MemberKey);
        return Ok(subscriber);
    }

    [HttpDelete("lists/{listId:int}/subscribers/{email}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult Unsubscribe(int listId, string email) =>
        newsletterService.Unsubscribe(listId, email) ? NoContent() : NotFound();

    [HttpDelete("subscribers/{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult DeleteSubscriber(int id) =>
        newsletterService.DeleteSubscriber(id) ? NoContent() : NotFound();

    // ── Campaigns ────────────────────────────────────────────────────────────

    [HttpGet("campaigns")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public IActionResult GetCampaigns() => Ok(newsletterService.GetAllCampaigns());

    [HttpGet("campaigns/{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult GetCampaign(int id)
    {
        var campaign = newsletterService.GetCampaignById(id);
        return campaign is null ? NotFound() : Ok(campaign);
    }

    [HttpPost("campaigns")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public IActionResult CreateCampaign([FromBody] Campaign campaign)
    {
        if (string.IsNullOrWhiteSpace(campaign.Name))
            return BadRequest("Name is required.");
        var created = newsletterService.Create(campaign);
        return CreatedAtAction(nameof(GetCampaign), new { id = created.Id }, created);
    }

    [HttpPut("campaigns/{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult UpdateCampaign(int id, [FromBody] Campaign campaign)
    {
        var updated = newsletterService.Update(id, campaign);
        return updated is null ? NotFound() : Ok(updated);
    }

    [HttpDelete("campaigns/{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult DeleteCampaign(int id) =>
        newsletterService.DeleteCampaign(id) ? NoContent() : NotFound();

    [HttpPost("campaigns/{id:int}/send")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> SendCampaign(int id, CancellationToken ct)
    {
        try
        {
            var count = await newsletterService.SendCampaignAsync(id, ct);
            return Ok(new { sent = count });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Campaign {CampaignId} send failed.", id);
            return StatusCode(StatusCodes.Status500InternalServerError, "Send failed.");
        }
    }

    // ── Stats ────────────────────────────────────────────────────────────────

    [HttpGet("campaigns/{id:int}/stats")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult GetStats(int id)
    {
        var stats = newsletterService.GetStats(id);
        return stats is null ? NotFound() : Ok(stats);
    }

    [HttpPost("campaigns/{id:int}/stats/fetch")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> FetchStats(int id, CancellationToken ct)
    {
        var stats = await newsletterService.FetchStatsFromMailgunAsync(id, ct);
        return stats is null ? NotFound() : Ok(stats);
    }
}

public record CreateListRequest(string Name);
public record SubscribeRequest(string Email, string? Name = null, Guid? MemberKey = null);
