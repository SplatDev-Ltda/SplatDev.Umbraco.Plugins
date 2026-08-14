using SplatDev.Umbraco.Plugins.TwoFactor.Models;

namespace SplatDev.Umbraco.Plugins.TwoFactor.Services;

public interface ITwoFactorService
{
    Task<TwoFactorSetup> SetupTotpAsync(int memberId);
    Task<bool> VerifyTotpAsync(int memberId, string code);
    Task<IEnumerable<string>> GenerateBackupCodesAsync(int memberId, int count = 8);
    Task<bool> UseBackupCodeAsync(int memberId, string code);
    Task<bool> IsEnabledAsync(int memberId);
    Task DisableAsync(int memberId);
}
