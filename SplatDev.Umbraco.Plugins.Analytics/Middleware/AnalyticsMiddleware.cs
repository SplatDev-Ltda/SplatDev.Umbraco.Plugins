using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using SplatDev.Umbraco.Plugins.Analytics.Models;
using SplatDev.Umbraco.Plugins.Analytics.Services;

namespace SplatDev.Umbraco.Plugins.Analytics.Middleware;

public sealed class AnalyticsMiddleware(ILogger<AnalyticsMiddleware> logger) : IMiddleware
{
    private const string CookieName = "_analytics_vid";
    public async Task InvokeAsync(HttpContext context, RequestDelegate next)
    {
        var visitorId = context.Request.Cookies[CookieName] ?? CreateVisitorId(context);
        await next(context);
        if (context.Response.StatusCode != StatusCodes.Status200OK || !IsTrackable(context.Request)) return;
        if (!context.Response.HasStarted) context.Response.Cookies.Append(CookieName, visitorId, new CookieOptions { HttpOnly = true, SameSite = SameSiteMode.Lax, Secure = context.Request.IsHttps, MaxAge = TimeSpan.FromDays(365), IsEssential = false });
        try
        {
            using var scope = context.RequestServices.CreateScope();
            var analytics = scope.ServiceProvider.GetRequiredService<IAnalyticsService>();
            await analytics.RecordVisitAsync(new AnalyticsVisit
            {
                VisitorId = visitorId,
                Path = Truncate(context.Request.Path.Value, 512) ?? "/",
                Referrer = Truncate(context.Request.Headers.Referer.FirstOrDefault(), 512),
                Browser = Truncate(context.Request.Headers.UserAgent.FirstOrDefault(), 128),
                VisitedAtUtc = DateTime.UtcNow
            });
        }
        catch (Exception ex) { logger.LogError(ex, "Failed to record analytics visit for {Path}", context.Request.Path); }
    }

    private static string? Truncate(string? value, int max) => value is null ? null : value.Length <= max ? value : value[..max];
    private static bool IsTrackable(HttpRequest request) => !request.Path.StartsWithSegments("/umbraco", StringComparison.OrdinalIgnoreCase) && !request.Path.StartsWithSegments("/media", StringComparison.OrdinalIgnoreCase) && request.Method.Equals("GET", StringComparison.OrdinalIgnoreCase) && (request.Headers.Accept.FirstOrDefault()?.Contains("text/html", StringComparison.OrdinalIgnoreCase) ?? false);
    private static string CreateVisitorId(HttpContext context) => Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes($"{context.Connection.RemoteIpAddress}|{context.Request.Headers.UserAgent}|{Guid.NewGuid():N}")))[..32];
}
