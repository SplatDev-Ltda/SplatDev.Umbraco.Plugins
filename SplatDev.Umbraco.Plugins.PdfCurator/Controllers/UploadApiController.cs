using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

using Umbraco.Cms.Web.Common.Controllers;

namespace SplatDev.Umbraco.Plugins.PdfCurator.Controllers;

[Authorize]
public class UploadApiController : ControllerBase
{
    private const long MaxFileSize = 50 * 1024 * 1024;
    private static readonly HashSet<string> AllowedMimeTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "application/pdf",
        "application/x-pdf",
        "image/vnd.djvu",
        "application/octet-stream"
    };

    private readonly IConfiguration _config;
    private readonly IWebHostEnvironment _webHostEnvironment;
    private readonly ILogger _logger;
    private readonly string _contentRootPath;
    private string _path;

    public UploadApiController(IWebHostEnvironment webHostEnvironment, IConfiguration config, ILogger<UploadApiController> logger)
    {
        _webHostEnvironment = webHostEnvironment;
        _config = config;
        _path = _config.GetValue(Constants.Imports.IMPORT_APP_SETTING, Constants.Imports.DEFAULT_IMPORT_FOLDER) ?? Constants.Imports.DEFAULT_IMPORT_FOLDER;
        _contentRootPath = _webHostEnvironment.ContentRootPath;
        _logger = logger;
    }

    [HttpPost]
    [RequestSizeLimit(MaxFileSize)]
    public async Task<ActionResult> UploadFileAsync(IFormFile file)
    {
        if (file is null || file.Length == 0)
            return BadRequest("No file provided.");

        if (file.Length > MaxFileSize)
            return BadRequest($"File exceeds maximum size of {MaxFileSize / 1024 / 1024} MB.");

        var safeFileName = Path.GetFileName(file.FileName);
        if (string.IsNullOrWhiteSpace(safeFileName))
            return BadRequest("Invalid file name.");

        if (!AllowedMimeTypes.Contains(file.ContentType))
        {
            _logger.LogWarning("Rejected upload with MIME type {MimeType}", file.ContentType);
            return BadRequest("File type not allowed.");
        }

        try
        {
            var targetDir = Path.Combine(_contentRootPath, _path);

            if (!Directory.Exists(targetDir))
            {
                Directory.CreateDirectory(targetDir);
            }

            var filePath = Path.Combine(targetDir, safeFileName);
            await using var fileStream = new FileStream(filePath, FileMode.Create);
            await file.CopyToAsync(fileStream);

            _logger.LogInformation("File uploaded: {FileName}", safeFileName);
            return Ok(new { fileName = safeFileName });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading file {Name}", safeFileName);
            return StatusCode(500, "Upload failed due to server error.");
        }
    }

    [HttpPost]
    [RequestSizeLimit(MaxFileSize)]
    public async Task<ActionResult> UploadFiles()
    {
        var request = HttpContext.Request;
        if (request.Form.Files.Count == 0)
            return BadRequest("No files provided.");

        try
        {
            var uploaded = new List<string>();
            foreach (var file in request.Form.Files)
            {
                var result = await UploadFileAsync(file);
                if (result is OkObjectResult ok)
                    uploaded.Add(file.FileName);
            }

            return Ok(new { uploaded });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading files");
            return StatusCode(500, "Upload failed due to server error.");
        }
    }
}
