# SplatDev.Umbraco.Workflow — v17 Implementation Plan

> **Architecture:** See `docs/specs/2026-05-27-workflow-v17-design.md`
> **Goal:** Port the Umbraco 13 Workflow plugin backoffice to Lit 3 / Bellissima for Umbraco 17. All C# layers are reused unchanged.

**Tech Stack:** .NET 10 · Umbraco 17.x · Lit 3 · TypeScript · Vite

---

## Phase 1 — Project Scaffold

### Task 1: Add `SplatDev.Umbraco.Workflow.Backoffice.V17` project to the solution

- [ ] **Step 1: Create the csproj**

```xml
<Project Sdk="Microsoft.NET.Sdk.Razor">
  <PropertyGroup>
    <TargetFramework>net10.0</TargetFramework>
    <RootNamespace>SplatDev.Umbraco.Workflow.Backoffice.V17</RootNamespace>
    <AddRazorSupportForMvc>true</AddRazorSupportForMvc>
  </PropertyGroup>
  <ItemGroup>
    <PackageReference Include="Umbraco.Cms.Web.BackOffice" Version="17.3.4" />
  </ItemGroup>
  <ItemGroup>
    <ProjectReference Include="..\SplatDev.Umbraco.Workflow.Api\SplatDev.Umbraco.Workflow.Api.csproj" />
  </ItemGroup>
  <ItemGroup>
    <Content Include="App_Plugins\**\*" CopyToOutputDirectory="PreserveNewest" />
    <EmbeddedResource Include="App_Plugins\**\*" />
  </ItemGroup>
</Project>
```

- [ ] **Step 2: Add to solution**

```bash
dotnet sln SplatDev.Umbraco.Workflow.sln add \
  src/SplatDev.Umbraco.Workflow.Backoffice.V17/SplatDev.Umbraco.Workflow.Backoffice.V17.csproj
```

- [ ] **Step 3: Create the Lit 3 client package.json**

See spec §3 for full content.

- [ ] **Step 4: Create vite.config.ts, tsconfig.json**

See spec §3 and §(Build Setup equivalent).

- [ ] **Step 5: Build (empty) and verify solution compiles**

```bash
npm ci --prefix src/SplatDev.Umbraco.Workflow.Backoffice.V17/client
npm run build --prefix src/SplatDev.Umbraco.Workflow.Backoffice.V17/client
dotnet build SplatDev.Umbraco.Workflow.sln -c Debug --nologo
```

---

## Phase 2 — Context Layer

### Task 2: Implement `workflow.context.ts`

**File:** `client/src/context/workflow.context.ts`

- [ ] **Step 1: Define types and token**

```typescript
export const WORKFLOW_CONTEXT_TOKEN = new UmbContextToken<WorkflowContext>('SplatDev.Workflow.Context');
```

- [ ] **Step 2: Implement `WorkflowContext extends UmbContextBase`**

Methods (wrap REST API calls):
- `getDefinitions(): Promise<WorkflowDefinitionDto[]>`
- `getInstance(id: number): Promise<WorkflowInstanceDto>`
- `getInstances(filter: WorkflowQueueFilter): Promise<PagedResult<WorkflowDisplayRow>>`
- `createInstance(req: CreateInstanceRequest): Promise<WorkflowInstanceDto>`
- `transition(id: number, actionKey: string): Promise<TransitionResult>`
- `getHistory(id: number): Promise<WorkflowEventDto[]>`
- `getTasks(id: number): Promise<WorkflowTaskDto[]>`
- `saveDefinition(def: WorkflowDefinitionDto): Promise<void>`
- `getThemes(): Promise<WorkflowThemeDto[]>`
- `getTheme(name: string): Promise<WorkflowThemeDto>`

### Task 3: Implement `theme.context.ts`

- [ ] **Step 1: Implement `ThemeContext extends UmbContextBase`**

```typescript
// Provides: activeTheme (string), setTheme(name: string)
// Side effect of setTheme: sets/replaces data-swf-theme attribute on document.body
```

---

## Phase 3 — Lit 3 Components

### Task 4: `workflow-pizza-chart.element.ts`

- [ ] **Step 1: Implement the base chart component**

Properties:
- `steps: WorkflowStepDisplay[]`
- `currentStepKey: string`
- `variant: 'horizontal-stepper' | 'vertical-donut' | 'compact-strip'` (default: `'horizontal-stepper'`)

Renders the appropriate template based on `variant` using conditional `html` tags.

- [ ] **Step 2: Implement `horizontal-stepper` template**

Linear flex row of step segments. Each segment:
- Background color via `--swf-chart-step-{state}-bg` CSS vars
- Label below
- Active segment has a filled indicator; completed segments show a checkmark

- [ ] **Step 3: Implement `vertical-donut` template**

Vertical list with circular step indicators connected by a vertical line.

- [ ] **Step 4: Implement `compact-strip` template**

Dense single-row bar with minimal labels (icon only for small viewports).

- [ ] **Step 5: Unit test with Vitest**

```typescript
it('marks currentStepKey segment as active', () => {
  const el = document.createElement('workflow-pizza-chart') as WorkflowPizzaChartElement;
  el.steps = [{ key: 'start', label: 'Start' }, { key: 'review', label: 'Review' }];
  el.currentStepKey = 'review';
  document.body.appendChild(el);
  const segments = el.shadowRoot!.querySelectorAll('.step-segment');
  expect(segments[1].classList.contains('active')).toBe(true);
});
```

---

### Task 5: `workflow-queue-table.element.ts`

- [ ] **Step 1: Implement paged table**

- Consumes `WORKFLOW_CONTEXT_TOKEN`
- Properties: `workflowKey`, `status`, `assignedToMe`, `page`, `pageSize`
- Fetches `context.getInstances(filter)` on change
- Renders `uui-table` with dynamic columns from workflow definition
- Emits `row-clicked` event with `instanceId`
- Includes `uui-pagination` at bottom

---

### Task 6: `workflow-queue-workspace.element.ts`

- [ ] **Step 1: Implement the workspace root**

- Provides `WorkflowContext`
- Renders filter bar + `<workflow-queue-table>`
- On `row-clicked`: opens `<workflow-instance-flyout>` via `UmbModalManagerContext`

### Task 7: `workflow-instance-flyout.element.ts`

- [ ] **Step 1: Implement flyout / side panel**

Shows:
- Instance metadata (workflow, current step, status, assignee)
- `<workflow-pizza-chart>` showing current position
- History timeline (event log)
- Tasks checklist (if any tasks-to-perform defined)
- Action buttons (from current step's `Actions` list)

On action button click: `context.transition(instanceId, actionKey)` → refresh chart + history.

---

### Task 8: `workflow-config-editor.element.ts`

- [ ] **Step 1: Implement the definition editor form**

Sub-editors:
- `<workflow-step-editor>` per step: key, label, department, group, actions list, pre/post messages
- `<workflow-action-editor>` per action: key, label, nextStepKey, assignment strategy

Save: `context.saveDefinition(def)` → success notification via `UMB_NOTIFICATION_CONTEXT`

---

### Task 9: `workflow-themes-workspace.element.ts`

- [ ] **Step 1: Implement themes listing**

- Lists themes from `context.getThemes()`
- Clicking a theme: loads `<workflow-theme-token-editor>` with live CSS preview
- Apply button: calls `context.setActiveTheme(name)` which persists the preference

---

## Phase 4 — Umbraco Package Registration

### Task 10: Create `umbraco-package.json`

See spec §4 for full content. Place at:
`App_Plugins/SplatDev.Workflow.V17/umbraco-package.json`

- [ ] **Step 1: Write the package manifest**
- [ ] **Step 2: Verify all extension aliases are unique and non-conflicting with v13 plugin**

---

## Phase 5 — E2E Tests

### Task 11: Playwright tests for Umbraco 17

**File:** `tests/SplatDev.Umbraco.Workflow.E2E.V17.Tests/QueueFlowV17Tests.cs`

- [ ] **Step 1: Write key E2E scenarios**

```csharp
[Fact]
public async Task V17_QueueLoadsAndPaginates() { /* ... */ }

[Fact]
public async Task V17_TransitionFromStep_UpdatesChart() { /* ... */ }

[Fact]
public async Task V17_ThemeSwitch_UpdatesCssTokens() { /* ... */ }

[Fact]
public async Task V17_ConfigEditor_SavesNewVersion() { /* ... */ }

[Fact]
public async Task V17_InstanceFlyout_ShowsHistory() { /* ... */ }
```

- [ ] **Step 2: Run tests**

```bash
dotnet test tests/SplatDev.Umbraco.Workflow.E2E.V17.Tests/
```

---

## Phase 6 — CI/CD Integration

### Task 12: Update CI workflow

**File:** `.github/workflows/build.yml`

- [ ] **Add npm build step for V17 backoffice**

```yaml
- name: Build Workflow V17 Lit 3 client
  working-directory: src/SplatDev.Umbraco.Workflow.Backoffice.V17/client
  run: |
    npm ci
    npm run build
```

---

## Acceptance Criteria

- [ ] Umbraco 17 backoffice → Workflow section visible in sidebar.
- [ ] Queue workspace: filter bar + paged table loads correctly.
- [ ] Instance flyout: pizza chart renders at correct step; action buttons trigger transitions.
- [ ] Theme switch: CSS tokens update without page reload.
- [ ] Config Editor: saving a new workflow definition version works; old instances pin to prior version.
- [ ] All 5 Playwright E2E tests pass.
- [ ] `npm run build` and `dotnet build net10.0` pass with 0 warnings/errors.
- [ ] The v13 AngularJS backoffice still works (no regressions).
