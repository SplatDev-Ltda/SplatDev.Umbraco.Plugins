using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using SplatDev.Umbraco.Plugins.Analytics.Configuration;

namespace SplatDev.Umbraco.Plugins.Analytics.ViewComponents;

/// <summary>
/// Emits the tracking beacon for the current page.
/// </summary>
/// <remarks>
/// The v7 build did this with a partial that referenced <c>~/scripts/analytics.js</c> — a
/// loose file the consuming site had to have copied into place, which nothing packed. The
/// script is inline here, so referencing the package is enough.
/// </remarks>
public class AnalyticsViewComponent : ViewComponent
{
    private readonly AnalyticsOptions _options;

    public AnalyticsViewComponent(IOptions<AnalyticsOptions> options) => _options = options.Value;

    /// <param name="nodeId">
    /// The content node being viewed. Omitted, the beacon reports 0, which records the visit
    /// against no node — pass <c>Model.Id</c> from a template.
    /// </param>
    public IViewComponentResult Invoke(int nodeId = 0) =>
        View(new AnalyticsBeaconViewModel(
            NodeId: nodeId,
            UseClientIpLookup: _options.IpSource == IpSource.Client));
}

/// <param name="NodeId">The node the visit is recorded against.</param>
/// <param name="UseClientIpLookup">
/// Whether the beacon asks a public service for the visitor's address before reporting.
/// </param>
public record AnalyticsBeaconViewModel(int NodeId, bool UseClientIpLookup);
