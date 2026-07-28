using global::Umbraco.Cms.Core.Composing;
using global::Umbraco.Cms.Core.DependencyInjection;

namespace SplatDev.Umbraco.Workflow.Backoffice.Sections;

public sealed class WorkflowSectionComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder) => builder.Sections().Append<WorkflowSection>();
}
