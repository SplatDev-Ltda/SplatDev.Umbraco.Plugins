using SplatDev.Umbraco.Plugins.JsonRpc.Models;

namespace SplatDev.Umbraco.Plugins.JsonRpc.Services;

public interface IApiKeyService
{
    Task<List<ApiKey>> GetAll();
    Task<ApiKeyCreated> Create(string name, string permissions);
    Task Revoke(int id);
    Task<ApiKey?> ValidateKey(string rawKey);
}
