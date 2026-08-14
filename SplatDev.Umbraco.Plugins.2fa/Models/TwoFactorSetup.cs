namespace SplatDev.Umbraco.Plugins.TwoFactor.Models;

public class TwoFactorSetup
{
    public int Id { get; set; }
    public int MemberId { get; set; }

    /// <summary>
    /// The TOTP shared secret, Base32-encoded per RFC 4648.
    /// </summary>
    /// <remarks>
    /// Base32, not Base64. Authenticator apps take Base32 — that is what the
    /// <c>otpauth://</c> URI carries and what the manual-entry field expects. The previous
    /// version generated Base64, which no standard app can enrol, so 2FA could never
    /// actually be completed by a member however correct the verification maths was.
    /// </remarks>
    public string SecretKey { get; set; } = string.Empty;

    public bool IsEnabled { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// The last 30-second time step successfully redeemed, so a code cannot be replayed
    /// within its validity window by anyone who observes it.
    /// </summary>
    public long LastUsedTimeStep { get; set; }

    public ICollection<BackupCode> BackupCodes { get; set; } = new List<BackupCode>();
}
