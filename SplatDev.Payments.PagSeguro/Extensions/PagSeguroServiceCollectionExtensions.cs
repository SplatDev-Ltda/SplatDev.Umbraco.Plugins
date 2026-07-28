namespace SplatDev.Payments.PagSeguro.Extensions
{
    using Microsoft.Extensions.Configuration;
    using Microsoft.Extensions.DependencyInjection;
    using SplatDev.Payments.PagSeguro.Models;
    using SplatDev.Payments.PagSeguro.Services;

    public static class PagSeguroServiceCollectionExtensions
    {
        public static IServiceCollection AddSplatDevPagSeguro(
            this IServiceCollection services,
            IConfiguration configuration,
            string sectionName = PagSeguroOptions.DefaultSection)
        {
            services.Configure<PagSeguroOptions>(
                configuration.GetSection(sectionName));

            services.AddHttpClient<PagSeguroService>();

            return services;
        }
    }
}
