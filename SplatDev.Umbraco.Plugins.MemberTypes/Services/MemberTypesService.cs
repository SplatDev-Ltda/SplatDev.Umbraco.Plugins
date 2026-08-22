using Microsoft.Extensions.Logging;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core.Strings;

namespace SplatDev.Umbraco.Plugins.MemberTypes.Services;

public class MemberTypesService : IMemberTypesService
{
    private readonly IMemberTypeService _memberTypeService;
    private readonly IShortStringHelper _shortStringHelper;
    private readonly ILogger<MemberTypesService> _logger;

    public MemberTypesService(
        IMemberTypeService memberTypeService,
        IShortStringHelper shortStringHelper,
        ILogger<MemberTypesService> logger)
    {
        _memberTypeService = memberTypeService;
        _shortStringHelper = shortStringHelper;
        _logger = logger;
    }

    public Task<IEnumerable<IMemberType>> GetAllAsync()
    {
        var types = _memberTypeService.GetAll();
        return Task.FromResult(types);
    }

    public Task<IMemberType?> GetByAliasAsync(string alias)
    {
        var type = _memberTypeService.Get(alias);
        return Task.FromResult(type);
    }

    public Task<IMemberType> CreateAsync(string alias, string name, string description = "")
    {
        // MemberType needs a real IShortStringHelper: the Alias setter runs the value
        // through it, so constructing with null stripped the alias to empty and Umbraco
        // refused the save with "cannot have an empty Alias". Creating a member type has
        // therefore never worked — the endpoint returned 500 every time.
        var memberType = new MemberType(_shortStringHelper, -1)
        {
            Alias = alias,
            Name = name,
            Description = description
        };

        _memberTypeService.Save(memberType);
        _logger.LogInformation("Created member type {Alias}", alias);
        return Task.FromResult<IMemberType>(memberType);
    }

    public Task<IMemberType> UpdateAsync(string alias, string name, string description)
    {
        var memberType = _memberTypeService.Get(alias)
            ?? throw new InvalidOperationException($"Member type '{alias}' not found.");

        memberType.Name = name;
        memberType.Description = description;

        _memberTypeService.Save(memberType);
        _logger.LogInformation("Updated member type {Alias}", alias);
        return Task.FromResult(memberType);
    }

    public Task DeleteAsync(string alias)
    {
        var memberType = _memberTypeService.Get(alias);
        if (memberType is not null)
        {
            _memberTypeService.Delete(memberType);
            _logger.LogInformation("Deleted member type {Alias}", alias);
        }
        return Task.CompletedTask;
    }
}
