import { LitElement, html, css, nothing } from "@umbraco-cms/backoffice/external/lit";
import { customElement, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import { ThemeContext, THEME_CONTEXT_TOKEN } from "../context/theme.context.js";
import "../queue/workflow-queue-workspace.element.js";
import "../config-editor/workflow-config-editor.element.js";
import "../themes/workflow-themes-workspace.element.js";

type SectionView = "queue" | "definitions" | "themes";

@customElement("workflow-section")
export class WorkflowSectionElement extends UmbElementMixin(LitElement) {
  static override styles = css`
    :host {
      display: flex;
      height: 100%;
    }
    nav {
      width: 200px;
      flex-shrink: 0;
      border-right: 1px solid var(--uui-color-border, #e5e7eb);
      background: var(--uui-color-surface-alt, #f9fafb);
      padding: 16px 0;
    }
    .nav-item {
      display: block;
      width: 100%;
      padding: 10px 20px;
      border: none;
      background: none;
      text-align: left;
      font-size: 0.9rem;
      cursor: pointer;
      color: var(--uui-color-text, #1f2937);
    }
    .nav-item:hover {
      background: var(--uui-color-surface-emphasis, #e5e7eb);
    }
    .nav-item.active {
      font-weight: 600;
      background: var(--uui-color-surface-emphasis, #e5e7eb);
      border-left: 3px solid var(--uui-color-interactive, #3b82f6);
    }
    main {
      flex: 1;
      overflow-y: auto;
    }
  `;

  @state() private _view: SectionView = "queue";

  #themeContext!: ThemeContext;

  override connectedCallback(): void {
    super.connectedCallback();
    this.#themeContext = new ThemeContext(this);
    this.provideContext(THEME_CONTEXT_TOKEN, this.#themeContext);
  }

  override render() {
    return html`
      <nav>
        <button class="nav-item ${this._view === "queue" ? "active" : ""}" @click=${() => (this._view = "queue")}>
          Queue
        </button>
        <button class="nav-item ${this._view === "definitions" ? "active" : ""}" @click=${() => (this._view = "definitions")}>
          Definitions
        </button>
        <button class="nav-item ${this._view === "themes" ? "active" : ""}" @click=${() => (this._view = "themes")}>
          Themes
        </button>
      </nav>
      <main>${this.#renderView()}</main>
    `;
  }

  #renderView() {
    switch (this._view) {
      case "queue":
        return html`<workflow-queue-workspace></workflow-queue-workspace>`;
      case "definitions":
        return html`<workflow-config-editor></workflow-config-editor>`;
      case "themes":
        return html`<workflow-themes-workspace></workflow-themes-workspace>`;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "workflow-section": WorkflowSectionElement;
  }
}
