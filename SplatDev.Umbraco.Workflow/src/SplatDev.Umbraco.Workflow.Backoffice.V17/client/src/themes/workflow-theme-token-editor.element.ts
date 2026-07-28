import { LitElement, html, css } from "@umbraco-cms/backoffice/external/lit";
import { customElement, property, state } from "@umbraco-cms/backoffice/external/lit";

interface ThemeToken {
  name: string;
  label: string;
  value: string;
  type: "color" | "size";
}

const THEME_TOKENS: Record<string, ThemeToken[]> = {
  classic: [
    { name: "--swf-chart-step-active-bg", label: "Active Step", value: "#2563eb", type: "color" },
    { name: "--swf-chart-step-completed-bg", label: "Completed Step", value: "#22c55e", type: "color" },
    { name: "--swf-chart-step-pending-bg", label: "Pending Step", value: "#d1d5db", type: "color" },
  ],
  modern: [
    { name: "--swf-chart-step-active-bg", label: "Active Step", value: "#8b5cf6", type: "color" },
    { name: "--swf-chart-step-completed-bg", label: "Completed Step", value: "#10b981", type: "color" },
    { name: "--swf-chart-step-pending-bg", label: "Pending Step", value: "#e5e7eb", type: "color" },
  ],
  compact: [
    { name: "--swf-chart-step-active-bg", label: "Active Step", value: "#0f172a", type: "color" },
    { name: "--swf-chart-step-completed-bg", label: "Completed Step", value: "#059669", type: "color" },
    { name: "--swf-chart-step-pending-bg", label: "Pending Step", value: "#cbd5e1", type: "color" },
  ],
};

@customElement("workflow-theme-token-editor")
export class WorkflowThemeTokenEditorElement extends LitElement {
  static override styles = css`
    :host { display: block; }
    .token-list { display: flex; flex-direction: column; gap: 12px; }
    .token-row { display: flex; align-items: center; gap: 12px; }
    .token-label { min-width: 120px; font-size: 0.85rem; font-weight: 500; }
    .token-var { font-size: 0.7rem; color: var(--uui-color-text-alt, #6b7280); font-family: monospace; }
    .color-input { width: 48px; height: 32px; border: none; cursor: pointer; border-radius: 4px; }
    .preview-bar { margin-top: 16px; }
  `;

  @property({ type: String }) theme = "classic";
  @state() private _tokens: ThemeToken[] = [];

  override connectedCallback(): void {
    super.connectedCallback();
    this._tokens = [...(THEME_TOKENS[this.theme] ?? THEME_TOKENS.classic)];
  }

  override updated(changed: Map<string, unknown>): void {
    if (changed.has("theme")) {
      this._tokens = [...(THEME_TOKENS[this.theme] ?? THEME_TOKENS.classic)];
    }
  }

  #handleTokenChange(index: number, value: string): void {
    this._tokens = this._tokens.map((t, i) => (i === index ? { ...t, value } : t));
    document.documentElement.style.setProperty(this._tokens[index].name, value);
  }

  override render() {
    return html`
      <div class="token-list">
        ${this._tokens.map(
          (token, i) => html`
            <div class="token-row">
              <div>
                <div class="token-label">${token.label}</div>
                <div class="token-var">${token.name}</div>
              </div>
              <input
                type="color"
                class="color-input"
                .value=${token.value}
                @input=${(e: InputEvent) => this.#handleTokenChange(i, (e.target as HTMLInputElement).value)}
              />
              <span style="font-size: 0.8rem; font-family: monospace;">${token.value}</span>
            </div>
          `,
        )}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "workflow-theme-token-editor": WorkflowThemeTokenEditorElement;
  }
}
