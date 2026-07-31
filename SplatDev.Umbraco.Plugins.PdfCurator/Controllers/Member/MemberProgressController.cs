using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using SplatDev.Umbraco.Plugins.PdfCurator.Authorization;
using SplatDev.Umbraco.Plugins.PdfCurator.Entities;
using SplatDev.Umbraco.Plugins.PdfCurator.Migrations;

using Umbraco.Cms.Core.Security;

namespace SplatDev.Umbraco.Plugins.PdfCurator.Controllers.Member;

[ApiController]
[MemberAuthorize]
[Route("umbraco/pdfcurator/api/v1/member/progress")]
public class MemberProgressController : ControllerBase
{
    private readonly IDbContextFactory<MemberDbContext> _dbFactory;
    private readonly IMemberManager _memberManager;

    public MemberProgressController(
        IDbContextFactory<MemberDbContext> dbFactory,
        IMemberManager memberManager)
    {
        _dbFactory = dbFactory;
        _memberManager = memberManager;
    }

    [HttpGet("{bookId:int}")]
    public async Task<IActionResult> GetProgress(int bookId, CancellationToken ct = default)
    {
        var memberKey = await GetMemberKeyAsync();
        if (memberKey is null)
        {
            return Unauthorized();
        }

        await using var db = await _dbFactory.CreateDbContextAsync(ct);
        var progress = await db.Progress
            .FirstOrDefaultAsync(p => p.MemberKey == memberKey.Value && p.BookId == bookId, ct);

        if (progress is null)
        {
            return Ok(new { page = 0, pageCount = 0 });
        }

        return Ok(new { progress.Page, progress.PageCount, progress.UpdatedAt });
    }

    [HttpPut("{bookId:int}")]
    public async Task<IActionResult> UpsertProgress(int bookId, [FromBody] ProgressUpdate update, CancellationToken ct = default)
    {
        var memberKey = await GetMemberKeyAsync();
        if (memberKey is null)
        {
            return Unauthorized();
        }

        await using var db = await _dbFactory.CreateDbContextAsync(ct);
        var progress = await db.Progress
            .FirstOrDefaultAsync(p => p.MemberKey == memberKey.Value && p.BookId == bookId, ct);

        if (progress is null)
        {
            progress = new MemberProgress { MemberKey = memberKey.Value, BookId = bookId };
            db.Progress.Add(progress);
        }

        progress.Page = update.Page;
        progress.PageCount = update.PageCount;
        progress.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);

        return Ok(new { progress.Page, progress.PageCount, progress.UpdatedAt });
    }

    private async Task<Guid?> GetMemberKeyAsync()
    {
        var member = await _memberManager.GetCurrentMemberAsync();
        return member?.Key;
    }

    public class ProgressUpdate
    {
        public int Page { get; set; }

        public int PageCount { get; set; }
    }
}
