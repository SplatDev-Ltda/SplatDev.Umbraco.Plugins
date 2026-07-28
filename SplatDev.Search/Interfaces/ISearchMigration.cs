namespace SplatDev.Search;

public interface ISearchMigration
{
    Task EnsureIndexAsync(IndexDefinition definition, CancellationToken cancellationToken = default);

    Task DropIndexAsync(string indexName, CancellationToken cancellationToken = default);
}
