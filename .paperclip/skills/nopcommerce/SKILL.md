---
name: nopcommerce
description: nopCommerce expert for plugin development, theme customization, data access, and store configuration. Use this skill whenever the user is working in a nopCommerce project, mentions plugin development, asks about BasePlugin, IPaymentMethod, IShippingRateComputationMethod, IWidgetPlugin, widget zones, FluentMigrator migrations, IRepository, INopStartup, nopCommerce settings, admin controllers, Razor views in plugins, or any nopCommerce-specific architecture. Trigger on keywords like "nopCommerce", "nop plugin", "Nop.Plugin", "nopcommerce plugin", "payment plugin", "widget zone", "plugin.json", "ISettings nop", "nopCommerce entity", or any nopCommerce namespace like `Nop.Core`, `Nop.Services`, `Nop.Web.Framework`.
---

# nopCommerce Development Guide

nopCommerce is an open-source ASP.NET Core e-commerce platform. This skill covers the patterns and conventions you need to build plugins, customizations, and integrations correctly.

**Current versions:** nopCommerce 4.90 / .NET 9.0

**Always check** `references/` for deep dives on specific topics:
- `references/plugin-types.md` — payment, shipping, tax, widget, misc plugin interfaces
- `references/data-access.md` — custom entities, FluentMigrator, IRepository<T>
- `references/services-di.md` — dependency injection, INopStartup, events

---

## Plugin Structure

Every plugin needs these two files at minimum:

### plugin.json
```json
{
  "Group": "Payment methods",
  "FriendlyName": "My Payment Method",
  "SystemName": "Payments.MyPayment",
  "Version": "4.90.1",
  "SupportedVersions": [ "4.90" ],
  "Author": "Your Company",
  "DisplayOrder": 1,
  "FileName": "Nop.Plugin.Payments.MyPayment.dll",
  "Description": "Brief description of the plugin"
}
```

**Group** values: `"Payment methods"`, `"Shipping rate computation"`, `"Tax providers"`, `"Widgets"`, `"Misc"`, `"Authentication"`, `"Pickup point providers"`, `"Address validators"`, `"Multi-factor authentication"`.

**SystemName** convention: `{Group}.{PluginName}` — e.g., `Payments.Stripe`, `Widgets.GoogleAnalytics`, `Misc.ProductViewTracker`.

### .csproj
```xml
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net9.0</TargetFramework>
    <OutputPath>..\..\Presentation\Nop.Web\Plugins\{SystemName}</OutputPath>
    <OutDir>$(OutputPath)</OutDir>
    <CopyLocalLockFileAssemblies>true</CopyLocalLockFileAssemblies>
  </PropertyGroup>
  <ItemGroup>
    <ProjectReference Include="..\..\Libraries\Nop.Services\Nop.Services.csproj" />
    <ProjectReference Include="..\..\Presentation\Nop.Web.Framework\Nop.Web.Framework.csproj" />
  </ItemGroup>
  <!-- Copy views to output -->
  <ItemGroup>
    <None Update="Views\**\*.*">
      <CopyToOutputDirectory>PreserveNewest</CopyToOutputDirectory>
    </None>
    <None Update="plugin.json">
      <CopyToOutputDirectory>PreserveNewest</CopyToOutputDirectory>
    </None>
  </ItemGroup>
</Project>
```

---

## BasePlugin — The Foundation

All plugins extend `BasePlugin`. Override `InstallAsync` / `UninstallAsync` to manage settings, localization strings, and DB schema:

```csharp
public class MyPlugin : BasePlugin
{
    private readonly ISettingService _settingService;
    private readonly ILocalizationService _localizationService;

    public MyPlugin(ISettingService settingService, ILocalizationService localizationService)
    {
        _settingService = settingService;
        _localizationService = localizationService;
    }

    public override async Task InstallAsync()
    {
        await _settingService.SaveSettingAsync(new MyPluginSettings { IsEnabled = true });

        await _localizationService.AddOrUpdateLocaleResourceAsync(new Dictionary<string, string>
        {
            ["Plugins.MyPlugin.Fields.IsEnabled"] = "Enable plugin",
            ["Plugins.MyPlugin.Fields.IsEnabled.Hint"] = "Check to enable the plugin."
        });

        await base.InstallAsync();
    }

    public override async Task UninstallAsync()
    {
        await _settingService.DeleteSettingAsync<MyPluginSettings>();
        await _localizationService.DeleteLocaleResourcesAsync("Plugins.MyPlugin");
        await base.UninstallAsync();
    }
}
```

The calls to `base.InstallAsync()` / `base.UninstallAsync()` are required — they register/deactivate the plugin in the system.

---

## Settings

Create a settings class implementing `ISettings` — nopCommerce serializes it automatically:

```csharp
using Nop.Core.Configuration;

public class MyPluginSettings : ISettings
{
    public bool IsEnabled { get; set; }
    public string ApiKey { get; set; }
    public decimal AdditionalFee { get; set; }
    public bool AdditionalFeePercentage { get; set; }
}
```

Use `ISettingService` to load, save, and delete. Settings are automatically multi-store aware — pass `storeId` to scope them:

```csharp
// Load
var settings = await _settingService.LoadSettingAsync<MyPluginSettings>(storeId);

// Save a specific property (for multi-store)
await _settingService.SaveSettingOverridablePerStoreAsync(settings, x => x.ApiKey, model.ApiKey_OverrideForStore, storeId, clearCache: false);
await _settingService.ClearCacheAsync();

// Delete all settings for a type
await _settingService.DeleteSettingAsync<MyPluginSettings>();
```

---

## Admin Controller

Admin controllers go in `Controllers/` and inherit `BasePluginController`:

```csharp
using Microsoft.AspNetCore.Mvc;
using Nop.Web.Framework;
using Nop.Web.Framework.Controllers;
using Nop.Web.Framework.Mvc.Filters;

[AutoValidateAntiforgeryToken]
[AuthorizeAdmin]
[Area(AreaNames.ADMIN)]
public class MyPluginController : BasePluginController
{
    private readonly ISettingService _settingService;
    private readonly MyPluginSettings _settings;
    private readonly IStoreContext _storeContext;

    public MyPluginController(ISettingService settingService,
        MyPluginSettings settings,
        IStoreContext storeContext)
    {
        _settingService = settingService;
        _settings = settings;
        _storeContext = storeContext;
    }

    public async Task<IActionResult> Configure()
    {
        var storeId = await _storeContext.GetActiveStoreScopeConfigurationAsync();
        var settings = await _settingService.LoadSettingAsync<MyPluginSettings>(storeId);

        var model = new ConfigurationModel
        {
            IsEnabled = settings.IsEnabled,
            ApiKey = settings.ApiKey,
            ActiveStoreScopeConfiguration = storeId
        };

        return View("~/Plugins/MyGroup.MyPlugin/Views/Configure.cshtml", model);
    }

    [HttpPost]
    public async Task<IActionResult> Configure(ConfigurationModel model)
    {
        if (!ModelState.IsValid)
            return await Configure();

        var storeId = await _storeContext.GetActiveStoreScopeConfigurationAsync();
        var settings = await _settingService.LoadSettingAsync<MyPluginSettings>(storeId);

        settings.IsEnabled = model.IsEnabled;
        settings.ApiKey = model.ApiKey;
        await _settingService.SaveSettingAsync(settings, storeId);

        return RedirectToAction("Configure");
    }
}
```

**View path pattern:** `~/Plugins/{SystemName}/Views/{ViewName}.cshtml`
The SystemName folder name must match exactly (e.g., `Payments.MyPayment`).

---

## Routing

Register plugin-specific routes via `IRouteProvider`:

```csharp
using Nop.Web.Framework.Mvc.Routing;
using Microsoft.AspNetCore.Routing;

public class RouteProvider : IRouteProvider
{
    public void RegisterRoutes(IEndpointRouteBuilder endpointRouteBuilder)
    {
        // Admin routes (already handled via Area, but explicit routes help)
        endpointRouteBuilder.MapControllerRoute(
            "Plugin.MyPlugin.Configure",
            "Admin/MyPlugin/Configure",
            new { controller = "MyPlugin", action = "Configure" });

        // Public-facing routes
        endpointRouteBuilder.MapControllerRoute(
            "Plugin.MyPlugin.Return",
            "myplugin/return",
            new { controller = "MyPluginPublic", action = "Return" });
    }

    public int Priority => 0;
}
```

---

## Dependency Injection

Register your services by implementing `INopStartup`:

```csharp
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Nop.Core.Infrastructure;

public class NopStartup : INopStartup
{
    public void ConfigureServices(IServiceCollection services, IConfiguration configuration)
    {
        services.AddScoped<IMyCustomService, MyCustomService>();
        services.AddSingleton<IMyCacheService, MyCacheService>();
    }

    public void Configure(IApplicationBuilder application) { }

    public int Order => 3000; // Higher = runs later, can override defaults
}
```

---

## Widget Plugins

See `references/plugin-types.md` for full widget implementation. Quick summary:

```csharp
public class MyWidgetPlugin : BasePlugin, IWidgetPlugin
{
    public bool HideInWidgetList => false;

    public Type GetWidgetViewComponent(string widgetZone) => typeof(MyWidgetViewComponent);

    public Task<IList<string>> GetWidgetZonesAsync() =>
        Task.FromResult<IList<string>>(new List<string>
        {
            PublicWidgetZones.HomepageTop,
            PublicWidgetZones.ProductDetailsTop,
        });
}
```

**Common public zones:** `HomepageTop`, `HomepageBottom`, `ProductDetailsTop`, `ProductDetailsBottom`, `CategoryDetailsTop`, `HeaderLinks`, `Footer`.
**Common admin zones:** `AdminHeaderLinks`, `AdminProductListButtons`.

View component:
```csharp
using Nop.Web.Framework.Components;

[ViewComponent(Name = "MyWidget")]
public class MyWidgetViewComponent : NopViewComponent
{
    public async Task<IViewComponentResult> InvokeAsync(string widgetZone, object additionalData)
    {
        var model = new MyWidgetModel { Zone = widgetZone };
        return View("~/Plugins/Widgets.MyWidget/Views/PublicInfo.cshtml", model);
    }
}
```

---

## Data Access (Custom Entities)

Read `references/data-access.md` for full details. Pattern summary:

1. **Entity** → extend `BaseEntity` (no navigation properties — use Linq2DB)
2. **Builder** → extend `NopEntityBuilder<T>`, define columns/FKs
3. **Migration** → extend `ForwardOnlyMigration` with `[NopSchemaMigration]` attribute
4. **Service** → inject `IRepository<T>`, use LINQ queries on `_repository.Table`
5. **Register** → wire up `IMyService → MyService` in `NopStartup`

---

## Events

Subscribe to nopCommerce domain events by implementing `IConsumer<T>`:

```csharp
using Nop.Core.Events;
using Nop.Core.Domain.Orders;

public class OrderConsumer : IConsumer<EntityInsertedEvent<Order>>
{
    private readonly IMyService _myService;

    public OrderConsumer(IMyService myService) { _myService = myService; }

    public async Task HandleEventAsync(EntityInsertedEvent<Order> eventMessage)
    {
        var order = eventMessage.Entity;
        await _myService.ProcessNewOrderAsync(order);
    }
}
```

Common events: `EntityInsertedEvent<T>`, `EntityUpdatedEvent<T>`, `EntityDeletedEvent<T>`, `OrderPaidEvent`, `CustomerRegisteredEvent`.

To publish: inject `IEventPublisher` and call `await _eventPublisher.PublishAsync(new MyCustomEvent(data))`.

---

## Common Patterns & Gotchas

- **No navigation properties on entities** — Linq2DB doesn't support EF-style navigation props. Load related data with separate `IRepository<T>` queries.
- **Caching** — use `IStaticCacheManager` with `CacheKey` objects. Keys should include store ID and language ID where relevant.
- **Localization** — all user-facing strings go through `ILocalizationService`. Add resources in `InstallAsync`, remove in `UninstallAsync`.
- **Multi-store** — always scope settings and data by `storeId` from `IStoreContext.GetActiveStoreScopeConfigurationAsync()`.
- **Model validators** — put FluentValidation validators in `Validators/` and decorate the model with `[Validator(typeof(MyModelValidator))]`.
- **ACL / Permissions** — implement `IPermissionProvider` and call `_permissionService.AuthorizeAsync(MyPermissionProvider.MyPermission)`.
- **Scheduled tasks** — implement `IScheduleTask` and register in `InstallAsync` via `IScheduleTaskService.InsertTaskAsync`.
- **View locations** — views must be at `~/Plugins/{SystemName}/Views/` and declared in `EmbeddedProvider` or copied to output (prefer copy-to-output via .csproj).

---

## Build, test & Gate-1 (this repo)

This section applies to the SplatDev fleet's nopCommerce plugin repo:
**`github.com/splatdevtech/SplatDev.NopCommerce.Plugins`**, branch **`master`**. Solution file is
**`NopCommerce.slnx`** (the newer `.slnx` XML format, not `.sln`). Target stack is **nopCommerce
4.90 / .NET 9.0 (`net9.0`)** — confirmed in `Directory.Build.props` and the CI workflow's
`DOTNET_VERSION: '9.0.x'`.

### Build

```sh
dotnet restore NopCommerce.slnx
dotnet build NopCommerce.slnx -c Release
```

CI (`.github/workflows/ci-cd.yml`, `typecheck` job) runs exactly this restore+build of the full
solution in `Release` and is a strict superset of anything a local Gate-1 run checks — a
solution-wide compile break, a naming/type collision with another plugin, or a regression in a
*different* `SplatDev.*` project can fail CI even when a single-plugin Gate-1 run passes. A red CI
`typecheck`/`test` check always wins over a local Gate-1 pass; never merge on a stale/local-only
green.

### Two test tiers

1. **Unit (mocked, CI-required — every PR):**
   ```sh
   dotnet test NopCommerce.slnx --filter "Category!=Integration"
   ```
   CI runs the equivalent per-project, looping only the SplatDev test projects (not the stock
   nopCommerce core/plugin test suites, which are slow and out of scope):
   ```sh
   for proj in Tests/SplatDev.*/*.csproj; do
     dotnet test "$proj" --no-build -c Release --filter "Category!=Integration"
   done
   ```
   All external HTTP calls must be mocked (RichardSzalay.MockHttp) and nopCommerce services mocked
   with Moq — never hit a live external endpoint or a live DB from this tier.

2. **Live/integration (opt-in, operator-run — required per plugin that calls an external API):**
   ```sh
   dotnet test Tests/<Plugin>.Tests --filter Category=Integration
   ```
   One `[Trait("Category", "Integration")]` test class per plugin, reading credentials from
   **environment variables only** (never hardcoded), constructing the *real* plugin service against
   the *real* sandbox API. It must **soft-skip green** when its env vars are absent, so CI and
   credential-less runs stay green — this tier is excluded from CI via the same
   `Category!=Integration` filter and is meant to be run manually by an operator against sandbox
   credentials. N/A only for plugins with no external API to hit (flat-rate/manual shipping,
   purely client-side widgets) — mark those n/a in the status tracker.

   See the `nopcommerce-plugin-testing` skill for the full test-project scaffolding (xUnit
   2.9.2 / xunit.runner.visualstudio 2.8.2 / Moq 4.20.72 / RichardSzalay.MockHttp 7.0.0 /
   Microsoft.NET.Test.Sdk 17.12.0 pin, `IsPackable=false`, `Tests/<Plugin>.Tests` layout).

### Gate-1 verify

```sh
scripts/verify-plugin-gate1.sh --plugin <ProjectName>
```

`<ProjectName>` is the plugin's folder name under `Plugins/`, e.g.
`SplatDev.Nop.Plugin.Payments.PagBank`. The script does the following, stopping at the first
failure:

1. **Changed-path guard.** Reads `CHANGED_FILES` (newline- or space-separated paths, e.g.
   `CHANGED_FILES="$(gh pr diff <pr#> --name-only)"`) and rejects (exit 2) any diff that touches a
   **stock** nopCommerce plugin path (`Plugins/Nop.Plugin.*` — but *not* `Plugins/SplatDev.*`) or
   anything outside the allowed roots: `Plugins/SplatDev.*`, `Tests/*`, `marketplace/*`, `docs/*`,
   `scripts/*`, or a root `*.slnx`/`*.sln` file. An **empty or unset `CHANGED_FILES` is itself a
   rejection (fail-closed, exit 2)** — it must never pass vacuously — unless the caller explicitly
   opts in with `--allow-empty-changes` for an intentional plugin-name-only check. The guard also
   rejects a stock plugin name passed directly via `--plugin` as defense in depth.
2. **Build** — `dotnet build` of the plugin's own `.csproj`.
3. **Test** — `dotnet test` of `Tests/<ProjectName>.Tests`.

On success it prints `GATE1 PASS: <plugin>`. Gate-1 is necessary but not sufficient: a human
reviewer must still confirm diff scope, PII-masking presence, and hardening-checklist coverage
before merge — see `docs/superpowers/runbooks/fleet-monitor-loop.md` for the full reviewer/merge-gate
procedure if you're operating the fleet loop, and the `paperclip-fleet-orchestration` skill for the
Paperclip-board side of that loop.

### Plugin `.csproj` output convention

```xml
<OutputPath>$(SolutionDir)/Presentation/Nop.Web/Plugins/<SystemName></OutputPath>
<OutDir>$(OutputPath)</OutDir>
```

Output goes to `Presentation/Nop.Web/Plugins/<SystemName>` (the plugin's `SystemName`, e.g.
`Payments.PagBank` — not the `Plugins/SplatDev.Nop.Plugin.*` project folder name). Every plugin
`.csproj` must also wire the post-build strip step, which deletes the framework/shared DLLs that
.NET's build otherwise copies into every plugin's output folder unnecessarily:

```xml
<ItemGroup>
  <ClearPluginAssemblies Include="$(SolutionDir)/Build/ClearPluginAssemblies.proj" />
</ItemGroup>
<Target Name="NopTarget" AfterTargets="Build">
  <MSBuild Projects="@(ClearPluginAssemblies)" Properties="PluginPath=$(OutDir)" Targets="NopClear" />
</Target>
```

**Cross-references** — this section covers build/test/Gate-1 only:
- For packaging and submitting the built plugin to the nopCommerce.com marketplace (ZIPs, logo,
  screenshots, listing form), use the **`nopcommerce-marketplace-deploy`** skill.
- For scaffolding a plugin's `*.Tests` project (xUnit conventions, mocking patterns, unhappy-path
  coverage), use the **`nopcommerce-plugin-testing`** skill.

---

## Definition of Done (hardening)

Condensed from `docs/superpowers/HARDENING-CHECKLIST.md` — the single source of truth for Track A
Definition of Done in the SplatDev fleet repo. Every hardening PR must satisfy all of these before
it is merge-eligible:

- **Build green** — `dotnet build NopCommerce.slnx -c Release` (or the plugin's own `.csproj`)
  succeeds with no errors.
- **Unit tests green** — the plugin's `*.Tests` project covers every unhappy path (non-2xx, timeout,
  invalid/missing config, missing credentials, declined payment, empty rate quote, malformed
  webhook, duplicate/replayed callback) plus pure logic (parsers, signature/HMAC validation,
  rate/tax tables, mapping code). All external HTTP mocked with RichardSzalay.MockHttp; nopCommerce
  services mocked with Moq — no live DB/host dependency.
- **Gate-1 green** — `scripts/verify-plugin-gate1.sh --plugin <ProjectName>` passes (guard + build +
  test), and no diff touches a stock `Plugins/Nop.Plugin.*` path or anything outside the allowed
  roots.
- **PII masking present and reviewed** — every log line or exception message that could carry a
  CPF, CNPJ, card PAN/CVV, or a token/API key/secret is routed through `PiiMask` (see "Logging &
  PII" below). This is a Gate-1 blocker, not a style preference.
- **Unhappy paths resolve to a typed result** — every case in the checklist above returns a typed
  failure/result plus a merchant/customer-facing message; never an unhandled exception, never a
  bare 500, never an NRE on an empty collection.
- **Logo wired** — `logo.png` (140×140) and `logo-512.png` (512×512) present, following the
  brand-vs-function rule (brand plugins embed the real unmodified mark; non-brand plugins depict
  function).
- **Marketplace-zip builds** — a compiled ready-to-deploy ZIP ≤10 MB with `uploadedItems.json` at
  the archive root builds cleanly via `scripts/build-marketplace-zips.sh`, plus a source ZIP (no
  `.git`) or GitHub URL.
- **No out-of-scope diffs** — every changed path is under `Plugins/SplatDev.*`, `Tests/*`,
  `marketplace/*`, `docs/*`, `scripts/*`, or a root `*.slnx`/`*.sln` edit; nothing touches a
  different plugin's files or an unrelated part of the repo.
- **Live sandbox integration test (where applicable)** — any plugin calling an external API ships a
  `[Trait("Category", "Integration")]` test class per the live tier above; soft-skips green when
  sandbox env vars are absent, excluded from CI. N/A only for plugins with no external API (mark
  n/a in the status tracker).

Full detail (exact masking patterns, per-category test-stack pinning, marketplace registry-entry
rules, description length/format constraints) lives in
`docs/superpowers/HARDENING-CHECKLIST.md` in the fleet repo — treat this section as the condensed
summary, that file as the source of truth if the two ever disagree.

**Anti-fabrication:** real proof of "done" is a build/test log (Gate-1 output, a `dotnet test`
run, a CI check-run link) — never a blank or staged screenshot. Do not report a checklist item
satisfied without the command output that demonstrates it.

---

## Logging & PII

Ported from `docs/superpowers/conventions/logging-and-pii.md` — the single source of truth for how
every SplatDev plugin logs and masks PII. Global constraints in the fleet plan apply on top of
this.

### Logger

- Use `Nop.Services.Logging.ILogger` (namespace `Nop.Services.Logging`), injected via constructor,
  for all logging in every plugin.
- **Never** use `Microsoft.Extensions.Logging.ILogger`/`ILogger<T>` — it bypasses nopCommerce's log
  storage/admin UI and is rejected in review.
- Call `Information` / `Warning` / `Error` directly — don't wrap them in a custom abstraction unless
  a plugin already has one for another approved reason.
- Log every external API request/response (HTTP status + correlation id), every webhook/callback
  receipt (source, event type, correlation id), every config-load failure, and every caught
  exception with context — never swallow an exception silently.

Log levels: **Information** for lifecycle events (install/uninstall, config saved, successful API
call, successful webhook, order/payment state transitions); **Warning** for handled-degraded
conditions (empty shipping quote, declined payment, safely-rejected malformed webhook, a retryable
timeout); **Error** for unexpected/unhandled conditions, always passing the exception as the second
argument (`_logger.Error(message, exception)`).

Every log line for a single external interaction carries a correlation id, prefixed in square
brackets — `[{correlationId}] message` — selected once at the start of the operation (gateway/
carrier transaction id, else `Order.CustomOrderNumber`/`Order.Id`, else a fresh
`Guid.NewGuid().ToString("N")[..8]`) and held fixed for that operation's lifetime, including
retries.

```csharp
_logger.Information($"[{correlationId}] Payment authorized for order {orderId}.");
_logger.Warning($"[{correlationId}] Shipping quote returned zero rates for order {orderId}.");
_logger.Error($"[{correlationId}] Failed to call gateway API for order {orderId}.", ex);
```

### Mandatory PII masking

Any log line or exception context that could contain a CPF, CNPJ, card number, or a token/API
key/secret **MUST** route through `PiiMask` before it reaches `ILogger` — raw PII in a log call is
a Gate-1 blocker, not a style preference. When in doubt whether a field is PII, mask it —
under-masking is a review blocker, over-masking is not.

Copy this helper **verbatim** into each plugin's `Services` folder as `PiiMask.cs`, adjusting only
the namespace — do not rename or change the method signatures:

```csharp
// PiiMask.cs — copy verbatim into each plugin's Services folder. Do not diverge.
namespace SplatDev.Nop.Plugin.Shared; // adjust namespace to the plugin

public static class PiiMask
{
    public static string Cpf(string? v)
    {
        var d = Digits(v);
        return d.Length == 11 ? $"{d[..3]}.***.***-**" : "***";
    }

    public static string Cnpj(string? v)
    {
        var d = Digits(v);
        return d.Length == 14 ? $"{d[..2]}.***.***/****-**" : "***";
    }

    public static string Card(string? v)
    {
        var d = Digits(v);
        return d.Length >= 4 ? $"****{d[^4..]}" : "****";
    }

    public static string Token(string? v) =>
        string.IsNullOrEmpty(v) ? "***" : $"{v[..System.Math.Min(4, v.Length)]}…(len {v.Length})";

    private static string Digits(string? v) =>
        new string((v ?? string.Empty).Where(char.IsDigit).ToArray());
}
```

```csharp
_logger.Information($"[{correlationId}] Received checkout for CPF {PiiMask.Cpf(customer.Cpf)}.");
_logger.Error($"[{correlationId}] Gateway call failed for card {PiiMask.Card(request.CardNumber)}.", ex);
```

| Method | Input | Output |
| --- | --- | --- |
| `Cpf` | 11-digit CPF | `123.***.***-**` |
| `Cpf` | `null`/empty/not 11 digits | `***` |
| `Cnpj` | 14-digit CNPJ | `12.***.***/****-**` |
| `Cnpj` | `null`/empty/not 14 digits | `***` |
| `Card` | PAN with ≥4 digits | `****` + last 4 digits |
| `Card` | `null`/empty/<4 digits | `****` |
| `Token` | non-empty string | first 4 chars + `…(len N)` |
| `Token` | `null`/empty | `***` |

Never log a secret or a full PAN under any circumstance, including in exception messages you
construct yourself — interpolating a raw CPF/CNPJ/card/token into an exception message is the same
violation as logging it directly.
