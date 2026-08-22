using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using Umbraco.Cms.Web.Common.Authorization;

using SplatDev.Directory.Abstractions;
using SplatDev.Directory.Models;

namespace SplatDev.Umbraco.Plugins.RdpManager.Controllers;

/// <summary>
/// Looks people up in the directory so a connection can be filled in from it, and — when
/// a site has explicitly allowed it — creates an account.
/// </summary>
/// <remarks>
/// Separate from the connections controller because it is a different kind of thing:
/// reaching outside Umbraco into Active Directory or Entra ID. Everything here requires
/// backoffice access, and creating accounts additionally requires the site to have
/// switched it on and named the one container accounts may be created in.
/// </remarks>
[Authorize(Policy = AuthorizationPolicies.BackOfficeAccess)]
[Route("umbraco/api/RdpDirectory/[action]")]
public class RdpDirectoryApiController : ControllerBase
{
    private readonly IDirectoryProviderResolver _resolver;

    public RdpDirectoryApiController(IDirectoryProviderResolver resolver) => _resolver = resolver;

    /// <summary>
    /// What the dashboard needs to decide which controls to offer.
    /// </summary>
    /// <remarks>
    /// A dashboard that offers a Create button and then reports "not permitted" wastes
    /// everyone's time. This says up front whether a directory is configured at all,
    /// whether creating is available, and — when it is not — why, so the panel can
    /// explain rather than fail.
    /// </remarks>
    [HttpGet]
    public IActionResult Status()
    {
        var current = _resolver.Current;

        return Ok(new
        {
            configured = current is not null,
            provider = current?.Name,
            canCreateUsers = current?.CanCreateUsers ?? false,
            providers = _resolver.All.Select(p => new
            {
                name = p.Name,
                configured = p.IsConfigured,
                canCreateUsers = p.CanCreateUsers,
            }),
            reason = current is null
                ? "No directory is configured. Set Directory:Enabled and either Directory:Ldap or Directory:Entra in appsettings."
                : current.CanCreateUsers
                    ? null
                    : "Creating accounts is off. It needs Directory:AllowUserCreation, and a container to create them in.",
        });
    }

    [HttpGet]
    public async Task<IActionResult> Search(string term, string? provider = null, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(term)) return Ok(Array.Empty<DirectoryUser>());

        var directory = _resolver.ByName(provider) ?? _resolver.Current;
        if (directory is null) return Ok(Array.Empty<DirectoryUser>());

        return Ok(await directory.SearchUsersAsync(term, 25, cancellationToken));
    }

    [HttpGet]
    public async Task<IActionResult> Find(string login, string? provider = null, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(login)) return BadRequest(new { message = "A login is required." });

        var directory = _resolver.ByName(provider) ?? _resolver.Current;
        if (directory is null) return NotFound(new { message = "No directory is configured." });

        var user = await directory.FindUserAsync(login, cancellationToken);
        return user is null ? NotFound(new { message = $"No account found for {login}." }) : Ok(user);
    }

    [HttpPost]
    public async Task<IActionResult> TestConnection(string? provider = null, CancellationToken cancellationToken = default)
    {
        var directory = _resolver.ByName(provider) ?? _resolver.Current;
        if (directory is null)
            return Ok(new { succeeded = false, message = "No directory is configured." });

        var result = await directory.TestConnectionAsync(cancellationToken);
        return Ok(new { succeeded = result.Succeeded, message = result.Message });
    }

    /// <summary>
    /// Creates a directory account, or says that one already exists and which.
    /// </summary>
    /// <remarks>
    /// Answers 200 for "already exists" rather than a conflict status: the dashboard
    /// shows the account it found, which is the useful outcome, and treating it as an
    /// error would only make the client dig the login back out of an error body.
    /// </remarks>
    [HttpPost]
    public async Task<IActionResult> CreateUser(
        [FromBody] DirectoryUserDraft draft,
        string? provider = null,
        CancellationToken cancellationToken = default)
    {
        if (draft is null) return BadRequest(new { message = "User details are required." });
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var directory = _resolver.ByName(provider) ?? _resolver.Current;
        if (directory is null)
            return Ok(new { outcome = nameof(DirectoryOutcome.NotConfigured), message = "No directory is configured.", user = (DirectoryUser?)null });

        var result = await directory.CreateUserAsync(draft, cancellationToken);

        return Ok(new
        {
            outcome = result.Outcome.ToString(),
            succeeded = result.Succeeded,
            alreadyExists = result.Outcome == DirectoryOutcome.AlreadyExists,
            message = result.Message,
            user = result.User,
        });
    }
}
