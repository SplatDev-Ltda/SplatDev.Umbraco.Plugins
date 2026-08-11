using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using SplatDev.Umbraco.Plugins.Schema2Yaml.Models;
using SplatDev.Umbraco.Plugins.Schema2Yaml.Services;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Web.Common.Authorization;

namespace SplatDev.Umbraco.Plugins.Schema2Yaml.Controllers;

[ApiController]
[Route("umbraco/api/[controller]/[action]")]
[Authorize(Policy = AuthorizationPolicies.SectionAccessSettings)]
public class ExportItemsController : ControllerBase
{
    private const int MaxMembersUsers = 500;
    private const int MaxTreeDepth    = 5;

    private readonly IDataTypeService      _dataTypes;
    private readonly IContentTypeService   _contentTypes;
    private readonly IMediaTypeService     _mediaTypes;
    // Umbraco 14 split ILocalizationService into ILanguageService and
    // IDictionaryItemService, and moved templates onto ITemplateService.
#if NET8_0
    private readonly IFileService          _templates;
    private readonly ILocalizationService  _languages;
    private readonly ILocalizationService  _dictionaryItems;
#else
    private readonly ITemplateService      _templates;
    private readonly ILanguageService      _languages;
    private readonly IDictionaryItemService _dictionaryItems;
#endif
    private readonly IContentService       _content;
    private readonly IMediaService         _media;
    private readonly IMemberService        _members;
    private readonly IUserService          _users;
    private readonly ILogger<ExportItemsController> _logger;

    public ExportItemsController(
        IDataTypeService dataTypes, IContentTypeService contentTypes,
#if NET8_0
        IMediaTypeService mediaTypes, IFileService templates,
        ILocalizationService languages, ILocalizationService dictionaryItems,
#else
        IMediaTypeService mediaTypes, ITemplateService templates,
        ILanguageService languages, IDictionaryItemService dictionaryItems,
#endif
        IContentService content, IMediaService media,
        IMemberService members, IUserService users,
        ILogger<ExportItemsController> logger)
    {
        _dataTypes       = dataTypes;
        _contentTypes    = contentTypes;
        _mediaTypes      = mediaTypes;
        _templates       = templates;
        _languages       = languages;
        _dictionaryItems = dictionaryItems;
        _content         = content;
        _media           = media;
        _members         = members;
        _users           = users;
        _logger          = logger;
    }

    // GET /umbraco/api/exportitems/available
    [HttpGet]
    public async Task<IActionResult> Available()
    {
        try
        {
            return Ok(new AvailableItemsResponse
            {
#if NET8_0
                DataTypes = _dataTypes.GetAll()
#else
                DataTypes = (await _dataTypes.GetAllAsync())
#endif
                    .Select(dt => new AvailableItem { Alias = DataTypeExporter.GenerateAlias(dt.Name ?? string.Empty), Name = dt.Name ?? string.Empty })
                    .OrderBy(x => x.Name).ToList(),

                DocumentTypes = _contentTypes.GetAll()
                    .Select(ct => new AvailableItem { Alias = ct.Alias, Name = ct.Name ?? ct.Alias })
                    .OrderBy(x => x.Name).ToList(),

                MediaTypes = _mediaTypes.GetAll()
                    .Select(mt => new AvailableItem { Alias = mt.Alias, Name = mt.Name ?? mt.Alias })
                    .OrderBy(x => x.Name).ToList(),

#if NET8_0
                Templates = _templates.GetTemplates()
#else
                Templates = (await _templates.GetAllAsync(Array.Empty<string>()))
#endif
                    .Select(t => new AvailableItem { Alias = t.Alias, Name = t.Name ?? t.Alias })
                    .OrderBy(x => x.Name).ToList(),

#if NET8_0
                Languages = _languages.GetAllLanguages()
#else
                Languages = (await _languages.GetAllAsync())
#endif
                    .Select(l => new AvailableItem { Alias = l.IsoCode, Name = l.CultureName ?? l.IsoCode })
                    .OrderBy(x => x.Name).ToList(),

                DictionaryItems = (await GetAllDictionaryItemsAsync())
                    .Select(d => new AvailableItem { Alias = d.ItemKey, Name = d.ItemKey })
                    .OrderBy(x => x.Name).ToList(),

                Members = _members.GetAll(0, MaxMembersUsers, out _)
                    .Select(m => new AvailableItem { Alias = m.Email, Name = m.Name ?? m.Email })
                    .OrderBy(x => x.Name).ToList(),

                Users = _users.GetAll(0, MaxMembersUsers, out _)
                    .Select(u => new AvailableItem { Alias = u.Email, Name = u.Name ?? u.Email })
                    .OrderBy(x => x.Name).ToList()
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get available items");
            return StatusCode(500, new { error = "Failed to get available items", message = ex.Message });
        }
    }

    // GET /umbraco/api/exportitems/contenttree
    [HttpGet]
    public IActionResult ContentTree()
    {
        try
        {
            var roots = _content.GetRootContent();
            return Ok(roots.Select(BuildContentNode).ToList());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get content tree");
            return StatusCode(500, new { error = "Failed to get content tree", message = ex.Message });
        }
    }

    // GET /umbraco/api/exportitems/mediatree
    [HttpGet]
    public IActionResult MediaTree()
    {
        try
        {
            var roots = _media.GetRootMedia();
            return Ok(roots.Select(BuildMediaNode).ToList());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get media tree");
            return StatusCode(500, new { error = "Failed to get media tree", message = ex.Message });
        }
    }

    private async Task<IEnumerable<IDictionaryItem>> GetAllDictionaryItemsAsync()
    {
        var result = new List<IDictionaryItem>();
#if NET8_0
        var rootItems = _dictionaryItems.GetRootDictionaryItems();
        await Task.CompletedTask;
#else
        var rootItems = await _dictionaryItems.GetAtRootAsync();
#endif
        await CollectDictionaryItemsAsync(rootItems, result);
        return result;
    }

    private async Task CollectDictionaryItemsAsync(IEnumerable<IDictionaryItem> items, List<IDictionaryItem> result)
    {
        foreach (var item in items)
        {
            result.Add(item);
#if NET8_0
            var children = _dictionaryItems.GetDictionaryItemChildren(item.Key);
#else
            var children = await _dictionaryItems.GetChildrenAsync(item.Key);
#endif
            await CollectDictionaryItemsAsync(children, result);
        }
    }

    private TreeNode BuildContentNode(IContent n, int depth = 0) => new()
    {
        Id       = n.Id,
        Name     = n.Name ?? "(unnamed)",
        Children = depth >= MaxTreeDepth
            ? []
            : _content.GetPagedChildren(n.Id, 0, int.MaxValue, out _)
                      .Select(c => BuildContentNode(c, depth + 1)).ToList()
    };

    private TreeNode BuildMediaNode(IMedia n, int depth = 0) => new()
    {
        Id       = n.Id,
        Name     = n.Name ?? "(unnamed)",
        Children = depth >= MaxTreeDepth
            ? []
            : _media.GetPagedChildren(n.Id, 0, int.MaxValue, out _)
                    .Select(c => BuildMediaNode(c, depth + 1)).ToList()
    };
}
