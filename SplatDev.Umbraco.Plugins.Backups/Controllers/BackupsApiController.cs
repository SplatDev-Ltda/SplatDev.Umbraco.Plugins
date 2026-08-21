using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Web.Common.Authorization;
using Umbraco.Cms.Web.Common.Controllers;
using SplatDev.Umbraco.Plugins.Backups.Configuration;
using SplatDev.Umbraco.Plugins.Backups.Models;
using SplatDev.Umbraco.Plugins.Backups.Services;

namespace SplatDev.Umbraco.Plugins.Backups.Controllers;

/// <summary>
/// Backup and restore, for the backoffice dashboard.
/// </summary>
/// <remarks>
/// This route carried no authorization at all until 3.3.0. Every action below —
/// including Restore, which replaces site content, and Delete — was reachable by any
/// anonymous caller. "umbraco/api/" is a routing convention, not an authorization
/// boundary; nothing gates it unless the controller says so.
/// </remarks>
[Authorize(Policy = AuthorizationPolicies.BackOfficeAccess)]
// The action-level route templates that used to sit on CreateAdvanced, Restore,
// GetCloudProviders and TestProvider combined with this prefix rather than replacing
// it, so the real URLs were /backups/GetCloudProviders/providers and the like. No
// shipped UI ever called them — the dashboard made no requests at all — so they were
// never noticed. They now resolve at /umbraco/api/backups/<Action> like the rest.
[Route("umbraco/api/backups/[action]")]
public class BackupsApiController : ControllerBase
{
    private readonly IBackupsService _service;

    public BackupsApiController(IBackupsService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var backups = await _service.ListBackupsAsync();
        return Ok(backups);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] BackupRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var result = await _service.CreateBackupAsync(request);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> CreateAdvanced([FromBody] BackupOptions options, CancellationToken ct)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var result = await _service.CreateBackupAsync(options, ct);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Restore([FromQuery] string backupPath, [FromBody] RestoreOptions options, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(backupPath))
            return BadRequest("Backup path is required.");

        var result = await _service.RestoreBackupAsync(backupPath, options, ct);
        return Ok(result);
    }

    [HttpDelete]
    public async Task<IActionResult> Delete([FromQuery] string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            return BadRequest("Backup name is required.");

        try
        {
            await _service.DeleteBackupAsync(name);
            return Ok(new { message = $"Backup '{name}' deleted." });
        }
        catch (FileNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetCloudProviders()
    {
        var providers = await _service.GetCloudProvidersAsync();
        return Ok(providers);
    }

    [HttpPost]
    public async Task<IActionResult> TestProvider([FromQuery] string providerId, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(providerId))
            return BadRequest("Provider ID is required.");

        var valid = await _service.TestCloudProviderAsync(providerId, ct);
        return Ok(new { providerId, valid });
    }
}
