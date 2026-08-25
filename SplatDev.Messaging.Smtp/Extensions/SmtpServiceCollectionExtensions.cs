namespace SplatDev.Messaging.Smtp.Extensions
{
    using Microsoft.Extensions.Configuration;
    using Microsoft.Extensions.DependencyInjection;
    using Microsoft.Extensions.Options;

    using SplatDev.Messaging.Smtp.Controllers;
    using SplatDev.Messaging.Smtp.Models;

    public static class SmtpServiceCollectionExtensions
    {
        public static IServiceCollection AddSplatDevSmtp(this IServiceCollection services, IConfiguration configuration, string sectionName = SmtpOptions.DefaultSection)
        {
            services.Configure<SmtpOptions>(configuration.GetSection(sectionName));
            services.AddTransient(sp =>
                new SmtpController(sp.GetRequiredService<IOptions<SmtpOptions>>().Value));
            return services;
        }
    }
}
