using SplatDev.Umbraco.Workflow.Core.Models;

namespace SplatDev.Umbraco.Workflow.Customers.FindlayAuto;

public interface IHireologyRepository
{
    IReadOnlyList<HireologyApplication> QueryApplications(WorkflowQueryFilter filter, out int totalCount);
    HireologyApplication? GetApplication(long id);
}
