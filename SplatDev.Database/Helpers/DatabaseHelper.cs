namespace SplatDev.Database.Helpers
{
    using NPoco;

    using SplatDev.Database.Interfaces;

    using System;
    using System.Collections.Generic;
    using System.IO;
    using System.Linq;
    using System.Reflection;

    using SplatDev.Reflection;

    using System.Text;
    public static class DatabaseHelper
    {
        public static bool ColumnExists(this Database db, ITable table, PropertyInfo column)
        {
            if (db.TableExistsQuery(table))
                return db.ExecuteScalar<bool>($"SELECT 1 [Exists] FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '{table.TableName}' AND COLUMN_NAME = '{column.Name}'");
            else return false;
        }

        public static string[] GetTableColumns(this Type table)
        {
            var properties = table.GetInstance<ITable>().GetType().GetProperties().Where(x => x.GetCustomAttribute<IgnoreAttribute>() == null);
            var list = new List<string>();
            foreach (var prop in properties) list.Add(prop.Name);
            return list.ToArray<string>();
        }

        public static string GetTableName(Type source)
        {
            try
            {
                return source.GetField("TABLENAME").GetValue(source).ToString();
            }
            catch
            {
                var type = Activator.CreateInstance(source);
                return type.GetProperty("TableName").Value<string>();
            }
        }

        public static IEnumerable<Type> GetTables(this Assembly assembly, string assemblyName = "")
        {
            IEnumerable<Type> classes = null;

            try
            {
                if (!string.IsNullOrEmpty(assemblyName)) assembly = Assembly.Load(assemblyName);
                classes = assembly.GetTypes().Where(t => t.IsClass && typeof(ITable).IsAssignableFrom(t));
            }
            catch (ReflectionTypeLoadException ex)
            {
                StringBuilder sb = new StringBuilder();
                foreach (Exception exSub in ex.LoaderExceptions)
                {
                    sb.AppendLine(exSub.Message);
                    if (exSub is FileNotFoundException exFileNotFound)
                    {
                        if (!string.IsNullOrEmpty(exFileNotFound.FusionLog))
                        {
                            sb.AppendLine("Fusion Log:");
                            sb.AppendLine(exFileNotFound.FusionLog);
                        }
                    }
                    sb.AppendLine();
                    throw new Exception(sb.ToString());
                }
            }
            return classes;
        }

        public static void InsertData<T>(Database db, List<T> list, bool SkipIfHasData = false, string Table = "")
        {
            bool hasData = db.ExecuteScalar<int>($"SELECT count(*) [Exists] FROM {Table}") > 0;
            if (!hasData)
                foreach (var item in list) db.Insert(item);
            else
                if (!SkipIfHasData) foreach (var item in list) db.Insert(item);
        }

        public static bool TableExistsQuery(this Database db, ITable table)
        {
            return db.ExecuteScalar<bool>($"SELECT 1 [Exists] FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = '{table.TableName}'");
        }

        public static bool TableExistsQuery(this Database db, string tableName)
        {
            return db.ExecuteScalar<bool>($"SELECT 1 [Exists] FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = '{tableName}'");
        }
    }
}
