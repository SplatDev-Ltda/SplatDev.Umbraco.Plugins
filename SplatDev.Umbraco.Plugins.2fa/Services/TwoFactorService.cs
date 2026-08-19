using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SplatDev.Umbraco.Plugins.TwoFactor.Models;

namespace SplatDev.Umbraco.Plugins.TwoFactor.Services;

public class TwoFactorService : ITwoFactorService
{
    private const int TimeStepSeconds = 30;

    /// <summary>How many steps either side of now are accepted, for clock drift.</summary>
    private const int DriftSteps = 1;

    private readonly TwoFactorDbContext _db;
    private readonly ILogger<TwoFactorService> _logger;

    public TwoFactorService(TwoFactorDbContext db, ILogger<TwoFactorService> logger)
    {
        _db = db;
        _logger = logger;
    }

    /// <summary>160 bits, the size RFC 4226 recommends for an HMAC-SHA1 secret.</summary>
    private static string GenerateTotpSecret() =>
        Base32.Encode(RandomNumberGenerator.GetBytes(20));

    private static string HashCode(string code) =>
        Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(code)));

    private static long CurrentTimeStep() =>
        DateTimeOffset.UtcNow.ToUnixTimeSeconds() / TimeStepSeconds;

    /// <summary>
    /// RFC 4226 dynamic truncation for one time step.
    /// </summary>
    internal static string ComputeOtp(byte[] key, long timeStep)
    {
        var data = BitConverter.GetBytes(timeStep);
        if (BitConverter.IsLittleEndian) Array.Reverse(data);

        var hash = HMACSHA1.HashData(key, data);
        var offset = hash[^1] & 0x0F;
        var otp = (((hash[offset] & 0x7F) << 24)
                 | ((hash[offset + 1] & 0xFF) << 16)
                 | ((hash[offset + 2] & 0xFF) << 8)
                 | (hash[offset + 3] & 0xFF)) % 1_000_000;

        return otp.ToString("D6");
    }

    /// <summary>
    /// Returns the time step the code matched, or null. Comparison is constant-time so the
    /// response cannot be used to learn a correct code digit by digit.
    /// </summary>
    private static long? MatchTimeStep(string secret, string code, long notBefore)
    {
        byte[] key;
        try
        {
            key = Base32.Decode(secret);
        }
        catch (FormatException)
        {
            // A secret written by a version before Base32 encoding. It cannot be enrolled
            // in an authenticator app, so it cannot produce a valid code either; treat it
            // as a failure rather than throwing on every verification attempt.
            return null;
        }

        var now = CurrentTimeStep();
        for (long step = now - DriftSteps; step <= now + DriftSteps; step++)
        {
            // Reject any step at or before the last redeemed one, so a code observed in
            // flight cannot be replayed for the remainder of its window.
            if (step <= notBefore) continue;

            var candidate = ComputeOtp(key, step);
            if (CryptographicOperations.FixedTimeEquals(
                    Encoding.UTF8.GetBytes(candidate), Encoding.UTF8.GetBytes(code)))
            {
                return step;
            }
        }

        return null;
    }

    public async Task<TwoFactorSetup> SetupTotpAsync(int memberId)
    {
        var existing = await _db.TwoFactorSetups.FirstOrDefaultAsync(s => s.MemberId == memberId);
        if (existing is not null)
        {
            existing.SecretKey = GenerateTotpSecret();
            existing.IsEnabled = false;
            existing.CreatedAt = DateTime.UtcNow;
            existing.LastUsedTimeStep = 0;
            await _db.SaveChangesAsync();
            return existing;
        }

        var setup = new TwoFactorSetup
        {
            MemberId = memberId,
            SecretKey = GenerateTotpSecret(),
            IsEnabled = false,
            CreatedAt = DateTime.UtcNow
        };

        _db.TwoFactorSetups.Add(setup);
        await _db.SaveChangesAsync();
        _logger.LogInformation("TOTP setup created for member {MemberId}", memberId);
        return setup;
    }

    public async Task<bool> VerifyTotpAsync(int memberId, string code)
    {
        var setup = await _db.TwoFactorSetups.FirstOrDefaultAsync(s => s.MemberId == memberId);
        if (setup is null) return false;

        var matched = MatchTimeStep(setup.SecretKey, code, setup.LastUsedTimeStep);
        if (matched is null) return false;

        setup.LastUsedTimeStep = matched.Value;
        if (!setup.IsEnabled) setup.IsEnabled = true;
        await _db.SaveChangesAsync();

        return true;
    }

    public async Task<IEnumerable<string>> GenerateBackupCodesAsync(int memberId, int count = 8)
    {
        var setup = await _db.TwoFactorSetups
            .Include(s => s.BackupCodes)
            .FirstOrDefaultAsync(s => s.MemberId == memberId)
            ?? throw new InvalidOperationException($"No 2FA setup found for member {memberId}.");

        _db.BackupCodes.RemoveRange(setup.BackupCodes);

        var codes = new List<string>(count);
        for (var i = 0; i < count; i++)
        {
            // 5 bytes = 40 bits. The previous 4 bytes was 32 bits, which is within reach
            // of an online attack against an endpoint that does not lock out.
            var raw = Convert.ToHexString(RandomNumberGenerator.GetBytes(5)).ToLowerInvariant();
            var code = $"{raw[..5]}-{raw[5..]}";
            codes.Add(code);

            setup.BackupCodes.Add(new BackupCode
            {
                MemberId = memberId,
                CodeHash = HashCode(code),
                IsUsed = false,
                TwoFactorSetupId = setup.Id
            });
        }

        await _db.SaveChangesAsync();
        _logger.LogInformation("Generated {Count} backup codes for member {MemberId}", count, memberId);

        // The only time the plaintext codes exist. They are not recoverable after this.
        return codes;
    }

    public async Task<bool> UseBackupCodeAsync(int memberId, string code)
    {
        var hash = HashCode(code.Trim());

        var backupCode = await _db.BackupCodes
            .FirstOrDefaultAsync(bc => bc.MemberId == memberId && bc.CodeHash == hash && !bc.IsUsed);

        if (backupCode is null) return false;

        backupCode.IsUsed = true;
        await _db.SaveChangesAsync();
        _logger.LogInformation("Backup code used for member {MemberId}", memberId);
        return true;
    }

    public async Task<bool> IsEnabledAsync(int memberId)
    {
        var setup = await _db.TwoFactorSetups.FirstOrDefaultAsync(s => s.MemberId == memberId);
        return setup?.IsEnabled ?? false;
    }

    public async Task DisableAsync(int memberId)
    {
        var setup = await _db.TwoFactorSetups
            .Include(s => s.BackupCodes)
            .FirstOrDefaultAsync(s => s.MemberId == memberId);

        if (setup is null) return;

        setup.IsEnabled = false;
        setup.LastUsedTimeStep = 0;
        _db.BackupCodes.RemoveRange(setup.BackupCodes);
        await _db.SaveChangesAsync();
        _logger.LogInformation("2FA disabled for member {MemberId}", memberId);
    }
}
