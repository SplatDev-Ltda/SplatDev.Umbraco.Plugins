using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using SplatDev.Umbraco.Plugins.ShopCart.Components;
using SplatDev.Umbraco.Plugins.ShopCart.Models;
using SplatDev.Umbraco.Plugins.ShopCart.Persistence;
using SplatDev.Umbraco.Plugins.ShopCart.Services;

namespace SplatDev.Umbraco.Plugins.ShopCart.Composers;

public class ShopCartComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.Services.AddScoped<IShopCartService, ShopCartService>();
        builder.Services.AddScoped<IShopCartAdminService, ShopCartAdminService>();

        builder.Services.AddDbContext<ShopCartDbContext>(options =>
            SplatDevDbContextConfig.UseUmbracoDatabase(options, builder.Config));

        builder.Components().Append<ShopCartSchemaComponent>();
    }
}
