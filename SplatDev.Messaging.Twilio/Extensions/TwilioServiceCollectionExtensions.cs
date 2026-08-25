namespace SplatDev.Messaging.Twilio.Extensions
{
    using Microsoft.Extensions.Configuration;
    using Microsoft.Extensions.DependencyInjection;
    using Microsoft.Extensions.Options;

    using SplatDev.Messaging.Twilio.Controllers;
    using SplatDev.Messaging.Twilio.Models;

    public static class TwilioServiceCollectionExtensions
    {
        public static IServiceCollection AddSplatDevTwilio(this IServiceCollection services, IConfiguration configuration, string sectionName = TwilioOptions.DefaultSection)
        {
            services.Configure<TwilioOptions>(configuration.GetSection(sectionName));
            services.AddTransient(sp =>
                new TwilioSmsController(sp.GetRequiredService<IOptions<TwilioOptions>>().Value));
            return services;
        }
    }
}
