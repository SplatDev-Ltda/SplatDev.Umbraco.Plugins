using System.Threading.Tasks;
﻿using CsvHelper;
using CsvHelper.Configuration;

using Microsoft.Extensions.Logging;

using System.Globalization;

using Umbraco.Cms.Infrastructure.Migrations;
using SplatDev.Umbraco.Plugins.Countries.Models;

namespace SplatDev.Umbraco.Plugins.Countries.Migrations
{
#if NET10_0_OR_GREATER
    internal class CountryMigration(IMigrationContext context, ILogger<CountryMigration> logger) : AsyncMigrationBase(context)
    {
        private readonly ILogger<CountryMigration> _logger = logger;

        protected override async Task MigrateAsync()
#else
    internal class CountryMigration(IMigrationContext context, ILogger<CountryMigration> logger) : MigrationBase(context)
    {
        private readonly ILogger<CountryMigration> _logger = logger;

        protected override void Migrate()
#endif
        {
            const string _skipping = "The database table {DbTable} already exists, skipping";

            _logger.LogDebug("Running migration {MigrationStep}", nameof(CountryMigration));

            if (TableExists(Country.TABLE_NAME))
            {
                _logger.LogDebug(_skipping, Country.TABLE_NAME);
                return;
            }

            Create.Table<Country>().Do();

            // The list is read from a copy embedded in this assembly.
            //
            // It used to be read from "C:\Temp\countries.csv" — a hardcoded absolute
            // path on someone's machine. That file does not exist on an install, and on
            // Linux the drive letter is not even meaningful, so the read threw, the
            // migration never completed, and Umbraco retried and failed it on every
            // boot with the table left empty. The CSV that ships beside this code was
            // never referenced by the project either, so pointing at it on disk would
            // not have helped: it was not in the package.
            var countries = ReadEmbeddedCountries();
            if (countries.Count == 0)
            {
                _logger.LogWarning(
                    "No countries were embedded in {Assembly}, so {DbTable} was created empty.",
                    typeof(CountryMigration).Assembly.GetName().Name, Country.TABLE_NAME);
                return;
            }

            context.Database.InsertBulk(countries);
            _logger.LogInformation("Inserted {Count} countries into {DbTable}.", countries.Count, Country.TABLE_NAME);

#if !NET10_0_OR_GREATER
        }
#else
            await Task.CompletedTask;
        }
#endif
    
        /// <summary>Reads the country list embedded in this assembly.</summary>
        private static List<Country> ReadEmbeddedCountries()
        {
            var assembly = typeof(CountryMigration).Assembly;
            var name = Array.Find(
                assembly.GetManifestResourceNames(),
                n => n.EndsWith("countries.csv", StringComparison.OrdinalIgnoreCase));

            if (name is null) return [];

            using var stream = assembly.GetManifestResourceStream(name);
            if (stream is null) return [];

            using var reader = new StreamReader(stream);
            using var csv = new CsvReader(reader, new CsvConfiguration(CultureInfo.InvariantCulture));

            // Map the five columns the file actually has. Country.Id is the database
            // identity, not something the CSV carries, and without saying so CsvHelper
            // demands an "Id" header and throws:
            //     Header with name 'Id'[0] was not found.
            // Mapping explicitly rather than switching header validation off, so a real
            // mismatch in the other five still fails loudly.
            csv.Context.RegisterClassMap<CountryCsvMap>();
            return csv.GetRecords<Country>().ToList();
        }

        /// <summary>Maps countries.csv onto <see cref="Country"/>, ignoring the identity.</summary>
        private sealed class CountryCsvMap : ClassMap<Country>
        {
            public CountryCsvMap()
            {
                Map(c => c.NumCode).Name("NumCode");
                Map(c => c.Alpha2Code).Name("Alpha2Code");
                Map(c => c.Alpha3Code).Name("Alpha3Code");
                Map(c => c.EnShortName).Name("EnShortName");
                Map(c => c.Nationality).Name("Nationality");
                Map(c => c.Id).Ignore();
            }
        }
}
}
