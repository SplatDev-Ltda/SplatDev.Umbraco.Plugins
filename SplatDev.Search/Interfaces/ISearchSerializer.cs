namespace SplatDev.Search;

public interface ISearchSerializer
{
    string? Serialize<T>(T? value);

    T? Deserialize<T>(string? json);
}
