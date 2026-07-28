using Microsoft.AspNetCore.Mvc;
using SplatDev.Umbraco.Workflow.Api.Contracts;
using SplatDev.Umbraco.Workflow.Core.Contracts;
using SplatDev.Umbraco.Workflow.Core.Enums;
using SplatDev.Umbraco.Workflow.Core.Models;
using Umbraco.Cms.Web.BackOffice.Controllers;
using Umbraco.Cms.Web.Common.Attributes;

namespace SplatDev.Umbraco.Workflow.Api.Controllers;

[PluginController("SplatDevWorkflow")]
public sealed class WorkflowInstancesController(
    IWorkflowEngine engine,
    IWorkflowInstanceStore instances,
    IWorkflowDataProvider provider) : UmbracoAuthorizedApiController
{
    [HttpGet]
    public IActionResult List(
        [FromQuery] string? workflowKey = null,
        [FromQuery] WorkflowStatus? status = null,
        [FromQuery] bool assignedToMe = false,
        [FromQuery] string? group = null,
        [FromQuery] string? department = null,
        [FromQuery] string? freeText = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        var filter = new WorkflowQueryFilter(workflowKey, status, assignedToMe, group, department, freeText, page, pageSize);
        var rows = provider.GetDisplayRows(filter, out var total);
        return Ok(new PagedResult<WorkflowDisplayRow>(rows, total, page, pageSize));
    }

    [HttpGet("{id:long}")]
    public IActionResult Get(long id)
    {
        var instance = instances.Get(id);
        return Ok(new WorkflowInstanceDto(
            instance.Id, instance.WorkflowKey, instance.WorkflowVersion, instance.CurrentStepKey,
            (int)instance.Status, instance.MetadataJson, instance.CreatedAt, instance.CreatedBy,
            instance.UpdatedAt, instance.UpdatedBy));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateInstanceRequest req, CancellationToken ct)
    {
        var actor = User.Identity?.Name ?? "anonymous";
        var instance = await engine.CreateAsync(req.WorkflowKey, req.MetadataJson, actor, ct).ConfigureAwait(false);
        return CreatedAtAction(nameof(Get), new { id = instance.Id }, instance);
    }

    [HttpPost("{id:long}/transition")]
    public async Task<IActionResult> Transition(long id, [FromBody] TransitionRequest req, CancellationToken ct)
    {
        var actor = User.Identity?.Name ?? "anonymous";
        var result = await engine.TransitionAsync(id, req.ActionKey, actor, ct).ConfigureAwait(false);
        if (!result.Success) return BadRequest(new ProblemDetails { Title = "Transition failed", Detail = result.Error });
        return Ok(result);
    }
}
