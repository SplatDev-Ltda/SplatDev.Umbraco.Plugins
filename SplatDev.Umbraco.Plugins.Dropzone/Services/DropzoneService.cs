using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.IO;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.PropertyEditors;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core.Strings;
using Umbraco.Extensions;
using SplatDev.Umbraco.Plugins.Dropzone.Models;

namespace SplatDev.Umbraco.Plugins.Dropzone.Services;

public class DropzoneService : IDropzoneService
{
    private readonly IMediaService _mediaService;
    private readonly IMediaTypeService _mediaTypeService;
    private readonly MediaFileManager _mediaFileManager;
    private readonly MediaUrlGeneratorCollection _mediaUrlGenerators;
    private readonly IShortStringHelper _shortStringHelper;
    private readonly IContentTypeBaseServiceProvider _contentTypeBaseServiceProvider;
    private readonly DropzoneOptions _options;

    public DropzoneService(
        IMediaService mediaService,
        IMediaTypeService mediaTypeService,
        MediaFileManager mediaFileManager,
        MediaUrlGeneratorCollection mediaUrlGenerators,
        IShortStringHelper shortStringHelper,
        IContentTypeBaseServiceProvider contentTypeBaseServiceProvider,
        IOptions<DropzoneOptions> options)
    {
        _mediaService = mediaService;
        _mediaTypeService = mediaTypeService;
        _mediaFileManager = mediaFileManager;
        _mediaUrlGenerators = mediaUrlGenerators;
        _shortStringHelper = shortStringHelper;
        _contentTypeBaseServiceProvider = contentTypeBaseServiceProvider;
        _options = options.Value;
    }

    public DropzoneOptions GetOptions() => _options;

    /// <summary>
    /// Creates a media item and writes the uploaded file into it.
    /// </summary>
    /// <remarks>
    /// This method used to do <c>mediaItem.SetValue("umbracoFile", file.FileName)</c>, which
    /// records the *name* as the property value and never writes the bytes anywhere. The
    /// stream it opened was never read, and MediaFileManager — the service that stores media
    /// content — was injected and never used. Every upload produced a media item pointing at
    /// nothing. The overload below is the one Umbraco documents for this.
    ///
    /// It also filed everything as an Image regardless of what was uploaded, so a PDF became
    /// an Image with a broken thumbnail.
    /// </remarks>
    public async Task<UploadResult> UploadFileAsync(IFormFile file, UploadRequest request)
    {
        try
        {
            if (file is null || file.Length == 0)
                return Failed("No file was supplied.");

            if (!_options.IsExtensionAllowed(file.FileName))
            {
                var allowed = string.Join(", ", _options.AllowedExtensions);
                return Failed($"{Path.GetExtension(file.FileName)} files are not allowed here. Allowed: {allowed}.");
            }

            if (_options.MaxFileSizeBytes > 0 && file.Length > _options.MaxFileSizeBytes)
                return Failed($"{file.FileName} is {Bytes(file.Length)}, over the {_options.MaxFileSizeMb} MB limit.");

            var parentId = ResolveParentId(request);
            var name = BuildName(file.FileName, parentId);
            var mediaTypeAlias = MediaTypeFor(file.FileName);

            var mediaItem = _mediaService.CreateMedia(name, parentId, mediaTypeAlias);

            await using (var stream = file.OpenReadStream())
            {
                mediaItem.SetValue(
                    _mediaFileManager,
                    _mediaUrlGenerators,
                    _shortStringHelper,
                    _contentTypeBaseServiceProvider,
                    Constants.Conventions.Media.File,
                    file.FileName,
                    stream);
            }

            _mediaService.Save(mediaItem);

            return new UploadResult
            {
                Success = true,
                MediaKey = mediaItem.Key.ToString(),
                Name = mediaItem.Name,
                MediaTypeAlias = mediaTypeAlias,
                SizeBytes = file.Length,
                Url = mediaItem.GetUrl(Constants.Conventions.Media.File, _mediaUrlGenerators)
            };
        }
        catch (Exception ex)
        {
            return Failed(ex.Message);
        }
    }

    /// <summary>
    /// Accepts either the integer id the old dashboard posted or the key a media picker gives.
    /// </summary>
    private int ResolveParentId(UploadRequest request)
    {
        if (request.ParentMediaKey is { } key && key != Guid.Empty)
        {
            var parent = _mediaService.GetById(key);
            if (parent is not null)
                return parent.Id;
        }

        return request.ParentMediaId is > 0 ? request.ParentMediaId.Value : Constants.System.Root;
    }

    /// <summary>
    /// Picks the media type that matches the file, falling back to File.
    /// </summary>
    /// <remarks>
    /// The alias is checked against the site rather than assumed: Video, Audio and
    /// Vector Graphics are conventions a site can remove, and creating media with a type
    /// that does not exist throws.
    /// </remarks>
    private string MediaTypeFor(string fileName)
    {
        var ext = Path.GetExtension(fileName).TrimStart('.').ToLowerInvariant();

        var preferred = ext switch
        {
            "jpg" or "jpeg" or "png" or "gif" or "webp" or "bmp" or "tif" or "tiff"
                => Constants.Conventions.MediaTypes.Image,
            "svg" => "umbracoMediaVectorGraphics",
            "mp4" or "webm" or "mov" or "avi" or "mkv" => "umbracoMediaVideo",
            "mp3" or "wav" or "ogg" or "flac" or "m4a" => "umbracoMediaAudio",
            "pdf" or "doc" or "docx" or "odt" => "umbracoMediaArticle",
            _ => Constants.Conventions.MediaTypes.File,
        };

        return _mediaTypeService.Get(preferred) is not null
            ? preferred
            : Constants.Conventions.MediaTypes.File;
    }

    /// <summary>
    /// Avoids adding a second item under a name already used in the same folder.
    /// </summary>
    private string BuildName(string fileName, int parentId)
    {
        var baseName = Path.GetFileNameWithoutExtension(fileName);
        if (!_options.RenameOnCollision)
            return baseName;

        var siblings = parentId == Constants.System.Root
            ? _mediaService.GetRootMedia()
            : _mediaService.GetPagedChildren(parentId, 0, int.MaxValue, out _);

        var taken = siblings
            .Select(m => m.Name)
            .Where(n => !string.IsNullOrEmpty(n))
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        if (!taken.Contains(baseName))
            return baseName;

        for (var i = 2; i < 1000; i++)
        {
            var candidate = $"{baseName} ({i})";
            if (!taken.Contains(candidate))
                return candidate;
        }

        return $"{baseName} ({Guid.NewGuid():N})";
    }

    public Task<IEnumerable<IMedia>> GetMediaItemsAsync(int? parentId)
    {
        var items = parentId is > 0
            ? _mediaService.GetPagedChildren(parentId.Value, 0, 100, out _)
            : _mediaService.GetRootMedia();

        return Task.FromResult(items);
    }

    public Task<IEnumerable<IMedia>> GetFoldersAsync()
    {
        var folderType = _mediaTypeService.Get(Constants.Conventions.MediaTypes.Folder);
        if (folderType is null)
            return Task.FromResult<IEnumerable<IMedia>>([]);

        var folders = _mediaService
            .GetPagedOfType(folderType.Id, 0, int.MaxValue, out _, null)
            .OrderBy(f => f.Name)
            .ToList();

        return Task.FromResult<IEnumerable<IMedia>>(folders);
    }

    public Task<bool> DeleteMediaAsync(Guid mediaKey)
    {
        var media = _mediaService.GetById(mediaKey);
        if (media == null) return Task.FromResult(false);

        _mediaService.Delete(media);
        return Task.FromResult(true);
    }

    private static UploadResult Failed(string error) => new() { Success = false, Error = error };

    private static string Bytes(long bytes)
    {
        string[] units = ["B", "KB", "MB", "GB"];
        var i = 0;
        double size = bytes;
        while (size >= 1024 && i < units.Length - 1) { size /= 1024; i++; }
        return $"{size:0.#} {units[i]}";
    }
}
