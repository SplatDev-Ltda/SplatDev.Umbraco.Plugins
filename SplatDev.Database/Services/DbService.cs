namespace SplatDev.Database.Services
{

    using SplatDev.Database.Interfaces;

    using System;
    using System.Collections.Generic;
    using System.Threading.Tasks;

    using NPoco;

    public abstract class DbService<T> : IDbService<T> where T : class, new()
    {
        private readonly string _tableName;
        public IDatabase Database { get; }

        protected DbService() { }
        protected DbService(string tableName) { _tableName = ValidateTableName(tableName); }

        protected DbService(IDatabase database, string tableName = "")
        {
            Database = database;
            _tableName = ValidateTableName(tableName);
        }

        private static string ValidateTableName(string tableName)
        {
            if (string.IsNullOrWhiteSpace(tableName))
            {
                return tableName;
            }

            if (tableName.IndexOfAny([';', '\'', '"', ' ', '\\', '/', '(', ')', '\0']) >= 0)
            {
                throw new ArgumentException($"Invalid table name: {tableName}", nameof(tableName));
            }

            return tableName;
        }

        #region virtual Methods
        /// <summary>
        /// Delete all records from the table (TableName is required)
        /// </summary>
        /// <remarks>tablename is required for this method</remarks>
        /// <returns>Async Task</returns>
        public virtual async Task DeleteAll()
        {
            await Task.Run(() => Database.Execute($"DELETE FROM {_tableName}")).ConfigureAwait(false);
        }

        /// <summary>
        /// Get all records in the table
        /// </summary>
        /// <remarks>tablename is required for this method</remarks>
        /// <returns>IEnumerable of all records</returns>
        public virtual async Task<IEnumerable<T>> GetAll()
        {
            return await Task.Run(() => Database.Query<T>($"SELECT * FROM {_tableName}")).ConfigureAwait(false);
        }

        /// <summary>
        /// Gets a record from the table base on Id and additional parameters
        /// </summary>
        /// <param name="id">the Id of the record</param>
        /// <param name="navigationProperties">Additional Parameters</param>
        /// <returns>A record of type T</returns>
        public virtual async Task<T> GetById(string id, params string[] navigationProperties)
        {
            return await Task.Run(() => Database.Single<T>(id, navigationProperties)).ConfigureAwait(false);
        }

        /// <summary>
        /// Queries the table and returns an IEnumerable of records
        /// </summary>
        /// <param name="sql">Custom SQL command</param>
        /// <returns>IEnumerable of records</returns>
        public virtual async Task<IEnumerable<T>> Query(string sql)
        {
            return await Task.Run(() => Database.Query<T>(sql)).ConfigureAwait(false);
        }

        /// <summary>
        /// Gets all records with list of Ids
        /// </summary>
        /// <param name="ids">List of ids to query the table</param>
        /// <remarks>tablename is required for this method</remarks>
        /// <returns>IEnumerable of records</returns>
        public virtual async Task<IEnumerable<T>> GetAllIds(params int[] ids)
        {
            return await Task.Run(() => Database.Query<T>($"SELECT * FROM {_tableName} WHERE Id in ({ids})")).ConfigureAwait(false);
        }
        #endregion

        /// <summary>
        /// Deletes a single record from the table
        /// </summary>
        /// <param name="id">The id of the record to delete</param>
        /// <returns>True or False (Success or Failure)</returns>
        public async Task<bool> Delete(int id)
        {
            var item = GetById(id);
            var result = await Task.Run(() => Database.Delete(item)).ConfigureAwait(false);
            return Convert.ToBoolean(result);
        }

        /// <summary>
        /// Gets a specific record by Id
        /// </summary>
        /// <param name="id">The Id of the record to return</param>
        /// <returns>A record T</returns>
        public async Task<T> GetById(int id)
        {
            if (await Exists(id).ConfigureAwait(false))
                return await Task.Run(() => Database.Single<T>(id.ToString())).ConfigureAwait(false);
            else return new T();
        }

        /// <summary>
        /// Inserts a new record into the table
        /// </summary>
        /// <param name="data">The entity to be inserted</param>
        /// <returns>True or False (Success or Failure)</returns>
        public async Task<bool> Insert(T data)
        {
            var result = await Task.Run(() => Database.Insert(data)).ConfigureAwait(false);
            return Convert.ToBoolean(result);
        }

        /// <summary>
        /// Updates a record in the table
        /// </summary>
        /// <param name="data">The entity to be update</param>
        /// <param name="primaryKeyValue">The primary key of the record</param>
        /// <returns>True or False (Success or Failure)</returns>
        public async Task<bool> Update(T data, int primaryKeyValue)
        {
            try
            {
                var result = await Task.Run(() => Database.Update(data, primaryKeyValue)).ConfigureAwait(false);
                return Convert.ToBoolean(result);

            }
            catch (Exception)
            {
                throw;
            }
        }

        /// <summary>
        /// Checks whether the record exists in the table
        /// </summary>
        /// <param name="id">The id of the record to be checked</param>
        /// <returns>True or False (Exists or Does not exist)</returns>
        public async Task<bool> Exists(int id)
        {
            return await Task.Run(() => Database.Exists<T>(id)).ConfigureAwait(false);
        }
    }
}
