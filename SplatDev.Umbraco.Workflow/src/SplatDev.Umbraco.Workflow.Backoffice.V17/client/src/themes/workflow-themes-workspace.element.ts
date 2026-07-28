import { LitElement, html, css } from "@umbraco-cms/backoffice/external/lit";
import { customElement, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import {
  WORKFLOW_CONTEXT_TOKEN,
  type WorkflowTheme,
  type WorkflowStepDisplay,
} from "../context/workflow.context.js";
import { ThemeContext, THEME_CONTEXT_TOKEN } from "../context/theme.context.js";
import "./workflow-theme-token-editor.element.js";
import "../chart/workflow-pizza-chart.element.js";

const PREVIEW_STEPS: WorkflowStepDisplay[] = [
  { key: "submit", label: "Submit", actions: [] },
  { key: "review", label: "Review", actions: [] },
  { key: "approve", label: "Approve", actions: [] },
  { key: "publish", label: "Publish", actions: [] },
];

@customElement("workflow-themes-workspace")
export class WorkflowThemesWorkspaceElement extends UmbElementMixin(LitElement) {
  static override styles = css`
    :host { display: block; padding: var(--uui-size-layout-1, 24px); }
    h2 { font-size: 1.25rem; font-weight: 600; margin: 0 0 16px; }
    .themes-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; margin-bottom: 24px; }
    .theme-card {
      padding: 16px; border: 2px solid var(--uui-color-border, #e5e7eb);
      border-radius: 8px; cursor: pointer; text-align: center;
    }
    .theme-card:hover { border-color: var(--uui-color-interactive, #3b82f6); }
    .theme-card.active { border-color: var(--uui-color-interactive, #3b82f6); background: rgba(59, 130, 246, 0.05); }
    .theme-name { font-weight: 600; font-size: 0.95rem; text-transform: capitalize; }
    .preview-section { margin-top: 24px; }
    .preview-section h3 { font-size: 1rem; margin: 0 0 12px; }
    .preview-charts { display: flex; flex-direction: column; gap: 24px; }
    .chart-preview { padding: 16px; border: 1px solid var(--uui-color-border, #e5e7eb); border-radius: 6px; }
    .chart-preview-label { font-size: 0.8rem; font-weight: 500; margin-bottom: 8px; color: var(--uui-color-text-alt, #6b7280); }
  `;

  @state() private _themes: WorkflowTheme[] = [];
  @state() private _activeTheme = "classic";
  @state() private _loading = false;

  #themeContext!: ThemeContext;

  override connectedCallback(): void {
    super.connectedCallback();

    this.consumeContext(THEME_CONTEXT_TOKEN, (ctx) => {
      this.#themeContext = ctx;
      this._activeTheme = ctx.activeTheme;
    });

    this.consumeContext(WORKFLOW_CONTEXT_TOKEN, (ctx) => {
      this.#loadThemes(ctx);
    });
  }

  async #loadThemes(ctx: import("../context/workflow.context.js").WorkflowContext): Promise<void> {
    this._loading = true;
    try {
      this._themes = await ctx.getThemes();
    } catch {
      this._themes = [
        { name: "classic", label: "Classic" },
        { name: "modern", label: "Modern" },
        { name: "compact", label: "Compact" },
      ];
    }
    this._loading = false;
  }

  #selectTheme(name: string): void {
    this._activeTheme = name;
    this.#themeContext?.setTheme(name);
  }

  override render() {
    if (this._loading) return html`<uui-loader-bar></uui-loader-bar>`;

    return html`
      <h2>Workflow Themes</h2>

      <div class="themes-grid">
        ${this._themes.map(
          (t) => html`
            <div class="theme-card ${t.name === this._activeTheme ? "active" : ""}" @click=${() => this.#selectTheme(t.name)}>
              <div class="theme-name">${t.label}</div>
              ${t.name === this._activeTheme ? html`<uui-badge color="positive">Active</uui-badge>` : ""}
            </div>
          `,
        )}
      </div>

      <workflow-theme-token-editor .theme=${this._activeTheme}></workflow-theme-token-editor>

      <div class="preview-section">
        <h3>Live Preview</h3>
        <div class="preview-charts">
          <div class="chart-preview">
            <div class="chart-preview-label">Horizontal Stepper</div>
            <workflow-pizza-chart .steps=${PREVIEW_STEPS} current-step="review" variant="horizontal-stepper"></workflow-pizza-chart>
          </div>
          <div class="chart-preview">
            <div class="chart-preview-label">Vertical Donut</div>
            <workflow-pizza-chart .steps=${PREVIEW_STEPS} current-step="review" variant="vertical-donut"></workflow-pizza-chart>
          </div>
          <div class="chart-preview">
            <div class="chart-preview-label">Compact Strip</div>
            <workflow-pizza-chart .steps=${PREVIEW_STEPS} current-step="review" variant="compact-strip"></workflow-pizza-chart>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "workflow-themes-workspace": WorkflowThemesWorkspaceElement;
  }
}
