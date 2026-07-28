using System.Text.Json;

namespace SplatDev.Search;

public sealed class SystemTextJsonSearchSerializer : ISearchSerializer
{
    private readonly JsonSerializerOptions _options;

    public SystemTextJsonSearchSerializer(JsonSerializerOptions? options = null)
    {
        _options = options ?? new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = false,
        };
    }

    public string? Serialize<T>(T? value)
    {
        if (value is null)
        {
            return null;
        }

        return JsonSerializer.Serialize(value, _options);
    }

    public T? Deserialize<T>(string? json)
    {
        if (string.IsNullOrEmpty(json))
        {
            return default;
        }

        return JsonSerializer.Deserialize<T>(json, _options);
    }
}
