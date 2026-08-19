using Microsoft.EntityFrameworkCore;
using SplatDev.Umbraco.Plugins.RdpManager.Models;
using SplatDev.Umbraco.Plugins.RdpManager.Services;
using Xunit;

namespace SplatDev.Umbraco.Plugins.RdpManager.Tests;

public class RdpManagerServiceTests
{
    private static RdpManagerService Build() =>
        new(new RdpManagerDbContext(new DbContextOptionsBuilder<RdpManagerDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString()).Options));

    private static RdpConnection Conn(string name = "Prod web", string host = "web01.example.com") =>
        new() { Name = name, Host = host, Port = 3389, Width = 1920, Height = 1080, ColorDepth = 32 };

    // ── validation the UI depends on ─────────────────────────────────────────

    [Fact]
    public async Task A_connection_without_a_host_is_refused()
    {
        // Previously stored, then generated a .rdp the client silently refused to open.
        var r = await Build().SaveAsync(new RdpConnection { Name = "x", Host = "" });

        Assert.False(r.Success);
        Assert.Contains("host name or IP", r.Message);
    }

    [Fact]
    public async Task A_connection_without_a_name_is_refused()
    {
        var r = await Build().SaveAsync(new RdpConnection { Name = " ", Host = "h" });
        Assert.False(r.Success);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    [InlineData(65536)]
    public async Task A_port_outside_the_valid_range_is_refused(int port)
    {
        var c = Conn(); c.Port = port;
        var r = await Build().SaveAsync(c);

        Assert.False(r.Success);
        Assert.Contains("1-65535", r.Message);
    }

    [Theory]
    [InlineData(8)]
    [InlineData(30)]
    public async Task An_unsupported_colour_depth_is_refused(int depth)
    {
        // mstsc silently falls back on anything other than 15/16/24/32, which reads as the
        // setting having been ignored.
        var c = Conn(); c.ColorDepth = depth;
        var r = await Build().SaveAsync(c);

        Assert.False(r.Success);
        Assert.Contains("15, 16, 24 or 32", r.Message);
    }

    [Theory]
    [InlineData(15)] [InlineData(16)] [InlineData(24)] [InlineData(32)]
    public async Task The_supported_colour_depths_are_accepted(int depth)
    {
        var c = Conn(); c.ColorDepth = depth;
        Assert.True((await Build().SaveAsync(c)).Success);
    }

    [Fact]
    public async Task A_resolution_below_640x480_is_refused()
    {
        var c = Conn(); c.Width = 320; c.Height = 240;
        Assert.False((await Build().SaveAsync(c)).Success);
    }

    [Fact]
    public async Task A_duplicate_name_is_refused()
    {
        var svc = Build();
        await svc.SaveAsync(Conn());

        var r = await svc.SaveAsync(Conn());

        Assert.False(r.Success);
        Assert.Contains("already called", r.Message);
    }

    [Fact]
    public async Task Saving_an_existing_connection_under_its_own_name_is_allowed()
    {
        // The duplicate check must exclude the row being edited, or nothing could be saved twice.
        var svc = Build();
        var created = (await svc.SaveAsync(Conn())).Value!;
        created.Host = "web02.example.com";

        Assert.True((await svc.SaveAsync(created)).Success);
    }

    // ── delete ───────────────────────────────────────────────────────────────

    [Fact]
    public async Task Deleting_a_connection_that_does_not_exist_reports_failure()
    {
        var r = await Build().RemoveAsync(404);
        Assert.False(r.Success);
        Assert.Contains("no longer exists", r.Message);
    }

    [Fact]
    public async Task A_connection_can_be_created_then_deleted()
    {
        var svc = Build();
        var c = (await svc.SaveAsync(Conn())).Value!;

        Assert.True((await svc.RemoveAsync(c.Id)).Success);
        Assert.Empty(await svc.GetAllAsync());
    }

    // ── generated file ───────────────────────────────────────────────────────

    [Fact]
    public async Task The_generated_rdp_names_the_host_and_port()
    {
        var svc = Build();
        var c = (await svc.SaveAsync(Conn(host: "web01.example.com"))).Value!;

        var content = await svc.GenerateRdpContentAsync(c.Id);

        Assert.Contains("full address:s:web01.example.com:3389", content);
    }

    [Fact]
    public async Task The_generated_rdp_never_contains_a_password_field()
    {
        // .rdp supports an encrypted password blob; storing one would put credentials in a
        // file the dashboard hands out on request.
        var svc = Build();
        var c = (await svc.SaveAsync(Conn())).Value!;

        var content = await svc.GenerateRdpContentAsync(c.Id);

        Assert.DoesNotContain("password", content, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task Generating_for_a_missing_connection_throws_rather_than_emitting_a_broken_file()
    {
        await Assert.ThrowsAsync<KeyNotFoundException>(() => Build().GenerateRdpContentAsync(404));
    }
}
