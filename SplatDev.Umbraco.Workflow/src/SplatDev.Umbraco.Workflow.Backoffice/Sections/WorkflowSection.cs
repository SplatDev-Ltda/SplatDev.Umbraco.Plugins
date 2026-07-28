using global::Umbraco.Cms.Core.Sections;

namespace SplatDev.Umbraco.Workflow.Backoffice.Sections;

public sealed class WorkflowSection : ISection
{
    public string Alias => "workflow";
    public string Name => "Workflow";
}
