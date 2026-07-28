using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using SplatDev.Messaging.ClickSend.Models;
using SplatDev.Messaging.Interfaces;

namespace SplatDev.Messaging.ClickSend.Extensions;

public static class ClickSendServiceCollectionExtensions
{
    public static IServiceCollection AddClickSend(
        this IServiceCollection services,
        Action<ClickSendOptions> configure)
    {
        var options = new ClickSendOptions();
        configure(options);
        services.AddSingleton(options);

        services.TryAddSingleton<ISmsService, ClickSendService>();
        services.AddHttpClient<ClickSendService>();

        return services;
    }
}
