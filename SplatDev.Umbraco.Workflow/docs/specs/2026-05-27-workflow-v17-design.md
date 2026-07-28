# SplatDev.Umbraco.Workflow — v17 Design (Bellissima / Lit 3)

**Status:** Draft for review
**Date:** 2026-05-27
**Target:** Umbraco 17.x · .NET 10 · Bellissima (Lit 3) backoffice
**Predecessor:** See `docs/specs/2026-05-26-workflow-plugin-design.md` (Umbraco 13 / AngularJS)

---

## 1. Goals & Non-Goals

### Goals
- **Port the v13 Workflow plugin backoffice** from AngularJS to Lit 3 / Bellissima web components.
- **Reuse all C# layers**: `Core`, `Persistence`, `Api` are unchanged. Only the UI package changes.
- Provide the same features as v13: Queue dashboard, Pizza-delivery chart, Config Editor, Themes panel.
- Follow Umbraco 17 extension API conventions: `umbraco-package.json`, sections, workspaces, entity-actions, Lit 3.
- Ship as `SplatDev.Umbraco.Workflow` targeting `net10.0` (alongside the existing `net8.0` target).
- Register a new Umbraco 17 **section** — `SplatDev Workflow` — with Workspace-based routing.
- All 3 themes (Classic, Modern, Compact) available from v1.

### Non-Goals (v17 v1)
- New C# backend features beyond the v13 API surface.
- Umbraco 13 support in this package (the `net8.0` / AngularJS package is separate).
- Auto-assign rule DSL (deferred from v13 v1 as well).
- Multi-tenant scoping.

---

## 2. What Changes vs v13

| Concern | v13 (AngularJS) | v17 (Lit 3) |
|---|---|---|
| Manifest | `package.manifest` | `umbraco-package.json` |
| Section registration | `ISection` C# class | Extension type `section` in JSON |
| Tree | `ITreeController` C# | Extension type `menuItem` / `workspaceRouteBuilder` |
| Dashboards | AngularJS templates | Lit 3 `@customElement` web components |
| Directives (chart, table) | `splat-workflow-*` AngularJS directives | Lit 3 custom elements |
| DI / services | AngularJS `$http` services | `UmbContextBase` tokens |
| i18n | Umbraco XML resources | `localization` extension type + JSON |
| Theme switching | `data-swf-theme` attribute via service | CSS custom property approach unchanged; JS theme service is now a UmbContextBase |

---

## 3. Solution Layout (additions for v17)

The existing `SplatDev.Umbraco.Workflow/` solution gains:

```
src/
└── SplatDev.Umbraco.Workflow.Backoffice.V17/
    ├── SplatDev.Umbraco.Workflow.Backoffice.V17.csproj    # targets net10.0
    ├── client/
    │   ├── package.json          # @umbraco-cms/backoffice ^17, vite, typescript
    │   ├── tsconfig.json
    │   ├── vite.config.ts        # output → ../App_Plugins/SplatDev.Workflow.V17/dist/
    │   └── src/
    │       ├── index.ts
    │       ├── section/
    │       │   └── workflow-section.element.ts
    │       ├── queue/
    │       │   ├── workflow-queue-workspace.element.ts
    │       │   ├── workflow-queue-table.element.ts
    │       │   └── workflow-instance-flyout.element.ts
    │       ├── chart/
    │       │   ├── workflow-pizza-chart.element.ts
    │       │   └── templates/
    │       │       ├── horizontal-stepper.element.ts
    │       │       ├── vertical-donut.element.ts
    │       │       └── compact-strip.element.ts
    │       ├── config-editor/
    │       │   ├── workflow-config-editor.element.ts
    │       │   ├── workflow-step-editor.element.ts
    │       │   └── workflow-action-editor.element.ts
    │       ├── themes/
    │       │   ├── workflow-themes-workspace.element.ts
    │       │   └── workflow-theme-token-editor.element.ts
    │       └── context/
    │           ├── workflow.context.ts
    │           └── theme.context.ts
    └── App_Plugins/SplatDev.Workflow.V17/
        ├── umbraco-package.json
        └── dist/
            └── workflow-v17.element.js      # Vite output bundle
```

---

## 4. Umbraco 17 Extension Registrations

`App_Plugins/SplatDev.Workflow.V17/umbraco-package.json`:

```json
{
  "$schema": "../../umbraco-package-schema.json",
  "name": "SplatDev.Workflow",
  "version": "1.0.0",
  "extensions": [
    {
      "type": "section",
      "alias": "SplatDev.Workflow.Section",
      "name": "Workflow Section",
      "js": "/App_Plugins/SplatDev.Workflow.V17/dist/workflow-v17.element.js",
      "weight": 200,
      "meta": { "label": "Workflow", "pathname": "workflow" }
    },
    {
      "type": "sectionSidebarApp",
      "alias": "SplatDev.Workflow.SidebarMenu",
      "name": "Workflow Sidebar",
      "js": "/App_Plugins/SplatDev.Workflow.V17/dist/workflow-v17.element.js",
      "conditions": [
        { "alias": "Umb.Condition.SectionAlias", "match": "SplatDev.Workflow.Section" }
      ]
    },
    {
      "type": "workspace",
      "alias": "SplatDev.Workflow.Queue.Workspace",
      "name": "Workflow Queue",
      "element": "workflow-queue-workspace",
      "js": "/App_Plugins/SplatDev.Workflow.V17/dist/workflow-v17.element.js",
      "meta": { "entityType": "workflow-queue" }
    },
    {
      "type": "workspace",
      "alias": "SplatDev.Workflow.Config.Workspace",
      "name": "Workflow Config Editor",
      "element": "workflow-config-editor",
      "js": "/App_Plugins/SplatDev.Workflow.V17/dist/workflow-v17.element.js",
      "meta": { "entityType": "workflow-definition" }
    },
    {
      "type": "workspace",
      "alias": "SplatDev.Workflow.Themes.Workspace",
      "name": "Workflow Themes",
      "element": "workflow-themes-workspace",
      "js": "/App_Plugins/SplatDev.Workflow.V17/dist/workflow-v17.element.js",
      "meta": { "entityType": "workflow-theme" }
    },
    {
      "type": "localization",
      "alias": "SplatDev.Workflow.Localization.En",
      "name": "Workflow — English",
      "meta": { "culture": "en" },
      "js": "/App_Plugins/SplatDev.Workflow.V17/dist/workflow-v17.element.js"
    }
  ]
}
```

---

## 5. Key Lit 3 Components

### `workflow.context.ts`
- `UmbContextToken`: `SplatDev.Workflow.Context`
- Methods mirror the REST API endpoints from `WorkflowInstancesController`, `WorkflowDefinitionsController`, `WorkflowThemesController`
- Used by queue workspace, config editor, and themes workspace

### `workflow-queue-workspace.element.ts`
- Hosts the filter bar and `<workflow-queue-table>`
- Consumes `WorkflowContext`
- Opens `<workflow-instance-flyout>` on row click (uses `UmbModalManagerContext`)
- Filter bar: `uui-select` for workflowKey, `uui-select` for status, `uui-toggle` for "assigned to me", `uui-input` for freetext

### `workflow-queue-table.element.ts`
- Renders `uui-table` with dynamic columns from `WorkflowContext.getColumns(workflowKey)`
- Paginates using Umbraco's `uui-pagination`
- Status badge column uses a `<workflow-status-badge>` sub-element

### `workflow-pizza-chart.element.ts`
- Renders the pizza-delivery step indicator
- `@property() steps: WorkflowStepDisplay[]`
- `@property() currentStepKey: string`
- `@property() theme: string` — switches template via slot/template selection
- Template variants: `horizontal-stepper` (default), `vertical-donut`, `compact-strip`

### `workflow-config-editor.element.ts`
- Form for editing a workflow definition
- Sub-components: `workflow-step-editor`, `workflow-action-editor`
- Save via `context.saveDefinition()` → `POST /Workflow/definitions`

### `workflow-themes-workspace.element.ts`
- Lists installed themes
- `workflow-theme-token-editor` shows editable CSS token sliders with live preview

---

## 6. Theming Compatibility

The CSS custom property theming system from v13 is **unchanged** in v17:
- `[data-swf-theme="classic"] { --swf-chart-step-active-bg: #2563eb; ... }` still works.
- The `theme.context.ts` replaces the v13 AngularJS `themeService.js` to apply/remove `data-swf-theme` attributes.
- Same 3 themes (Classic, Modern, Compact) ship in the v17 package.

---

## 7. API Compatibility

The C# API controllers (`WorkflowInstancesController`, etc.) are **unchanged**. They serve both the v13 AngularJS client and the v17 Lit 3 client. The v17 context simply calls the same `/umbraco/api/Workflow/*` endpoints.

---

## 8. Testing Strategy

| Type | Tool | Scope |
|---|---|---|
| Unit (TypeScript) | Vitest | Context methods, pizza chart rendering, step transitions |
| E2E (v17) | Playwright | Queue load → transition → chart updates, theme switch, config save |
| CI gate | GitHub Actions | `npm run build` + `dotnet build net10.0` + all tests |

---

## 9. v17 Deliverables

1. `src/SplatDev.Umbraco.Workflow.Backoffice.V17/` project (csproj + client/ + App_Plugins/)
2. 15 Lit 3 web components (section, queue, chart, config editor, themes)
3. `workflow.context.ts` + `theme.context.ts`
4. Vite build producing single ES module bundle
5. `umbraco-package.json` with all extension registrations
6. Integration into main `SplatDev.Umbraco.Workflow.sln`
7. Playwright E2E test suite for v17

---

## 10. Open Questions

- Should v13 and v17 packages be published as separate NuGet packages (`SplatDev.Umbraco.Workflow` targeting net8.0 vs net10.0) or as a single multi-target package? (Recommendation: multi-target, one package, different `TargetFrameworks`.)
- Portuguese (Brazil) localization strings — need input from operator.
