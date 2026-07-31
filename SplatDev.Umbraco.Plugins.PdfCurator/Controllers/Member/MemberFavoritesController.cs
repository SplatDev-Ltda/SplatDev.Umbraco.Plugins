using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using SplatDev.Umbraco.Plugins.PdfCurator.Authorization;
using SplatDev.Umbraco.Plugins.PdfCurator.Entities;
using SplatDev.Umbraco.Plugins.PdfCurator.Migrations;

using Umbraco.Cms.Core.Security;

namespace SplatDev.Umbraco.Plugins.PdfCurator.Controllers.Member;

[ApiController]
[MemberAuthorize]
[Route("umbraco/pdfcurator/api/v1/member/favorites")]
public class MemberFavoritesController : ControllerBase
{
    private readonly IDbContextFactory<MemberDbContext> _dbFactory;
    private readonly IMemberManager _memberManager;

    public MemberFavoritesController(
        IDbContextFactory<MemberDbContext> dbFactory,
        IMemberManager memberManager)
    {
        _dbFactory = dbFactory;
        _memberManager = memberManager;
    }

    [HttpGet]
    public async Task<IActionResult> GetFavorites(CancellationToken ct = default)
    {
        var memberKey = await GetMemberKeyAsync();
        if (memberKey is null)
        {
            return Unauthorized();
        }

        await using var db = await _dbFactory.CreateDbContextAsync(ct);
        var favs = await db.Favorites
            .Where(f => f.MemberKey == memberKey.Value)
            .OrderByDescending(f => f.CreatedAt)
            .Select(f => new { f.BookId, f.CreatedAt })
            .ToListAsync(ct);

        return Ok(favs);
    }

    [HttpPost("{bookId:int}")]
    public async Task<IActionResult> ToggleFavorite(int bookId, CancellationToken ct = default)
    {
        var memberKey = await GetMemberKeyAsync();
        if (memberKey is null)
        {
            return Unauthorized();
        }

        await using var db = await _dbFactory.CreateDbContextAsync(ct);
        var existing = await db.Favorites
            .FirstOrDefaultAsync(f => f.MemberKey == memberKey.Value && f.BookId == bookId, ct);

        if (existing is not null)
        {
            db.Favorites.Remove(existing);
            await db.SaveChangesAsync(ct);
            return Ok(new { favorited = false, bookId });
        }

        db.Favorites.Add(new MemberFavorite { MemberKey = memberKey.Value, BookId = bookId });
        await db.SaveChangesAsync(ct);
        return Ok(new { favorited = true, bookId });
    }

    [HttpDelete("{bookId:int}")]
    public async Task<IActionResult> RemoveFavorite(int bookId, CancellationToken ct = default)
    {
        var memberKey = await GetMemberKeyAsync();
        if (memberKey is null)
        {
            return Unauthorized();
        }

        await using var db = await _dbFactory.CreateDbContextAsync(ct);
        var fav = await db.Favorites
            .FirstOrDefaultAsync(f => f.MemberKey == memberKey.Value && f.BookId == bookId, ct);

        if (fav is null)
        {
            return NotFound();
        }

        db.Favorites.Remove(fav);
        await db.SaveChangesAsync(ct);
        return Ok(new { removed = true, bookId });
    }

    private async Task<Guid?> GetMemberKeyAsync()
    {
        var member = await _memberManager.GetCurrentMemberAsync();
        return member?.Key;
    }
}
