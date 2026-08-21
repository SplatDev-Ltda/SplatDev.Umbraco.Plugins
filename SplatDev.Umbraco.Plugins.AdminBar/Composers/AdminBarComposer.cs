using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;

namespace SplatDev.Umbraco.Plugins.AdminBar.Composers;

public class AdminBarComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        // ViewComponent is auto-discovered by ASP.NET Core MVC.
        // Nothing extra to register — IUmbracoContextAccessor and
        // IBackOfficeSecurityAccessor are already registered by Umbraco.
    }
}
