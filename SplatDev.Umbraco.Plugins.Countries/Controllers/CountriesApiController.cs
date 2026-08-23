using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using Umbraco.Cms.Core.Scoping;
using Umbraco.Cms.Web.Common.Authorization;

using SplatDev.Umbraco.Plugins.Countries.Models;

namespace SplatDev.Umbraco.Plugins.Countries.Controllers;

/// <summary>
/// The country list, for the picker.
/// </summary>
/// <remarks>
/// The plugin created a countries table and offered no way to read it — no controller,
/// no service, no UI. The data was there (when the migration worked, which it did not)
/// and nothing could reach it.
/// </remarks>
[Authorize(Policy = AuthorizationPolicies.BackOfficeAccess)]
[Route("umbraco/api/countries/[action]")]
public class CountriesApiController : ControllerBase
{
    private readonly IScopeProvider _scopeProvider;

    public CountriesApiController(IScopeProvider scopeProvider) => _scopeProvider = scopeProvider;

    [HttpGet]
    public IActionResult GetCountries()
    {
        using var scope = _scopeProvider.CreateScope(autoComplete: true);

        var countries = scope.Database
            .Fetch<Country>($"SELECT * FROM {Country.TABLE_NAME} ORDER BY EnShortName")
            .Select(c => new
            {
                c.NumCode,
                c.Alpha2Code,
                c.Alpha3Code,
                Name = c.EnShortName,
                c.Nationality,
            });

        return Ok(countries);
    }
}
