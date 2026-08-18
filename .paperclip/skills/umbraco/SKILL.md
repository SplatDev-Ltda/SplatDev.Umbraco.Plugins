---
name: umbraco
description: Development standards and patterns for Umbraco CMS versions 13–17 on .NET 8+. Use whenever writing Umbraco controllers, templates, services, composers, property editors, backoffice extensions, or database migrations. Covers ModelsBuilder, Block List/Grid editors, Bellissima (v14+ backoffice), and version-specific guidance.
---

# Umbraco CMS — Development Standards (v13–v17)

**Stack**: Umbraco 13–17 · .NET 8/9/10 · C# · Razor views · MSSQL or SQLite

Before writing any Umbraco-specific code, **check Context7** (`/umbraco/umbracodocs`) for the latest API and the current version's breaking changes. Umbraco evolves rapidly between majors.

---

## Version Quick Reference

| Version | .NET | Backoffice  | Key change |
|---------|------|-------------|------------|
| 13      | 8    | AngularJS   | LTS; Nested Content deprecated → Block List |
| 14      | 8    | **Bellissima** (Lit/Web Components) | AngularJS removed; new extension API |
| 15      | 9    | Bellissima  | Delivery API stable; Block Grid GA |
| 16      | 9/10 | Bellissima  | Content Versioning improvements |
| 17      | 10   | Bellissima  | Long-term support candidate |

> When working on a project, confirm the exact version: `cat *.csproj | grep "Umbraco.Cms"` → check PackageReference version.

---

## Project Structure

```
src/
├── MyProject.Web/
│   ├── App_Plugins/          # Backoffice extensions (JS/JSON manifests)
│   ├── umbraco/              # Umbraco admin config, models, data
│   ├── Views/                # Razor templates (.cshtml)
│   │   ├── _Layout.cshtml
│   │   └── Partials/
│   ├── ViewModels/           # Strong-typed view models
│   ├── Controllers/          # Surface + API controllers
│   ├── Composers/            # IComposer DI registration
│   ├── Notifications/        # INotificationHandler<T> handlers
│   └── Migrations/           # Database migration plans
```

---

## Content Modelling

**Document types** define the structure of content nodes. Always use:
- Aliases in camelCase: `heroHeadline`, `pageDescription`
- Compositions for shared property groups (e.g., `MetaDataComposition`)
- Element types for Block List / Block Grid content elements

**Read properties in Razor** (prefer strongly-typed ModelsBuilder output):
```csharp
// Auto-generated model (ModelsBuilder InMemory or AppCode mode)
@inherits Umbraco.Cms.Web.Common.Views.UmbracoViewPage<ContentModels.HomePage>
@using ContentModels = Umbraco.Cms.Web.Common.PublishedModels;

<h1>@Model.HeroHeadline</h1>
```

**Read properties in fallback mode** (no ModelsBuilder):
```csharp
@inherits Umbraco.Cms.Web.Common.Views.UmbracoViewPage
@Model.Value<string>("heroHeadline")
@Model.Value<IEnumerable<IPublishedContent>>("relatedPages")
```

**ModelsBuilder modes** (configured in `appsettings.json`):
```json
"Umbraco": {
  "CMS": {
    "ModelsBuilder": {
      "ModelsMode": "InMemoryAuto"
    }
  }
}
```
Prefer `InMemoryAuto` for dev, `Nothing` if using custom ViewModels everywhere.

---

## Templates & Views

Templates live in `Views/`. Each Document type maps to a `.cshtml` file by alias.

```csharp
@inherits Umbraco.Cms.Web.Common.Views.UmbracoViewPage
@{
    Layout = "_Layout.cshtml";
}
<h1>@Model.Name</h1>
```

**Partial views**: placed in `Views/Partials/`, rendered via:
```csharp
@Html.Partial("~/Views/Partials/NavigationMenu.cshtml", someViewModel)
```

**Partial view macros**: the macro engine was removed in Umbraco 10. For v13+ always use Razor partials or View Components — never macros.

---

## Routing

Umbraco handles routing via its own pipeline. Understand the order:

1. Umbraco virtual nodes (from content tree)
2. Custom routes registered via `IUmbracoBuilder`
3. MVC routes

**Custom route (hijack existing content node)**:
```csharp
// Controller must match Document Type alias
public class HomePageController : RenderController
{
    public HomePageController(ILogger<RenderController> logger, ICompositeViewEngine compositeViewEngine, IUmbracoContextAccessor umbracoContextAccessor)
        : base(logger, compositeViewEngine, umbracoContextAccessor) { }

    public override IActionResult Index()
    {
        var viewModel = new HomePageViewModel(CurrentPage!);
        return CurrentTemplate(viewModel);
    }
}
```

**Surface controller** (form posts, child actions):
```csharp
public class ContactFormController : SurfaceController
{
    public ContactFormController(IUmbracoContextAccessor umbracoContextAccessor,
        IUmbracoDatabaseFactory databaseFactory, ServiceContext services,
        AppCaches appCaches, IProfilingLogger profilingLogger, IPublishedUrlProvider publishedUrlProvider)
        : base(umbracoContextAccessor, databaseFactory, services, appCaches, profilingLogger, publishedUrlProvider) { }

    [HttpPost]
    public IActionResult SubmitContact(ContactFormViewModel model)
    {
        if (!ModelState.IsValid) return CurrentUmbracoPage();
        // handle form
        return RedirectToCurrentUmbracoPage();
    }
}
```

---

## Service Layer

See `references/services.md` for the full services reference.

**Key services** (inject via DI in constructors):

| Service | Use for |
|---------|---------|
| `IContentService` | CRUD operations on content nodes |
| `IMediaService` | CRUD on media nodes |
| `IPublishedContentQuery` | Query published content tree |
| `IUmbracoContextAccessor` | Access current request's UmbracoContext |
| `IPublishedUrlProvider` | Get URLs for content nodes |
| `ITagService` | Read/write tags |
| `IMemberService` | Member management |
| `IScopeProvider` | Wrap DB operations in a transaction scope |
| `IContentTypeService` | Read/write document type definitions |

**Example — query content by document type**:
```csharp
public class ProductService(IPublishedContentQuery contentQuery)
{
    public IEnumerable<IPublishedContent> GetAllProducts() =>
        contentQuery.ContentOfType("productPage");
}
```

**Scoped DB access** (custom tables):
```csharp
using var scope = _scopeProvider.CreateScope();
var db = scope.Database;
var rows = db.Fetch<MyDto>("SELECT * FROM myTable WHERE active = 1");
scope.Complete();
```

---

## Composers & DI Registration

Use `IComposer` to register services, handlers, and configure the application:

```csharp
public class MyProjectComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.Services.AddScoped<IProductService, ProductService>();
        builder.AddNotificationHandler<ContentPublishedNotification, ContentPublishedHandler>();
    }
}
```

No `[assembly: RuntimeLevel]` attribute needed in v13+. Composers are auto-discovered.

---

## Notifications (Events)

Replace the old `ContentService.Published` events with typed notification handlers:

```csharp
public class ContentPublishedHandler : INotificationHandler<ContentPublishedNotification>
{
    private readonly ILogger<ContentPublishedHandler> _logger;

    public ContentPublishedHandler(ILogger<ContentPublishedHandler> logger) => _logger = logger;

    public void Handle(ContentPublishedNotification notification)
    {
        foreach (var content in notification.PublishedEntities)
        {
            _logger.LogInformation("Published: {Name}", content.Name);
        }
    }
}
```

Register in composer: `builder.AddNotificationHandler<ContentPublishedNotification, ContentPublishedHandler>();`

Common notifications: `ContentPublishedNotification`, `ContentSavingNotification`, `ContentDeletingNotification`, `MediaSavedNotification`, `MemberSavedNotification`.

---

## Block List & Block Grid Editors

**Block List** — ordered list of element type instances:
```csharp
@{
    var blocks = Model.Value<IEnumerable<BlockListItem>>("myBlockList");
    foreach (var block in blocks)
    {
        @Html.Partial("Partials/Blocks/" + block.Content.ContentType.Alias, block)
    }
}
```

**Block Grid** — area-based layout (v14+ recommended over Block List for page layouts):
```csharp
@* Renders all areas using partial views in Views/Partials/blockgrid/ by element type alias *@
@await Html.GetBlockGridHtmlAsync(Model, "pageGrid")
```

Block Grid renders via partial views in `Views/Partials/blockgrid/` automatically by alias.

**Element types**: always create as compositions for reuse across Block List and Block Grid.

---

## Database Migrations

Create custom tables or modify schema using migration plans:

```csharp
public class MyMigrationPlan : MigrationPlan
{
    public MyMigrationPlan() : base("MyProject")
    {
        From(string.Empty)
            .To<AddMyTable>("v1.0.0");
    }
}

public class AddMyTable : MigrationBase
{
    public AddMyTable(IMigrationContext context) : base(context) { }

    protected override void Migrate()
    {
        if (!TableExists("myTable"))
        {
            Create.Table<MyTableDto>().Do();
        }
    }
}
```

Register via composer:
```csharp
builder.AddComponent<RunMigrationsComponent>();
```

Component:
```csharp
public class RunMigrationsComponent(IRuntimeState runtimeState, IMigrationPlanExecutor migrationPlanExecutor, IKeyValueService keyValueService, ILogger<RunMigrationsComponent> logger) : IComponent
{
    public void Initialize()
    {
        if (runtimeState.Level < RuntimeLevel.Run) return;
        var upgrader = new Upgrader(new MyMigrationPlan());
        upgrader.Execute(migrationPlanExecutor, keyValueService, logger);
    }

    public void Terminate() { }
}
```

---

## Backoffice Extension (v14+ Bellissima)

See `references/backoffice.md` for the full Bellissima guide.

v14 removed AngularJS entirely. Extensions now use Web Components + Lit + `umbraco-package.json`.

**`App_Plugins/MyExtension/umbraco-package.json`** (manifest):
```json
{
  "$schema": "../../umbraco-package-schema.json",
  "name": "My Extension",
  "version": "1.0.0",
  "extensions": [
    {
      "type": "dashboard",
      "alias": "My.Dashboard",
      "name": "My Dashboard",
      "element": "/App_Plugins/MyExtension/my-dashboard.js",
      "weight": 100,
      "meta": {
        "label": "My Dashboard",
        "pathname": "my-dashboard"
      },
      "conditions": [
        { "alias": "Umb.Condition.SectionAlias", "match": "Umb.Section.Content" }
      ]
    }
  ]
}
```

**Web Component (Lit)**:
```typescript
import { LitElement, html, css, customElement } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";

@customElement("my-dashboard")
export class MyDashboard extends UmbElementMixin(LitElement) {
    static styles = css`...`;

    render() {
        return html`<uui-box><h2>My Dashboard</h2></uui-box>`;
    }
}

export default MyDashboard;
```

Use `uui-*` components (Umbraco UI Library), not `umb-*` (removed in v14).

---

## Delivery API (v12+, GA in v14+)

Headless content delivery without custom controllers:

```json
"Umbraco": {
  "CMS": {
    "DeliveryApi": {
      "Enabled": true,
      "PublicAccess": false
    }
  }
}
```

> **Never hardcode the API key in `appsettings.json`** — store it in an environment variable (`UMBRACO__CMS__DELIVERYAPI__APIKEY`) or user secrets / Azure Key Vault.

Callers send the key as a request header: `Api-Key: <value>`

Query: `GET /umbraco/delivery/api/v2/content?fetch=children:/root&fields=properties[$all]`

Use for: decoupled front-ends (Next.js, Nuxt, React, etc.) consuming Umbraco as a headless CMS.

---

## Configuration Pattern

Always prefer `appsettings.json` with typed options over hard-coded values:

```json
"MyProject": {
  "ContactEmail": "contact@example.com",
  "MaxItemsPerPage": 12
}
```

```csharp
public class MyProjectOptions
{
    public string ContactEmail { get; set; } = string.Empty;
    public int MaxItemsPerPage { get; set; } = 10;
}

// In composer:
builder.Services.Configure<MyProjectOptions>(
    builder.Config.GetSection("MyProject"));
```

---

## Common Gotchas

- **Never call `IContentService` in a Razor view** — it hits the DB directly and bypasses cache. Use `IPublishedContentQuery` or `Model.Children` instead.
- **Scope the DB or it'll leak** — always wrap `IScopeProvider` in `using var scope = ...` and call `scope.Complete()` on success.
- **ModelsBuilder race conditions** — in multi-instance deployments, set ModelsMode to `Nothing` and generate models via CLI.
- **Block List vs Block Grid** — Block List is a flat list; Block Grid supports areas/columns. For page builders use Block Grid.
- **v14 backoffice** — AngularJS code (`.controller.js`, `package.manifest`) no longer works. Must migrate to `umbraco-package.json` + Lit Web Components.
- **Delivery API auth** — Requires API key header `Api-Key: <value>` or configure public access for anonymous content.
