using FluentAssertions;
using Microsoft.Data.SqlClient;
using Xunit;

namespace SplatDev.Umbraco.Workflow.Persistence.Tests;

public sealed class MigrationTests
{
    [Fact(Skip = "Requires LocalDB. Run locally with MSSQL LocalDB installed.")]
    public async Task M001_CreatesAllTablesOnFreshDatabase()
    {
        var dbName = $"SplatWorkflowTest_{Guid.NewGuid():N}";
        var master = "Server=(localdb)\\MSSQLLocalDB;Database=master;Integrated Security=true;TrustServerCertificate=true";
        var target = $"Server=(localdb)\\MSSQLLocalDB;Database={dbName};Integrated Security=true;TrustServerCertificate=true";

        await using (var c = new SqlConnection(master))
        {
            await c.OpenAsync();
            await using var cmd = c.CreateCommand();
            cmd.CommandText = $"CREATE DATABASE [{dbName}]";
            await cmd.ExecuteNonQueryAsync();
        }

        try
        {
            await MigrationTestHarness.RunAsync(target);

            await using var c = new SqlConnection(target);
            await c.OpenAsync();
            var tables = new[] { "splatWorkflowDefinition", "splatWorkflowInstance", "splatWorkflowEvent", "splatWorkflowAssignment", "splatWorkflowTask" };
            foreach (var name in tables)
            {
                await using var cmd = c.CreateCommand();
                cmd.CommandText = "SELECT COUNT(*) FROM sys.tables WHERE name = @n";
                cmd.Parameters.AddWithValue("@n", name);
                var found = (int)(await cmd.ExecuteScalarAsync())!;
                found.Should().Be(1, $"table {name} must exist after M001");
            }
        }
        finally
        {
            await using var c = new SqlConnection(master);
            await c.OpenAsync();
            await using var cmd = c.CreateCommand();
            cmd.CommandText = $"DROP DATABASE [{dbName}]";
            await cmd.ExecuteNonQueryAsync();
        }
    }
}

internal static class MigrationTestHarness
{
    public static Task RunAsync(string connectionString)
    {
        throw new NotImplementedException("Wire up Umbraco MigrationPlanExecutor + IScopeProvider against the target connection string. See Task 10 in the plan.");
    }
}
