using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using SplatDev.Umbraco.Plugins.Analytics.Models;
using SplatDev.Umbraco.Plugins.Analytics.Services;

namespace SplatDev.Umbraco.Plugins.Analytics.Middleware;

public sealed class AnalyticsMiddleware : IMiddleware
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
            await analytics.RecordVisitAsync(new AnalyticsVisit { VisitorId = visitorId, Path = context.Request.Path, Referrer = context.Request.Headers.Referer.FirstOrDefault(), Browser = context.Request.Headers.UserAgent.FirstOrDefault(), VisitedAtUtc = DateTime.UtcNow });
        }
        catch { /* Tracking must never affect the response. */ }
    }

    private static bool IsTrackable(HttpRequest request) => request.Path.StartsWithSegments("/umbraco", StringComparison.OrdinalIgnoreCase) is false && request.Path.StartsWithSegments("/media", StringComparison.OrdinalIgnoreCase) is false && request.Method.Equals("GET", StringComparison.OrdinalIgnoreCase) && (request.Headers.Accept.FirstOrDefault()?.Contains("text/html", StringComparison.OrdinalIgnoreCase) ?? false);
    private static string CreateVisitorId(HttpContext context)
    {
        var input = $"{context.Connection.RemoteIpAddress}|{context.Request.Headers.UserAgent}|{Guid.NewGuid():N}";
        return Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(input)))[..32];
    }
}
