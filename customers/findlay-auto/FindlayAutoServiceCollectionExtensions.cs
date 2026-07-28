using Microsoft.Extensions.DependencyInjection;

namespace SplatDev.Umbraco.Workflow.Customers.FindlayAuto;

public static class FindlayAutoServiceCollectionExtensions
{
    public static IServiceCollection AddFindlayAutoWorkflow(this IServiceCollection services)
    {
        services.AddScoped<HireologyDataProvider>();
        services.AddScoped<FindlayAutoActionMessageDispatcher>();

        return services;
    }
}
