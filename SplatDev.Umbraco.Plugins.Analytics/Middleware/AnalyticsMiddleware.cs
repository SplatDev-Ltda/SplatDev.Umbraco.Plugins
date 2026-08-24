using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SplatDev.Umbraco.Plugins.Analytics.Configuration;
using SplatDev.Umbraco.Plugins.Analytics.Models;
using SplatDev.Umbraco.Plugins.Analytics.Services;

namespace SplatDev.Umbraco.Plugins.Analytics.Middleware;

/// <summary>
/// Records a visit server-side, on every page the site serves.
/// </summary>
/// <remarks>
/// The tracking component reports things only the browser knows — screen size, and the
/// exit url when the visitor leaves — but it has to be added to every template, and an ad
/// blocker can stop it. This sees every request instead, at the cost of that detail.
///
/// With <c>RecordingMode.Both</c> the middleware records the visit and the component fills
/// in the rest against the same row, rather than creating a second one.
/// </remarks>
public sealed class AnalyticsMiddleware : IMiddleware
{
    private readonly AnalyticsOptions _options;
    private readonly ILogger<AnalyticsMiddleware> _logger;

    public AnalyticsMiddleware(IOptions<AnalyticsOptions> options, ILogger<AnalyticsMiddleware> logger)
    {
        _options = options.Value;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context, RequestDelegate next)
    {
        await next(context);

        if (_options.RecordingMode == RecordingMode.Beacon)
            return;

        if (!ShouldRecord(context))
            return;

        var userAgent = context.Request.Headers.UserAgent.ToString();
        var isBot = BotDetector.IsBot(userAgent);
        if (isBot && !_options.RecordBots)
            return;

        if (_options.IgnoreBackofficeUsers && context.User?.Identity?.IsAuthenticated == true)
            return;

        try
        {
            using var scope = context.RequestServices.CreateScope();
            var service = scope.ServiceProvider.GetRequiredService<IAnalyticsService>();

            await service.RecordVisitAsync(
                new RecordVisitRequest
                {
                    NodeId = ContentNodeId(context),
                    EntryUrl = context.Request.Path.Value + context.Request.QueryString.Value,
                    Referrer = context.Request.Headers.Referer.FirstOrDefault(),
                },
                context.Connection.RemoteIpAddress?.ToString() ?? "0.0.0.0",
                userAgent,
                isBot,
                context.RequestAborted);
        }
        catch (Exception ex)
        {
            // Analytics must never cost the visitor their page.
            _logger.LogError(ex, "Analytics: could not record a visit for {Path}", context.Request.Path);
        }
    }

    /// <summary>
    /// Only successful HTML page responses. Without this the table fills with every
    /// stylesheet, script and image, and the numbers stop meaning anything.
    /// </summary>
    private static bool ShouldRecord(HttpContext context)
    {
        var request = context.Request;

        if (context.Response.StatusCode != StatusCodes.Status200OK) return false;
        if (!HttpMethods.IsGet(request.Method)) return false;
        if (request.Path.StartsWithSegments("/umbraco", StringComparison.OrdinalIgnoreCase)) return false;
        if (request.Path.StartsWithSegments("/media", StringComparison.OrdinalIgnoreCase)) return false;
        if (request.Path.StartsWithSegments("/App_Plugins", StringComparison.OrdinalIgnoreCase)) return false;

        // The response says what it actually is; the Accept header only says what was asked
        // for, and browsers ask for text/html on sub-resources too.
        var contentType = context.Response.ContentType;
        return contentType is not null
            && contentType.Contains("text/html", StringComparison.OrdinalIgnoreCase);
    }

    /// <summary>
    /// The Umbraco content node behind this request, or 0 for a page outside the tree.
    /// </summary>
    private static int ContentNodeId(HttpContext context)
    {
        // Umbraco puts the routed content on the request features during its pipeline;
        // reading it here avoids taking a dependency on UmbracoContext in middleware.
        var routeValue = context.Request.RouteValues.TryGetValue("id", out var id) ? id?.ToString() : null;
        return int.TryParse(routeValue, out var nodeId) ? nodeId : 0;
    }
}
