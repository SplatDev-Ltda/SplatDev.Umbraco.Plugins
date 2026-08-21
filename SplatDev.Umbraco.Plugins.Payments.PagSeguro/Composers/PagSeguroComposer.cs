using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using SplatDev.Umbraco.Plugins.Payments.PagSeguro.Models;
using SplatDev.Umbraco.Plugins.Payments.PagSeguro.Services;
using SplatDev.Umbraco.Plugins.Payments.PagSeguro.Components;
using SplatDev.Umbraco.Plugins.Payments.PagSeguro.Persistence;

namespace SplatDev.Umbraco.Plugins.Payments.PagSeguro.Composers;

public class PagSeguroComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.Services.AddHttpClient();

        builder.Services.AddScoped<IPagSeguroService, PagSeguroService>();

        builder.Services.AddDbContext<PagSeguroDbContext>(options =>
            SplatDevDbContextConfig.UseUmbracoDatabase(options, builder.Config));

        builder.Components().Append<PaymentsPagSeguroSchemaComponent>();
    }
}
