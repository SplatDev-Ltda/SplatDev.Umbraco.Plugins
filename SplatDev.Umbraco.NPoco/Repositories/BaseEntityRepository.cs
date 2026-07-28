// Ignore Spelling: sql

using Microsoft.Win32.SafeHandles;

using NPoco;
using NPoco.Linq;

using SplatDev.Umbraco.NPoco.Notifications;

using System.Runtime.InteropServices;

using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Persistence.Querying;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Infrastructure.Persistence;
using Umbraco.Cms.Infrastructure.Persistence.Querying;
using Umbraco.Cms.Infrastructure.Scoping;
using Umbraco.Extensions;

namespace SplatDev.Umbraco.NPoco.Repositories
{
    public abstract class BaseEntityRepository<T>(IScopeProvider scopeProvider) : IDisposable, IRepository<T> where T : class, IBaseEntity
    {
        private static readonly Guid SuperUserKey = new("1E70F841-C261-413B-ABB2-2D68CDB96094");

        private bool _disposedValue;
        private SafeHandle? _safeHandle = new SafeFileHandle(nint.Zero, true);
        private Guid? _userId = SuperUserKey;
        public Guid? UserId { get => _userId; set => _userId = value; }
        private readonly IScopeProvider _scopeProvider = scopeProvider;

        #region TsRepository Methods
        public int? Count()
        {
            using var scope = _scopeProvider.CreateScope(autoComplete: true);
            return scope.Database.Query<T>().Count();
        }

        public void Delete(int id)
        {
            using var scope = _scopeProvider.CreateScope(autoComplete: true);
            scope.Database.Delete<T>(id);
            OnActionCompleted(new ActionCompletedEvent
            {
                AuditType = AuditType.Delete,
                Id = id,
                UserId = UserId ?? SuperUserKey,
                Message = $"T with id {id} has been deleted",
                Log = true
            });
        }

        public void Delete(T entity)
        {
            using var scope = _scopeProvider.CreateScope(autoComplete: true);
            scope.Database.Delete(entity);
            OnActionCompleted(new ActionCompletedEvent
            {
                AuditType = AuditType.Delete,
                Entity = entity,
                Id = entity.Id,
                UserId = UserId ?? SuperUserKey,
                Message = $"T (id: {entity.Id}) has been deleted",
                Log = true
            });
        }

        public void DeleteBulk(IList<int> ids)
        {
            using var scope = _scopeProvider.CreateScope(autoComplete: true);
            scope.Database.DeleteMany<T>().Where(x => ids.Contains(x.Id)).Execute();
            foreach (var id in ids)
            {
                OnActionCompleted(new ActionCompletedEvent
                {
                    AuditType = AuditType.Delete,
                    Id = id,
                    UserId = UserId ?? SuperUserKey,
                    Message = $"T with id {id} has been deleted",
                    Log = true
                });
            }
        }

        public void DeleteBulk(IList<T> entities)
        {
            using var scope = _scopeProvider.CreateScope(autoComplete: true);
            scope.Database.DeleteMany<T>().Where(x => entities.Contains(x)).Execute();
            foreach (var entity in entities)
            {
                OnActionCompleted(new ActionCompletedEvent
                {
                    AuditType = AuditType.Delete,
                    Entity = entity,
                    Id = entity.Id,
                    UserId = UserId ?? SuperUserKey,
                    Message = $"T (id: {entity.Id}) has been deleted",
                    Log = true
                });
            }
        }

        public bool Exists(int id) => Get(id) is not null;

        public IEnumerable<T> GetMany(params int[]? ids)
        {
            using var scope = _scopeProvider.CreateScope(autoComplete: true);
            if (ids?.Length > 0)
                return scope.Database.Query<T>().Where(x => ids.Contains(x.Id)).ToList();
            else return [];
        }

        public IEnumerable<T> GetMany(int id)
        {
            using var scope = _scopeProvider.CreateScope(autoComplete: true);
            return scope.Database.Query<T>().Where(x => x.Id == id).ToList();
        }

        public IList<T> Fetch(string query)
        {
            using var scope = _scopeProvider.CreateScope(autoComplete: true);
            return [.. scope.Database.Query<T>(query)];
        }

        public T? Get(int? id)
        {
            if (id == null || id <= 0)
            {
                return null;
            }
            using var scope = _scopeProvider.CreateScope(autoComplete: true);
            Sql<ISqlContext> sql = scope.SqlContext.Sql()
             .Select<T>()
             .From<T>()
             .Where<T>(x => x.Id == id);

            T dto = scope.Database.FirstOrDefault<T>(sql);
            return dto;
        }

        public T? Get(string column, object? value)
        {
            if (value == null)
                return null;

            // Early validation for int columns (optional)
            if (value is int intValue && intValue <= 0)
                return null;

            using var scope = _scopeProvider.CreateScope(autoComplete: true);
            var sql = scope.SqlContext.Sql()
                .Select<T>()
                .From<T>()
                .Where($"{column} = @0", value);

            T dto = scope.Database.FirstOrDefault<T>(sql);
            return dto;
        }


        public IEnumerable<T> GetAll()
        {
            using var scope = _scopeProvider.CreateScope(autoComplete: true);
            return scope.Database.Query<T>().ToList();
        }

        public IEnumerable<T> GetPagedResultsByQuery(
            IQuery<T> query,
            long pageIndex,
            int pageSize,
            out long totalRecords,
            IQuery<T>? filter,
            Ordering? ordering)
       => GetPagedResultsByQuery(query, pageIndex, pageSize, out totalRecords, filter, ordering, sqlCustomization: null);

        public IEnumerable<T> GetPagedResultsByQuery(
            IQuery<T> query,
            long pageIndex,
            int pageSize,
            out long totalRecords,
            IQuery<T>? filter,
            Ordering? ordering,
            Action<Sql<ISqlContext>>? sqlCustomization = null)
        {
            Sql<ISqlContext> sql = GetBaseWhere(s =>
            {
                sqlCustomization?.Invoke(s);

                if (filter != null)
                {
                    foreach (Tuple<string, object[]> filterClause in filter.GetWhereClauses())
                    {
                        s.Where(filterClause.Item1, filterClause.Item2);
                    }
                }
            });

            ordering ??= Ordering.ByDefault();

            var translator = new SqlTranslator<T>(sql, query);
            sql = translator.Translate();

            if (!ordering.IsEmpty) ApplyOrdering(ref sql, ordering);

            var pageIndexToFetch = pageIndex + 1;
            IEnumerable<T> dtos;
            using var scope = _scopeProvider.CreateScope(autoComplete: true);
            Page<T>? page = scope.Database.Page<T>(pageIndexToFetch, pageSize, sql);
            dtos = page.Items;
            totalRecords = page.TotalItems;

            return dtos;
        }

        public T Insert(T entity)
        {
            using var scope = _scopeProvider.CreateScope(autoComplete: true);
            var id = Convert.ToInt32(scope.Database.Insert(entity));
            entity.Id = id;
            OnActionCompleted(new ActionCompletedEvent
            {
                AuditType = AuditType.Save,
                Entity = entity,
                Id = id,
                UserId = UserId ?? SuperUserKey,
            });
            return entity;
        }

        public void InsertBulk(List<T> entities)
        {
            using var scope = _scopeProvider.CreateScope(autoComplete: true);
            scope.Database.InsertBulk(entities);
            foreach (var entity in entities)
            {
                OnActionCompleted(new ActionCompletedEvent
                {
                    AuditType = AuditType.Save,
                    Entity = entity,
                    Id = entity.Id,
                    UserId = UserId ?? SuperUserKey
                });
            }
        }

        public void Update(T entity)
        {
            using var scope = _scopeProvider.CreateScope(autoComplete: true);
            scope.Database.Update(entity);
            OnActionCompleted(new ActionCompletedEvent
            {
                AuditType = AuditType.Save,
                Entity = entity,
                Id = entity.Id,
                UserId = UserId ?? SuperUserKey
            });
        }

        public void UpdateBulk(List<T> entities)
        {
            foreach (var entity in entities)
            {
                Update(entity);
            }
        }
        #endregion

        #region Query Methods
        protected static void ApplyOrdering(ref Sql<ISqlContext> sql, Ordering ordering, string field = "id")
        {
            ArgumentNullException.ThrowIfNull(sql);

            ArgumentNullException.ThrowIfNull(ordering);

            if (ordering.Direction == Direction.Ascending)
            {
                sql.OrderBy(field);
            }
            else
            {
                sql.OrderByDescending(field);
            }
        }

        protected Sql<ISqlContext> GetBase(Action<Sql<ISqlContext>>? filter)
        {
            using var scope = _scopeProvider.CreateScope(autoComplete: true);
            Sql<ISqlContext> sql = scope.SqlContext.Sql();

            sql.From<T>();

            filter?.Invoke(sql);

            return sql;
        }

        protected Sql<ISqlContext> GetBaseQuery(bool isCount)
        {
            using var scope = _scopeProvider.CreateScope(autoComplete: true);
            Sql<ISqlContext> sql = scope.SqlContext.Sql();
            sql = isCount ? sql.SelectCount() : sql.Select<T>();
            sql = sql.From<T>();
            return sql;
        }

        protected Sql<ISqlContext> GetBaseWhere(Action<Sql<ISqlContext>>? filter)
        {
            Sql<ISqlContext> sql = GetBase(filter);

            return sql;
        }
        #endregion

        #region  Dispose

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        protected virtual void Dispose(bool disposing)
        {
            if (!_disposedValue)
            {
                if (disposing)
                {
                    _safeHandle?.Dispose();
                    _safeHandle = null;
                }

                _disposedValue = true;
            }
        }

        #endregion

        #region Events
        public event IRepository<T>.OnActionCompleted? ActionCompleted;
        protected virtual void OnActionCompleted(ActionCompletedEvent e)
        {
            ActionCompleted?.Invoke(this, e);
        }
        #endregion
    }
}
