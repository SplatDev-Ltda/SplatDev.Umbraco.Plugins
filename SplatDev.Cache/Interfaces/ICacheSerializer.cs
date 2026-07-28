namespace SplatDev.Cache;

public interface ICacheSerializer
{
    byte[]? Serialize<T>(T? value);

    T? Deserialize<T>(byte[]? data);
}
