// The dashboard that calls this is the Umbraco 17 (Lit) one; Umbraco 13 ships no UI for
// it, and this project's net8.0 target does not reference Umbraco.Cms.Web.Common.
#if NET10_0_OR_GREATER
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;

using Umbraco.Cms.Web.Common.Authorization;

namespace SplatDev.Umbraco.Plugins.Yaml2Schema.Controllers;

/// <summary>
/// Reports whether an import is pending and when the last one ran.
/// </summary>
/// <remarks>
/// The dashboard has always called GET /umbraco/api/Yaml2Schema/Status, but no controller
/// existed, so the call 404'd on every load. The dashboard swallowed that and displayed
/// hardcoded text describing what the plugin does in general, which read as real status —
/// it said an import runs "on every application startup when the YAML file is present"
/// whether or not a file was there, and never revealed that one had run.
///
/// The state is derived the same way <c>YamlInitializationHandler</c> derives it: the
/// configured path, resolved against the content root, and the *.done file it renames the
/// YAML to once an import succeeds.
/// </remarks>
[Authorize(Policy = AuthorizationPolicies.BackOfficeAccess)]
[Route("umbraco/api/Yaml2Schema")]
public class Yaml2SchemaApiController : ControllerBase
{
    private const string DefaultConfigPath = "config/umbraco.yml";

    private readonly IConfiguration _configuration;
    private readonly IHostEnvironment _hostEnvironment;

    public Yaml2SchemaApiController(IConfiguration configuration, IHostEnvironment hostEnvironment)
    {
        _configuration = configuration;
        _hostEnvironment = hostEnvironment;
    }

    [HttpGet("Status")]
    public IActionResult Status()
    {
        var configured = _configuration["UmbracoYaml:ConfigPath"] ?? DefaultConfigPath;
        var configPath = Path.IsPathRooted(configured)
            ? configured
            : Path.Combine(_hostEnvironment.ContentRootPath, configured);

        var donePath = Path.ChangeExtension(configPath, ".done");
        var doneExists = System.IO.File.Exists(donePath);

        return Ok(new
        {
            // Report the configured value, not the absolute path: the absolute path leaks the
            // server's directory layout into the browser and is not what anyone edits.
            configPath = configured,
            pendingImport = System.IO.File.Exists(configPath),
            lastImportSucceeded = doneExists,
            lastImportDate = doneExists
                ? System.IO.File.GetLastWriteTimeUtc(donePath).ToString("O")
                : null,
            processedFile = doneExists ? Path.GetFileName(donePath) : null,
        });
    }
}
#endif
