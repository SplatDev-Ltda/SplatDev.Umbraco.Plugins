using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using SplatDev.Umbraco.Plugins.Blog.Models;
using SplatDev.Umbraco.Plugins.Blog.Services;
using SplatDev.Umbraco.Plugins.Blog.Components;
using SplatDev.Umbraco.Plugins.Blog.Persistence;

namespace SplatDev.Umbraco.Plugins.Blog.Composers;

public class BlogComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.Services.AddDbContext<BlogDbContext>(options =>
            SplatDevDbContextConfig.UseUmbracoDatabase(options, builder.Config));

        builder.Components().Append<BlogSchemaComponent>();

        builder.Services.AddScoped<IBlogService, BlogService>();
    }
}
