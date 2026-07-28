using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

using SplatDev.DigitalBookCurator.Core.Models;
using SplatDev.DigitalBookCurator.Core.Repositories;
using SplatDev.Umbraco.Plugins.PdfCurator.Models;

#if NET10_0_OR_GREATER
using Umbraco.Cms.Api.Management.Controllers;
using UmbracoAuthorizedBase = Umbraco.Cms.Api.Management.Controllers.ManagementApiControllerBase;
#else
using Umbraco.Cms.Web.BackOffice.Controllers;
using UmbracoAuthorizedBase = Umbraco.Cms.Web.BackOffice.Controllers.UmbracoAuthorizedApiController;
#endif

namespace SplatDev.Umbraco.Plugins.PdfCurator.Controllers;

public class ImportApiController : UmbracoAuthorizedBase
{
    private readonly IWebHostEnvironment _webHostEnvironment;
    private readonly IConfiguration _config;
    private readonly FileManagerService _fileManagerService;
    private readonly string _contentRootPath;
    private readonly string _path;

    public ImportApiController(IConfiguration config,
        IWebHostEnvironment webHostEnvironment,
        FileManagerService fileManagerService)
    {
        _config = config;
        _webHostEnvironment = webHostEnvironment;
        _path = _config.GetValue(Constants.Imports.IMPORT_APP_SETTING, Constants.Imports.DEFAULT_IMPORT_FOLDER) ?? Constants.Imports.DEFAULT_IMPORT_FOLDER;
        _contentRootPath = _webHostEnvironment.ContentRootPath;
        _fileManagerService = fileManagerService;
    }

    [HttpGet("ready")]
    public async Task<IEnumerable<FileImportAvailable>> GetAllReadyAsync(bool done = false)
    {
        var path = Path.Combine(_contentRootPath, _path);
        if (done) path = Path.Combine(_contentRootPath, Constants.Imports.DONE_FOLDER);
        var files = Directory.GetFiles(path);
        var list = new List<FileImportAvailable>();
        foreach (var file in files)
        {
            var fileInfo = new FileInfo(file);
            list.Add(new FileImportAvailable
            {
                Name = fileInfo.Name,
                Size = fileInfo.Length / 1024
            });
        }
        await Task.FromResult(0);
        return list;
    }

    [HttpGet("done")]
    public async Task<IEnumerable<FileImportAvailable>> GetAllDoneAsync()
    {
        return await GetAllReadyAsync(done: true);
    }

    [HttpPost("import")]
    public IAsyncEnumerable<BookImportResult> ImportAll()
    {
        var path = Path.Combine(_contentRootPath, _path);
        var destination = Path.Combine(_contentRootPath, Constants.Imports.DONE_FOLDER);
        return _fileManagerService.ProcessUploadedAsync(path, destination);
    }
}
