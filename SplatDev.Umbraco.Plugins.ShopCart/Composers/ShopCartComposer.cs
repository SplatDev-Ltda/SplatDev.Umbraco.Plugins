using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using SplatDev.Umbraco.Plugins.ShopCart.Models;
using SplatDev.Umbraco.Plugins.ShopCart.Services;

namespace SplatDev.Umbraco.Plugins.ShopCart.Composers;

public class ShopCartComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.Services.AddScoped<IShopCartService, ShopCartService>();
        builder.Services.AddScoped<IShopCartAdminService, ShopCartAdminService>();

        builder.Services.AddDbContext<ShopCartDbContext>(options =>
            options.UseSqlServer(
                builder.Config.GetSection("ConnectionStrings")["umbracoDbDSN"] ?? string.Empty));
    }
}
