using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;

using Moq;

using PdfCurator.Core.Data;
using PdfCurator.Core.Entities;

using SplatDev.Umbraco.Plugins.PdfCurator.Controllers.Member;
using SplatDev.Umbraco.Plugins.PdfCurator.Models;
using SplatDev.Umbraco.Plugins.PdfCurator.Services;

using Umbraco.Cms.Core.Security;
using Umbraco.Cms.Core.Services;

using Xunit;

namespace SplatDev.Umbraco.Plugins.PdfCurator.Tests;

public class MemberSimilarControllerTests
{
    private static Mock<IDbContextFactory<CuratorDbContext>> CreateDbFactory(CuratorDbContext db)
    {
        var factory = new Mock<IDbContextFactory<CuratorDbContext>>();
        factory.Setup(f => f.CreateDbContextAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(db);
        return factory;
    }

    private static CuratorDbContext CreateInMemoryDb()
    {
        var options = new DbContextOptionsBuilder<CuratorDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new CuratorDbContext(options);
    }

    private static MemberGroupScopingService CreateNoopScopingService()
    {
        var opts = Options.Create(new PdfCuratorOptions());
        var mmMock = new Mock<IMemberManager>();
        var msMock = new Mock<IMemberService>();
        return new MemberGroupScopingService(opts, mmMock.Object, msMock.Object);
    }

    private static IMemoryCache CreateCache()
    {
        return new MemoryCache(new MemoryCacheOptions());
    }

    [Fact]
    public async Task GetSimilar_Returns404_WhenBookNotFound()
    {
        await using var db = CreateInMemoryDb();
        var factory = CreateDbFactory(db);
        var cache = CreateCache();
        var scopingService = CreateNoopScopingService();

        var controller = new MemberSimilarController(factory.Object, cache, scopingService);

        var result = await controller.GetSimilar(999);

        var notFound = Assert.IsType<NotFoundObjectResult>(result);
        var value = GetAnonymousValue(notFound);
        Assert.Equal("Book not found.", value?.GetType().GetProperty("error")?.GetValue(value));
    }

    [Fact]
    public async Task GetSimilar_ReturnsScoredResults_WhenBookExists()
    {
        await using var db = CreateInMemoryDb();
        db.Books.AddRange(
            new Book { Title = "Programming in Lua", Author = "Roberto Ierusalimschy", Category = "Technology", Status = BookStatus.Filed, CreatedAt = DateTime.UtcNow },
            new Book { Title = "Lua Programming Gems", Author = "Roberto Ierusalimschy", Category = "Technology", Status = BookStatus.Filed, CreatedAt = DateTime.UtcNow },
            new Book { Title = "Modern Design Patterns", Author = "Erich Gamma", Category = "Technology", Status = BookStatus.Filed, CreatedAt = DateTime.UtcNow },
            new Book { Title = "Cooking Essentials", Author = "Julia Child", Category = "Cooking", Status = BookStatus.Filed, CreatedAt = DateTime.UtcNow });
        await db.SaveChangesAsync();

        var factory = CreateDbFactory(db);
        var cache = CreateCache();
        var scopingService = CreateNoopScopingService();

        var controller = new MemberSimilarController(factory.Object, cache, scopingService);

        var result = await controller.GetSimilar(1);

        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(okResult.Value);
    }

    [Fact]
    public async Task GetSimilar_CachesResults()
    {
        await using var db = CreateInMemoryDb();
        db.Books.AddRange(
            new Book { Title = "CSharp in Depth", Author = "Jon Skeet", Category = "Technology", Status = BookStatus.Filed, CreatedAt = DateTime.UtcNow },
            new Book { Title = "Effective CSharp", Author = "Bill Wagner", Category = "Technology", Status = BookStatus.Filed, CreatedAt = DateTime.UtcNow });
        await db.SaveChangesAsync();

        var factory = CreateDbFactory(db);
        var cache = CreateCache();
        var scopingService = CreateNoopScopingService();

        var controller = new MemberSimilarController(factory.Object, cache, scopingService);

        var first = await controller.GetSimilar(1);
        var second = await controller.GetSimilar(1);

        Assert.IsType<OkObjectResult>(first);
        Assert.IsType<OkObjectResult>(second);
        factory.Verify(f => f.CreateDbContextAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    private static object? GetAnonymousValue(ObjectResult result)
    {
        return result.Value;
    }
}
