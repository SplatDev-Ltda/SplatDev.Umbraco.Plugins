using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using SplatDev.Umbraco.Plugins.PhotoGallery.Models;
using SplatDev.Umbraco.Plugins.PhotoGallery.Services;
using SplatDev.Umbraco.Plugins.PhotoGallery.Components;
using SplatDev.Umbraco.Plugins.PhotoGallery.Persistence;

namespace SplatDev.Umbraco.Plugins.PhotoGallery.Composers;

public class PhotoGalleryComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        var connectionString = builder.Config.GetSection("ConnectionStrings")["umbracoDbDSN"];

        builder.Services.AddDbContext<PhotoGalleryDbContext>(options =>
            SplatDevDbContextConfig.UseUmbracoDatabase(options, builder.Config));

        builder.Components().Append<PhotoGallerySchemaComponent>();

        builder.Services.AddScoped<IPhotoGalleryService, PhotoGalleryService>();
    }
}
