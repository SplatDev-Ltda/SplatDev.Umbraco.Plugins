using EFCoreSecondLevelCacheInterceptor;

using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

using SplatDev.Cache;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using Umbraco.Cms.Web.Common.ApplicationBuilder;
using SplatDev.Umbraco.Plugins.CacheManager.Components;
using SplatDev.Umbraco.Plugins.CacheManager.Repositories;
using SplatDev.Umbraco.Plugins.CacheManager.Services;
using Umbraco.Plugins.Mailer.Extensions;

using static SplatDev.Umbraco.Plugins.CacheManager.Constants.CacheConstants;

namespace SplatDev.Umbraco.Plugins.CacheManager.Composers
{
    public class CacheManagerMigrationComposer : ComponentComposer<CacheWarmerComponent>
    {
    }
    public class CacheManagerComposer : IComposer
    {
        private static readonly string[] middleware = ["Accept-Encoding"];
        public void Compose(IUmbracoBuilder builder)
        {

            #region EF Caching
            builder.Services.AddMemoryCache();
            builder.Services.AddEFSecondLevelCache(options =>
            {
                options.UseMemoryCacheProvider()
                .ConfigureLogging(true, args =>
                {
                    var _hostEnvironment = args.ServiceProvider.GetRequiredService<IWebHostEnvironment>();
                    if (_hostEnvironment.IsDevelopment())
                    {
                        args.ServiceProvider.GetRequiredService<ILoggerFactory>()
                            .CreateLogger(nameof(EFCoreSecondLevelCacheInterceptor))
                            .LogInformation(message: "CACHING - {EventId} -> {Message} -> {CommandText}", args.EventId,
                                args.Message, args.CommandText);
                    }

                })
                .UseCacheKeyPrefix("EF_");
                options.CacheAllQueries(CacheExpirationMode.Absolute, TimeSpan.FromMinutes(30));
                options.UseDbCallsIfCachingProviderIsDown(TimeSpan.FromMinutes(1));
            });
            builder.Services.AddConfiguredMsSqlDbContext(builder.Config.GetConnectionString("umbracoDbDSN") ?? "");
            #endregion

            #region Caching
            //Static Files Caching
            builder.Services.Configure<UmbracoPipelineOptions>(options =>
            {
                options.AddFilter(new UmbracoPipelineFilter(nameof(StaticFileOptions))
                {
                    PrePipeline = app =>
                    {
                        app.UseStaticFiles(new StaticFileOptions()
                        {
                            HttpsCompression = Microsoft.AspNetCore.Http.Features.HttpsCompressionMode.Compress,
                            OnPrepareResponse = (context) =>
                            {
                                var headers = context.Context.Response.GetTypedHeaders();
                                headers.CacheControl = new Microsoft.Net.Http.Headers.CacheControlHeaderValue
                                {
                                    Public = true,
                                    MaxAge = CacheRefresh.MONTH
                                };
                            }
                        });
                    }
                });
            });
            //Response Caching
            builder.Services.AddResponseCaching(options =>
            {
                options.MaximumBodySize = 1024;
                options.UseCaseSensitivePaths = true;
            });
            builder.Services.Configure<UmbracoPipelineOptions>(options =>
            {
                options.AddFilter(new UmbracoPipelineFilter("ResponseCache")
                {
                    PostRouting = app =>
                    {
                        app.UseResponseCaching();
                        app.Use(async (context, next) =>
                        {
                            context.Response.GetTypedHeaders().CacheControl =
                                new Microsoft.Net.Http.Headers.CacheControlHeaderValue()
                                {
                                    NoCache = true,
                                    Public = true,
                                    MaxAge = TimeSpan.FromMinutes(5)
                                };
                            context.Response.Headers[Microsoft.Net.Http.Headers.HeaderNames.Vary] = middleware;
                            await next();
                        });
                    }
                });
            });

            //Method Caching
            builder.Services.AddSingleton<CacheService>();
            builder.Services.AddSingleton<ICacheService>(sp => sp.GetRequiredService<CacheService>());
            builder.Services.AddSingleton<ICacheProvider>(sp => sp.GetRequiredService<CacheService>());

            #endregion
            //Repository
            builder.Services.AddSingleton<CacheWarmerEntryRepository>();

            builder.Services.AddHttpClient();

            //App Cache Warmer
            builder.Services.AddHostedService<CacheWarmerBackgroundService>();

            //Plugin Cache Manager
            builder.Services.AddScoped<CacheWarmerService>();

            //Url Not Found Log
            builder.Services.AddScoped<UrlNotFoundService>();
            builder.Services.AddSingleton<UrlNotFoundRepository>();
        }
    }
}
