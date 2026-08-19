import { LitElement, html, css } from "@umbraco-cms/backoffice/external/lit";
import { customElement, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";

import { createAuthFetch } from "./auth-fetch";

interface LazyLoadSettings {
  enabled: boolean;
  placeholder: string;
  lazyLoadIframes: boolean;
}

@customElement("lazyload-dashboard")
export class LazyLoadDashboardElement extends UmbElementMixin(LitElement) {
  readonly #fetch = createAuthFetch(this);

  @state() private _settings: LazyLoadSettings = { enabled: true, placeholder: "", lazyLoadIframes: true };
  @state() private _loading = true;
  @state() private _saved = false;

  static override styles = css`
    :host { display: block; padding: 1rem; }
    .form-row { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; }
    label { min-width: 160px; font-weight: 600; }
    input[type="text"] { flex: 1; padding: 0.4rem; border: 1px solid var(--uui-color-border); border-radius: 4px; }
  `;

  override connectedCallback(): void {
    super.connectedCallback();
    this._loadSettings();
  }

  private async _loadSettings(): Promise<void> {
    try {
      const response = await this.#fetch("/umbraco/api/lazyload/GetSettings");
      this._settings = (await response.json()) as LazyLoadSettings;
    } finally {
      this._loading = false;
    }
  }

  private async _saveSettings(): Promise<void> {
    await this.#fetch("/umbraco/api/lazyload/SaveSettings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(this._settings),
    });
    this._saved = true;
    setTimeout(() => { this._saved = false; }, 3000);
  }

  private _toggle(field: keyof LazyLoadSettings): void {
    this._settings = { ...this._settings, [field]: !this._settings[field] as never };
  }

  override render() {
    if (this._loading) return html`<uui-loader></uui-loader>`;
    return html`
      <uui-box headline="Lazy Load Settings">
        <div class="form-row">
          <label>Enabled</label>
          <uui-toggle ?checked=${this._settings.enabled} @change=${() => this._toggle("enabled")}></uui-toggle>
        </div>
        <div class="form-row">
          <label>Lazy Load Iframes</label>
          <uui-toggle ?checked=${this._settings.lazyLoadIframes} @change=${() => this._toggle("lazyLoadIframes")}></uui-toggle>
        </div>
        <div class="form-row">
          <label>Placeholder</label>
          <input type="text" .value=${this._settings.placeholder}
            @input=${(e: InputEvent) => (this._settings = { ...this._settings, placeholder: (e.target as HTMLInputElement).value })} />
        </div>
        <uui-button look="primary" @click=${this._saveSettings}>Save Settings</uui-button>
        ${this._saved ? html`<uui-tag color="positive" look="secondary">Saved!</uui-tag>` : ""}
      </uui-box>
    `;
  }
}

export default LazyLoadDashboardElement;

declare global { interface HTMLElementTagNameMap { "lazyload-dashboard": LazyLoadDashboardElement; } }
