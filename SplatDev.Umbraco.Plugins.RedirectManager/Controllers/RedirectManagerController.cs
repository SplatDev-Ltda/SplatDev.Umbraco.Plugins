using Microsoft.AspNetCore.Mvc;
#if NET10_0_OR_GREATER
using Umbraco.Cms.Api.Management.Controllers;
#else
using Umbraco.Cms.Web.BackOffice.Controllers;
#endif
using SplatDev.Umbraco.Plugins.RedirectManager.Models;
using SplatDev.Umbraco.Plugins.RedirectManager.Repositories;

namespace SplatDev.Umbraco.Plugins.RedirectManager.Controllers
{
#if NET10_0_OR_GREATER
    // Umbraco 17 does not route a ManagementApiControllerBase by convention the way
    // Umbraco 13 routed UmbracoAuthorizedApiController, so without an explicit route this
    // controller was not mapped at all and every call from the dashboard returned 404.
    // Declared for net10.0 only: Umbraco 13 still routes this at
    // /umbraco/backoffice/api/Redirect..., which the AngularJS bundle calls.
    [Route("umbraco/api/redirectmanager")]
    public class RedirectManagerController(RedirectUrlsRepository redirectUrlsRepository) : ManagementApiControllerBase
#else
    public class RedirectManagerController(RedirectUrlsRepository redirectUrlsRepository) : UmbracoAuthorizedApiController
#endif
    {
        private readonly RedirectUrlsRepository redirectUrlsRepository = redirectUrlsRepository;

        [HttpGet("all")]
        public IEnumerable<RedirectUrl>? GetAll()
        {
            return redirectUrlsRepository.GetAllRedirectionUrls();
        }

        [HttpGet("{id:int}")]
        public RedirectUrl? Get(int id)
        {
            return redirectUrlsRepository.GetRedirectionUrl(id);
        }

        [HttpPost("create")]
        public void Post(RedirectUrl url)
        {
            redirectUrlsRepository.AddRedirectionUrl(url);
        }

        [HttpPut("update")]
        public void Put(RedirectUrl url)
        {
            redirectUrlsRepository.EditRedirectionUrl(url);
        }

        [HttpDelete("{id:int}")]
        public void Delete(int id)
        {
            redirectUrlsRepository.DeleteRedirectionUrl(id);
        }

        [HttpDelete("all")]
        public void DeleteAll()
        {
            redirectUrlsRepository.DeleteAll();
        }
    }
}
