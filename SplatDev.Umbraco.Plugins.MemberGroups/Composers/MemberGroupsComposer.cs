using Microsoft.Extensions.DependencyInjection;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using SplatDev.Umbraco.Plugins.MemberGroups.Services;

namespace SplatDev.Umbraco.Plugins.MemberGroups.Composers
{
    public class MemberGroupsComposer : IComposer
    {
        public void Compose(IUmbracoBuilder builder)
        {
            builder.Services.AddScoped<IMemberGroupsService, MemberGroupService>();
        }
    }
}
