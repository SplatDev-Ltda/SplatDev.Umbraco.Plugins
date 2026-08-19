namespace SplatDev.Umbraco.Plugins.TwoFactor.Models;

public class BackupCode
{
    public int Id { get; set; }
    public int MemberId { get; set; }

    /// <summary>
    /// SHA-256 of the code, hex-encoded. The code itself is shown to the member once,
    /// at generation, and is not recoverable afterwards.
    /// </summary>
    /// <remarks>
    /// This used to be the plaintext code. Anyone with read access to the database —
    /// a backup, a support query, a log of a SELECT — held working second factors for
    /// every member. Codes are 40 bits of CSPRNG output, so a plain hash is enough:
    /// there is no low-entropy guess space for a rainbow table to cover, which is the
    /// thing a slow KDF and a salt exist to defend.
    /// </remarks>
    public string CodeHash { get; set; } = string.Empty;

    public bool IsUsed { get; set; } = false;

    public int TwoFactorSetupId { get; set; }
    public TwoFactorSetup? Setup { get; set; }
}
