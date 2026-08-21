using Microsoft.AspNetCore.Authorization;
using Umbraco.Cms.Web.Common.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SplatDev.Umbraco.Plugins.ENotAssina.Models;
using SplatDev.Umbraco.Plugins.ENotAssina.Services;
using Umbraco.Cms.Infrastructure.Scoping;
using Umbraco.Cms.Web.Common.Controllers;
using NPoco;

namespace SplatDev.Umbraco.Plugins.ENotAssina.Controllers;

/// <summary>
/// Public API surface for the e-Not Assina Umbraco plugin.
/// <list type="bullet">
///   <item>Webhook receiver  — POST /umbraco/api/enotassina/webhook</item>
///   <item>Dashboard data    — GET  /umbraco/api/enotassina/documents</item>
///   <item>Status check      — POST /umbraco/api/enotassina/check-status</item>
///   <item>Cancel flow       — POST /umbraco/api/enotassina/cancel</item>
/// </list>
/// </summary>
/// <remarks>
/// Previously anonymous. Documents, ByLocacao and CertificateInfo disclosed signature records, and Cancel withdrew them. The provider webhook stays open.
/// </remarks>
[Authorize(Policy = AuthorizationPolicies.BackOfficeAccess)]
[Route(ENotAssinaDefaults.ApiRoutePrefix + "/[action]")]
public class ENotAssinaApiController(
    IENotAssinaService eNotService,
    IScopeProvider scopeProvider,
    IOptions<ENotAssinaOptions> options,
    ILogger<ENotAssinaApiController> logger) : ControllerBase
{
    private readonly ENotAssinaOptions _opts = options.Value;

    // ── Webhook ───────────────────────────────────────────────────────────────

    /// <summary>
    /// Receives lifecycle events from e-Not Assina (DocumentConcluded, DocumentCanceled, …).
    /// Pass the webhook URL to e-Not Assina in the document creation payload's <c>webhookUrl</c> field.
    /// </summary>
    [AllowAnonymous]
    [HttpPost]
    public async Task<IActionResult> Webhook(
        [FromBody] ENotWebhookPayload? payload,
        CancellationToken ct)
    {
        if (payload is null || string.IsNullOrWhiteSpace(payload.DocumentId))
            return BadRequest();

        if (payload.Event == "DocumentConcluded")
        {
            // Update local status to signed
            try
            {
                using var scope = scopeProvider.CreateScope();
                await scope.Database.ExecuteAsync(new Sql(
                    $"UPDATE {_opts.TableName} SET status='assinado', assinado_em=@0 WHERE doc_id=@1",
                    payload.ConcludedAt ?? DateTime.UtcNow, payload.DocumentId));
                scope.Complete();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "e-Not Assina webhook DB update failed for {DocId}", payload.DocumentId);
            }
        }

        await eNotService.ProcessWebhookAsync(payload, ct);
        return Ok();
    }

    // ── Dashboard API ─────────────────────────────────────────────────────────

    /// <summary>
    /// Returns all rows from the configured e-Not Assina table.
    /// When <see cref="ENotAssinaOptions.LocacaoTableName"/> is configured the result is
    /// enriched via JOINs to the related locação and cadastro tables.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> Documents()
    {
        try
        {
            using var scope = scopeProvider.CreateScope();
            IList<dynamic> rows;

            // The host site owns these tables; a fresh install has none of them. That is a
            // setup step rather than a failure, and it used to surface as a 500 saying
            // "Erro ao buscar documentos e-Not Assina", which reads as a broken integration.
            if (!scope.SqlContext.SqlSyntax.DoesTableExist(scope.Database, _opts.TableName))
            {
                logger.LogInformation(
                    "e-Not Assina dashboard: table {Table} does not exist yet", _opts.TableName);

                return Ok(new
                {
                    documents = Array.Empty<object>(),
                    setupRequired = true,
                    message = $"No table named '{_opts.TableName}' exists in this database yet. "
                              + "Create it, or point ENotAssina:TableName at the table that holds your documents.",
                });
            }

            if (!string.IsNullOrWhiteSpace(_opts.LocacaoTableName) &&
                !string.IsNullOrWhiteSpace(_opts.CadastroLocacaoTableName) &&
                !string.IsNullOrWhiteSpace(_opts.CadastroUnicoTableName))
            {
                var sql = new Sql($@"
                    SELECT
                        ec.id,
                        ec.locacao_id,
                        ec.cartorio_doc_id,
                        ec.cartorio_link,
                        ec.status,
                        ec.criado_em,
                        ec.assinado_em,
                        ec.pdf_blob_url,
                        ec.nome_assinante,
                        ec.cpf_assinante,
                        ec.email_assinante,
                        ec.certificado_ativo,
                        ec.cartorio_emissor,
                        cu.razao_social,
                        cu.cnpj,
                        cl.slug_desejado,
                        cl.regional_codigo,
                        cl.uf
                    FROM {_opts.TableName} ec
                    INNER JOIN {_opts.CadastroLocacaoTableName} cl ON cl.id = ec.locacao_id
                    INNER JOIN {_opts.CadastroUnicoTableName} cu ON cu.id = cl.cadastro_unico_id
                    ORDER BY ec.criado_em DESC");
                rows = await scope.Database.FetchAsync<dynamic>(sql);
            }
            else
            {
                rows = await scope.Database.FetchAsync<dynamic>(
                    new Sql($"SELECT * FROM {_opts.TableName} ORDER BY criado_em DESC"));
            }

            return Ok(new { documents = rows });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "e-Not Assina dashboard: failed to query {Table}", _opts.TableName);
            return StatusCode(500, new { message = "Erro ao buscar documentos e-Not Assina." });
        }
    }

    /// <summary>
    /// Returns the e-Not Assina document and related data for a specific locação.
    /// Requires <see cref="ENotAssinaOptions.LocacaoTableName"/> to be configured.
    /// </summary>
    [HttpGet("{locacaoId:int}")]
    [ActionName("ByLocacao")]
    public async Task<IActionResult> ByLocacao(int locacaoId)
    {
        if (string.IsNullOrWhiteSpace(_opts.LocacaoTableName) ||
            string.IsNullOrWhiteSpace(_opts.CadastroLocacaoTableName) ||
            string.IsNullOrWhiteSpace(_opts.CadastroUnicoTableName))
            return StatusCode(501, new { message = "LocacaoTableName options are not configured." });

        try
        {
            using var scope = scopeProvider.CreateScope();
            var sql = new Sql($@"
                SELECT
                    ec.*,
                    cu.razao_social,
                    cu.cnpj,
                    cu.email,
                    cl.slug_desejado
                FROM {_opts.TableName} ec
                INNER JOIN {_opts.CadastroLocacaoTableName} cl ON cl.id = ec.locacao_id
                INNER JOIN {_opts.CadastroUnicoTableName} cu ON cu.id = cl.cadastro_unico_id
                WHERE ec.locacao_id = @0", locacaoId);

            var document = await scope.Database.SingleOrDefaultAsync<dynamic>(sql);
            if (document is null)
                return NotFound(new { message = "Documento não encontrado para esta locação." });

            return Ok(new { document });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "e-Not Assina ByLocacao failed for {LocacaoId}", locacaoId);
            return StatusCode(500, new { message = "Erro ao buscar documento." });
        }
    }

    /// <summary>
    /// Returns the most recent certificate information for a specific CPF.
    /// </summary>
    [HttpGet("{cpf}")]
    [ActionName("CertificateInfo")]
    public async Task<IActionResult> CertificateInfo(string cpf)
    {
        try
        {
            using var scope = scopeProvider.CreateScope();
            var sql = new Sql($@"
                SELECT TOP 1
                    ec.cpf_assinante,
                    ec.certificado_ativo,
                    ec.cartorio_emissor,
                    ec.criado_em
                FROM {_opts.TableName} ec
                WHERE ec.cpf_assinante = @0
                ORDER BY ec.criado_em DESC", cpf);

            var cert = await scope.Database.SingleOrDefaultAsync<dynamic>(sql);
            if (cert is null)
                return NotFound(new { message = "Nenhum certificado encontrado para este CPF." });

            return Ok(new { certificate = cert });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "e-Not Assina CertificateInfo failed for CPF {Cpf}", cpf);
            return StatusCode(500, new { message = "Erro ao buscar informações do certificado." });
        }
    }

    /// <summary>
    /// Queries e-Not Assina for the current document status.
    /// Updates the local row when the status changed to "Concluded".
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CheckStatus(
        [FromBody] ENotCheckStatusRequest? request,
        CancellationToken ct)
    {
        if (request is null || string.IsNullOrWhiteSpace(request.DocId))
            return BadRequest(new { message = "docId é obrigatório." });

        try
        {
            var isSigned = await eNotService.IsSignedAsync(request.DocId, ct);

            string currentStatus;
            using (var scope = scopeProvider.CreateScope())
            {
                var row = await scope.Database.SingleOrDefaultAsync<dynamic>(
                    new Sql($"SELECT status FROM {_opts.TableName} WHERE doc_id=@0", request.DocId));

                if (row is null)
                    return NotFound(new { message = "Documento não encontrado." });

                currentStatus = (string)row.status;
            }

            var updated = false;
            if (isSigned && currentStatus != "assinado")
            {
                using var scope = scopeProvider.CreateScope();
                await scope.Database.ExecuteAsync(new Sql(
                    $"UPDATE {_opts.TableName} SET status='assinado', assinado_em=@0 WHERE doc_id=@1",
                    DateTime.UtcNow, request.DocId));
                scope.Complete();

                updated       = true;
                currentStatus = "assinado";

                logger.LogInformation(
                    "e-Not Assina document {DocId} marked signed via manual dashboard check.", request.DocId);
            }

            return Ok(new { status = currentStatus, updated, isSigned });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "e-Not Assina check-status failed for {DocId}", request.DocId);
            return StatusCode(500, new { message = "Erro ao verificar status." });
        }
    }

    /// <summary>Cancels a pending e-Not Assina signature flow.</summary>
    [HttpPost]
    public async Task<IActionResult> Cancel(
        [FromBody] ENotCancelRequest? request,
        CancellationToken ct)
    {
        if (request is null || string.IsNullOrWhiteSpace(request.DocId))
            return BadRequest(new { message = "docId é obrigatório." });

        try
        {
            await eNotService.CancelAsync(request.DocId, ct);

            using var scope = scopeProvider.CreateScope();
            await scope.Database.ExecuteAsync(new Sql(
                $"UPDATE {_opts.TableName} SET status='cancelado' WHERE doc_id=@0", request.DocId));
            scope.Complete();

            logger.LogInformation("e-Not Assina flow {DocId} canceled via backoffice.", request.DocId);
            return Ok(new { canceled = true });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "e-Not Assina cancel failed for {DocId}", request.DocId);
            return StatusCode(500, new { message = "Erro ao cancelar documento." });
        }
    }
}
