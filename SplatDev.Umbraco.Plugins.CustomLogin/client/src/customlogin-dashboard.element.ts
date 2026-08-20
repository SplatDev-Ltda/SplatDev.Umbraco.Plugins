import { LitElement, html, css } from "@umbraco-cms/backoffice/external/lit";
import { customElement, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";

import { createAuthFetch } from "./auth-fetch";

interface CustomLoginSettings {
  brandName: string;
  logoUrl: string;
  backgroundColor: string;
  accentColor: string;
  supportEmail: string;
  enableSso: boolean;
}

@customElement("customlogin-dashboard")
export class CustomLoginDashboardElement extends UmbElementMixin(LitElement) {
  readonly #fetch = createAuthFetch(this);

  static override styles = css`
    :host { display: block; padding: var(--uui-size-layout-1, 24px); }
    h1 { font-size: 1.5rem; font-weight: 600; margin: 0 0 8px; }
    p.description { color: var(--uui-color-text-alt, #6b7280); margin: 0 0 24px; }
    .field-row { margin-bottom: 16px; }
    .field-row label { display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 4px; }
    .field-row input[type="text"],
    .field-row input[type="url"],
    .field-row input[type="email"] {
      width: 100%;
      max-width: 480px;
      padding: 8px 10px;
      border: 1px solid var(--uui-color-border, #d1d5db);
      border-radius: 4px;
      font-size: 1rem;
    }
    .color-row { display: flex; align-items: center; gap: 8px; }
    .msg { padding: 10px 14px; border-radius: 4px; margin-bottom: 16px; }
    .msg.success { background: #d1fae5; color: #065f46; }
    .msg.error { background: #fee2e2; color: #991b1b; }
  `;

  @state() private _settings: CustomLoginSettings = {
    brandName: "",
    logoUrl: "",
    backgroundColor: "#ffffff",
    accentColor: "#1a73e8",
    supportEmail: "",
    enableSso: false,
  };
  @state() private _loading = false;
  @state() private _saving = false;
  @state() private _message: { type: "success" | "error"; text: string } | null = null;

  private readonly _apiBase = "/umbraco/api/customlogin";

  override connectedCallback(): void {
    super.connectedCallback();
    this._load();
  }

  private async _load(): Promise<void> {
    this._loading = true;
    try {
      const response = await this.#fetch(`${this._apiBase}/GetSettings`);
      if (response.ok) this._settings = await response.json();
    } catch {
      /* use defaults */
    } finally {
      this._loading = false;
    }
  }

  private async _save(): Promise<void> {
    this._saving = true;
    this._message = null;
    try {
      const response = await this.#fetch(`${this._apiBase}/SaveSettings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(this._settings),
      });
      if (response.ok) {
        this._message = { type: "success", text: "Settings saved successfully." };
      } else {
        this._message = { type: "error", text: "Failed to save settings." };
      }
    } catch {
      this._message = { type: "error", text: "Network error. Please try again." };
    } finally {
      this._saving = false;
    }
  }

  private _set<K extends keyof CustomLoginSettings>(key: K, value: CustomLoginSettings[K]) {
    this._settings = { ...this._settings, [key]: value };
  }

  override render() {
    if (this._loading) return html`<p>Loading...</p>`;

    return html`
      <h1>Custom Login Settings</h1>
      <p class="description">Configure the branded login page appearance and SSO integration.</p>

      ${this._message
        ? html`<div class="msg ${this._message.type}">${this._message.text}</div>`
        : ""}

      <uui-box headline="Branding">
        <div class="field-row">
          <label>Brand Name</label>
          <input type="text" .value=${this._settings.brandName}
            @input=${(e: InputEvent) => this._set("brandName", (e.target as HTMLInputElement).value)}
            placeholder="My Company" />
        </div>
        <div class="field-row">
          <label>Logo URL</label>
          <input type="url" .value=${this._settings.logoUrl}
            @input=${(e: InputEvent) => this._set("logoUrl", (e.target as HTMLInputElement).value)}
            placeholder="https://example.com/logo.png" />
        </div>
        <div class="field-row">
          <label>Background Color</label>
          <div class="color-row">
            <input type="color" .value=${this._settings.backgroundColor}
              @input=${(e: InputEvent) => this._set("backgroundColor", (e.target as HTMLInputElement).value)} />
            <input type="text" .value=${this._settings.backgroundColor}
              @input=${(e: InputEvent) => this._set("backgroundColor", (e.target as HTMLInputElement).value)}
              style="width:120px" />
          </div>
        </div>
        <div class="field-row">
          <label>Accent Color</label>
          <div class="color-row">
            <input type="color" .value=${this._settings.accentColor}
              @input=${(e: InputEvent) => this._set("accentColor", (e.target as HTMLInputElement).value)} />
            <input type="text" .value=${this._settings.accentColor}
              @input=${(e: InputEvent) => this._set("accentColor", (e.target as HTMLInputElement).value)}
              style="width:120px" />
          </div>
        </div>
        <div class="field-row">
          <label>Support Email</label>
          <input type="email" .value=${this._settings.supportEmail}
            @input=${(e: InputEvent) => this._set("supportEmail", (e.target as HTMLInputElement).value)}
            placeholder="support@example.com" />
        </div>
      </uui-box>

      <uui-box headline="SSO" style="margin-top:16px;">
        <div class="field-row">
          <uui-toggle
            .checked=${this._settings.enableSso}
            @change=${(e: CustomEvent) => this._set("enableSso", (e.target as HTMLInputElement).checked)}
          >Enable Single Sign-On hook</uui-toggle>
        </div>
      </uui-box>

      <div style="margin-top:20px;">
        <uui-button look="primary" ?disabled=${this._saving} @click=${this._save}>
          ${this._saving ? "Saving..." : "Save Settings"}
        </uui-button>
      </div>
    `;
  }
}

export default CustomLoginDashboardElement;

declare global {
  interface HTMLElementTagNameMap {
    "customlogin-dashboard": CustomLoginDashboardElement;
  }
}
