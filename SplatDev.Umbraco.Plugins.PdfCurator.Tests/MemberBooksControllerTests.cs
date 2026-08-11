using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

using Moq;

using PdfCurator.Core.Data;
using PdfCurator.Core.Entities;

using SplatDev.Umbraco.Plugins.PdfCurator.Controllers.Member;
using SplatDev.Umbraco.Plugins.PdfCurator.Models;
using SplatDev.Umbraco.Plugins.PdfCurator.Services;

using Umbraco.Cms.Core.Security;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Services;

using Xunit;

namespace SplatDev.Umbraco.Plugins.PdfCurator.Tests;

public class MemberBooksControllerTests
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

    private static MemberBooksController CreateController(
        CuratorDbContext db,
        MemberGroupScopingService? scopingService = null)
    {
        return new MemberBooksController(
            CreateDbFactory(db).Object,
            scopingService ?? CreateNoopScopingService());
    }

    private static Book CreateBook(
        int id = 1,
        string title = "Test Book",
        string author = "Author",
        string category = "Technology",
        BookStatus status = BookStatus.Filed)
    {
        return new Book
        {
            Id = id,
            Title = title,
            Author = author,
            Category = category,
            Status = status,
            CreatedAt = DateTime.UtcNow,
            Pages = 100,
            Size = 1024,
        };
    }

    [Fact]
    public async Task GetBooks_ReturnsFiledBooksOnly()
    {
        await using var db = CreateInMemoryDb();
        db.Books.AddRange(
            CreateBook(1, "Filed Book", status: BookStatus.Filed),
            CreateBook(2, "Processing Book", status: BookStatus.Planned),
            CreateBook(3, "Error Book", status: BookStatus.Quarantined)
        );
        await db.SaveChangesAsync();

        var controller = CreateController(db);

        var result = await controller.GetBooks(null, null, null);

        var okResult = Assert.IsType<OkObjectResult>(result);
        var json = okResult.Value!;
        var totalProp = json.GetType().GetProperty("total");
        Assert.NotNull(totalProp);
        Assert.Equal(1, totalProp!.GetValue(json));
    }

    [Fact]
    public async Task GetBooks_FiltersByQuery()
    {
        await using var db = CreateInMemoryDb();
        db.Books.AddRange(
            CreateBook(1, "TypeScript Guide", "Alice"),
            CreateBook(2, "JavaScript Patterns", "Bob"),
            CreateBook(3, "Cooking Basics", "Carol")
        );
        await db.SaveChangesAsync();

        var controller = CreateController(db);

        var result = await controller.GetBooks("Script", null, null);

        var okResult = Assert.IsType<OkObjectResult>(result);
        var json = okResult.Value!;
        var itemsProp = json.GetType().GetProperty("items");
        var items = itemsProp!.GetValue(json) as System.Collections.IList;
        Assert.Equal(2, items!.Count);
    }

    [Fact]
    public async Task GetBooks_FiltersByCategory()
    {
        await using var db = CreateInMemoryDb();
        db.Books.AddRange(
            CreateBook(1, "Tech Book", category: "Technology"),
            CreateBook(2, "Design Book", category: "Design"),
            CreateBook(3, "Tech Book 2", category: "Technology")
        );
        await db.SaveChangesAsync();

        var controller = CreateController(db);

        var result = await controller.GetBooks(null, "Technology", null);

        var okResult = Assert.IsType<OkObjectResult>(result);
        var json = okResult.Value!;
        var itemsProp = json.GetType().GetProperty("items");
        var items = itemsProp!.GetValue(json) as System.Collections.IList;
        Assert.Equal(2, items!.Count);
    }

    [Fact]
    public async Task GetBooks_SortsByTitle()
    {
        await using var db = CreateInMemoryDb();
        db.Books.AddRange(
            CreateBook(1, "Zebra"),
            CreateBook(2, "Alpha"),
            CreateBook(3, "Mango")
        );
        await db.SaveChangesAsync();

        var controller = CreateController(db);

        var result = await controller.GetBooks(null, null, null, "title");

        var okResult = Assert.IsType<OkObjectResult>(result);
        var json = okResult.Value!;
        var itemsProp = json.GetType().GetProperty("items");
        var items = itemsProp!.GetValue(json) as System.Collections.IList;
        Assert.Equal(3, items!.Count);
        var firstItem = items![0];
        var titleProp = firstItem!.GetType().GetProperty("Title");
        Assert.Equal("Alpha", titleProp!.GetValue(firstItem));
    }

    [Fact]
    public async Task GetBooks_Paginates()
    {
        await using var db = CreateInMemoryDb();
        for (int i = 1; i <= 30; i++)
        {
            db.Books.Add(CreateBook(i, $"Book {i}"));
        }
        await db.SaveChangesAsync();

        var controller = CreateController(db);

        var result = await controller.GetBooks(null, null, null, page: 2, pageSize: 10);

        var okResult = Assert.IsType<OkObjectResult>(result);
        var json = okResult.Value!;
        var totalProp = json.GetType().GetProperty("total");
        var itemsProp = json.GetType().GetProperty("items");
        Assert.Equal(30, totalProp!.GetValue(json));
        var items = itemsProp!.GetValue(json) as System.Collections.IList;
        Assert.Equal(10, items!.Count);
    }

    [Fact]
    public async Task GetBook_Returns404_WhenNotFound()
    {
        await using var db = CreateInMemoryDb();
        var controller = CreateController(db);

        var result = await controller.GetBook(999);

        Assert.IsType<NotFoundObjectResult>(result);
    }

    [Fact]
    public async Task GetBook_ReturnsBookDetail_WhenExists()
    {
        await using var db = CreateInMemoryDb();
        db.Books.Add(CreateBook(1, "My Book", "Author"));
        await db.SaveChangesAsync();

        var controller = CreateController(db);

        var result = await controller.GetBook(1);

        var okResult = Assert.IsType<OkObjectResult>(result);
        var json = okResult.Value!;
        var titleProp = json.GetType().GetProperty("Title");
        Assert.Equal("My Book", titleProp!.GetValue(json));
    }

    [Fact]
    public async Task GetBook_Returns404_WhenNonFiledStatus()
    {
        await using var db = CreateInMemoryDb();
        db.Books.Add(CreateBook(1, "Processing", status: BookStatus.Planned));
        await db.SaveChangesAsync();

        var controller = CreateController(db);

        var result = await controller.GetBook(1);

        Assert.IsType<NotFoundObjectResult>(result);
    }

    [Fact]
    public async Task GetThumbnail_Returns404_WhenNoThumbnail()
    {
        await using var db = CreateInMemoryDb();
        var book = CreateBook(1);
        book.Thumbnail = Array.Empty<byte>();
        db.Books.Add(book);
        await db.SaveChangesAsync();

        var controller = CreateController(db);

        var result = await controller.GetThumbnail(1);

        Assert.IsType<NotFoundResult>(result);
    }

    [Fact]
    public async Task GetThumbnail_Returns404_WhenBookNotFound()
    {
        await using var db = CreateInMemoryDb();
        var controller = CreateController(db);

        var result = await controller.GetThumbnail(999);

        Assert.IsType<NotFoundResult>(result);
    }

    [Fact]
    public async Task GetFile_Returns404_WhenBookNotFound()
    {
        await using var db = CreateInMemoryDb();
        var controller = CreateController(db);

        var result = await controller.GetFile(999);

        var notFound = Assert.IsType<NotFoundObjectResult>(result);
        Assert.NotNull(notFound.Value);
    }

    [Fact]
    public async Task GetFile_Returns404_WhenFileMissingOnDisk()
    {
        await using var db = CreateInMemoryDb();
        var book = CreateBook(1);
        book.LibraryPath = "/nonexistent/path.pdf";
        db.Books.Add(book);
        await db.SaveChangesAsync();

        var controller = CreateController(db);

        var result = await controller.GetFile(1);

        var notFound = Assert.IsType<NotFoundObjectResult>(result);
        Assert.NotNull(notFound.Value);
    }

    [Fact]
    public async Task GetBooks_WithCategoryScoping_FiltersByAllowedCategories()
    {
        await using var db = CreateInMemoryDb();
        db.Books.AddRange(
            CreateBook(1, "Tech Book", category: "Technology"),
            CreateBook(2, "Design Book", category: "Design"),
            CreateBook(3, "Cooking Book", category: "Cooking")
        );
        await db.SaveChangesAsync();

        // Create scoping service that only allows "Technology"
        var opts = Options.Create(new PdfCuratorOptions
        {
            MemberGroupScopes = new Dictionary<string, List<string>>
            {
                ["Technology"] = ["Developers"],
            },
        });
        var mmMock = new Mock<IMemberManager>();
        var identity = new MemberIdentityUser { Email = "test@test.com", UserName = "test@test.com", Key = Guid.NewGuid() };
        mmMock.Setup(m => m.GetCurrentMemberAsync()).ReturnsAsync(identity);

        var msMock = new Mock<IMemberService>();
        var member = new Mock<IMember>();
        member.Setup(m => m.Id).Returns(42);
        msMock.Setup(s => s.GetByKey(identity.Key)).Returns(member.Object);
        msMock.Setup(s => s.GetAllRoles(42)).Returns(["Developers"]);

        var scopingService = new MemberGroupScopingService(opts, mmMock.Object, msMock.Object);
        var controller = CreateController(db, scopingService);

        var result = await controller.GetBooks(null, null, null);

        var okResult = Assert.IsType<OkObjectResult>(result);
        var json = okResult.Value!;
        var itemsProp = json.GetType().GetProperty("items");
        var items = itemsProp!.GetValue(json) as System.Collections.IList;
        Assert.Single(items!);
    }
}
