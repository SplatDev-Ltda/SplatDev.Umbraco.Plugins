using Microsoft.AspNetCore.Mvc;
using SplatDev.Umbraco.Plugins.Blog.Services;

namespace SplatDev.Umbraco.Plugins.Blog.ViewComponents;

public class BlogViewComponent : ViewComponent
{
    private readonly IBlogService _service;

    public BlogViewComponent(IBlogService service)
    {
        _service = service;
    }

    public async Task<IViewComponentResult> InvokeAsync(
        int page = 1,
        int pageSize = 5,
        string? categorySlug = null,
        string? tagSlug = null)
    {
        var posts = categorySlug is not null
            ? await _service.GetPostsByCategoryAsync(categorySlug, page, pageSize)
            : tagSlug is not null
                ? await _service.GetPostsByTagAsync(tagSlug, page, pageSize)
                : await _service.GetPostsAsync(page, pageSize, publishedOnly: true);

        var categories = await _service.GetCategoriesAsync();
        var tags = await _service.GetTagsAsync();

        ViewBag.Categories = categories;
        ViewBag.Tags = tags;
        ViewBag.Page = page;
        ViewBag.PageSize = pageSize;

        return View(posts);
    }
}
