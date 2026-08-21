using Microsoft.Extensions.Logging;

using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Notifications;
#if NET10_0_OR_GREATER
using Umbraco.Cms.Core.Services;
#else
using Umbraco.Cms.Core.Models.Membership;
using Umbraco.Cms.Core.Services;
#endif

namespace SplatDev.Umbraco.Plugins.WhatsApp.Components;

/// <summary>
/// Gives the built-in Administrators group access to the WhatsApp section without
/// changing any other group's deliberately configured permissions.
/// </summary>
public sealed class WhatsAppSectionPermissionHandler
#if NET10_0_OR_GREATER
    : INotificationAsyncHandler<UmbracoApplicationStartingNotification>
#else
    : INotificationHandler<UmbracoApplicationStartingNotification>
#endif
{
    private const string AdministratorAlias = "admin";
    public const string SectionAlias = "SplatDev.WhatsApp.Section";

#if NET10_0_OR_GREATER
    private readonly IUserGroupService _userGroupService;
#else
    private readonly IUserService _userService;
#endif
    private readonly ILogger<WhatsAppSectionPermissionHandler> _logger;

#if NET10_0_OR_GREATER
    public WhatsAppSectionPermissionHandler(
        IUserGroupService userGroupService,
        ILogger<WhatsAppSectionPermissionHandler> logger)
    {
        _userGroupService = userGroupService;
        _logger = logger;
    }
#else
    public WhatsAppSectionPermissionHandler(
        IUserService userService,
        ILogger<WhatsAppSectionPermissionHandler> logger)
    {
        _userService = userService;
        _logger = logger;
    }
#endif

#if NET10_0_OR_GREATER
    public async Task HandleAsync(
        UmbracoApplicationStartingNotification notification,
        CancellationToken cancellationToken)
    {
        var administrators = await _userGroupService.GetAsync(AdministratorAlias);
        if (administrators is null || administrators.AllowedSections.Contains(SectionAlias))
            return;

        administrators.AddAllowedSection(SectionAlias);
        var result = await _userGroupService.UpdateAsync(administrators, Guid.Empty);
        if (!result.Success)
        {
            _logger.LogWarning("Could not grant the WhatsApp section to the Administrators group: {Status}.", result.Status);
            return;
        }

        _logger.LogInformation("Granted the WhatsApp section to the Administrators group.");
    }
#else
    public void Handle(UmbracoApplicationStartingNotification notification)
    {
        var administrators = _userService.GetUserGroupByAlias(AdministratorAlias);
        if (administrators is null || administrators.AllowedSections.Contains(SectionAlias))
            return;

        administrators.AddAllowedSection(SectionAlias);
        _userService.Save(administrators);
        _logger.LogInformation("Granted the WhatsApp section to the Administrators group.");
    }
#endif
}
