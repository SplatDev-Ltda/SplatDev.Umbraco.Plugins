namespace SplatDev.Umbraco.Plugins.CacheManager.Services
{
    public interface ICacheService
    {
        T? GetOrCreate<T>(string key, Func<T> factory, TimeSpan? slidingExpiration = null, TimeSpan? absoluteExpiration = null);
        Task<T?> GetOrCreateAsync<T>(string key, Func<Task<T>> factory, TimeSpan? slidingExpiration = null, TimeSpan? absoluteExpiration = null);
        void Remove(string key);
    }
}
