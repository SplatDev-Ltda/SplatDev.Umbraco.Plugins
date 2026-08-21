using Microsoft.AspNetCore.Http;
using Umbraco.Cms.Core.Models;
using SplatDev.Umbraco.Plugins.Dropzone.Models;

namespace SplatDev.Umbraco.Plugins.Dropzone.Services;

public interface IDropzoneService
{
    /// <summary>The limits the dashboard should show and enforce before uploading.</summary>
    DropzoneOptions GetOptions();

    Task<UploadResult> UploadFileAsync(IFormFile file, UploadRequest request);
    Task<IEnumerable<IMedia>> GetMediaItemsAsync(int? parentId);

    /// <summary>Every media Folder, so a destination can be chosen rather than typed.</summary>
    Task<IEnumerable<IMedia>> GetFoldersAsync();

    Task<bool> DeleteMediaAsync(Guid mediaKey);
}
