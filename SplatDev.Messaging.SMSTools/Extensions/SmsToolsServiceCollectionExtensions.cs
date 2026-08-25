namespace SplatDev.Messaging.SMSTools.Extensions
{
    using Microsoft.Extensions.Configuration;
    using Microsoft.Extensions.DependencyInjection;
    using Microsoft.Extensions.Options;

    using SplatDev.Messaging.SMSTools.Controllers;
    using SplatDev.Messaging.SMSTools.Models;

    public static class SmsToolsServiceCollectionExtensions
    {
        public static IServiceCollection AddSplatDevSmsTools(this IServiceCollection services, IConfiguration configuration, string sectionName = SmsToolsOptions.DefaultSection)
        {
            services.Configure<SmsToolsOptions>(configuration.GetSection(sectionName));
            services.AddTransient(sp =>
                new SmsToolsController(sp.GetRequiredService<IOptions<SmsToolsOptions>>().Value));
            return services;
        }
    }
}
