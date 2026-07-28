using Microsoft.Extensions.Hosting;
using Moq;
using SplatDev.Umbraco.Plugins.Backups.Configuration;
using SplatDev.Umbraco.Plugins.Backups.Engine;
using SplatDev.Umbraco.Plugins.Backups.Models;
using SplatDev.Umbraco.Plugins.Backups.Providers;
using SplatDev.Umbraco.Plugins.Backups.Services;
using Umbraco.Cms.Core.Services;
using Xunit;

namespace SplatDev.Umbraco.Plugins.Backups.Tests;

public class BackupsServiceTests : IDisposable
{
    private readonly string _tempDir;
    private readonly string _backupDir;
    private readonly Mock<IHostEnvironment> _hostEnv;
    private readonly Mock<IBackupEngine> _backupEngine;
    private readonly Mock<IContentService> _contentService;
    private readonly Mock<IMediaService> _mediaService;
    private readonly BackupSettings _settings;

    public BackupsServiceTests()
    {
        _tempDir = Path.Combine(Path.GetTempPath(), $"service-test-{Guid.NewGuid():N}");
        Directory.CreateDirectory(_tempDir);
        _backupDir = Path.Combine(_tempDir, "App_Data", "Backups");

        _hostEnv = new Mock<IHostEnvironment>();
        _hostEnv.Setup(h => h.ContentRootPath).Returns(_tempDir);

        _backupEngine = new Mock<IBackupEngine>();
        _contentService = new Mock<IContentService>();
        _mediaService = new Mock<IMediaService>();
        _settings = new BackupSettings();
    }

    private BackupsService CreateService(IEnumerable<ICloudStorageProvider>? providers = null) =>
        new(
            _hostEnv.Object,
            _contentService.Object,
            _mediaService.Object,
            _backupEngine.Object,
            _settings,
            providers ?? []);

    // ── ListBackupsAsync ──────────────────────────────────────────────────────

    [Fact]
    public async Task ListBackupsAsync_WithNoFiles_ReturnsEmpty()
    {
        var svc = CreateService();

        var result = await svc.ListBackupsAsync();

        Assert.Empty(result);
    }

    [Fact]
    public async Task ListBackupsAsync_WithMixedFiles_ReturnsAllBackupExtensions()
    {
        Directory.CreateDirectory(_backupDir);
        await File.WriteAllTextAsync(Path.Combine(_backupDir, "backup-a.json"), "{}");
        await File.WriteAllTextAsync(Path.Combine(_backupDir, "backup-b.zip"), "PK");
        await File.WriteAllTextAsync(Path.Combine(_backupDir, "backup-c.enc"), "enc");
        await File.WriteAllTextAsync(Path.Combine(_backupDir, "notes.txt"), "ignored");

        var svc = CreateService();

        var result = (await svc.ListBackupsAsync()).ToList();

        Assert.Equal(3, result.Count);
        Assert.DoesNotContain(result, b => b.Name == "notes");
    }

    [Fact]
    public async Task ListBackupsAsync_ReturnsItemsOrderedByCreatedAtDescending()
    {
        Directory.CreateDirectory(_backupDir);
        await File.WriteAllTextAsync(Path.Combine(_backupDir, "backup-older.zip"), "PK");
        await Task.Delay(10);
        await File.WriteAllTextAsync(Path.Combine(_backupDir, "backup-newer.zip"), "PK");

        var svc = CreateService();

        var result = (await svc.ListBackupsAsync()).ToList();

        Assert.Equal(2, result.Count);
        Assert.True(result[0].CreatedAt >= result[1].CreatedAt);
    }

    [Fact]
    public async Task ListBackupsAsync_SetsIsCompressedForZipFiles()
    {
        Directory.CreateDirectory(_backupDir);
        await File.WriteAllTextAsync(Path.Combine(_backupDir, "backup.zip"), "PK");

        var svc = CreateService();
        var result = (await svc.ListBackupsAsync()).Single();

        Assert.True(result.IsCompressed);
        Assert.False(result.IsEncrypted);
    }

    [Fact]
    public async Task ListBackupsAsync_SetsIsEncryptedForEncFiles()
    {
        Directory.CreateDirectory(_backupDir);
        await File.WriteAllTextAsync(Path.Combine(_backupDir, "backup.enc"), "encrypted");

        var svc = CreateService();
        var result = (await svc.ListBackupsAsync()).Single();

        Assert.True(result.IsEncrypted);
        Assert.False(result.IsCompressed);
    }

    // ── CreateBackupAsync (BackupRequest overload) ────────────────────────────

    [Fact]
    public async Task CreateBackupAsync_WithRequest_DelegatesToEngineAndReturnsBackupInfo()
    {
        _backupEngine
            .Setup(e => e.CreateFullBackupAsync(It.IsAny<BackupOptions>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new BackupResult
            {
                Name = "backup-20240101-120000-abcd1234",
                LocalPath = string.Empty,
                Compressed = true,
                Encrypted = false,
                CreatedAt = new DateTime(2024, 1, 1, 12, 0, 0, DateTimeKind.Utc),
                SizeBytes = 1024
            });

        var svc = CreateService();
        var request = new BackupRequest { Compress = true, Scope = BackupScope.Content };

        var info = await svc.CreateBackupAsync(request);

        Assert.Equal("backup-20240101-120000-abcd1234", info.Name);
        Assert.True(info.IsCompressed);
        Assert.False(info.IsEncrypted);
        _backupEngine.Verify(e =>
            e.CreateFullBackupAsync(It.IsAny<BackupOptions>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task CreateBackupAsync_WithIncludeMedia_AddsMediaFlagToOptions()
    {
        BackupOptions? capturedOptions = null;
        _backupEngine
            .Setup(e => e.CreateFullBackupAsync(It.IsAny<BackupOptions>(), It.IsAny<CancellationToken>()))
            .Callback<BackupOptions, CancellationToken>((opts, _) => capturedOptions = opts)
            .ReturnsAsync(new BackupResult { Name = "test", LocalPath = string.Empty });

        var svc = CreateService();
        await svc.CreateBackupAsync(new BackupRequest
        {
            Scope = BackupScope.Content,
            IncludeMedia = true
        });

        Assert.NotNull(capturedOptions);
        Assert.True(capturedOptions!.Scope.HasFlag(BackupScope.Media));
    }

    // ── CreateBackupAsync (BackupOptions overload) ────────────────────────────

    [Fact]
    public async Task CreateBackupAsync_WithOptions_DelegatesToEngineDirectly()
    {
        var expected = new BackupResult { Name = "direct-backup", LocalPath = string.Empty };
        _backupEngine
            .Setup(e => e.CreateFullBackupAsync(It.IsAny<BackupOptions>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(expected);

        var svc = CreateService();
        var options = new BackupOptions { Compress = false };

        var result = await svc.CreateBackupAsync(options);

        Assert.Same(expected, result);
    }

    // ── RestoreBackupAsync ────────────────────────────────────────────────────

    [Fact]
    public async Task RestoreBackupAsync_DelegatesToEngineRestoreAsync()
    {
        var expected = new RestoreResult { Success = true, RestoredContentCount = 3 };
        _backupEngine
            .Setup(e => e.RestoreAsync(It.IsAny<string>(), It.IsAny<RestoreOptions>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(expected);

        var svc = CreateService();

        var result = await svc.RestoreBackupAsync("/some/path.zip", new RestoreOptions());

        Assert.Same(expected, result);
        _backupEngine.Verify(e =>
            e.RestoreAsync("/some/path.zip", It.IsAny<RestoreOptions>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    // ── DeleteBackupAsync ─────────────────────────────────────────────────────

    [Fact]
    public async Task DeleteBackupAsync_WithExistingBackup_DeletesFile()
    {
        Directory.CreateDirectory(_backupDir);
        var filePath = Path.Combine(_backupDir, "backup-20240101.zip");
        await File.WriteAllTextAsync(filePath, "PK");

        var svc = CreateService();
        await svc.DeleteBackupAsync("backup-20240101");

        Assert.False(File.Exists(filePath));
    }

    [Fact]
    public async Task DeleteBackupAsync_WithNonExistentBackup_ThrowsFileNotFoundException()
    {
        var svc = CreateService();

        await Assert.ThrowsAsync<FileNotFoundException>(
            () => svc.DeleteBackupAsync("nonexistent-backup"));
    }

    [Fact]
    public async Task DeleteBackupAsync_MatchesByNameWithoutExtension()
    {
        Directory.CreateDirectory(_backupDir);
        await File.WriteAllTextAsync(Path.Combine(_backupDir, "backup-xyz.json"), "{}");
        await File.WriteAllTextAsync(Path.Combine(_backupDir, "backup-abc.json"), "{}");

        var svc = CreateService();
        await svc.DeleteBackupAsync("backup-xyz");

        Assert.False(File.Exists(Path.Combine(_backupDir, "backup-xyz.json")));
        Assert.True(File.Exists(Path.Combine(_backupDir, "backup-abc.json")));
    }

    // ── GetCloudProvidersAsync ────────────────────────────────────────────────

    [Fact]
    public async Task GetCloudProvidersAsync_WithNoConfiguredProviders_ReturnsEmpty()
    {
        var svc = CreateService();

        var result = await svc.GetCloudProvidersAsync();

        Assert.Empty(result);
    }

    [Fact]
    public async Task GetCloudProvidersAsync_ReturnsConfiguredProviders()
    {
        _settings.CloudProviders.Add(new CloudProviderConfig
        {
            Id = "gd-1",
            ProviderType = "GoogleDrive",
            Enabled = true,
            Settings = []
        });

        var svc = CreateService();
        var result = (await svc.GetCloudProvidersAsync()).ToList();

        Assert.Single(result);
        Assert.Equal("gd-1", result[0].Id);
        Assert.Equal("GoogleDrive", result[0].ProviderType);
        Assert.True(result[0].Enabled);
    }

    [Fact]
    public async Task GetCloudProvidersAsync_WhenProviderRegistered_EnrichesWithOAuthAndApiKeyFlags()
    {
        _settings.CloudProviders.Add(new CloudProviderConfig
        {
            Id = "test-1",
            ProviderType = "TestCloud",
            Enabled = true,
            Settings = []
        });

        var provider = new Mock<ICloudStorageProvider>();
        provider.Setup(p => p.ProviderName).Returns("TestCloud");
        provider.Setup(p => p.RequiresOAuth).Returns(true);
        provider.Setup(p => p.RequiresApiKey).Returns(false);

        var svc = CreateService([provider.Object]);
        var result = (await svc.GetCloudProvidersAsync()).Single();

        Assert.Equal("True", result.Settings["requiresOAuth"]);
        Assert.Equal("False", result.Settings["requiresApiKey"]);
    }

    [Fact]
    public async Task GetCloudProvidersAsync_WhenProviderNotRegistered_DefaultsOAuthAndApiKeyToFalse()
    {
        _settings.CloudProviders.Add(new CloudProviderConfig
        {
            Id = "unregistered-1",
            ProviderType = "UnregisteredCloud",
            Enabled = true,
            Settings = []
        });

        var svc = CreateService();
        var result = (await svc.GetCloudProvidersAsync()).Single();

        Assert.Equal("False", result.Settings["requiresOAuth"]);
        Assert.Equal("False", result.Settings["requiresApiKey"]);
    }

    // ── TestCloudProviderAsync ────────────────────────────────────────────────

    [Fact]
    public async Task TestCloudProviderAsync_WithRegisteredProvider_ReturnsValidateResult()
    {
        var provider = new Mock<ICloudStorageProvider>();
        provider.Setup(p => p.ProviderName).Returns("ActiveCloud");
        provider.Setup(p => p.ValidateConnectionAsync(It.IsAny<CancellationToken>())).ReturnsAsync(true);

        var svc = CreateService([provider.Object]);

        var result = await svc.TestCloudProviderAsync("ActiveCloud");

        Assert.True(result);
        provider.Verify(p => p.ValidateConnectionAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task TestCloudProviderAsync_WithUnregisteredProvider_ReturnsFalse()
    {
        var svc = CreateService();

        var result = await svc.TestCloudProviderAsync("NonExistentCloud");

        Assert.False(result);
    }

    [Fact]
    public async Task TestCloudProviderAsync_WhenValidateFails_ReturnsFalse()
    {
        var provider = new Mock<ICloudStorageProvider>();
        provider.Setup(p => p.ProviderName).Returns("BadCloud");
        provider.Setup(p => p.ValidateConnectionAsync(It.IsAny<CancellationToken>())).ReturnsAsync(false);

        var svc = CreateService([provider.Object]);

        var result = await svc.TestCloudProviderAsync("BadCloud");

        Assert.False(result);
    }

    public void Dispose()
    {
        if (Directory.Exists(_tempDir))
            Directory.Delete(_tempDir, recursive: true);
    }
}
