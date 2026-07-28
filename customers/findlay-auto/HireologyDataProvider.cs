using SplatDev.Umbraco.Workflow.Core.Contracts;
using SplatDev.Umbraco.Workflow.Core.Models;

namespace SplatDev.Umbraco.Workflow.Customers.FindlayAuto;

public sealed class HireologyApplication
{
    public long Id { get; set; }
    public string CandidateName { get; set; } = string.Empty;
    public string Position { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public string Stage { get; set; } = string.Empty;
    public DateTime? HireDate { get; set; }
    public decimal? RateOfPay { get; set; }
    public string? Tags { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public sealed class HireologyDataProvider : IWorkflowDataProvider
{
    private readonly IHireologyRepository _repository;

    public HireologyDataProvider(IHireologyRepository repository)
    {
        _repository = repository;
    }

    public IReadOnlyList<WorkflowDisplayRow> GetDisplayRows(WorkflowQueryFilter filter, out int totalCount)
    {
        var rows = _repository.QueryApplications(filter, out totalCount);

        return rows.Select(app => new WorkflowDisplayRow(
            InstanceId: app.Id,
            Values: new Dictionary<string, object?>(StringComparer.OrdinalIgnoreCase)
            {
                ["candidate"] = app.CandidateName,
                ["position"] = app.Position,
                ["location"] = app.Location,
                ["department"] = app.Department,
                ["stage"] = app.Stage,
                ["hireDate"] = app.HireDate,
                ["rateOfPay"] = app.RateOfPay,
                ["tags"] = app.Tags,
            }))
            .ToList()
            .AsReadOnly();
    }

    public string? GetSearchableValue(long instanceId, string fieldKey)
    {
        var app = _repository.GetApplication(instanceId);
        if (app is null)
            return null;

        return fieldKey.ToLowerInvariant() switch
        {
            "candidate" => app.CandidateName,
            "position" => app.Position,
            "location" => app.Location,
            "department" => app.Department,
            "tags" => app.Tags,
            "email" => app.Email,
            _ => null,
        };
    }

    public IReadOnlyList<DisplayColumn> GetColumns(string workflowKey)
    {
        return new[]
        {
            new DisplayColumn(Key: "candidate",  Label: "Candidate",   Type: "string", IsSortable: true),
            new DisplayColumn(Key: "position",   Label: "Position",    Type: "string", IsSortable: true),
            new DisplayColumn(Key: "location",   Label: "Location",    Type: "string", IsSortable: true),
            new DisplayColumn(Key: "department", Label: "Department",  Type: "string", IsSortable: true),
            new DisplayColumn(Key: "stage",      Label: "Stage",       Type: "badge",  IsSortable: false),
            new DisplayColumn(Key: "hireDate",   Label: "Hire Date",   Type: "date",   IsSortable: true),
            new DisplayColumn(Key: "rateOfPay",  Label: "Rate of Pay", Type: "number", IsSortable: false),
            new DisplayColumn(Key: "tags",       Label: "Tags",        Type: "string", IsSortable: false),
        };
    }
}
