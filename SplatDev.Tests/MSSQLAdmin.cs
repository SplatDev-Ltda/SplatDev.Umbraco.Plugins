namespace SplatDev.Tests
{
    using Microsoft.Extensions.DependencyInjection;
    using Microsoft.Extensions.Logging;
    using SplatDev.Database.MSSQLAdmin;
    using SplatDev.Database.MSSQLAdmin.Extensions;
    using SplatDev.Database.MSSQLAdmin.Models;
    using Xunit;

    public class MSSQLAdmin
    {
        [Fact]
        public void Options_Defaults_AreSetCorrectly()
        {
            var options = new MssqlAdminOptions();

            Assert.Equal(string.Empty, options.ConnectionString);
            Assert.True(options.IndexMaintenanceEnabled);
            Assert.True(options.IntegrityChecksEnabled);
            Assert.True(options.SizeMonitoringEnabled);
            Assert.Equal(30.0f, options.RebuildThresholdPercent);
            Assert.Equal(10.0f, options.ReorganizeThresholdPercent);
        }

        [Fact]
        public void Options_CanConfigureValues()
        {
            var options = new MssqlAdminOptions
            {
                ConnectionString = "Server=localhost;Database=Test;",
                IndexMaintenanceEnabled = false,
                RebuildThresholdPercent = 50.0f,
            };

            Assert.Equal("Server=localhost;Database=Test;", options.ConnectionString);
            Assert.False(options.IndexMaintenanceEnabled);
            Assert.Equal(50.0f, options.RebuildThresholdPercent);
        }

        [Fact]
        public void IndexFragmentationInfo_Properties_CanBeSet()
        {
            var info = new IndexFragmentationInfo
            {
                SchemaName = "dbo",
                TableName = "Orders",
                IndexName = "IX_Orders_Date",
                FragmentationPercent = 75.5f,
                PageCount = 1000,
                RecommendedAction = "REBUILD",
            };

            Assert.Equal("dbo", info.SchemaName);
            Assert.Equal("Orders", info.TableName);
            Assert.Equal("IX_Orders_Date", info.IndexName);
            Assert.Equal(75.5f, info.FragmentationPercent);
            Assert.Equal(1000, info.PageCount);
            Assert.Equal("REBUILD", info.RecommendedAction);
        }

        [Fact]
        public void IndexMaintenanceResult_Defaults_AreZero()
        {
            var result = new IndexMaintenanceResult();

            Assert.False(result.Success);
            Assert.Equal(0, result.RebuiltCount);
            Assert.Equal(0, result.ReorganizedCount);
            Assert.Equal(0, result.StatisticsRefreshedCount);
            Assert.Empty(result.Actions);
            Assert.Null(result.Error);
            Assert.Empty(result.Details);
        }

        [Fact]
        public void IndexMaintenanceResult_ReflectsSuccess()
        {
            var result = new IndexMaintenanceResult
            {
                Success = true,
                RebuiltCount = 3,
                ReorganizedCount = 2,
                StatisticsRefreshedCount = 15,
            };

            Assert.True(result.Success);
            Assert.Equal(3, result.RebuiltCount);
            Assert.Equal(2, result.ReorganizedCount);
            Assert.Equal(15, result.StatisticsRefreshedCount);
        }

        [Fact]
        public void IntegrityCheckResult_Defaults_AreZero()
        {
            var result = new IntegrityCheckResult();

            Assert.False(result.Success);
            Assert.False(result.AllChecksPassed);
            Assert.Equal(0, result.ErrorCount);
            Assert.Empty(result.Rows);
            Assert.NotEqual(default, result.Timestamp);
        }

        [Fact]
        public void IntegrityCheckResult_PassedChecks()
        {
            var result = new IntegrityCheckResult
            {
                Success = true,
                AllChecksPassed = true,
                ErrorCount = 0,
                Rows =
                {
                    new IntegrityCheckRow
                    {
                        MessageText = "CHECKDB found 0 allocation errors and 0 consistency errors in database 'Test'.",
                        Level = 0,
                    },
                },
            };

            Assert.True(result.Success);
            Assert.True(result.AllChecksPassed);
            Assert.Equal(0, result.ErrorCount);
            Assert.Single(result.Rows);
        }

        [Fact]
        public void DatabaseSizeInfo_FormatsSizesCorrectly()
        {
            var info = new DatabaseSizeInfo
            {
                DatabaseName = "TestDb",
                DataSizeBytes = 1024L * 1024 * 150,
                LogSizeBytes = 1024L * 1024 * 50,
                TotalSizeBytes = 1024L * 1024 * 200,
            };

            Assert.Equal("TestDb", info.DatabaseName);
            Assert.Equal(1024L * 1024 * 150, info.DataSizeBytes);
            Assert.Equal(1024L * 1024 * 50, info.LogSizeBytes);
            Assert.True(info.TotalSizeBytes > 0);
        }

        [Fact]
        public void TableSizeInfo_Properties_CanBeSet()
        {
            var info = new TableSizeInfo
            {
                SchemaName = "dbo",
                TableName = "Products",
                RowCount = 50000,
                DataSizeBytes = 1024L * 1024 * 80,
                IndexSizeBytes = 1024L * 1024 * 20,
                TotalSizeBytes = 1024L * 1024 * 100,
                DataSizeFormatted = "80.00 MB",
                IndexSizeFormatted = "20.00 MB",
                TotalSizeFormatted = "100.00 MB",
            };

            Assert.Equal("dbo", info.SchemaName);
            Assert.Equal("Products", info.TableName);
            Assert.Equal(50000, info.RowCount);
            Assert.Equal(1024L * 1024 * 80, info.DataSizeBytes);
            Assert.Equal("100.00 MB", info.TotalSizeFormatted);
        }

        [Fact]
        public void IntegrityCheckRow_HandlesDbccColumns()
        {
            var row = new IntegrityCheckRow
            {
                Error = "8970",
                Level = 16,
                State = 1,
                MessageText = "Row error: Object ID 12345",
                DbId = 5,
                ObjectId = 12345,
                IndexId = 1,
            };

            Assert.Equal("8970", row.Error);
            Assert.Equal(16, row.Level);
            Assert.Equal("Row error: Object ID 12345", row.MessageText);
            Assert.Equal(5, row.DbId);
            Assert.Equal(12345, row.ObjectId);
            Assert.Equal(1, row.IndexId);
        }

        [Fact]
        public void DI_Registration_AddsServiceToCollection()
        {
            var services = new ServiceCollection();
            services.AddLogging();
            services.AddSplatDevMssqlAdmin(options =>
            {
                options.ConnectionString = "Server=localhost;Database=Test;";
            });

            var provider = services.BuildServiceProvider();
            var service = provider.GetService<MssqlAdminService>();

            Assert.NotNull(service);
        }

        [Fact]
        public void DI_Registration_RegistersOptionsAsSingleton()
        {
            var services = new ServiceCollection();
            services.AddLogging();
            services.AddSplatDevMssqlAdmin(options =>
            {
                options.ConnectionString = "Server=localhost;Database=Test;";
                options.RebuildThresholdPercent = 40.0f;
            });

            var provider = services.BuildServiceProvider();
            var options = provider.GetRequiredService<MssqlAdminOptions>();

            Assert.Equal("Server=localhost;Database=Test;", options.ConnectionString);
            Assert.Equal(40.0f, options.RebuildThresholdPercent);
        }
    }
}
