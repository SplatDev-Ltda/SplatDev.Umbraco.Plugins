using Microsoft.AspNetCore.Authorization;
using Umbraco.Cms.Web.Common.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Umbraco.Cms.Web.Common.Controllers;
using SplatDev.Umbraco.Plugins.EmailNotifications.Models;
using SplatDev.Umbraco.Plugins.EmailNotifications.Services;

namespace SplatDev.Umbraco.Plugins.EmailNotifications.Controllers;

/// <remarks>
/// Previously anonymous. GetSubscribers returned the subscriber list and SendCampaign mailed all of them. Subscribing and unsubscribing stay open.
/// </remarks>
[Authorize(Policy = AuthorizationPolicies.BackOfficeAccess)]
[Route("umbraco/api/newsletter")]
public class NewsletterController(
    INewsletterService newsletterService,
    ILogger<NewsletterController> logger) : ControllerBase
{
    public record SubscribeRequest(string Email, string? ListId = null, string? MemberId = null,
        string? FirstName = null, string? LastName = null);

    public record UnsubscribeRequest(string Email, string? ListId = null);

    // --- Subscribers ---

    [HttpGet("subscribers")]
    public async Task<IActionResult> GetSubscribers([FromQuery] string? listId, CancellationToken ct) =>
        Ok(await newsletterService.GetSubscribersAsync(listId, ct));

    [AllowAnonymous]
    [HttpPost("subscribe")]
    public async Task<IActionResult> Subscribe([FromBody] SubscribeRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Email))
            return BadRequest("Email is required.");

        var sub = await newsletterService.SubscribeAsync(
            request.Email, request.ListId, request.MemberId,
            request.FirstName, request.LastName, ct);

        return sub is null ? BadRequest("Invalid email address.") : Ok(sub);
    }

    [AllowAnonymous]
    [HttpPost("unsubscribe")]
    public async Task<IActionResult> Unsubscribe([FromBody] UnsubscribeRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Email))
            return BadRequest("Email is required.");

        var result = await newsletterService.UnsubscribeAsync(request.Email, request.ListId, ct);
        return Ok(new { success = result });
    }

    // --- Campaigns ---

    [HttpGet("campaigns")]
    public async Task<IActionResult> GetCampaigns(CancellationToken ct) =>
        Ok(await newsletterService.GetCampaignsAsync(ct));

    [HttpGet("campaigns/{id:int}")]
    public async Task<IActionResult> GetCampaign(int id, CancellationToken ct)
    {
        var campaign = await newsletterService.GetCampaignAsync(id, ct);
        return campaign is null ? NotFound() : Ok(campaign);
    }

    [HttpPost("campaigns")]
    public async Task<IActionResult> CreateCampaign([FromBody] Campaign campaign, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(campaign.Subject))
            return BadRequest("Subject is required.");

        var created = await newsletterService.CreateCampaignAsync(campaign, ct);
        return CreatedAtAction(nameof(GetCampaign), new { id = created.Id }, created);
    }

    [HttpPut("campaigns/{id:int}")]
    public async Task<IActionResult> UpdateCampaign(int id, [FromBody] Campaign campaign, CancellationToken ct)
    {
        try
        {
            var updated = await newsletterService.UpdateCampaignAsync(id, campaign, ct);
            return updated is null ? NotFound() : Ok(updated);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("campaigns/{id:int}/send")]
    public async Task<IActionResult> SendCampaign(int id, CancellationToken ct)
    {
        try
        {
            var stats = await newsletterService.ScheduleSendAsync(id, ct);
            return Ok(stats);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet("campaigns/{id:int}/stats")]
    public async Task<IActionResult> GetStats(int id, CancellationToken ct)
    {
        try
        {
            return Ok(await newsletterService.GetStatsAsync(id, ct));
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }
}
