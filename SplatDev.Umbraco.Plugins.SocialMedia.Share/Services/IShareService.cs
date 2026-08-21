using SplatDev.Umbraco.Plugins.SocialMedia.Share.Models;

namespace SplatDev.Umbraco.Plugins.SocialMedia.Share.Services
{
    public interface IShareService
    {
        IEnumerable<ShareLink> GetShareLinks(string pageUrl, string pageTitle);
    }
}
