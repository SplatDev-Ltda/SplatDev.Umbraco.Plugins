using Microsoft.Extensions.Options;

using SplatDev.Umbraco.Plugins.PdfCurator.Models;

using Umbraco.Cms.Core.Security;
using Umbraco.Cms.Core.Services;

namespace SplatDev.Umbraco.Plugins.PdfCurator.Services;

public class MemberGroupScopingService
{
    private readonly PdfCuratorOptions _options;
    private readonly IMemberManager _memberManager;
    private readonly IMemberService _memberService;

    public MemberGroupScopingService(
        IOptions<PdfCuratorOptions> options,
        IMemberManager memberManager,
        IMemberService memberService)
    {
        _options = options.Value;
        _memberManager = memberManager;
        _memberService = memberService;
    }

    public async Task<IReadOnlySet<string>> GetAllowedCategoriesAsync()
    {
        var scopes = _options.MemberGroupScopes;
        if (scopes is null || scopes.Count == 0)
        {
            return new HashSet<string>();
        }

        var identity = await _memberManager.GetCurrentMemberAsync();
        if (identity is null)
        {
            return new HashSet<string> { "__none__" };
        }

        var member = _memberService.GetByKey(identity.Key);
        if (member is null)
        {
            return new HashSet<string> { "__none__" };
        }

        var memberGroupNames = new HashSet<string>(_memberService.GetAllRoles(member.Id), StringComparer.OrdinalIgnoreCase);

        var allowed = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var hasAnyMappedScope = false;

        foreach (var (category, groups) in scopes)
        {
            hasAnyMappedScope = true;
            if (groups.Any(g => memberGroupNames.Contains(g)))
            {
                allowed.Add(category);
            }
        }

        if (!hasAnyMappedScope)
        {
            return new HashSet<string>();
        }

        return allowed;
    }

    public bool IsConfigured()
    {
        return _options.MemberGroupScopes is not null && _options.MemberGroupScopes.Count > 0;
    }
}
