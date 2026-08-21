using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using SplatDev.Umbraco.Plugins.Newsletter.Components;
using SplatDev.Umbraco.Plugins.Newsletter.Services;

namespace SplatDev.Umbraco.Plugins.Newsletter.Composers;

public class NewsletterComponentComposer : ComponentComposer<NewsletterComponent>
{
}

public class NewsletterComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.Services.AddScoped<INewsletterService, NewsletterService>();

        // Mailgun HttpClient with Basic auth
        builder.Services.AddHttpClient("NewsletterMailgun", (sp, client) =>
        {
            var config = sp.GetRequiredService<IConfiguration>();
            var baseUrl = config["Newsletter:Mailgun:BaseUrl"] ?? "https://api.mailgun.net";
            var apiKey = config["Newsletter:Mailgun:ApiKey"] ?? string.Empty;

            client.BaseAddress = new Uri(baseUrl);
            client.DefaultRequestHeaders.Add("Accept", "application/json");

            if (!string.IsNullOrWhiteSpace(apiKey))
            {
                var token = Convert.ToBase64String(
                    System.Text.Encoding.ASCII.GetBytes($"api:{apiKey.Trim()}"));
                client.DefaultRequestHeaders.Authorization =
                    new System.Net.Http.Headers.AuthenticationHeaderValue("Basic", token);
            }
        });
    }
}
