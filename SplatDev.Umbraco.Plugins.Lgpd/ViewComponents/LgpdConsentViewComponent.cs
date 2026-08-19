using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using SplatDev.Umbraco.Plugins.Lgpd.Models;
using SplatDev.Umbraco.Plugins.Lgpd.Services;

namespace SplatDev.Umbraco.Plugins.Lgpd.ViewComponents;

/// <summary>
/// The visitor-facing consent banner and encarregado disclosure.
/// </summary>
/// <remarks>
/// Render it once in the site layout: <c>@await Component.InvokeAsync("LgpdConsent")</c>.
///
/// The session id is the plugin's own cookie rather than the ASP.NET session, because a
/// consent record has to outlive the browsing session it was given in — art. 8 §1 asks the
/// controller to prove consent long after the visitor has gone.
/// </remarks>
public class LgpdConsentViewComponent : ViewComponent
{
    public const string CookieName = "splatdev_lgpd_sid";

    private readonly ILgpdService _service;
    private readonly LgpdOptions _options;

    public LgpdConsentViewComponent(ILgpdService service, IOptions<LgpdOptions> options)
    {
        _service = service;
        _options = options.Value;
    }

    public async Task<IViewComponentResult> InvokeAsync(string finalidade = "navegacao")
    {
        var sessionId = HttpContext.Request.Cookies[CookieName];

        if (string.IsNullOrWhiteSpace(sessionId))
        {
            sessionId = Guid.NewGuid().ToString("N");

            // A year, matching the usual retention for the consent it identifies. The cookie
            // holds no personal data itself — it is an opaque identifier for the record.
            HttpContext.Response.Cookies.Append(CookieName, sessionId, new Microsoft.AspNetCore.Http.CookieOptions
            {
                HttpOnly = false,          // the banner script reads it
                IsEssential = true,        // strictly necessary: it carries the consent decision
                SameSite = Microsoft.AspNetCore.Http.SameSiteMode.Lax,
                Secure = HttpContext.Request.IsHttps,
                Expires = DateTimeOffset.UtcNow.AddYears(1),
            });
        }

        var atual = await _service.ConsentimentoAtual(sessionId);
        var decidido = atual.Any(c => c.Finalidade == finalidade);

        ViewBag.SessionId = sessionId;
        ViewBag.Finalidade = finalidade;
        ViewBag.JaDecidiu = decidido;
        ViewBag.EncarregadoNome = _options.EncarregadoNome;
        ViewBag.EncarregadoEmail = _options.EncarregadoEmail;

        return View(atual);
    }
}
