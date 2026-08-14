using Microsoft.AspNetCore.Authorization;
using Umbraco.Cms.Web.Common.Authorization;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Web.Common.Controllers;
using SplatDev.Umbraco.Plugins.Surveys.Models;
using SplatDev.Umbraco.Plugins.Surveys.Services;

namespace SplatDev.Umbraco.Plugins.Surveys.Controllers;

/// <remarks>
/// Previously anonymous. Create, Update and Delete let anyone rewrite surveys, and Results exposed the collected responses. Taking a survey stays open.
/// </remarks>
[Authorize(Policy = AuthorizationPolicies.BackOfficeAccess)]
[Route("umbraco/api/surveys/[action]")]
public class SurveysApiController : ControllerBase
{
    private readonly ISurveysService _service;

    public SurveysApiController(ISurveysService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken = default)
        => Ok(await _service.GetSurveysAsync(cancellationToken));

    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> Get(int id, CancellationToken cancellationToken = default)
    {
        var survey = await _service.GetSurveyAsync(id, cancellationToken);
        return survey is null ? NotFound() : Ok(survey);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Survey survey, CancellationToken cancellationToken = default)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        var created = await _service.CreateSurveyAsync(survey, cancellationToken);
        return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
    }

    [HttpPut]
    public async Task<IActionResult> Update(int id, [FromBody] Survey survey, CancellationToken cancellationToken = default)
    {
        if (id != survey.Id) return BadRequest("ID mismatch.");
        if (!ModelState.IsValid) return BadRequest(ModelState);
        var updated = await _service.UpdateSurveyAsync(survey, cancellationToken);
        return updated is null ? NotFound() : Ok(updated);
    }

    [HttpDelete]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken = default)
    {
        var deleted = await _service.DeleteSurveyAsync(id, cancellationToken);
        return deleted ? NoContent() : NotFound();
    }

    [AllowAnonymous]
    [HttpPost]
    public async Task<IActionResult> Submit(int surveyId, [FromBody] SubmitRequest request, CancellationToken cancellationToken = default)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        var response = await _service.SubmitResponseAsync(
            surveyId,
            request.RespondentEmail,
            request.Answers.Select(a => (a.QuestionId, a.AnswerText, a.SelectedOptionId)),
            cancellationToken);
        return Ok(response);
    }

    [HttpGet]
    public async Task<IActionResult> Results(int surveyId, CancellationToken cancellationToken = default)
    {
        try
        {
            var results = await _service.GetResultsAsync(surveyId, cancellationToken);
            return Ok(results);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }
}

public class SubmitRequest
{
    public string? RespondentEmail { get; set; }
    public List<AnswerDto> Answers { get; set; } = new();
}

public class AnswerDto
{
    public int QuestionId { get; set; }
    public string? AnswerText { get; set; }
    public int? SelectedOptionId { get; set; }
}
