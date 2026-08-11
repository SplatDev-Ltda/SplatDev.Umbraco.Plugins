using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using SplatDev.Umbraco.Plugins.NuGetCatalog.Models;
using SplatDev.Umbraco.Plugins.NuGetCatalog.Services;

using Umbraco.Cms.Web.Common.Authorization;

namespace SplatDev.Umbraco.Plugins.NuGetCatalog.Controllers;

/// <summary>
/// Backoffice API for the NuGet catalog dashboard.
/// </summary>
[ApiController]
[Route("umbraco/nuget-catalog/api/v1")]
[Authorize(Policy = AuthorizationPolicies.BackOfficeAccess)]
public class NuGetCatalogController(ICatalogService catalog, ICatalogStore store) : ControllerBase
{
    [HttpGet("packages")]
    [ProducesResponseType(typeof(CatalogResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPackages(CancellationToken ct)
        => Ok(await catalog.GetAsync(refresh: false, ct));

    [HttpPost("refresh")]
    [ProducesResponseType(typeof(CatalogResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> Refresh(CancellationToken ct)
        => Ok(await catalog.GetAsync(refresh: true, ct));

    public record AddPackageRequest(string UrlOrId);

    /// <summary>Adds a package by nuget.org URL or bare id.</summary>
    [HttpPost("packages")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public IActionResult AddPackage([FromBody] AddPackageRequest request)
    {
        if (!store.AddPackage(request.UrlOrId, out var packageId))
        {
            // Either it did not parse as a package id, or it is already in the list.
            // Both are the caller's problem to fix, and neither is a server error.
            return BadRequest(new
            {
                message = packageId is null
                    ? "That is not a nuget.org package URL or a valid package id."
                    : $"{packageId} is already in the catalog.",
            });
        }

        return Ok(new { packageId });
    }

    [HttpDelete("packages/{packageId}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult RemovePackage(string packageId)
        => store.RemovePackage(packageId) ? Ok() : NotFound();

    [HttpPost("hidden/{packageId}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public IActionResult Hide(string packageId)
    {
        store.Hide(packageId);
        return Ok();
    }

    [HttpDelete("hidden/{packageId}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public IActionResult Unhide(string packageId)
    {
        store.Unhide(packageId);
        return Ok();
    }

    public record OwnerRequest(string Owner);

    [HttpPost("owners")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public IActionResult AddOwner([FromBody] OwnerRequest request)
    {
        var owner = request.Owner?.Trim();
        if (string.IsNullOrWhiteSpace(owner))
        {
            return BadRequest(new { message = "An owner account name is required." });
        }

        var settings = store.Get();
        if (settings.Owners.Any(o => string.Equals(o, owner, StringComparison.OrdinalIgnoreCase)))
        {
            return BadRequest(new { message = $"{owner} is already listed." });
        }

        settings.Owners.Add(owner);
        store.Save(settings);
        return Ok(new { owner });
    }

    [HttpDelete("owners/{owner}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public IActionResult RemoveOwner(string owner)
    {
        var settings = store.Get();
        var existing = settings.Owners.FirstOrDefault(o => string.Equals(o, owner, StringComparison.OrdinalIgnoreCase));
        if (existing is not null)
        {
            settings.Owners.Remove(existing);
            store.Save(settings);
        }

        return Ok();
    }
}
