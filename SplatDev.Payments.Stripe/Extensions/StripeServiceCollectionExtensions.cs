namespace SplatDev.Payments.Stripe.Extensions
{
    using Microsoft.Extensions.Configuration;
    using Microsoft.Extensions.DependencyInjection;
    using SplatDev.Payments.Stripe.Models;
    using SplatDev.Payments.Stripe.Services;

    public static class StripeServiceCollectionExtensions
    {
        public static IServiceCollection AddSplatDevStripe(
            this IServiceCollection services,
            IConfiguration configuration,
            string sectionName = StripeOptions.DefaultSection)
        {
            services.Configure<StripeOptions>(
                configuration.GetSection(sectionName));

            services.AddSingleton<StripeService>();

            return services;
        }
    }
}
