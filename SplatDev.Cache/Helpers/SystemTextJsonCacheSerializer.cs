using System.Text.Json;

namespace SplatDev.Cache;

public sealed class SystemTextJsonCacheSerializer : ICacheSerializer
{
    private readonly JsonSerializerOptions _options;

    public SystemTextJsonCacheSerializer(JsonSerializerOptions? options = null)
    {
        _options = options ?? new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = false,
        };
    }

    public byte[]? Serialize<T>(T? value)
    {
        if (value is null)
        {
            return null;
        }

        return JsonSerializer.SerializeToUtf8Bytes(value, _options);
    }

    public T? Deserialize<T>(byte[]? data)
    {
        if (data is null || data.Length == 0)
        {
            return default;
        }

        return JsonSerializer.Deserialize<T>(data, _options);
    }
}
