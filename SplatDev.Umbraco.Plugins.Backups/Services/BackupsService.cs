using System.Text.Json;
using Microsoft.Extensions.Hosting;
using Umbraco.Cms.Core.Services;
using SplatDev.Umbraco.Plugins.Backups.Configuration;
using SplatDev.Umbraco.Plugins.Backups.Engine;
using SplatDev.Umbraco.Plugins.Backups.Models;
using SplatDev.Umbraco.Plugins.Backups.Providers;

namespace SplatDev.Umbraco.Plugins.Backups.Services;

public class BackupsService : IBackupsService
{
    private readonly IHostEnvironment _hostEnvironment;
    private readonly IContentService _contentService;
    private readonly IMediaService _mediaService;
    private readonly IBackupEngine _backupEngine;
    private readonly BackupSettings _settings;
    private readonly IEnumerable<ICloudStorageProvider> _cloudProviders;

    private string BackupDirectory =>
        Path.Combine(_hostEnvironment.ContentRootPath, "App_Data", "Backups");

    public BackupsService(
        IHostEnvironment hostEnvironment,
        IContentService contentService,
        IMediaService mediaService,
        IBackupEngine backupEngine,
        BackupSettings settings,
        IEnumerable<ICloudStorageProvider> cloudProviders)
    {
        _hostEnvironment = hostEnvironment;
        _contentService = contentService;
        _mediaService = mediaService;
        _backupEngine = backupEngine;
        _settings = settings;
        _cloudProviders = cloudProviders;
    }

    public Task<IEnumerable<BackupInfo>> ListBackupsAsync()
    {
        EnsureDirectory();

        var patterns = new[] { "*.json", "*.zip", "*.enc" };
        var files = patterns
            .SelectMany(p => Directory.GetFiles(BackupDirectory, p))
            .Select(f =>
            {
                var fi = new FileInfo(f);
                var ext = fi.Extension.ToLowerInvariant();
                return new BackupInfo
                {
                    Name = Path.GetFileNameWithoutExtension(fi.Name),
                    Extension = ext,
                    CreatedAt = fi.CreationTimeUtc,
                    SizeBytes = fi.Length,
                    IsCompressed = ext == ".zip",
                    IsEncrypted = ext == ".enc"
                };
            })
            .OrderByDescending(b => b.CreatedAt);

        return Task.FromResult<IEnumerable<BackupInfo>>(files);
    }

    public async Task<BackupInfo> CreateBackupAsync(BackupRequest request)
    {
        var scope = request.Scope;
        if (request.IncludeMedia)
            scope |= BackupScope.Media;

        var options = new BackupOptions
        {
            Scope = scope,
            Compress = request.Compress,
            Encrypt = request.Encrypt,
            EncryptionKey = request.EncryptionKey,
            CloudProviderIds = request.CloudProviderIds,
            KeepLocal = true
        };

        var result = await _backupEngine.CreateFullBackupAsync(options);
        return new BackupInfo
        {
            Name = result.Name,
            CreatedAt = result.CreatedAt,
            SizeBytes = result.SizeBytes,
            Extension = File.Exists(result.LocalPath) ? Path.GetExtension(result.LocalPath) : string.Empty,
            IsCompressed = result.Compressed,
            IsEncrypted = result.Encrypted
        };
    }

    public Task<BackupResult> CreateBackupAsync(BackupOptions options, CancellationToken ct = default)
    {
        return _backupEngine.CreateFullBackupAsync(options, ct);
    }

    public Task<RestoreResult> RestoreBackupAsync(string backupPath, RestoreOptions options, CancellationToken ct = default)
    {
        // Defence in depth behind the controller's authorization: confine the path to the
        // backup directory. The caller supplies this string, and the engine would otherwise
        // read whatever absolute path it names and restore its contents into the CMS.
        return _backupEngine.RestoreAsync(ResolveWithinBackupDirectory(backupPath), options, ct);
    }

    /// <summary>
    /// Resolves a caller-supplied backup path against the backup directory and rejects
    /// anything that escapes it.
    /// </summary>
    private string ResolveWithinBackupDirectory(string backupPath)
    {
        if (string.IsNullOrWhiteSpace(backupPath))
            throw new ArgumentException("Backup path is required.", nameof(backupPath));

        EnsureDirectory();

        var root = Path.GetFullPath(BackupDirectory);

        // Normalise Windows separators even on Linux. Without this, "..\..\etc\passwd" is
        // one long filename to a Linux host — harmless there, but the same package runs on
        // Windows App Service where it does escape. Rejecting it everywhere keeps the guard
        // (and its tests) independent of where the site happens to be hosted.
        var normalised = backupPath.Replace('\\', '/');

        // Treat the input as relative to the backup directory. Path.Combine returns the
        // second argument unchanged when it is rooted, so an absolute path is still caught
        // by the containment check below rather than silently honoured.
        var candidate = Path.GetFullPath(Path.Combine(root, normalised));

        var rootWithSeparator = root.EndsWith(Path.DirectorySeparatorChar)
            ? root
            : root + Path.DirectorySeparatorChar;

        if (!candidate.StartsWith(rootWithSeparator, StringComparison.OrdinalIgnoreCase))
            throw new UnauthorizedAccessException("Backup path is outside the backup directory.");

        return candidate;
    }

    public Task DeleteBackupAsync(string name)
    {
        EnsureDirectory();

        var patterns = new[] { "*.json", "*.zip", "*.enc" };
        var found = patterns
            .SelectMany(p => Directory.GetFiles(BackupDirectory, p))
            .FirstOrDefault(f =>
                Path.GetFileNameWithoutExtension(f).Equals(name, StringComparison.OrdinalIgnoreCase));

        if (found is null)
            throw new FileNotFoundException($"Backup '{name}' not found.");

        File.Delete(found);
        return Task.CompletedTask;
    }

    public Task<IEnumerable<CloudProviderConfig>> GetCloudProvidersAsync()
    {
        var configs = _settings.CloudProviders.Select(c =>
        {
            var provider = _cloudProviders.FirstOrDefault(p => p.ProviderName == c.ProviderType);
            return new CloudProviderConfig
            {
                Id = c.Id,
                ProviderType = c.ProviderType,
                Enabled = c.Enabled,
                Settings = new Dictionary<string, string>(c.Settings)
                {
                    ["requiresOAuth"] = (provider?.RequiresOAuth ?? false).ToString(),
                    ["requiresApiKey"] = (provider?.RequiresApiKey ?? false).ToString()
                }
            };
        });

        return Task.FromResult<IEnumerable<CloudProviderConfig>>(configs);
    }

    public async Task<bool> TestCloudProviderAsync(string providerId, CancellationToken ct = default)
    {
        var provider = _cloudProviders.FirstOrDefault(p => p.ProviderName == providerId);
        if (provider is null)
            return false;

        return await provider.ValidateConnectionAsync(ct);
    }

    private void EnsureDirectory()
    {
        if (!Directory.Exists(BackupDirectory))
            Directory.CreateDirectory(BackupDirectory);
    }
}
