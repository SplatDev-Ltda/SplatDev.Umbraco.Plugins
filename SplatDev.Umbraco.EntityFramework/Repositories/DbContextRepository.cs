using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

using SplatDev.Umbraco.Pagination.Extensions;
using SplatDev.Umbraco.Pagination.Models;

namespace SplatDev.Umbraco.EntityFramework.Repositories
{
    public class DbContextRepository<TEntity>(
        DbContext context,
        ILogger<DbContextRepository<TEntity>> logger) : IRepository<TEntity> where TEntity : class
    {
        private readonly DbContext _dbContext = context;
        private readonly ILogger<DbContextRepository<TEntity>> _logger = logger;

        public async Task<TEntity> CreateAsync(TEntity entity)
        {
            try
            {
                await _dbContext.Set<TEntity>().AddAsync(entity);
                await _dbContext.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Could not save Entity");
            }
            return entity;
        }

        public async Task DeleteAsync(int id)
        {
            var entity = await GetByIdAsync(id);
            if (entity is null) return;

            _dbContext.Set<TEntity>().Remove(entity);
            await _dbContext.SaveChangesAsync();
        }

        public void Dispose() => _dbContext.Dispose();

        public virtual async Task<IList<TEntity>> FetchAsync(FormattableString query)
        {
            var items = await _dbContext.Set<TEntity>().FromSqlInterpolated(query).AsNoTracking().ToListAsync();
            return items;
        }

        public async Task<IList<TEntity>?> GetAllAsync()
        {
            var items = await _dbContext.Set<TEntity>().AsNoTracking().ToListAsync();
            return items;
        }

        public async Task<TEntity?> GetByIdAsync(int id)
        {
            var item = await _dbContext.Set<TEntity>().FindAsync(id);
            return item;
        }

        public async Task<PagedResults<TEntity>> GetPagedResultsAsync(int pageNumber, int pageSize)
        {
            int total = await _dbContext.Set<TEntity>().CountAsync();
            IList<TEntity> paged = await _dbContext.Set<TEntity>()
                .AsNoTracking()
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var pagedResults = new PagedResults<TEntity>
            {
                Results = paged,
                Pagination = new Pagination.Models.Pagination
                {
                    Page = pageNumber,
                    PageSize = pageSize,
                    TotalResults = total,
                    TotalPages = total > 0 ? PaginationExtensions.GetTotalPages(total, pageSize) : 0
                }
            };
            return pagedResults;
        }

        public async Task<TEntity> UpdateAsync(TEntity entity)
        {
            _dbContext.Set<TEntity>().Update(entity);
            await _dbContext.SaveChangesAsync();
            return entity;
        }

        public async Task<int?> CountRecordsAsync()
        {
            return await _dbContext.Set<TEntity>().CountAsync();
        }
    }
}
