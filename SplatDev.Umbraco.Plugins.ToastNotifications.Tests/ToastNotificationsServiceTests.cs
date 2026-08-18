using Microsoft.EntityFrameworkCore;
using SplatDev.Umbraco.Plugins.ToastNotifications.Data;
using SplatDev.Umbraco.Plugins.ToastNotifications.Models;
using SplatDev.Umbraco.Plugins.ToastNotifications.Services;
using Xunit;

namespace SplatDev.Umbraco.Plugins.ToastNotifications.Tests;

public class ToastNotificationsServiceTests
{
    private static ToastNotificationsDbContext NewDb() =>
        new(new DbContextOptionsBuilder<ToastNotificationsDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options);

    private static ToastMessage Toast(
        string title, bool active = true, DateTime? start = null, DateTime? end = null) =>
        new() { Title = title, Body = "b", Type = "info", IsActive = active, StartDate = start, EndDate = end };

    /// <summary>
    /// The gap this fixes: the dashboard only had GetActive, which filters on IsActive and
    /// the start/end window — so a toast scheduled for next week, or one that had expired,
    /// was invisible in the only screen that manages them. You could create it, watch it
    /// vanish, and have no way to edit or delete it afterwards.
    /// </summary>
    [Fact]
    public async Task GetAll_returns_scheduled_and_expired_toasts_that_GetActive_hides()
    {
        using var db = NewDb();
        var svc = new ToastNotificationsService(db);

        await svc.CreateToastAsync(Toast("showing now"));
        await svc.CreateToastAsync(Toast("scheduled", start: DateTime.UtcNow.AddDays(7)));
        await svc.CreateToastAsync(Toast("expired", end: DateTime.UtcNow.AddDays(-1)));
        await svc.CreateToastAsync(Toast("disabled", active: false));

        var active = (await svc.GetActiveToastsAsync()).Select(t => t.Title).ToList();
        var all = (await svc.GetAllToastsAsync()).Select(t => t.Title).ToList();

        Assert.Equal(new[] { "showing now" }, active);
        Assert.Equal(4, all.Count);
        Assert.Contains("scheduled", all);
        Assert.Contains("expired", all);
        Assert.Contains("disabled", all);
    }

    [Fact]
    public async Task GetActive_includes_a_toast_with_no_window_at_all()
    {
        using var db = NewDb();
        var svc = new ToastNotificationsService(db);
        await svc.CreateToastAsync(Toast("open ended"));

        Assert.Single(await svc.GetActiveToastsAsync());
    }

    [Fact]
    public async Task GetActive_includes_a_toast_inside_its_window()
    {
        using var db = NewDb();
        var svc = new ToastNotificationsService(db);
        await svc.CreateToastAsync(Toast("in window",
            start: DateTime.UtcNow.AddHours(-1), end: DateTime.UtcNow.AddHours(1)));

        Assert.Single(await svc.GetActiveToastsAsync());
    }

    [Fact]
    public async Task Toasts_come_back_newest_first()
    {
        using var db = NewDb();
        var svc = new ToastNotificationsService(db);

        var older = Toast("older"); older.CreatedAt = DateTime.UtcNow.AddDays(-2);
        var newer = Toast("newer"); newer.CreatedAt = DateTime.UtcNow;
        await svc.CreateToastAsync(older);
        await svc.CreateToastAsync(newer);

        Assert.Equal("newer", (await svc.GetAllToastsAsync()).First().Title);
    }

    [Fact]
    public async Task Updating_a_toast_that_does_not_exist_returns_null_rather_than_throwing()
    {
        using var db = NewDb();
        Assert.Null(await new ToastNotificationsService(db).UpdateToastAsync(404, Toast("x")));
    }

    [Fact]
    public async Task Deleting_a_toast_that_does_not_exist_reports_false()
    {
        using var db = NewDb();
        Assert.False(await new ToastNotificationsService(db).DeleteToastAsync(404));
    }

    [Fact]
    public async Task A_created_toast_can_be_edited_and_deleted()
    {
        using var db = NewDb();
        var svc = new ToastNotificationsService(db);

        var created = await svc.CreateToastAsync(Toast("first"));
        var updated = await svc.UpdateToastAsync(created.Id, Toast("second"));

        Assert.NotNull(updated);
        Assert.Equal("second", updated!.Title);
        Assert.True(await svc.DeleteToastAsync(created.Id));
        Assert.Empty(await svc.GetAllToastsAsync());
    }
}
