using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using PdfCurator.Core.Data;
using PdfCurator.Core.Entities;

using SplatDev.Umbraco.Plugins.PdfCurator.Authorization;

namespace SplatDev.Umbraco.Plugins.PdfCurator.Controllers.Member;

[ApiController]
[MemberAuthorize]
[Route("umbraco/pdfcurator/api/v1/member/books")]
public class MemberBooksController : ControllerBase
{
    private readonly IDbContextFactory<CuratorDbContext> _dbFactory;

    public MemberBooksController(IDbContextFactory<CuratorDbContext> dbFactory)
    {
        _dbFactory = dbFactory;
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

        return Ok(book);
    }

    [HttpGet("{id:int}/thumbnail")]
    public async Task<IActionResult> GetThumbnail(int id, CancellationToken ct = default)
    {
        await using var db = await _dbFactory.CreateDbContextAsync(ct);
        var book = await db.Books
            .Where(b => b.Id == id)
            .Select(b => new { b.Sha256, b.Thumbnail })
            .FirstOrDefaultAsync(ct);

        if (book is null || book.Thumbnail.Length == 0)
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
            .Select(b => new { b.Sha256, b.LibraryPath, b.SourcePath })
            .FirstOrDefaultAsync(ct);

        if (book is null)
        {
            return NotFound(new { error = "Book not found or not available." });
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
}
