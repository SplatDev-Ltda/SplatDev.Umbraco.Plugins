using global::Umbraco.Cms.Web.BackOffice.Trees;
using global::Umbraco.Cms.Core;
using global::Umbraco.Cms.Core.Events;
using global::Umbraco.Cms.Core.Services;
using global::Umbraco.Cms.Core.Trees;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace SplatDev.Umbraco.Workflow.Backoffice.Trees;

[Tree("workflow", "themes", TreeTitle = "Themes", SortOrder = 2)]
public sealed class ThemesTreeController : TreeController
{
    private static readonly IReadOnlyList<string> ThemeNames = new[] { "classic", "modern", "compact" };
    private readonly IMenuItemCollectionFactory _menuItemCollectionFactory;

    public ThemesTreeController(
        ILocalizedTextService localizedTextService,
        UmbracoApiControllerTypeCollection umbracoApiControllerTypeCollection,
        IEventAggregator eventAggregator,
        IMenuItemCollectionFactory menuItemCollectionFactory) : base(localizedTextService, umbracoApiControllerTypeCollection, eventAggregator)
    {
        _menuItemCollectionFactory = menuItemCollectionFactory;
    }

    protected override ActionResult<TreeNodeCollection> GetTreeNodes(string id, FormCollection queryStrings)
    {
        var nodes = new TreeNodeCollection();

        if (id == Constants.System.RootString)
        {
            foreach (var name in ThemeNames)
            {
                var node = CreateTreeNode(name, string.Empty, queryStrings, name, "icon-paint-roller", hasChildren: false);
                nodes.Add(node);
            }
        }

        return nodes;
    }

    protected override ActionResult<MenuItemCollection> GetMenuForNode(string id, FormCollection queryStrings)
    {
        return _menuItemCollectionFactory.Create();
    }
}
