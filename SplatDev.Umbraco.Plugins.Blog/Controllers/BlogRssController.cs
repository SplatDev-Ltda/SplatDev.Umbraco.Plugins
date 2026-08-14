using Microsoft.AspNetCore.Mvc;
using System.Text;
using System.Xml;
using Umbraco.Cms.Web.Common.Controllers;
using SplatDev.Umbraco.Plugins.Blog.Services;

namespace SplatDev.Umbraco.Plugins.Blog.Controllers;

[Route("umbraco/api/blog/rss")]
public class BlogRssController : ControllerBase
{
    private readonly IBlogService _service;

    public BlogRssController(IBlogService service)
    {
        _service = service;
    }

    [HttpGet]
    [Route("")]
    public async Task<IActionResult> Feed([FromQuery] string? category = null)
    {
        var posts = await _service.GetPostsAsync(1, 20, publishedOnly: true);

        if (!string.IsNullOrWhiteSpace(category))
            posts = posts.Where(p => p.Category?.Slug == category);

        var baseUrl = $"{Request.Scheme}://{Request.Host}";
        var sb = new StringBuilder();

        using (var sw = new StringWriter(sb))
        using (var writer = XmlWriter.Create(sw, new XmlWriterSettings { Indent = true, Encoding = Encoding.UTF8 }))
        {
            writer.WriteStartDocument();
            writer.WriteStartElement("rss");
            writer.WriteAttributeString("version", "2.0");
            writer.WriteAttributeString("xmlns", "atom", null, "http://www.w3.org/2005/Atom");
            writer.WriteAttributeString("xmlns", "content", null, "http://purl.org/rss/1.0/modules/content/");

            writer.WriteStartElement("channel");
            writer.WriteElementString("title", "Blog");
            writer.WriteElementString("link", baseUrl);
            writer.WriteElementString("description", "Latest blog posts");
            writer.WriteElementString("language", "en-us");
            writer.WriteElementString("lastBuildDate", DateTime.UtcNow.ToString("R"));

            writer.WriteStartElement("atom", "link", "http://www.w3.org/2005/Atom");
            writer.WriteAttributeString("href", $"{baseUrl}/umbraco/api/blog/rss");
            writer.WriteAttributeString("rel", "self");
            writer.WriteAttributeString("type", "application/rss+xml");
            writer.WriteEndElement();

            foreach (var post in posts)
            {
                writer.WriteStartElement("item");
                writer.WriteElementString("title", post.Title);
                writer.WriteElementString("link", $"{baseUrl}/blog/{post.Slug}");
                writer.WriteElementString("description", post.Excerpt);
                writer.WriteStartElement("content", "encoded", "http://purl.org/rss/1.0/modules/content/");
                writer.WriteCData(post.Content);
                writer.WriteEndElement();
                writer.WriteElementString("pubDate", post.PublishedAt.ToString("R"));
                writer.WriteElementString("guid", $"{baseUrl}/blog/{post.Slug}");
                if (post.Category is not null)
                    writer.WriteElementString("category", post.Category.Name);
                writer.WriteEndElement(); // item
            }

            writer.WriteEndElement(); // channel
            writer.WriteEndElement(); // rss
            writer.WriteEndDocument();
        }

        return Content(sb.ToString(), "application/rss+xml", Encoding.UTF8);
    }
}
