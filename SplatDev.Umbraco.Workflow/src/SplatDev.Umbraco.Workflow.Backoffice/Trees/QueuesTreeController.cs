using global::Umbraco.Cms.Web.BackOffice.Trees;
using global::Umbraco.Cms.Core;
using global::Umbraco.Cms.Core.Events;
using global::Umbraco.Cms.Core.Services;
using global::Umbraco.Cms.Core.Trees;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace SplatDev.Umbraco.Workflow.Backoffice.Trees;

[Tree("workflow", "queues", TreeTitle = "Queues", SortOrder = 0)]
public sealed class QueuesTreeController : TreeController
{
    private readonly IMenuItemCollectionFactory _menuItemCollectionFactory;

    public QueuesTreeController(
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
            var node = CreateTreeNode("onboarding", string.Empty, queryStrings, "Onboarding", "icon-process", hasChildren: false);
            nodes.Add(node);
        }

        return nodes;
    }

    protected override ActionResult<MenuItemCollection> GetMenuForNode(string id, FormCollection queryStrings)
    {
        return _menuItemCollectionFactory.Create();
    }
}
