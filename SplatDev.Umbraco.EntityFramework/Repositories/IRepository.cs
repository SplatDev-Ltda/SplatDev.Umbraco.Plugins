using SplatDev.Umbraco.Pagination.Models;

namespace SplatDev.Umbraco.EntityFramework.Repositories
{
    public interface IRepository<TEntity> : IDisposable where TEntity : class
    {
        Task<int?> CountRecordsAsync();
        Task<TEntity> CreateAsync(TEntity entity);
        Task DeleteAsync(int id);
        Task<IList<TEntity>> FetchAsync(FormattableString query);
        Task<IList<TEntity>?> GetAllAsync();
        Task<TEntity?> GetByIdAsync(int id);
        Task<PagedResults<TEntity>> GetPagedResultsAsync(int pageNumber, int pageSize);
        Task<TEntity> UpdateAsync(TEntity entity);
    }
}
