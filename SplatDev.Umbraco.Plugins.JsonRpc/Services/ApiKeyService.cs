using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using SplatDev.Umbraco.Plugins.JsonRpc.Models;

namespace SplatDev.Umbraco.Plugins.JsonRpc.Services;

public class ApiKeyService : IApiKeyService
{
    private readonly JsonRpcDbContext _db;

    public ApiKeyService(JsonRpcDbContext db)
    {
        _db = db;
    }

    public async Task<List<ApiKey>> GetAll()
    {
        return await _db.ApiKeys
            .OrderByDescending(k => k.CreatedAt)
            .ToListAsync();
    }

    public async Task<ApiKeyCreated> Create(string name, string permissions)
    {
        // Generate a random 32-byte key and store its SHA-256 hash
        var rawKey     = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));
        var keyHash    = HashKey(rawKey);

        var entity = new ApiKey
        {
            Name        = name,
            KeyHash     = keyHash,
            Permissions = string.IsNullOrWhiteSpace(permissions) ? "*" : permissions,
            IsActive    = true,
            CreatedAt   = DateTime.UtcNow
        };

        await _db.ApiKeys.AddAsync(entity);
        await _db.SaveChangesAsync();

        return new ApiKeyCreated
        {
            Id = entity.Id,
            Name = entity.Name,
            Permissions = entity.Permissions,
            IsActive = entity.IsActive,
            CreatedAt = entity.CreatedAt,
            RawKey = rawKey,
        };
    }

    public async Task Revoke(int id)
    {
        var key = await _db.ApiKeys.FindAsync(id);
        if (key is null) return;

        key.IsActive = false;
        _db.ApiKeys.Update(key);
        await _db.SaveChangesAsync();
    }

    public async Task<ApiKey?> ValidateKey(string rawKey)
    {
        var hash = HashKey(rawKey);
        var key = await _db.ApiKeys
            .FirstOrDefaultAsync(k => k.KeyHash == hash && k.IsActive);

        if (key is null) return null;

        key.LastUsedAt = DateTime.UtcNow;
        _db.ApiKeys.Update(key);
        await _db.SaveChangesAsync();
        return key;
    }

    private static string HashKey(string rawKey)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(rawKey));
        return Convert.ToHexString(bytes).ToLowerInvariant();
    }
}
