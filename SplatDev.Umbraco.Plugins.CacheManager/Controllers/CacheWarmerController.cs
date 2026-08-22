using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;

using System.Runtime.Versioning;

#if NET10_0_OR_GREATER
using Umbraco.Cms.Api.Management.Controllers;
#else
using Umbraco.Cms.Web.BackOffice.Controllers;
#endif
using SplatDev.Umbraco.Plugins.CacheManager.Extensions;
using SplatDev.Umbraco.Plugins.CacheManager.Repositories;
using SplatDev.Umbraco.Plugins.CacheManager.Services;

namespace SplatDev.Umbraco.Plugins.CacheManager.Controllers
{
#if NET10_0_OR_GREATER
    // Umbraco 17 does not route a ManagementApiControllerBase by convention the way
    // Umbraco 13 routed UmbracoAuthorizedApiController, so without an explicit route this
    // controller was not mapped at all and every call from the dashboard returned 404.
    // Declared for net10.0 only: Umbraco 13 still routes this at
    // /umbraco/backoffice/api/Cache..., which the AngularJS bundle calls.
    [Route("umbraco/api/cachewarmer")]
    public class CacheWarmerController(
        IMemoryCache memoryCache,
        CacheWarmerService cacheWarmerService,
        CacheWarmerEntryRepository repository,
        UrlNotFoundRepository urlNotFoundRepository) : ManagementApiControllerBase
#else
    public class CacheWarmerController(
        IMemoryCache memoryCache,
        CacheWarmerService cacheWarmerService,
        CacheWarmerEntryRepository repository,
        UrlNotFoundRepository urlNotFoundRepository) : UmbracoAuthorizedApiController
#endif
    {
        private readonly IMemoryCache _memoryCache = memoryCache;
        private readonly CacheWarmerService _cacheWarmerService = cacheWarmerService;
        private readonly CacheWarmerEntryRepository _repository = repository;
        private readonly UrlNotFoundRepository _urlNotFoundRepository = urlNotFoundRepository;

        public static bool IsRunning { get; private set; }

        [HttpGet("fusion-cache")]
        public async Task<IActionResult> GetFusionCache()
        {
            await Task.FromResult(0);
            return Ok(0);
        }

        [HttpPost("clear-cache")]
        public async Task<IActionResult> ClearCache()
        {
            await Task.FromResult(0);

            if (_memoryCache is MemoryCache concreteMemoryCache)
            {
                concreteMemoryCache.Clear();
            }
            return Ok();
        }

        [HttpPost("refresh-cache")]
        public async Task<IActionResult> RefreshCache()
        {
            if (_memoryCache is MemoryCache concreteMemoryCache)
            {
                concreteMemoryCache.Clear();
            }
            IsRunning = true;
            await _cacheWarmerService.ExecuteAsync(CancellationToken.None);
            IsRunning = false;
            return Ok();
        }

        [HttpGet("last-task")]
        public async Task<IActionResult> GetLastTask()
        {
            await Task.FromResult(0);
            var history = _repository.GetCacheEntries();
            return Ok(history);
        }

        [HttpPost("clear-log")]
        public async Task<IActionResult> ClearLog()
        {
            await Task.FromResult(0);
            _repository.DeleteAll();
            return Ok();
        }

        [HttpGet("url-not-found")]
        public async Task<IActionResult> GetUrlNotFound()
        {
            await Task.FromResult(0);
            var history = _urlNotFoundRepository.GetAllUrlNotFound();
            var filtered = history.GroupBy(x => x!.Url).Select(x => x.FirstOrDefault()).Take(100);
            return Ok(filtered);
        }

        [HttpGet("statistics")]
        [RequiresPreviewFeatures]
        public async Task<IActionResult> GetStatistics()
        {
            await Task.FromResult(0);

            if (_memoryCache is MemoryCache concreteMemoryCache)
            {
                var allKeys = concreteMemoryCache.GetKeys();
                var stats = new
                {
                    allKeys.Count,
                    DbKeys = allKeys.Where(x => x.ToString()!.StartsWith("EF_")),
                    MethodKeys = allKeys.Where(x => x.ToString()!.StartsWith("METHOD_")),
                };
                return Ok(stats);
            }
            return Ok();
        }
    }
}
