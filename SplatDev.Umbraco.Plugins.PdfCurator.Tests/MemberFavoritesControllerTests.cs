using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using Moq;

using SplatDev.Umbraco.Plugins.PdfCurator.Controllers.Member;
using SplatDev.Umbraco.Plugins.PdfCurator.Entities;
using SplatDev.Umbraco.Plugins.PdfCurator.Migrations;

using PdfCurator.Core.Data;

using Umbraco.Cms.Core.Security;

using Xunit;

namespace SplatDev.Umbraco.Plugins.PdfCurator.Tests;

public class MemberFavoritesControllerTests
{
    private sealed class TestMemberDbContext(DbContextOptions<MemberDbContext> options) : MemberDbContext(options)
    {
        public override void Dispose() { }
        public override ValueTask DisposeAsync() => ValueTask.CompletedTask;
    }

    private static readonly Guid MemberKey = Guid.NewGuid();

    private static Mock<IDbContextFactory<CuratorDbContext>> CreateCuratorDbFactory(CuratorDbContext db)
    {
        var factory = new Mock<IDbContextFactory<CuratorDbContext>>();
        factory.Setup(f => f.CreateDbContextAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(db);
        return factory;
    }

    private static CuratorDbContext CreateCuratorInMemoryDb()
    {
        var options = new DbContextOptionsBuilder<CuratorDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new CuratorDbContext(options);
    }

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

    private static MemberFavoritesController CreateController(
        MemberDbContext db,
        bool authenticated = true,
        CuratorDbContext? curatorDb = null)
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

        curatorDb ??= CreateCuratorInMemoryDb();
        return new MemberFavoritesController(
            CreateDbFactory(db).Object,
            CreateCuratorDbFactory(curatorDb).Object,
            memberManagerMock.Object);
    }

    [Fact]
    public async Task GetFavorites_Returns401_WhenNotAuthenticated()
    {
        await using var db = CreateInMemoryDb();
        var controller = CreateController(db, authenticated: false);

        var result = await controller.GetFavorites();

        Assert.IsType<UnauthorizedResult>(result);
    }

    [Fact]
    public async Task GetFavorites_ReturnsEmpty_WhenNoFavorites()
    {
        await using var db = CreateInMemoryDb();
        var controller = CreateController(db);

        var result = await controller.GetFavorites();

        var okResult = Assert.IsType<OkObjectResult>(result);
        var items = Assert.IsAssignableFrom<System.Collections.IEnumerable>(okResult.Value)
            .Cast<object>()
            .ToList();
        Assert.Empty(items);
    }

    [Fact]
    public async Task GetFavorites_ReturnsFavoritesForCurrentMember()
    {
        await using var db = CreateInMemoryDb();
        db.Favorites.AddRange(
            new MemberFavorite { MemberKey = MemberKey, BookId = 1, CreatedAt = DateTime.UtcNow },
            new MemberFavorite { MemberKey = MemberKey, BookId = 2, CreatedAt = DateTime.UtcNow },
            new MemberFavorite { MemberKey = Guid.NewGuid(), BookId = 3, CreatedAt = DateTime.UtcNow }
        );
        await db.SaveChangesAsync();

        var controller = CreateController(db);

        var result = await controller.GetFavorites();

        var okResult = Assert.IsType<OkObjectResult>(result);
        var items = Assert.IsAssignableFrom<System.Collections.IEnumerable>(okResult.Value)
            .Cast<object>()
            .ToList();
        Assert.Equal(2, items.Count);
    }

    [Fact]
    public async Task AddFavorite_Returns401_WhenNotAuthenticated()
    {
        await using var db = CreateInMemoryDb();
        var controller = CreateController(db, authenticated: false);

        var result = await controller.AddFavorite(1);

        Assert.IsType<UnauthorizedResult>(result);
    }

    [Fact]
    public async Task AddFavorite_AddsNewFavorite()
    {
        await using var db = CreateInMemoryDb();
        var controller = CreateController(db);

        var result = await controller.AddFavorite(42);

        var okResult = Assert.IsType<OkObjectResult>(result);
        var json = okResult.Value!;
        var bookIdProp = json.GetType().GetProperty("bookId");
        Assert.Equal(42, bookIdProp!.GetValue(json));

        var fav = await db.Favorites.FirstOrDefaultAsync(f => f.BookId == 42 && f.MemberKey == MemberKey);
        Assert.NotNull(fav);
    }

    [Fact]
    public async Task AddFavorite_Idempotent_WhenAlreadyFavorited()
    {
        await using var db = CreateInMemoryDb();
        db.Favorites.Add(new MemberFavorite { MemberKey = MemberKey, BookId = 42 });
        await db.SaveChangesAsync();
        var controller = CreateController(db);

        var result = await controller.AddFavorite(42);

        Assert.IsType<OkObjectResult>(result);
        var count = await db.Favorites.CountAsync(f => f.BookId == 42 && f.MemberKey == MemberKey);
        Assert.Equal(1, count);
    }

    [Fact]
    public async Task RemoveFavorite_Returns401_WhenNotAuthenticated()
    {
        await using var db = CreateInMemoryDb();
        var controller = CreateController(db, authenticated: false);

        var result = await controller.RemoveFavorite(1);

        Assert.IsType<UnauthorizedResult>(result);
    }

    [Fact]
    public async Task RemoveFavorite_Returns404_WhenNotFavorited()
    {
        await using var db = CreateInMemoryDb();
        var controller = CreateController(db);

        var result = await controller.RemoveFavorite(999);

        Assert.IsType<NotFoundResult>(result);
    }

    [Fact]
    public async Task RemoveFavorite_RemovesExistingFavorite()
    {
        await using var db = CreateInMemoryDb();
        db.Favorites.Add(new MemberFavorite { MemberKey = MemberKey, BookId = 42 });
        await db.SaveChangesAsync();
        var controller = CreateController(db);

        var result = await controller.RemoveFavorite(42);

        var okResult = Assert.IsType<OkObjectResult>(result);
        var json = okResult.Value!;
        var removedProp = json.GetType().GetProperty("removed");
        Assert.Equal(true, removedProp!.GetValue(json));

        var fav = await db.Favorites.FirstOrDefaultAsync(f => f.BookId == 42 && f.MemberKey == MemberKey);
        Assert.Null(fav);
    }

    [Fact]
    public async Task RemoveFavorite_DoesNotAffectOtherMembersFavorites()
    {
        var otherMember = Guid.NewGuid();
        await using var db = CreateInMemoryDb();
        db.Favorites.Add(new MemberFavorite { MemberKey = otherMember, BookId = 42 });
        await db.SaveChangesAsync();
        var controller = CreateController(db);

        var result = await controller.RemoveFavorite(42);

        Assert.IsType<NotFoundResult>(result);
        var remaining = await db.Favorites.CountAsync(f => f.BookId == 42);
        Assert.Equal(1, remaining);
    }
}
