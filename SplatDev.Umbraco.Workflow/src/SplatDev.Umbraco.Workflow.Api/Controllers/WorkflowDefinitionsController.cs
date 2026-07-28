using Microsoft.AspNetCore.Mvc;
using SplatDev.Umbraco.Workflow.Api.Contracts;
using SplatDev.Umbraco.Workflow.Core.Contracts;
using SplatDev.Umbraco.Workflow.Persistence.Entities;
using SplatDev.Umbraco.Workflow.Persistence.Repositories;
using Umbraco.Cms.Web.BackOffice.Controllers;
using Umbraco.Cms.Web.Common.Attributes;

namespace SplatDev.Umbraco.Workflow.Api.Controllers;

[PluginController("SplatDevWorkflow")]
public sealed class WorkflowDefinitionsController(WorkflowDefinitionRepository repo) : UmbracoAuthorizedApiController
{
    [HttpGet]
    public IActionResult List()
    {
        var entities = repo.GetAll();
        var dtos = entities.Select(e => new WorkflowDefinitionDto(
            e.Key, e.Label, e.Version, e.IsActive, e.DefinitionJson, e.CreatedAt));
        return Ok(dtos);
    }

    [HttpGet("{key}")]
    public IActionResult Get(string key)
    {
        var entity = repo.GetHighestVersion(key);
        if (entity is null) return NotFound();
        return Ok(new WorkflowDefinitionDto(
            entity.Key, entity.Label, entity.Version, entity.IsActive, entity.DefinitionJson, entity.CreatedAt));
    }

    [HttpPost]
    public IActionResult Save([FromBody] WorkflowDefinitionDto dto)
    {
        var entity = new WorkflowDefinitionEntity
        {
            Key = dto.Key,
            Label = dto.Label,
            Version = dto.Version,
            DefinitionJson = dto.DefinitionJson,
            IsActive = dto.IsActive,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = User.Identity?.Name ?? "system",
        };
        repo.Insert(entity);
        return Ok(dto);
    }
}
