using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using Moq;

using SplatDev.Umbraco.Plugins.PdfCurator.Controllers.Member;
using SplatDev.Umbraco.Plugins.PdfCurator.Entities;
using SplatDev.Umbraco.Plugins.PdfCurator.Migrations;

using Umbraco.Cms.Core.Security;

using Xunit;

namespace SplatDev.Umbraco.Plugins.PdfCurator.Tests;

public class MemberProgressControllerTests
{
    private sealed class TestMemberDbContext(DbContextOptions<MemberDbContext> options) : MemberDbContext(options)
    {
        public override void Dispose() { }
        public override ValueTask DisposeAsync() => ValueTask.CompletedTask;
    }

    private static readonly Guid MemberKey = Guid.NewGuid();

    private static Mock<IDbContextFactory<MemberDbContext>> CreateDbFactory(MemberDbContext db)
    {
        var factory = new Mock<IDbContextFactory<MemberDbContext>>();
        factory.Setup(f => f.CreateDbContextAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(db);
        return factory;
    }

    private static MemberDbContext CreateInMemoryDb()
    {
        var options = new DbContextOptionsBuilder<MemberDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new TestMemberDbContext(options);
    }

    private static MemberProgressController CreateController(
        MemberDbContext db,
        bool authenticated = true)
    {
        var memberManagerMock = new Mock<IMemberManager>();
        if (authenticated)
        {
            var identity = new MemberIdentityUser
            {
                Email = "test@example.com",
                UserName = "test@example.com",
                Key = MemberKey,
            };
            memberManagerMock.Setup(m => m.GetCurrentMemberAsync()).ReturnsAsync(identity);
        }
        else
        {
            memberManagerMock.Setup(m => m.GetCurrentMemberAsync())
                .ReturnsAsync((MemberIdentityUser?)null);
        }

        return new MemberProgressController(
            CreateDbFactory(db).Object,
            memberManagerMock.Object);
    }

    private static MemberProgressController.ProgressUpdate CreateUpdate(int page, int pageCount = 100)
    {
        return new MemberProgressController.ProgressUpdate
        {
            Page = page,
            PageCount = pageCount,
        };
    }

    [Fact]
    public async Task GetProgress_Returns401_WhenNotAuthenticated()
    {
        await using var db = CreateInMemoryDb();
        var controller = CreateController(db, authenticated: false);

        var result = await controller.GetProgress(1);

        Assert.IsType<UnauthorizedResult>(result);
    }

    [Fact]
    public async Task GetProgress_ReturnsDefault_WhenNoProgress()
    {
        await using var db = CreateInMemoryDb();
        var controller = CreateController(db);

        var result = await controller.GetProgress(1);

        var okResult = Assert.IsType<OkObjectResult>(result);
        var json = okResult.Value!;
        var pageProp = json.GetType().GetProperty("page");
        var pageCountProp = json.GetType().GetProperty("pageCount");
        Assert.Equal(0, pageProp!.GetValue(json));
        Assert.Equal(0, pageCountProp!.GetValue(json));
    }

    [Fact]
    public async Task GetProgress_ReturnsProgress_WhenExists()
    {
        await using var db = CreateInMemoryDb();
        db.Progress.Add(new MemberProgress
        {
            MemberKey = MemberKey,
            BookId = 1,
            Page = 42,
            PageCount = 100,
            UpdatedAt = DateTime.UtcNow,
        });
        await db.SaveChangesAsync();
        var controller = CreateController(db);

        var result = await controller.GetProgress(1);

        var okResult = Assert.IsType<OkObjectResult>(result);
        var json = okResult.Value!;
        var pageProp = json.GetType().GetProperty("Page");
        var pageCountProp = json.GetType().GetProperty("PageCount");
        Assert.Equal(42, pageProp!.GetValue(json));
        Assert.Equal(100, pageCountProp!.GetValue(json));
    }

    [Fact]
    public async Task GetProgress_ReturnsDefault_WhenOtherMemberHasProgress()
    {
        await using var db = CreateInMemoryDb();
        db.Progress.Add(new MemberProgress
        {
            MemberKey = Guid.NewGuid(),
            BookId = 1,
            Page = 50,
            PageCount = 100,
        });
        await db.SaveChangesAsync();
        var controller = CreateController(db);

        var result = await controller.GetProgress(1);

        var okResult = Assert.IsType<OkObjectResult>(result);
        var json = okResult.Value!;
        var pageProp = json.GetType().GetProperty("page");
        Assert.Equal(0, pageProp!.GetValue(json));
    }

    [Fact]
    public async Task UpsertProgress_Returns401_WhenNotAuthenticated()
    {
        await using var db = CreateInMemoryDb();
        var controller = CreateController(db, authenticated: false);

        var result = await controller.UpsertProgress(1, CreateUpdate(1));

        Assert.IsType<UnauthorizedResult>(result);
    }

    [Fact]
    public async Task UpsertProgress_CreatesNewProgress()
    {
        await using var db = CreateInMemoryDb();
        var controller = CreateController(db);

        var result = await controller.UpsertProgress(1, CreateUpdate(10, 200));

        var okResult = Assert.IsType<OkObjectResult>(result);
        var json = okResult.Value!;
        var pageProp = json.GetType().GetProperty("Page");
        var pageCountProp = json.GetType().GetProperty("PageCount");
        Assert.Equal(10, pageProp!.GetValue(json));
        Assert.Equal(200, pageCountProp!.GetValue(json));

        var progress = await db.Progress.FirstOrDefaultAsync(p => p.BookId == 1 && p.MemberKey == MemberKey);
        Assert.NotNull(progress);
    }

    [Fact]
    public async Task UpsertProgress_UpdatesExistingProgress()
    {
        await using var db = CreateInMemoryDb();
        db.Progress.Add(new MemberProgress
        {
            MemberKey = MemberKey,
            BookId = 1,
            Page = 5,
            PageCount = 100,
        });
        await db.SaveChangesAsync();
        var controller = CreateController(db);

        var result = await controller.UpsertProgress(1, CreateUpdate(50, 100));

        var okResult = Assert.IsType<OkObjectResult>(result);
        var json = okResult.Value!;
        var pageProp = json.GetType().GetProperty("Page");
        Assert.Equal(50, pageProp!.GetValue(json));

        var count = await db.Progress.CountAsync(p => p.BookId == 1 && p.MemberKey == MemberKey);
        Assert.Equal(1, count);
    }

    [Fact]
    public async Task UpsertProgress_DoesNotAffectOtherMembersProgress()
    {
        var otherKey = Guid.NewGuid();
        await using var db = CreateInMemoryDb();
        db.Progress.Add(new MemberProgress
        {
            MemberKey = otherKey,
            BookId = 1,
            Page = 5,
            PageCount = 100,
        });
        await db.SaveChangesAsync();
        var controller = CreateController(db);

        var result = await controller.UpsertProgress(1, CreateUpdate(75, 100));

        Assert.IsType<OkObjectResult>(result);
        var otherProgress = await db.Progress.FirstOrDefaultAsync(p => p.MemberKey == otherKey && p.BookId == 1);
        Assert.Equal(5, otherProgress!.Page);
    }

    [Fact]
    public async Task UpsertProgress_SetsUpdatedAtToUtcNow()
    {
        await using var db = CreateInMemoryDb();
        var controller = CreateController(db);
        var before = DateTime.UtcNow.AddSeconds(-1);

        var result = await controller.UpsertProgress(1, CreateUpdate(1, 100));

        var progress = await db.Progress.FirstOrDefaultAsync(p => p.BookId == 1 && p.MemberKey == MemberKey);
        Assert.NotNull(progress);
        Assert.True(progress!.UpdatedAt >= before);
    }
}
