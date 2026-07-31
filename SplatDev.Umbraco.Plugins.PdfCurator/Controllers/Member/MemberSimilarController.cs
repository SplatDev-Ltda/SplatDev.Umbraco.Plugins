using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using PdfCurator.Core.Data;
using PdfCurator.Core.Entities;

using SplatDev.Umbraco.Plugins.PdfCurator.Authorization;

namespace SplatDev.Umbraco.Plugins.PdfCurator.Controllers.Member;

[ApiController]
[MemberAuthorize]
[Route("umbraco/pdfcurator/api/v1/member/books")]
public class MemberSimilarController : ControllerBase
{
    private readonly IDbContextFactory<CuratorDbContext> _dbFactory;

    public MemberSimilarController(IDbContextFactory<CuratorDbContext> dbFactory)
    {
        _dbFactory = dbFactory;
    }

    [HttpGet("{id:int}/similar")]
    public async Task<IActionResult> GetSimilar(int id, CancellationToken ct = default)
    {
        await using var db = await _dbFactory.CreateDbContextAsync(ct);
        var book = await db.Books
            .Where(b => b.Id == id && b.Status == BookStatus.Filed)
            .Select(b => new { b.Id, b.Title, b.Author, b.Category })
            .FirstOrDefaultAsync(ct);

        if (book is null)
        {
            return NotFound(new { error = "Book not found." });
        }

        var tokenizer = (string s) => new HashSet<string>(
            s.ToLowerInvariant()
                .Split(' ', StringSplitOptions.RemoveEmptyEntries)
                .Where(t => t.Length > 2),
            StringComparer.Ordinal);

        var sourceTokens = tokenizer(book.Title);
        if (sourceTokens.Count == 0)
        {
            return Ok(new List<object>());
        }

        var candidates = await db.Books
            .Where(b => b.Status == BookStatus.Filed && b.Id != id)
            .Select(b => new
            {
                b.Id,
                b.Title,
                b.Author,
                b.Category,
                b.Volume,
                b.Pages,
                b.CreatedAt,
            })
            .Take(200)
            .ToListAsync(ct);

        var scored = candidates
            .Select(c =>
            {
                var score = 0;
                if (string.Equals(c.Author, book.Author, StringComparison.OrdinalIgnoreCase))
                {
                    score += 3;
                }

                if (string.Equals(c.Category, book.Category, StringComparison.OrdinalIgnoreCase))
                {
                    score += 2;
                }

                var candidateTokens = tokenizer(c.Title);
                var intersection = sourceTokens.Intersect(candidateTokens).Count();
                var union = sourceTokens.Union(candidateTokens).Count();
                var jaccard = union > 0 ? (double)intersection / union : 0;
                score += (int)(jaccard * 5);

                return new
                {
                    c.Id,
                    c.Title,
                    c.Author,
                    c.Category,
                    c.Volume,
                    c.Pages,
                    c.CreatedAt,
                    Score = score,
                };
            })
            .OrderByDescending(x => x.Score)
            .ThenBy(x => x.Title)
            .Take(5)
            .ToList();

        return Ok(scored);
    }
}
