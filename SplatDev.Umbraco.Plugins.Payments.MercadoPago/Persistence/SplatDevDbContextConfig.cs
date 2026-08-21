using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace SplatDev.Umbraco.Plugins.Payments.MercadoPago.Persistence;

/// <summary>
/// Points this plugin's DbContext at the same database Umbraco is using, with the same provider.
/// </summary>
/// <remarks>
/// This used to be a bare <c>UseSqlServer(umbracoDbDSN)</c>. Umbraco supports SQLite — it is what
/// the install wizard picks by default — and handing a SQLite connection string to the SQL Server
/// provider fails with "Keyword not supported: 'cache'", surfacing as a 500 from this plugin's own
/// dashboard.
/// </remarks>
public static class SplatDevDbContextConfig
{
    public const string ConnectionStringName = "umbracoDbDSN";

    public static void UseUmbracoDatabase(DbContextOptionsBuilder options, IConfiguration config)
    {
        var section = config.GetSection("ConnectionStrings");
        var connectionString = ResolveDataDirectory(section[ConnectionStringName] ?? string.Empty);
        var provider = section[$"{ConnectionStringName}_ProviderName"] ?? string.Empty;

        if (provider.Contains("Sqlite", StringComparison.OrdinalIgnoreCase))
        {
            options.UseSqlite(connectionString);
            return;
        }

        options.UseSqlServer(connectionString);
    }

    /// <summary>
    /// Expands the <c>|DataDirectory|</c> token Umbraco writes into SQLite connection strings.
    /// </summary>
    /// <remarks>
    /// Umbraco resolves this itself before handing the string to its own database factory, so a
    /// plugin reading the raw configuration value gets the unexpanded token and SQLite tries to
    /// open a file with a literal pipe in its name.
    /// </remarks>
    internal static string ResolveDataDirectory(string connectionString)
    {
        if (!connectionString.Contains("|DataDirectory|", StringComparison.OrdinalIgnoreCase))
            return connectionString;

        var dataDirectory = AppDomain.CurrentDomain.GetData("DataDirectory") as string;
        if (string.IsNullOrWhiteSpace(dataDirectory))
            dataDirectory = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "umbraco", "Data");

        return connectionString.Replace("|DataDirectory|", dataDirectory.TrimEnd('/', '\\'),
            StringComparison.OrdinalIgnoreCase);
    }
}
