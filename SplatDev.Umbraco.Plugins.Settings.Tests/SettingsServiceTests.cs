using Microsoft.EntityFrameworkCore;
using SplatDev.Umbraco.Plugins.Settings.Models;
using SplatDev.Umbraco.Plugins.Settings.Services;
using Xunit;

namespace SplatDev.Umbraco.Plugins.Settings.Tests;

public class SettingsServiceTests
{
    private static SettingsDbContext NewDb() =>
        new(new DbContextOptionsBuilder<SettingsDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);

    // ── the gap: groups could be read but never created ──────────────────────

    [Fact]
    public async Task A_group_can_be_created()
    {
        using var db = NewDb();
        var svc = new SettingsService(db);

        var r = await svc.SaveGroupAsync(new SettingGroup { Name = "Contact details" });

        Assert.True(r.Success);
        Assert.Equal("contact-details", r.Value!.Alias);
        Assert.Single(await svc.GetAllGroupsAsync());
    }

    [Fact]
    public async Task A_group_without_a_name_is_refused()
    {
        using var db = NewDb();
        var r = await new SettingsService(db).SaveGroupAsync(new SettingGroup { Name = "  " });
        Assert.False(r.Success);
    }

    [Fact]
    public async Task A_duplicate_alias_is_refused_with_a_readable_message()
    {
        // The column is uniquely indexed, so without this the clash surfaces as a
        // DbUpdateException rather than something an editor can act on.
        using var db = NewDb();
        var svc = new SettingsService(db);
        await svc.SaveGroupAsync(new SettingGroup { Name = "SEO" });

        var r = await svc.SaveGroupAsync(new SettingGroup { Name = "SEO" });

        Assert.False(r.Success);
        Assert.Contains("already uses the alias", r.Message);
    }

    [Fact]
    public async Task A_group_holding_settings_cannot_be_deleted()
    {
        // Deleting it would orphan the settings onto GroupId 0, where nothing lists them:
        // still readable by key, invisible in the UI.
        using var db = NewDb();
        var svc = new SettingsService(db);
        var g = (await svc.SaveGroupAsync(new SettingGroup { Name = "Mail" })).Value!;
        await svc.SaveSettingAsync(new SiteSetting { Key = "mail.from", GroupId = g.Id });

        var r = await svc.DeleteGroupAsync(g.Id);

        Assert.False(r.Success);
        Assert.Contains("still holds 1 setting", r.Message);
    }

    // ── the gap: Type existed on the model and nothing honoured it ───────────

    [Theory]
    [InlineData("boolean", "true", true)]
    [InlineData("boolean", "false", true)]
    [InlineData("boolean", "1", true)]
    [InlineData("boolean", "yes", false)]
    [InlineData("number", "42", true)]
    [InlineData("number", "3.14", true)]
    [InlineData("number", "lots", false)]
    [InlineData("json", "{\"a\":1}", true)]
    [InlineData("json", "{not json", false)]
    [InlineData("text", "anything at all", true)]
    public void A_value_is_validated_against_its_declared_type(string type, string value, bool valid)
    {
        var error = SettingsService.ValidateValue(type, value);
        Assert.Equal(valid, error is null);
    }

    [Fact]
    public async Task Saving_a_boolean_with_a_non_boolean_value_is_refused()
    {
        using var db = NewDb();
        var r = await new SettingsService(db).SaveSettingAsync(
            new SiteSetting { Key = "feature.on", Type = "boolean", Value = "yes" });

        Assert.False(r.Success);
        Assert.Contains("not a boolean", r.Message);
    }

    [Fact]
    public async Task An_unknown_type_is_refused_and_lists_the_valid_ones()
    {
        using var db = NewDb();
        var r = await new SettingsService(db).SaveSettingAsync(
            new SiteSetting { Key = "k", Type = "colour" });

        Assert.False(r.Success);
        Assert.Contains("text, boolean, number, json", r.Message);
    }

    [Fact]
    public async Task A_setting_keeps_its_group_and_type_when_saved_properly()
    {
        // SetSettingAsync could only ever produce GroupId 0 and Type "text".
        using var db = NewDb();
        var svc = new SettingsService(db);
        var g = (await svc.SaveGroupAsync(new SettingGroup { Name = "Shop" })).Value!;

        var r = await svc.SaveSettingAsync(new SiteSetting
        {
            Key = "shop.taxRate", Type = "number", Value = "23", GroupId = g.Id,
            Description = "Percent",
        });

        Assert.True(r.Success);
        Assert.Equal(g.Id, r.Value!.GroupId);
        Assert.Equal("number", r.Value.Type);
    }

    [Fact]
    public async Task A_setting_pointed_at_a_missing_group_is_refused()
    {
        using var db = NewDb();
        var r = await new SettingsService(db).SaveSettingAsync(
            new SiteSetting { Key = "k", GroupId = 999 });

        Assert.False(r.Success);
        Assert.Contains("group no longer exists", r.Message);
    }

    [Fact]
    public async Task A_duplicate_key_is_refused()
    {
        using var db = NewDb();
        var svc = new SettingsService(db);
        await svc.SaveSettingAsync(new SiteSetting { Key = "site.title" });

        var r = await svc.SaveSettingAsync(new SiteSetting { Key = "site.title" });

        Assert.False(r.Success);
        Assert.Contains("already uses the key", r.Message);
    }

    [Fact]
    public async Task The_legacy_key_value_endpoint_still_works()
    {
        // Kept for anything scripted against the original API.
        using var db = NewDb();
        var svc = new SettingsService(db);

        var created = await svc.SetSettingAsync("legacy.key", "v1");
        var updated = await svc.SetSettingAsync("legacy.key", "v2");

        Assert.Equal(created.Id, updated.Id);
        Assert.Equal("v2", updated.Value);
    }

    [Fact]
    public async Task GetAll_returns_ungrouped_settings_too()
    {
        using var db = NewDb();
        var svc = new SettingsService(db);
        await svc.SaveSettingAsync(new SiteSetting { Key = "orphan" });

        Assert.Single(await svc.GetAllSettingsAsync());
    }
}
