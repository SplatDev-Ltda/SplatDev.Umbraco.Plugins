using Microsoft.Extensions.DependencyInjection;

using SplatDev.Umbraco.Plugins.PdfCurator.Models;

using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;

namespace SplatDev.Umbraco.Plugins.PdfCurator.Components;

/// <summary>
/// Phase A composer: binds <see cref="PdfCuratorOptions"/> only.
/// Data services arrive in Phase B via the PdfCurator.Core/Web packages —
/// the legacy DigitalBookCurator services must NOT be wired here.
/// </summary>
public class PdfCuratorComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.Services.Configure<PdfCuratorOptions>(
            builder.Config.GetSection(PdfCuratorOptions.SectionName));
    }
}
