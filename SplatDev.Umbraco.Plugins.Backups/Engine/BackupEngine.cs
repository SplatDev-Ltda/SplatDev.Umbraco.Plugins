using System.IO.Compression;
using System.Security.Cryptography;
using System.Text.Json;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Services;
using SplatDev.Umbraco.Plugins.Backups.Configuration;
using SplatDev.Umbraco.Plugins.Backups.Models;
using SplatDev.Umbraco.Plugins.Backups.Providers;
using IOFile = System.IO.File;
using IODirectory = System.IO.Directory;
using IOPath = System.IO.Path;
using ZipIOFile = System.IO.Compression.ZipFile;

namespace SplatDev.Umbraco.Plugins.Backups.Engine;

public class BackupEngine : IBackupEngine
{
    private readonly IHostEnvironment _hostEnvironment;
    private readonly IContentService _contentService;
    private readonly IMediaService _mediaService;
    private readonly BackupSettings _settings;
    private readonly IEnumerable<ICloudStorageProvider> _cloudProviders;
    private readonly ILogger<BackupEngine> _logger;

    public BackupEngine(
        IHostEnvironment hostEnvironment,
        IContentService contentService,
        IMediaService mediaService,
        BackupSettings settings,
        IEnumerable<ICloudStorageProvider> cloudProviders,
        ILogger<BackupEngine> logger)
    {
        _hostEnvironment = hostEnvironment;
        _contentService = contentService;
        _mediaService = mediaService;
        _settings = settings;
        _cloudProviders = cloudProviders;
        _logger = logger;
    }

    private string BackupDirectory =>
        IOPath.Combine(_hostEnvironment.ContentRootPath, _settings.BackupPath);

    public async Task<BackupResult> CreateFullBackupAsync(BackupOptions options, CancellationToken ct = default)
    {
        var backupId = Guid.NewGuid().ToString("N")[..8];
        var backupName = $"backup-{DateTime.UtcNow:yyyyMMdd-HHmmss}-{backupId}";
        var result = new BackupResult
        {
            Id = backupId,
            Name = backupName,
            Compressed = options.Compress,
            Encrypted = options.Encrypt,
            CreatedAt = DateTime.UtcNow
        };

        EnsureDirectory();

        var payload = await BuildPayloadAsync(options, ct);
        var json = JsonSerializer.Serialize(payload, new JsonSerializerOptions { WriteIndented = true });

        var jsonFileName = $"{backupName}.json";
        var jsonFilePath = IOPath.Combine(BackupDirectory, jsonFileName);
        await IOFile.WriteAllTextAsync(jsonFilePath, json, ct);

        string finalFilePath = jsonFilePath;
        var jsonBytes = System.Text.Encoding.UTF8.GetBytes(json);

        if (options.Compress)
        {
            var zipFileName = $"{backupName}.zip";
            finalFilePath = IOPath.Combine(BackupDirectory, zipFileName);
            await using var zipStream = new FileStream(finalFilePath, FileMode.Create);
            using var archive = new ZipArchive(zipStream, ZipArchiveMode.Create, leaveOpen: true);
            var entry = archive.CreateEntry(jsonFileName);
            await using var entryStream = entry.Open();
            await entryStream.WriteAsync(jsonBytes, ct);
        }

        if (options.Encrypt && !string.IsNullOrEmpty(options.EncryptionKey))
        {
            var encryptedFileName = $"{backupName}.enc";
            var sourcePath = finalFilePath;
            finalFilePath = IOPath.Combine(BackupDirectory, encryptedFileName);
            await EncryptFileAsync(sourcePath, finalFilePath, options.EncryptionKey, ct);
            if (IOFile.Exists(sourcePath) && sourcePath != jsonFilePath)
            {
                IOFile.Delete(sourcePath);
            }
        }

        // Compressing or encrypting writes a new artifact and leaves the .json behind.
        // That doubles the disk every backup costs, makes a single backup list as two
        // entries under the same name, and — when Encrypt is on — leaves the plaintext
        // sitting next to the encrypted archive, which defeats encrypting it at all.
        if (finalFilePath != jsonFilePath && IOFile.Exists(jsonFilePath))
        {
            IOFile.Delete(jsonFilePath);
        }

        if (options.KeepLocal)
        {
            result.LocalPath = finalFilePath;
            var fi = new FileInfo(finalFilePath);
            result.SizeBytes = fi.Length;
        }

        result.ContentCount = payload.content.Count;
        result.MediaCount = payload.media.Count;

        if (options.CloudProviderIds.Count > 0)
        {
            await UploadToCloudProvidersAsync(finalFilePath, backupName, result, options, ct);
        }

        if (_settings.AutoCleanup)
        {
            CleanupOldBackups();
        }

        _logger.LogInformation("Backup {BackupName} created ({Size} bytes, {Content} content, {Media} media)",
            backupName, result.SizeBytes, result.ContentCount, result.MediaCount);

        return result;
    }

    public Task<BackupResult> CreateContentBackupAsync(BackupOptions options, CancellationToken ct = default)
    {
        options.Scope = BackupScope.Content;
        return CreateFullBackupAsync(options, ct);
    }

    public async Task<RestoreResult> RestoreAsync(string backupPath, RestoreOptions options, CancellationToken ct = default)
    {
        var result = new RestoreResult();

        if (!IOFile.Exists(backupPath))
        {
            result.Errors.Add($"Backup file not found: {backupPath}");
            return result;
        }

        try
        {
            string jsonContent;
            var fullPath = backupPath;

            if (!string.IsNullOrEmpty(options.DecryptionKey) && IOPath.GetExtension(backupPath) == ".enc")
            {
                var decryptedPath = IOPath.Combine(BackupDirectory, $"restore-{Guid.NewGuid():N}.tmp");
                await DecryptFileAsync(backupPath, decryptedPath, options.DecryptionKey, ct);
                fullPath = decryptedPath;
            }

            if (IOPath.GetExtension(fullPath) == ".zip")
            {
                using var archive = ZipIOFile.OpenRead(fullPath);
                var entry = archive.Entries.FirstOrDefault(e => e.Name.EndsWith(".json"));
                if (entry is null)
                {
                    result.Errors.Add("No JSON payload found in archive.");
                    return result;
                }
                using var reader = new StreamReader(entry.Open());
                jsonContent = await reader.ReadToEndAsync(ct);
            }
            else
            {
                jsonContent = await IOFile.ReadAllTextAsync(fullPath, ct);
            }

            var payload = JsonSerializer.Deserialize<BackupPayload>(jsonContent)
                ?? throw new InvalidOperationException("Failed to deserialize backup payload.");

            if (options.Scope.HasFlag(BackupScope.Content))
            {
                result.RestoredContentCount = await RestoreContentAsync(payload.content, options.OverwriteExisting, ct);
            }

            if (options.Scope.HasFlag(BackupScope.Media))
            {
                result.RestoredMediaCount = await RestoreMediaAsync(payload.media, options.OverwriteExisting, ct);
            }

            result.Success = true;
        }
        catch (Exception ex)
        {
            result.Errors.Add(ex.Message);
            _logger.LogError(ex, "Restore failed for {BackupPath}", backupPath);
        }

        return result;
    }

    private async Task<BackupPayload> BuildPayloadAsync(BackupOptions options, CancellationToken ct)
    {
        var payload = new BackupPayload
        {
            createdAt = DateTime.UtcNow,
            content = options.Scope.HasFlag(BackupScope.Content)
                ? ExportContentTree()
                : new List<ContentEntry>(),
            media = options.Scope.HasFlag(BackupScope.Media)
                ? ExportMediaTree()
                : new List<MediaEntry>()
        };

        if (options.Scope.HasFlag(BackupScope.Database))
        {
            payload.databaseBackup = await ExportDatabaseAsync(ct);
        }

        return payload;
    }

    private List<ContentEntry> ExportContentTree()
    {
        var results = new List<ContentEntry>();
        foreach (var root in _contentService.GetRootContent())
        {
            results.Add(MapContent(root));
            AppendContentDescendants(root, results, visited: new HashSet<int>());
        }
        return results;
    }

    private void AppendContentDescendants(IContent parent, List<ContentEntry> results, HashSet<int> visited)
    {
        if (!visited.Add(parent.Id))
            return;

        foreach (var child in _contentService.GetPagedChildren(parent.Id, 0, int.MaxValue, out _))
        {
            results.Add(MapContent(child));
            AppendContentDescendants(child, results, visited);
        }
    }

    private static ContentEntry MapContent(IContent c) => new()
    {
        id = c.Id,
        key = c.Key,
        name = c.Name ?? string.Empty,
        contentType = c.ContentType.Alias,
        published = c.Published,
        parentId = c.ParentId
    };

    private List<MediaEntry> ExportMediaTree()
    {
        var results = new List<MediaEntry>();
        foreach (var root in _mediaService.GetRootMedia())
        {
            if (root is null) continue;
            results.Add(MapMedia(root));
            AppendMediaDescendants(root, results, visited: new HashSet<int>());
        }
        return results;
    }

    private void AppendMediaDescendants(IMedia parent, List<MediaEntry> results, HashSet<int> visited)
    {
        if (!visited.Add(parent.Id))
            return;

        foreach (var child in _mediaService.GetPagedChildren(parent.Id, 0, int.MaxValue, out _))
        {
            if (child is null) continue;
            results.Add(MapMedia(child));
            AppendMediaDescendants(child, results, visited);
        }
    }

    private static MediaEntry MapMedia(IMedia m) => new()
    {
        id = m.Id,
        key = m.Key,
        name = m.Name ?? string.Empty,
        mediaType = m.ContentType.Alias,
        parentId = m.ParentId
    };

    private Task<string?> ExportDatabaseAsync(CancellationToken ct)
    {
        _logger.LogWarning("Database backup not fully implemented. Use BACKUP DATABASE SQL command.");
        return Task.FromResult<string?>(null);
    }

    private async Task<int> RestoreContentAsync(List<ContentEntry> entries, bool overwrite, CancellationToken ct)
    {
        var count = 0;
        foreach (var entry in entries)
        {
            try
            {
                var existing = _contentService.GetById(entry.id);
                if (existing is not null)
                {
                    if (!overwrite) continue;
                    existing.Name = entry.name;
                    _contentService.Save(existing);
                }
                else
                {
                    var parentId = entry.parentId > 0 ? entry.parentId : -1;
                    var created = _contentService.Create(entry.name, parentId, entry.contentType);
                    if (created is not null)
                    {
#if NET10_0_OR_GREATER
                        _contentService.Save(created);
#else
                        _contentService.SaveAndPublish(created);
#endif
                    }
                }
                count++;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to restore content {Id} ({Name})", entry.id, entry.name);
            }
        }
        return count;
    }

    private Task<int> RestoreMediaAsync(List<MediaEntry> entries, bool overwrite, CancellationToken ct)
    {
        var count = 0;
        foreach (var entry in entries)
        {
            try
            {
                var existing = _mediaService.GetById(entry.id);
                if (existing is not null)
                {
                    if (!overwrite) continue;
                    existing.Name = entry.name;
                    _mediaService.Save(existing);
                }
                else
                {
                    var parentId = entry.parentId > 0 ? entry.parentId : -1;
                    var created = _mediaService.CreateMedia(entry.name, parentId, entry.mediaType);
                    if (created is not null)
                    {
                        _mediaService.Save(created);
                    }
                }
                count++;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to restore media {Id} ({Name})", entry.id, entry.name);
            }
        }
        return Task.FromResult(count);
    }

    private async Task UploadToCloudProvidersAsync(string filePath, string backupName, BackupResult result, BackupOptions options, CancellationToken ct)
    {
        var providers = _cloudProviders
            .Where(p => options.CloudProviderIds.Contains(p.ProviderName))
            .ToList();

        var uploadTasks = providers.Select(async provider =>
        {
            var uploadResult = new CloudUploadResult
            {
                ProviderId = provider.ProviderName,
                ProviderName = provider.ProviderName
            };

            try
            {
                await using var fileStream = IOFile.OpenRead(filePath);
                var remotePath = $"backups/{DateTime.UtcNow:yyyy/MM}";
                var fileName = IOPath.GetFileName(filePath);
                await provider.UploadAsync(fileStream, remotePath, fileName, ct);
                uploadResult.Success = true;
                uploadResult.RemotePath = $"{remotePath}/{fileName}";
                _logger.LogInformation("Uploaded {FileName} to {Provider}", fileName, provider.ProviderName);
            }
            catch (Exception ex)
            {
                uploadResult.Success = false;
                uploadResult.ErrorMessage = ex.Message;
                _logger.LogError(ex, "Failed to upload to {Provider}", provider.ProviderName);
            }

            return uploadResult;
        });

        var results = await Task.WhenAll(uploadTasks);
        result.CloudUploads.AddRange(results);
    }

    private void CleanupOldBackups()
    {
        try
        {
            var files = IODirectory.GetFiles(BackupDirectory)
                .Select(f => new FileInfo(f))
                .Where(fi => fi.Extension is ".json" or ".zip" or ".enc")
                .OrderByDescending(fi => fi.CreationTimeUtc)
                .ToList();

            if (files.Count <= _settings.MaxLocalBackups)
                return;

            var toDelete = files.Skip(_settings.MaxLocalBackups)
                .Concat(files.Where(f => f.CreationTimeUtc < DateTime.UtcNow.AddDays(-_settings.LocalRetentionDays)))
                .Distinct();

            foreach (var file in toDelete)
            {
                file.Delete();
                _logger.LogInformation("Cleaned up old backup: {FileName}", file.Name);
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to clean up old backups");
        }
    }

    private static async Task EncryptFileAsync(string sourcePath, string destPath, string key, CancellationToken ct)
    {
        var keyBytes = SHA256.HashData(System.Text.Encoding.UTF8.GetBytes(key));

        await using var sourceStream = IOFile.OpenRead(sourcePath);
        await using var destStream = IOFile.Create(destPath);

        using var aes = Aes.Create();
        aes.Key = keyBytes;
        aes.GenerateIV();
        await destStream.WriteAsync(aes.IV, ct);

        await using var cryptoStream = new CryptoStream(destStream, aes.CreateEncryptor(), CryptoStreamMode.Write);
        await sourceStream.CopyToAsync(cryptoStream, ct);
        await cryptoStream.FlushFinalBlockAsync(ct);
    }

    private static async Task DecryptFileAsync(string sourcePath, string destPath, string key, CancellationToken ct)
    {
        var keyBytes = SHA256.HashData(System.Text.Encoding.UTF8.GetBytes(key));

        await using var sourceStream = IOFile.OpenRead(sourcePath);
        var iv = new byte[16];
        await sourceStream.ReadExactlyAsync(iv, ct);

        using var aes = Aes.Create();
        aes.Key = keyBytes;
        aes.IV = iv;

        await using var cryptoStream = new CryptoStream(sourceStream, aes.CreateDecryptor(), CryptoStreamMode.Read);
        await using var destStream = IOFile.Create(destPath);
        await cryptoStream.CopyToAsync(destStream, ct);
    }

    private void EnsureDirectory()
    {
        if (!IODirectory.Exists(BackupDirectory))
            IODirectory.CreateDirectory(BackupDirectory);
    }

    private class BackupPayload
    {
        public DateTime createdAt { get; set; }
        public List<ContentEntry> content { get; set; } = new();
        public List<MediaEntry> media { get; set; } = new();
        public string? databaseBackup { get; set; }
    }

    private class ContentEntry
    {
        public int id { get; set; }
        public Guid key { get; set; }
        public string name { get; set; } = string.Empty;
        public string contentType { get; set; } = string.Empty;
        public bool published { get; set; }
        public int parentId { get; set; }
    }

    private class MediaEntry
    {
        public int id { get; set; }
        public Guid key { get; set; }
        public string name { get; set; } = string.Empty;
        public string mediaType { get; set; } = string.Empty;
        public int parentId { get; set; }
    }
}
