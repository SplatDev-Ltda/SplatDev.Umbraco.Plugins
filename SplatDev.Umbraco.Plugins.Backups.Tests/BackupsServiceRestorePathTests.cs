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

/// <summary>
/// Restore takes a caller-supplied path. Before 3.3.0 the endpoint was also anonymous,
/// so that string could name any file the process could read and its contents would be
/// restored into the CMS. Authorization is the primary fix; these cover the containment
/// check behind it, so an authenticated-but-hostile caller still cannot escape.
/// </summary>
public class BackupsServiceRestorePathTests : IDisposable
{
    private readonly string _tempDir;
    private readonly string _backupDir;
    private readonly Mock<IBackupEngine> _engine = new();

    public BackupsServiceRestorePathTests()
    {
        _tempDir = Path.Combine(Path.GetTempPath(), $"restore-path-{Guid.NewGuid():N}");
        _backupDir = Path.Combine(_tempDir, "App_Data", "Backups");
        Directory.CreateDirectory(_backupDir);

        _engine.Setup(e => e.RestoreAsync(It.IsAny<string>(), It.IsAny<RestoreOptions>(), It.IsAny<CancellationToken>()))
               .ReturnsAsync(new RestoreResult());
    }

    private BackupsService CreateService()
    {
        var hostEnv = new Mock<IHostEnvironment>();
        hostEnv.Setup(h => h.ContentRootPath).Returns(_tempDir);

        return new BackupsService(
            hostEnv.Object,
            new Mock<IContentService>().Object,
            new Mock<IMediaService>().Object,
            _engine.Object,
            new BackupSettings(),
            []);
    }

    [Fact]
    public async Task A_backup_inside_the_directory_is_restored()
    {
        var name = "nightly.zip";
        await File.WriteAllTextAsync(Path.Combine(_backupDir, name), "x");

        await CreateService().RestoreBackupAsync(name, new RestoreOptions());

        _engine.Verify(e => e.RestoreAsync(
            Path.Combine(Path.GetFullPath(_backupDir), name),
            It.IsAny<RestoreOptions>(),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Theory]
    [InlineData("../../../etc/passwd")]
    [InlineData("..\\..\\..\\windows\\win.ini")]
    [InlineData("subdir/../../../../secrets.json")]
    public async Task A_path_escaping_the_directory_is_rejected(string hostile)
    {
        await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => CreateService().RestoreBackupAsync(hostile, new RestoreOptions()));

        _engine.Verify(e => e.RestoreAsync(It.IsAny<string>(), It.IsAny<RestoreOptions>(),
            It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task An_absolute_path_outside_the_directory_is_rejected()
    {
        var outside = Path.Combine(Path.GetTempPath(), $"outside-{Guid.NewGuid():N}.json");
        await File.WriteAllTextAsync(outside, "{}");

        try
        {
            await Assert.ThrowsAsync<UnauthorizedAccessException>(
                () => CreateService().RestoreBackupAsync(outside, new RestoreOptions()));

            _engine.Verify(e => e.RestoreAsync(It.IsAny<string>(), It.IsAny<RestoreOptions>(),
                It.IsAny<CancellationToken>()), Times.Never);
        }
        finally
        {
            File.Delete(outside);
        }
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public async Task An_empty_path_is_rejected(string empty)
    {
        await Assert.ThrowsAsync<ArgumentException>(
            () => CreateService().RestoreBackupAsync(empty, new RestoreOptions()));
    }

    [Fact]
    public async Task A_sibling_directory_sharing_the_name_prefix_is_rejected()
    {
        // "…/Backups-evil" starts with "…/Backups" as a string but is a different directory.
        var sibling = Path.Combine(_tempDir, "App_Data", "Backups-evil");
        Directory.CreateDirectory(sibling);
        await File.WriteAllTextAsync(Path.Combine(sibling, "payload.json"), "{}");

        await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => CreateService().RestoreBackupAsync(
                Path.Combine(sibling, "payload.json"), new RestoreOptions()));
    }

    public void Dispose()
    {
        if (Directory.Exists(_tempDir))
            Directory.Delete(_tempDir, recursive: true);
    }
}
