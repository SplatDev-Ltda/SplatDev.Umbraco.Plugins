using System.IO.Compression;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using SplatDev.Umbraco.Plugins.Backups.Configuration;
using SplatDev.Umbraco.Plugins.Backups.Engine;
using SplatDev.Umbraco.Plugins.Backups.Models;
using SplatDev.Umbraco.Plugins.Backups.Providers;
using Umbraco.Cms.Core.Services;
using Xunit;

namespace SplatDev.Umbraco.Plugins.Backups.Tests;

public class BackupEngineTests : IDisposable
{
    private readonly string _tempDir;
    private readonly string _backupDir;
    private readonly Mock<IHostEnvironment> _hostEnv;
    private readonly Mock<IContentService> _contentService;
    private readonly Mock<IMediaService> _mediaService;
    private readonly BackupSettings _settings;

    public BackupEngineTests()
    {
        _tempDir = Path.Combine(Path.GetTempPath(), $"engine-test-{Guid.NewGuid():N}");
        Directory.CreateDirectory(_tempDir);
        _backupDir = Path.Combine(_tempDir, "Backups");

        _hostEnv = new Mock<IHostEnvironment>();
        _hostEnv.Setup(h => h.ContentRootPath).Returns(_tempDir);

        _contentService = new Mock<IContentService>();
        _contentService.Setup(s => s.GetRootContent()).Returns([]);

        _mediaService = new Mock<IMediaService>();
        _mediaService.Setup(s => s.GetRootMedia()).Returns([]);

        _settings = new BackupSettings
        {
            BackupPath = "Backups",
            AutoCleanup = false,
            MaxLocalBackups = 5,
            LocalRetentionDays = 30
        };
    }

    private BackupEngine CreateEngine(IEnumerable<ICloudStorageProvider>? providers = null) =>
        new(
            _hostEnv.Object,
            _contentService.Object,
            _mediaService.Object,
            _settings,
            providers ?? [],
            NullLogger<BackupEngine>.Instance);

    // ── CreateFullBackupAsync ─────────────────────────────────────────────────

    [Fact]
    public async Task CreateFullBackupAsync_WithDefaultOptions_ProducesJsonFile()
    {
        var engine = CreateEngine();
        var options = new BackupOptions { Compress = false, Encrypt = false, KeepLocal = true };

        var result = await engine.CreateFullBackupAsync(options);

        Assert.NotEmpty(result.Id);
        Assert.NotEmpty(result.Name);
        Assert.True(result.CreatedAt > DateTime.UtcNow.AddMinutes(-1));
        Assert.True(File.Exists(result.LocalPath));
        Assert.EndsWith(".json", result.LocalPath);
    }

    [Fact]
    public async Task CreateFullBackupAsync_WithCompression_ProducesValidZipContainingJson()
    {
        var engine = CreateEngine();
        var options = new BackupOptions { Compress = true, Encrypt = false, KeepLocal = true };

        var result = await engine.CreateFullBackupAsync(options);

        Assert.True(result.Compressed);
        Assert.EndsWith(".zip", result.LocalPath);
        Assert.True(File.Exists(result.LocalPath));
        using var zip = ZipFile.OpenRead(result.LocalPath);
        Assert.Single(zip.Entries);
        Assert.EndsWith(".json", zip.Entries[0].Name);
    }

    [Fact]
    public async Task CreateFullBackupAsync_WithEncryption_ProducesEncFile()
    {
        var engine = CreateEngine();
        var options = new BackupOptions
        {
            Compress = false,
            Encrypt = true,
            EncryptionKey = "test-key-123",
            KeepLocal = true
        };

        var result = await engine.CreateFullBackupAsync(options);

        Assert.True(result.Encrypted);
        Assert.EndsWith(".enc", result.LocalPath);
        Assert.True(File.Exists(result.LocalPath));
        var encBytes = await File.ReadAllBytesAsync(result.LocalPath);
        Assert.True(encBytes.Length > 16, "Encrypted file must be larger than the IV alone");
    }

    [Fact]
    public async Task CreateFullBackupAsync_WithEmptyServices_ReturnsZeroItemCounts()
    {
        var engine = CreateEngine();
        var options = new BackupOptions { Compress = false, KeepLocal = true };

        var result = await engine.CreateFullBackupAsync(options);

        Assert.Equal(0, result.ContentCount);
        Assert.Equal(0, result.MediaCount);
    }

    [Fact]
    public async Task CreateFullBackupAsync_WithMatchingCloudProvider_UploadsSuccessfully()
    {
        var provider = new Mock<ICloudStorageProvider>();
        provider.Setup(p => p.ProviderName).Returns("MockCloud");
        provider.Setup(p => p.UploadAsync(
                It.IsAny<Stream>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        var engine = CreateEngine([provider.Object]);
        var options = new BackupOptions
        {
            Compress = false,
            KeepLocal = true,
            CloudProviderIds = ["MockCloud"]
        };

        var result = await engine.CreateFullBackupAsync(options);

        Assert.Single(result.CloudUploads);
        Assert.True(result.CloudUploads[0].Success);
        Assert.Equal("MockCloud", result.CloudUploads[0].ProviderId);
        provider.Verify(p =>
            p.UploadAsync(It.IsAny<Stream>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task CreateFullBackupAsync_WhenCloudUploadThrows_RecordsFailureWithoutThrowing()
    {
        var provider = new Mock<ICloudStorageProvider>();
        provider.Setup(p => p.ProviderName).Returns("FailCloud");
        provider.Setup(p => p.UploadAsync(
                It.IsAny<Stream>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new IOException("network timeout"));

        var engine = CreateEngine([provider.Object]);
        var options = new BackupOptions
        {
            Compress = false,
            KeepLocal = true,
            CloudProviderIds = ["FailCloud"]
        };

        var result = await engine.CreateFullBackupAsync(options);

        Assert.Single(result.CloudUploads);
        Assert.False(result.CloudUploads[0].Success);
        Assert.Contains("network timeout", result.CloudUploads[0].ErrorMessage);
    }

    [Fact]
    public async Task CreateFullBackupAsync_WithUnknownCloudProviderId_ProducesNoUploads()
    {
        var engine = CreateEngine();
        var options = new BackupOptions
        {
            Compress = false,
            KeepLocal = true,
            CloudProviderIds = ["NonexistentCloud"]
        };

        var result = await engine.CreateFullBackupAsync(options);

        Assert.Empty(result.CloudUploads);
    }

    // ── CreateContentBackupAsync ──────────────────────────────────────────────

    [Fact]
    public async Task CreateContentBackupAsync_OverridesOptionsScopeToContentOnly()
    {
        var engine = CreateEngine();
        var options = new BackupOptions { Scope = BackupScope.ContentAndMedia, Compress = false, KeepLocal = true };

        await engine.CreateContentBackupAsync(options);

        Assert.Equal(BackupScope.Content, options.Scope);
    }

    // ── RestoreAsync ──────────────────────────────────────────────────────────

    [Fact]
    public async Task RestoreAsync_WithNonExistentFile_ReturnsErrorWithoutThrowing()
    {
        var engine = CreateEngine();

        var result = await engine.RestoreAsync("/tmp/does-not-exist.json", new RestoreOptions());

        Assert.False(result.Success);
        Assert.Single(result.Errors);
        Assert.Contains("not found", result.Errors[0], StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task RestoreAsync_WithValidPlainJsonFile_RestoresSuccessfully()
    {
        var jsonPath = Path.Combine(_tempDir, "restore-test.json");
        await File.WriteAllTextAsync(jsonPath,
            """{"createdAt":"2024-01-01T00:00:00Z","content":[],"media":[]}""");

        var engine = CreateEngine();

        var result = await engine.RestoreAsync(jsonPath, new RestoreOptions { Scope = BackupScope.ContentAndMedia });

        Assert.True(result.Success);
        Assert.Empty(result.Errors);
        Assert.Equal(0, result.RestoredContentCount);
        Assert.Equal(0, result.RestoredMediaCount);
    }

    [Fact]
    public async Task RestoreAsync_WithZipContainingJsonPayload_RestoresSuccessfully()
    {
        var zipPath = Path.Combine(_tempDir, "restore-test.zip");
        var json = """{"createdAt":"2024-01-01T00:00:00Z","content":[],"media":[]}""";
        using (var stream = File.Create(zipPath))
        using (var archive = new ZipArchive(stream, ZipArchiveMode.Create))
        {
            var entry = archive.CreateEntry("payload.json");
            await using var writer = new StreamWriter(entry.Open());
            await writer.WriteAsync(json);
        }

        var engine = CreateEngine();

        var result = await engine.RestoreAsync(zipPath, new RestoreOptions());

        Assert.True(result.Success);
        Assert.Empty(result.Errors);
    }

    [Fact]
    public async Task RestoreAsync_WithZipMissingJsonEntry_ReturnsError()
    {
        var zipPath = Path.Combine(_tempDir, "no-json.zip");
        using (var stream = File.Create(zipPath))
        using (var archive = new ZipArchive(stream, ZipArchiveMode.Create))
        {
            var entry = archive.CreateEntry("payload.xml");
            await using var writer = new StreamWriter(entry.Open());
            await writer.WriteAsync("<data/>");
        }

        var engine = CreateEngine();

        var result = await engine.RestoreAsync(zipPath, new RestoreOptions());

        Assert.False(result.Success);
        Assert.Contains(result.Errors, e => e.Contains("No JSON payload"));
    }

    [Fact]
    public async Task RestoreAsync_WithEncryptedFile_DecryptsAndRestoresSuccessfully()
    {
        Directory.CreateDirectory(_backupDir);
        var json = """{"createdAt":"2024-01-01T00:00:00Z","content":[],"media":[]}""";
        var plainPath = Path.Combine(_tempDir, "plain.json");
        var encPath = Path.Combine(_tempDir, "encrypted.enc");
        await File.WriteAllTextAsync(plainPath, json);
        await BackupEngineTestHelpers.EncryptFileAsync(plainPath, encPath, "restore-key", CancellationToken.None);

        var engine = CreateEngine();

        var result = await engine.RestoreAsync(encPath, new RestoreOptions { DecryptionKey = "restore-key" });

        Assert.True(result.Success);
        Assert.Empty(result.Errors);
    }

    // ── Auto-cleanup ──────────────────────────────────────────────────────────

    [Fact]
    public async Task CreateFullBackupAsync_WithAutoCleanupEnabled_RemovesExcessFiles()
    {
        _settings.AutoCleanup = true;
        _settings.MaxLocalBackups = 3;
        Directory.CreateDirectory(_backupDir);
        for (var i = 0; i < 6; i++)
        {
            await File.WriteAllTextAsync(Path.Combine(_backupDir, $"old-backup-{i:D3}.zip"), "fake");
        }

        var engine = CreateEngine();
        await engine.CreateFullBackupAsync(new BackupOptions { Compress = true, KeepLocal = true });

        var remaining = Directory.GetFiles(_backupDir)
            .Where(f => f.EndsWith(".zip") || f.EndsWith(".json") || f.EndsWith(".enc"))
            .ToArray();
        Assert.True(remaining.Length <= _settings.MaxLocalBackups,
            $"Expected ≤{_settings.MaxLocalBackups} backup files after cleanup, found {remaining.Length}");
    }

    [Fact]
    public async Task CreateFullBackupAsync_WithAutoCleanupDisabled_LeavesAllFiles()
    {
        _settings.AutoCleanup = false;
        _settings.MaxLocalBackups = 2;
        Directory.CreateDirectory(_backupDir);
        for (var i = 0; i < 4; i++)
        {
            await File.WriteAllTextAsync(Path.Combine(_backupDir, $"existing-{i:D3}.zip"), "fake");
        }

        var engine = CreateEngine();
        await engine.CreateFullBackupAsync(new BackupOptions { Compress = true, KeepLocal = true });

        var remaining = Directory.GetFiles(_backupDir, "*.zip");
        Assert.True(remaining.Length > _settings.MaxLocalBackups,
            "With AutoCleanup=false, old files should not be removed");
    }

    public void Dispose()
    {
        if (Directory.Exists(_tempDir))
            Directory.Delete(_tempDir, recursive: true);
    }
}
