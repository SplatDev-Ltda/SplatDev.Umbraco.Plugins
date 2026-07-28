using Microsoft.AspNetCore.Mvc;
using SplatDev.Umbraco.Workflow.Api.Contracts;
using SplatDev.Umbraco.Workflow.Persistence.Repositories;
using Umbraco.Cms.Web.BackOffice.Controllers;
using Umbraco.Cms.Web.Common.Attributes;

namespace SplatDev.Umbraco.Workflow.Api.Controllers;

[PluginController("SplatDevWorkflow")]
public sealed class WorkflowTasksController(WorkflowTaskRepository taskRepository) : UmbracoAuthorizedApiController
{
    [HttpPost("{instanceId:long}/tasks")]
    public IActionResult SetCompletion(long instanceId, [FromBody] SetTaskCompletionRequest req)
    {
        if (req.Entries.Count == 0)
        {
            return Ok(new { instanceId, updated = 0 });
        }

        var entries = req.Entries.Select(e => ((long)e.TaskId, e.IsCompleted)).ToList();
        taskRepository.SetCompletion(entries, "admin");
        return Ok(new { instanceId, updated = req.Entries.Count });
    }

    [HttpGet("{instanceId:long}/tasks")]
    public IActionResult List(long instanceId)
    {
        var tasks = taskRepository.GetByInstance(instanceId);
        var result = tasks.Select(t => new
        {
            id = t.Id,
            instanceId = t.InstanceId,
            alias = t.Alias,
            name = t.Name,
            description = t.Description,
            isCompleted = t.IsCompleted,
            completedAt = t.CompletedAt,
            completedBy = t.CompletedBy,
            departmentId = t.DepartmentId,
        }).ToList();

        return Ok(result);
    }
}
