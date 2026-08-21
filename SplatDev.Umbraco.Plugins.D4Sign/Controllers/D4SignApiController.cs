using Microsoft.AspNetCore.Authorization;
using Umbraco.Cms.Web.Common.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SplatDev.Umbraco.Plugins.D4Sign.Models;
using SplatDev.Umbraco.Plugins.D4Sign.Services;
using Umbraco.Cms.Infrastructure.Scoping;
using Umbraco.Cms.Web.Common.Controllers;
using NPoco;

namespace SplatDev.Umbraco.Plugins.D4Sign.Controllers;

/// <summary>
/// Public API surface for the D4Sign Umbraco plugin.
/// <list type="bullet">
///   <item>Webhook receiver  — POST /umbraco/api/d4sign/webhook</item>
///   <item>Dashboard data    — GET  /umbraco/api/d4sign/documents</item>
///   <item>Status check      — POST /umbraco/api/d4sign/check-status</item>
/// </list>
/// </summary>
/// <remarks>
/// Previously anonymous. Documents listed the documents in the signature account and CheckStatus read their state. The provider webhook stays open, since the provider cannot authenticate.
/// </remarks>
[Authorize(Policy = AuthorizationPolicies.BackOfficeAccess)]
[Route(D4SignDefaults.ApiRoutePrefix + "/[action]")]
public class D4SignApiController(
    ID4SignService d4SignService,
    IScopeProvider scopeProvider,
    IOptions<D4SignOptions> options,
    ILogger<D4SignApiController> logger) : ControllerBase
{
    private readonly D4SignOptions _opts = options.Value;

    // ── Webhook ───────────────────────────────────────────────────────────────

    /// <summary>
    /// Receives lifecycle events from D4Sign (document_signed, document_canceled, …).
    /// Secure the URL by keeping it secret — store it only in D4Sign:WebhookUrl config.
    /// </summary>
    [AllowAnonymous]
    [HttpPost]
    public async Task<IActionResult> Webhook(
        [FromBody] D4SignWebhookPayload? payload,
        CancellationToken ct)
    {
        if (payload is null || string.IsNullOrWhiteSpace(payload.UuidDocument))
            return BadRequest();

        await d4SignService.ProcessWebhookAsync(payload, ct);
        return Ok();
    }

    // ── Dashboard API ─────────────────────────────────────────────────────────

    /// <summary>
    /// Returns all rows from the configured d4sign_contrato table.
    /// The SQL is deliberately simple and works with any host schema;
    /// the dashboard groups/filters client-side.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> Documents()
    {
        try
        {
            using var scope = scopeProvider.CreateScope();

            // A fresh install has no d4sign_contrato table — the host site creates it. That
            // is a setup step, not a failure, and it used to come back as a 500 carrying
            // "Erro ao buscar documentos D4Sign", which reads as the integration being
            // broken rather than not configured yet.
            if (!scope.SqlContext.SqlSyntax.DoesTableExist(scope.Database, _opts.TableName))
            {
                logger.LogInformation(
                    "D4Sign dashboard: table {Table} does not exist yet", _opts.TableName);

                return Ok(new
                {
                    documents = Array.Empty<object>(),
                    setupRequired = true,
                    message = $"No table named '{_opts.TableName}' exists in this database yet. "
                              + "Create it, or point D4Sign:TableName at the table that holds your contracts.",
                });
            }

            var rows = await scope.Database.FetchAsync<dynamic>(
                new Sql($"SELECT * FROM {_opts.TableName} ORDER BY criado_em DESC"));
            return Ok(new { documents = rows });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "D4Sign dashboard: failed to query {Table}", _opts.TableName);
            return StatusCode(500, new { message = "Erro ao buscar documentos D4Sign." });
        }
    }

    /// <summary>
    /// Asks D4Sign for the current status of a document.
    /// Returns <c>updated: true</c> when the local status changed.
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CheckStatus(
        [FromBody] D4SignCheckStatusRequest? request,
        CancellationToken ct)
    {
        if (request is null || string.IsNullOrWhiteSpace(request.DocUuid))
            return BadRequest(new { message = "docUuid é obrigatório." });

        try
        {
            var isSigned = await d4SignService.IsSignedAsync(request.DocUuid, ct);

            string currentStatus;
            using (var scope = scopeProvider.CreateScope())
            {
                var row = await scope.Database.SingleOrDefaultAsync<dynamic>(
                    new Sql($"SELECT status FROM {_opts.TableName} WHERE doc_uuid=@0", request.DocUuid));

                if (row is null)
                    return NotFound(new { message = "Documento não encontrado." });

                currentStatus = (string)row.status;
            }

            var updated = false;
            if (isSigned && currentStatus != "assinado")
            {
                using var scope = scopeProvider.CreateScope();
                await scope.Database.ExecuteAsync(
                    new Sql($"UPDATE {_opts.TableName} SET status='assinado', assinado_em=@0 WHERE doc_uuid=@1",
                        DateTime.UtcNow, request.DocUuid));
                scope.Complete();

                updated       = true;
                currentStatus = "assinado";

                logger.LogInformation(
                    "D4Sign document {DocUuid} marked signed via manual dashboard check.", request.DocUuid);
            }

            return Ok(new { status = currentStatus, updated, isSigned });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "D4Sign check-status failed for {DocUuid}", request.DocUuid);
            return StatusCode(500, new { message = "Erro ao verificar status." });
        }
    }

    /// <summary>Returns the status row for a given document UUID (used by the status badge).</summary>
    [HttpGet]
    public async Task<IActionResult> Status(string docUuid)
    {
        if (string.IsNullOrWhiteSpace(docUuid))
            return BadRequest(new { message = "docUuid é obrigatório." });

        using var scope = scopeProvider.CreateScope();
        var row = await scope.Database.SingleOrDefaultAsync<dynamic>(
            new Sql($"SELECT status, assinado_em, pdf_blob_url FROM {_opts.TableName} WHERE doc_uuid=@0", docUuid));

        return row is null
            ? NotFound()
            : Ok(new
              {
                  status     = (string)row.status,
                  assinadoEm = (DateTime?)row.assinado_em,
                  pdfBlobUrl = (string?)row.pdf_blob_url,
              });
    }
}
