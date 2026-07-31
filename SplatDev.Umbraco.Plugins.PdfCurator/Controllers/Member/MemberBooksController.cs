using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using PdfCurator.Core.Data;
using PdfCurator.Core.Entities;

using SplatDev.Umbraco.Plugins.PdfCurator.Authorization;
using SplatDev.Umbraco.Plugins.PdfCurator.Services;

namespace SplatDev.Umbraco.Plugins.PdfCurator.Controllers.Member;

[ApiController]
[MemberAuthorize]
[Route("umbraco/pdfcurator/api/v1/member/books")]
public class MemberBooksController : ControllerBase
{
    private readonly IDbContextFactory<CuratorDbContext> _dbFactory;
    private readonly MemberGroupScopingService _scopingService;

    public MemberBooksController(
        IDbContextFactory<CuratorDbContext> dbFactory,
        MemberGroupScopingService scopingService)
    {
        _dbFactory = dbFactory;
        _scopingService = scopingService;
    }

    [HttpGet]
    public async Task<IActionResult> GetBooks(
        [FromQuery] string? query,
        [FromQuery] string? category,
        [FromQuery] string? language,
        [FromQuery] string? sort = "newest",
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 25,
        CancellationToken ct = default)
    {
        await using var db = await _dbFactory.CreateDbContextAsync(ct);
        var books = db.Books.Where(b => b.Status == BookStatus.Filed);

        if (_scopingService.IsConfigured())
        {
            var allowedCategories = await _scopingService.GetAllowedCategoriesAsync();
            var categoriesList = allowedCategories.ToList();
            books = books.Where(b => b.Category != null && categoriesList.Contains(b.Category));
        }

        if (!string.IsNullOrWhiteSpace(query))
        {
            var q = query.Trim();
            books = books.Where(b =>
                EF.Functions.Like(b.Title, $"%{q}%") ||
                EF.Functions.Like(b.Author, $"%{q}%"));
        }

        if (!string.IsNullOrWhiteSpace(category))
        {
            books = books.Where(b => b.Category == category);
        }

        if (!string.IsNullOrWhiteSpace(language))
        {
            books = language.ToUpperInvariant() switch
            {
                "PT" or "PT-BR" or "PTBR" => books.Where(b => b.PtBr),
                _ => books.Where(b => !b.PtBr),
            };
        }

        books = sort switch
        {
            "title" => books.OrderBy(b => b.Title),
            "author" => books.OrderBy(b => b.Author),
            "category" => books.OrderBy(b => b.Category),
            "size" => books.OrderByDescending(b => b.Size),
            _ => books.OrderByDescending(b => b.CreatedAt),
        };

        var total = await books.CountAsync(ct);
        var items = await books
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(b => new
            {
                b.Id,
                b.Title,
                b.Author,
                b.Category,
                b.Volume,
                b.PtBr,
                b.Size,
                b.Pages,
                Status = b.Status.ToString(),
                b.Sha256,
                b.CreatedAt,
            })
            .ToListAsync(ct);

        return Ok(new { total, page, pageSize, items });
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetBook(int id, CancellationToken ct = default)
    {
        await using var db = await _dbFactory.CreateDbContextAsync(ct);
        var book = await db.Books
            .Where(b => b.Id == id && b.Status == BookStatus.Filed)
            .Select(b => new
            {
                b.Id,
                b.Title,
                b.Author,
                b.Category,
                b.Volume,
                b.PtBr,
                b.Size,
                b.Pages,
                Status = b.Status.ToString(),
                b.Sha256,
                b.CreatedAt,
            })
            .FirstOrDefaultAsync(ct);

        if (book is null)
        {
            return NotFound(new { error = "Book not found." });
        }

        if (!await IsCategoryAllowedAsync(book.Category))
        {
            return NotFound(new { error = "Book not found." });
        }

        return Ok(book);
    }

    [HttpGet("{id:int}/thumbnail")]
    public async Task<IActionResult> GetThumbnail(int id, CancellationToken ct = default)
    {
        await using var db = await _dbFactory.CreateDbContextAsync(ct);
        var book = await db.Books
            .Where(b => b.Id == id)
            .Select(b => new { b.Sha256, b.Thumbnail, b.Category })
            .FirstOrDefaultAsync(ct);

        if (book is null || book.Thumbnail.Length == 0)
        {
            return NotFound();
        }

        if (!await IsCategoryAllowedAsync(book.Category))
        {
            return NotFound();
        }

        var etag = $"\"{book.Sha256}\"";
        Response.Headers.ETag = etag;

        if (Request.Headers.IfNoneMatch == etag)
        {
            return StatusCode(304);
        }

        return File(book.Thumbnail, "image/png", null,
            DateTimeOffset.UtcNow.AddDays(7),
            new Microsoft.Net.Http.Headers.EntityTagHeaderValue(etag));
    }

    [HttpGet("{id:int}/file")]
    public async Task<IActionResult> GetFile(int id, CancellationToken ct = default)
    {
        await using var db = await _dbFactory.CreateDbContextAsync(ct);
        var book = await db.Books
            .Where(b => b.Id == id && b.Status == BookStatus.Filed)
            .Select(b => new { b.Sha256, b.LibraryPath, b.SourcePath, b.Category })
            .FirstOrDefaultAsync(ct);

        if (book is null)
        {
            return NotFound(new { error = "Book not found or not available." });
        }

        if (!await IsCategoryAllowedAsync(book.Category))
        {
            return NotFound(new { error = "Book not found." });
        }

        var filePath = book.LibraryPath ?? book.SourcePath;
        if (string.IsNullOrEmpty(filePath) || !System.IO.File.Exists(filePath))
        {
            return NotFound(new { error = "File not found on disk." });
        }

        var fileInfo = new FileInfo(filePath);
        var etag = $"\"{book.Sha256}\"";
        Response.Headers.ETag = etag;

        if (Request.Headers.IfNoneMatch == etag)
        {
            return StatusCode(304);
        }

        return PhysicalFile(
            fileInfo.FullName,
            "application/pdf",
            fileInfo.Name,
            enableRangeProcessing: true);
    }

    private async Task<bool> IsCategoryAllowedAsync(string? category)
    {
        if (!_scopingService.IsConfigured() || string.IsNullOrEmpty(category))
        {
            return true;
        }

        var allowedCategories = await _scopingService.GetAllowedCategoriesAsync();
        if (allowedCategories.Count == 0)
        {
            return true;
        }

        return allowedCategories.Contains(category);
    }
}
