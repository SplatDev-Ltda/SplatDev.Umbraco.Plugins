using Microsoft.Extensions.DependencyInjection;
using SplatDev.Umbraco.Workflow.Core.Contracts;
using SplatDev.Umbraco.Workflow.Core.Models;
using SplatDev.Umbraco.Workflow.Persistence.Providers;

namespace SplatDev.Umbraco.Workflow.Api.Composition;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddSplatDevWorkflowJsonProvider(
        this IServiceCollection services,
        Action<JsonMetadataProviderOptionsBuilder> configure)
    {
        var b = new JsonMetadataProviderOptionsBuilder();
        configure(b);
        services.AddSingleton(b.Build());
        services.AddScoped<IWorkflowDataProvider, JsonMetadataDataProvider>();
        return services;
    }
}

public sealed class JsonMetadataProviderOptionsBuilder
{
    private readonly Dictionary<string, IReadOnlyList<DisplayColumn>> _columns = new();
    private readonly List<string> _searchable = new();

    public JsonMetadataProviderOptionsBuilder Columns(string workflowKey, params DisplayColumn[] cols)
    {
        _columns[workflowKey] = cols;
        return this;
    }

    public JsonMetadataProviderOptionsBuilder Searchable(params string[] fieldKeys)
    {
        _searchable.AddRange(fieldKeys);
        return this;
    }

    public JsonMetadataProviderOptions Build() => new(_columns, _searchable);
}
