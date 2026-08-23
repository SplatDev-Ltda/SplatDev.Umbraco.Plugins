using Microsoft.AspNetCore.Mvc;
using SplatDev.Umbraco.Plugins.Surveys.Services;

namespace SplatDev.Umbraco.Plugins.Surveys.ViewComponents;

public class SurveyViewComponent : ViewComponent
{
    private readonly ISurveysService _service;

    public SurveyViewComponent(ISurveysService service)
    {
        _service = service;
    }

    public async Task<IViewComponentResult> InvokeAsync(int surveyId, CancellationToken cancellationToken = default)
    {
        var survey = await _service.GetSurveyAsync(surveyId, cancellationToken);
        return View(survey);
    }
}
