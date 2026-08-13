using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using SplatDev.Umbraco.Plugins.TwoFactor.Models;
using SplatDev.Umbraco.Plugins.TwoFactor.Services;
using Xunit;

namespace SplatDev.Umbraco.Plugins.TwoFactor.Tests;

public class TwoFactorServiceTests
{
    private static TwoFactorDbContext NewDb()
    {
        var options = new DbContextOptionsBuilder<TwoFactorDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new TwoFactorDbContext(options);
    }

    private static TwoFactorService NewService(TwoFactorDbContext db) =>
        new(db, NullLogger<TwoFactorService>.Instance);

    /// <summary>Produces the code an authenticator app would show right now.</summary>
    private static string CurrentCode(string base32Secret)
    {
        var step = DateTimeOffset.UtcNow.ToUnixTimeSeconds() / 30;
        return TwoFactorService.ComputeOtp(Base32.Decode(base32Secret), step);
    }

    [Fact]
    public async Task Setup_then_verify_enables_2fa()
    {
        using var db = NewDb();
        var svc = NewService(db);

        var setup = await svc.SetupTotpAsync(memberId: 7);
        Assert.False(setup.IsEnabled);

        Assert.True(await svc.VerifyTotpAsync(7, CurrentCode(setup.SecretKey)));
        Assert.True(await svc.IsEnabledAsync(7));
    }

    [Fact]
    public async Task A_code_cannot_be_replayed()
    {
        using var db = NewDb();
        var svc = NewService(db);

        var setup = await svc.SetupTotpAsync(memberId: 7);
        var code = CurrentCode(setup.SecretKey);

        Assert.True(await svc.VerifyTotpAsync(7, code));

        // Same code, same 30-second window. Previously this succeeded indefinitely, so
        // anyone who observed a code could reuse it until the window rolled over.
        Assert.False(await svc.VerifyTotpAsync(7, code));
    }

    [Fact]
    public async Task Wrong_code_is_rejected()
    {
        using var db = NewDb();
        var svc = NewService(db);

        await svc.SetupTotpAsync(memberId: 7);
        Assert.False(await svc.VerifyTotpAsync(7, "000000"));
    }

    [Fact]
    public async Task Verify_for_a_member_with_no_setup_is_false_not_an_exception()
    {
        using var db = NewDb();
        Assert.False(await NewService(db).VerifyTotpAsync(999, "123456"));
    }

    [Fact]
    public async Task Backup_codes_are_not_stored_in_plaintext()
    {
        using var db = NewDb();
        var svc = NewService(db);

        await svc.SetupTotpAsync(memberId: 7);
        var codes = (await svc.GenerateBackupCodesAsync(7)).ToList();

        var stored = await db.BackupCodes.Select(c => c.CodeHash).ToListAsync();

        Assert.Equal(8, codes.Count);
        Assert.All(codes, c => Assert.DoesNotContain(c, stored));
        Assert.All(stored, h => Assert.Equal(64, h.Length));
    }

    [Fact]
    public async Task A_backup_code_works_once()
    {
        using var db = NewDb();
        var svc = NewService(db);

        await svc.SetupTotpAsync(memberId: 7);
        var code = (await svc.GenerateBackupCodesAsync(7)).First();

        Assert.True(await svc.UseBackupCodeAsync(7, code));
        Assert.False(await svc.UseBackupCodeAsync(7, code));
    }

    [Fact]
    public async Task A_backup_code_does_not_work_for_a_different_member()
    {
        using var db = NewDb();
        var svc = NewService(db);

        await svc.SetupTotpAsync(memberId: 7);
        await svc.SetupTotpAsync(memberId: 8);

        var code = (await svc.GenerateBackupCodesAsync(7)).First();
        Assert.False(await svc.UseBackupCodeAsync(8, code));
    }

    [Fact]
    public async Task Regenerating_backup_codes_invalidates_the_previous_set()
    {
        using var db = NewDb();
        var svc = NewService(db);

        await svc.SetupTotpAsync(memberId: 7);
        var first = (await svc.GenerateBackupCodesAsync(7)).First();
        await svc.GenerateBackupCodesAsync(7);

        Assert.False(await svc.UseBackupCodeAsync(7, first));
    }

    [Fact]
    public async Task Disabling_removes_the_backup_codes()
    {
        using var db = NewDb();
        var svc = NewService(db);

        await svc.SetupTotpAsync(memberId: 7);
        var code = (await svc.GenerateBackupCodesAsync(7)).First();

        await svc.DisableAsync(7);

        Assert.False(await svc.IsEnabledAsync(7));
        Assert.False(await svc.UseBackupCodeAsync(7, code));
    }

    [Fact]
    public async Task Re_running_setup_replaces_the_secret_and_disables_until_reverified()
    {
        using var db = NewDb();
        var svc = NewService(db);

        var first = await svc.SetupTotpAsync(memberId: 7);
        await svc.VerifyTotpAsync(7, CurrentCode(first.SecretKey));
        Assert.True(await svc.IsEnabledAsync(7));

        var firstSecret = first.SecretKey;
        var second = await svc.SetupTotpAsync(memberId: 7);

        Assert.NotEqual(firstSecret, second.SecretKey);
        Assert.False(await svc.IsEnabledAsync(7));
    }

    [Fact]
    public async Task Backup_codes_require_an_existing_setup()
    {
        using var db = NewDb();
        await Assert.ThrowsAsync<InvalidOperationException>(
            () => NewService(db).GenerateBackupCodesAsync(404));
    }

    [Fact]
    public async Task A_legacy_base64_secret_fails_verification_rather_than_throwing()
    {
        using var db = NewDb();
        db.TwoFactorSetups.Add(new TwoFactorSetup
        {
            MemberId = 7,
            // What the previous version wrote. '+' and '/' are outside the Base32 alphabet.
            SecretKey = Convert.ToBase64String(Encoding.ASCII.GetBytes("12345678901234567890")),
            IsEnabled = true
        });
        await db.SaveChangesAsync();

        Assert.False(await NewService(db).VerifyTotpAsync(7, "123456"));
    }
}
