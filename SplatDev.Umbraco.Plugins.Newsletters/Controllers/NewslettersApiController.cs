using Microsoft.AspNetCore.Authorization;
using Umbraco.Cms.Web.Common.Authorization;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Web.Common.Controllers;
using SplatDev.Umbraco.Plugins.Newsletters.Models;
using SplatDev.Umbraco.Plugins.Newsletters.Services;

namespace SplatDev.Umbraco.Plugins.Newsletters.Controllers;

/// <remarks>
/// Previously anonymous. GetSubscribers returned the subscriber list - personal data - and SendCampaign let anyone send mail to all of them. Subscribing and unsubscribing stay open.
/// </remarks>
[Authorize(Policy = AuthorizationPolicies.BackOfficeAccess)]
[Route("umbraco/api/newsletters")]
public class NewslettersApiController : ControllerBase
{
    private readonly INewslettersService _service;

    public NewslettersApiController(INewslettersService service)
    {
        _service = service;
    }

    public record SubscribeRequest(string Email, string FirstName, string LastName);
    public record UnsubscribeRequest(string Email);
    public record SendCampaignRequest(int CampaignId);

    [AllowAnonymous]
    [HttpPost("subscribe")]
    public async Task<IActionResult> Subscribe([FromBody] SubscribeRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email))
            return BadRequest("Email is required.");

        var result = await _service.SubscribeAsync(request.Email, request.FirstName, request.LastName);
        return Ok(new { success = result, message = result ? "Subscribed successfully." : "Already subscribed." });
    }

    [AllowAnonymous]
    [HttpPost("unsubscribe")]
    public async Task<IActionResult> Unsubscribe([FromBody] UnsubscribeRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email))
            return BadRequest("Email is required.");

        var result = await _service.UnsubscribeAsync(request.Email);
        return Ok(new { success = result, message = result ? "Unsubscribed." : "Email not found or already unsubscribed." });
    }

    [HttpGet("subscribers")]
    public async Task<IActionResult> GetSubscribers()
    {
        var subscribers = await _service.GetSubscribersAsync();
        return Ok(subscribers);
    }

    [HttpGet("campaigns")]
    public async Task<IActionResult> GetCampaigns()
    {
        var campaigns = await _service.GetCampaignsAsync();
        return Ok(campaigns);
    }

    [HttpPost("send")]
    public async Task<IActionResult> SendCampaign([FromBody] SendCampaignRequest request)
    {
        try
        {
            await _service.SendCampaignAsync(request.CampaignId);
            return Ok(new { success = true });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("campaigns")]
    public async Task<IActionResult> CreateCampaign([FromBody] NewsletterCampaign campaign)
    {
        if (string.IsNullOrWhiteSpace(campaign.Subject))
            return BadRequest("Subject is required.");

        // Use a context directly for campaign creation. Campaigns created here start as Draft.
        // This is a simplified endpoint; a full implementation would use a campaign service method.
        campaign.Id = 0;
        campaign.Status = CampaignStatus.Draft;
        campaign.SentAt = null;

        return Ok(campaign); // placeholder — real implementation persists via service
    }
}
