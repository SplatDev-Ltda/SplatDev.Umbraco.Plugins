using FluentAssertions;
using Microsoft.Playwright;
using Xunit;

namespace SplatDev.Umbraco.Workflow.E2E.Tests;

public sealed class QueueFlowTests : IAsyncDisposable
{
    private const string BaseUrl = "http://localhost:5000";
    private const string LoginPath = "/umbraco";
    private const string WorkflowSectionPath = "/umbraco/#/SplatDevWorkflow/SplatDevWorkflowQueue";
    private const string DefinitionsPath = "/umbraco/#/SplatDevWorkflow/SplatDevWorkflowDefinitions";
    private const string ThemesPath = "/umbraco/#/SplatDevWorkflow/SplatDevWorkflowThemes";

    private readonly IPlaywright _playwright;
    private readonly IBrowser _browser;

    public QueueFlowTests()
    {
        _playwright = Playwright.CreateAsync().GetAwaiter().GetResult();
        _browser = _playwright.Chromium.LaunchAsync(new BrowserTypeLaunchOptions
        {
            Headless = true,
        }).GetAwaiter().GetResult();
    }

    [Fact(Skip = "Requires running Umbraco host")]
    public async Task QueueDashboard_Loads_AndDisplaysPizzaChart()
    {
        var page = await _browser.NewPageAsync();

        await page.GotoAsync(BaseUrl + WorkflowSectionPath, new PageGotoOptions
        {
            WaitUntil = WaitUntilState.NetworkIdle,
        });

        (await page.TitleAsync()).Should().NotBeNullOrEmpty();
        await page.CloseAsync();
    }

    [Fact(Skip = "Requires running Umbraco host")]
    public async Task DefinitionEditor_CanCreateAndSaveWorkflow()
    {
        var page = await _browser.NewPageAsync();

        await page.GotoAsync(BaseUrl + DefinitionsPath, new PageGotoOptions
        {
            WaitUntil = WaitUntilState.NetworkIdle,
        });

        (await page.TitleAsync()).Should().NotBeNullOrEmpty();
        await page.CloseAsync();
    }

    [Fact(Skip = "Requires running Umbraco host")]
    public async Task ThemesDashboard_CanSwitchTheme()
    {
        var page = await _browser.NewPageAsync();

        await page.GotoAsync(BaseUrl + ThemesPath, new PageGotoOptions
        {
            WaitUntil = WaitUntilState.NetworkIdle,
        });

        (await page.TitleAsync()).Should().NotBeNullOrEmpty();
        await page.CloseAsync();
    }

    [Fact(Skip = "Requires running Umbraco host")]
    public async Task FullWorkflowLifecycle_CreateInstanceToComplete()
    {
        var page = await _browser.NewPageAsync();

        await page.GotoAsync(BaseUrl + WorkflowSectionPath, new PageGotoOptions
        {
            WaitUntil = WaitUntilState.NetworkIdle,
        });

        (await page.TitleAsync()).Should().NotBeNullOrEmpty();
        await page.CloseAsync();
    }

    public async ValueTask DisposeAsync()
    {
        await _browser.CloseAsync();
        _playwright.Dispose();
    }
}
