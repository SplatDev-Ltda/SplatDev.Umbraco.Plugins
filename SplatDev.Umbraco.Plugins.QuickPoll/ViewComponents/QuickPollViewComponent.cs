using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SplatDev.Umbraco.Plugins.QuickPoll.Services;

namespace SplatDev.Umbraco.Plugins.QuickPoll.ViewComponents;

public class QuickPollViewComponent : ViewComponent
{
    private readonly IQuickPollService _service;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public QuickPollViewComponent(IQuickPollService service, IHttpContextAccessor httpContextAccessor)
    {
        _service = service;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<IViewComponentResult> InvokeAsync(int? pollId = null, CancellationToken cancellationToken = default)
    {
        var voterIp = _httpContextAccessor.HttpContext?.Connection.RemoteIpAddress?.ToString() ?? "unknown";

        if (pollId.HasValue)
        {
            var poll = await _service.GetPollAsync(pollId.Value, cancellationToken);
            var results = poll is not null ? await _service.GetResultsAsync(pollId.Value, cancellationToken) : null;
            return View(new QuickPollViewModel(poll, results, voterIp));
        }
        else
        {
            var activePoll = await _service.GetActivePollAsync(cancellationToken);
            var results = activePoll is not null ? await _service.GetResultsAsync(activePoll.Id, cancellationToken) : null;
            return View(new QuickPollViewModel(activePoll, results, voterIp));
        }
    }
}

public record QuickPollViewModel(
    SplatDev.Umbraco.Plugins.QuickPoll.Models.Poll? Poll,
    PollResults? Results,
    string VoterIp);
