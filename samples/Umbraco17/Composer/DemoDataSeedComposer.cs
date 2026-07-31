using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using Umbraco.Cms.Core.Notifications;
using Umbraco.Cms.Core.Services;

namespace PdfCurator.Umbraco.Sample.Composer;

public class DemoDataSeedComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.AddNotificationHandler<UmbracoApplicationStartedNotification, DemoDataSeedHandler>();
    }
}

public class DemoDataSeedHandler : INotificationHandler<UmbracoApplicationStartedNotification>
{
    private readonly ILogger<DemoDataSeedHandler> _logger;
    private readonly IContentService _contentService;
    private readonly IContentTypeService _contentTypeService;

    public DemoDataSeedHandler(
        ILogger<DemoDataSeedHandler> logger,
        IContentService contentService,
        IContentTypeService contentTypeService)
    {
        _logger = logger;
        _contentService = contentService;
        _contentTypeService = contentTypeService;
    }

    public void Handle(UmbracoApplicationStartedNotification notification)
    {
        _logger.LogInformation("[PdfCurator.Sample] Demo data seed running");

        var homeContentType = _contentTypeService.Get("home");
        if (homeContentType is null)
        {
            _logger.LogInformation("[PdfCurator.Sample] No home doc type yet; unattended install will create it. Skipping seed.");
            return;
        }

        var root = _contentService.GetRootContent().FirstOrDefault();
        if (root is null)
        {
            _logger.LogInformation("[PdfCurator.Sample] No root content; skipping seed until unattended install completes.");
            return;
        }

        _logger.LogInformation("[PdfCurator.Sample] Demo data OK — Umbraco is ready with root content. PdfCurator section accessible via backoffice.");
    }
}
