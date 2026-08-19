import { LitElement, html, css, nothing } from "@umbraco-cms/backoffice/external/lit";
import { customElement, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";

import { createAuthFetch } from "./auth-fetch";

interface PasswordPolicy {
  id: number;
  minLength: number;
  requireUppercase: boolean;
  requireDigit: boolean;
  requireSpecial: boolean;
  expirationDays: number;
  historyCount: number;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

@customElement("passwordsettings-dashboard")
export class PasswordSettingsDashboardElement extends UmbElementMixin(LitElement) {
  readonly #fetch = createAuthFetch(this);

  static override styles = css`
    :host { display: block; padding: var(--uui-size-layout-1, 24px); }
    h1 { font-size: 1.5rem; font-weight: 600; margin: 0 0 8px; }
    p.description { color: var(--uui-color-text-alt, #6b7280); margin: 0 0 24px; }
    .form-grid { display: grid; gap: 16px; max-width: 480px; }
    .field label { display: block; font-weight: 600; font-size: 0.875rem; margin-bottom: 4px; }
    .check-row { display: flex; align-items: center; gap: 8px; }
    .tester { margin-top: 24px; }
    .tester h2 { font-size: 1rem; margin-bottom: 12px; }
    .valid-msg { color: #065f46; margin-top: 8px; }
    .error-list { list-style: disc; padding-left: 1.25rem; color: #b91c1c; margin-top: 8px; }
    .actions { margin-top: 20px; display: flex; gap: 12px; align-items: center; }
    .status { font-size: 0.875rem; color: #065f46; }
  `;

  @state() private _policy: PasswordPolicy | null = null;
  @state() private _loading = false;
  @state() private _saving = false;
  @state() private _testPassword = "";
  @state() private _validationResult: ValidationResult | null = null;
  @state() private _statusMsg = "";

  private readonly _apiBase = "/umbraco/api/passwordsettings";

  override connectedCallback(): void {
    super.connectedCallback();
    this._loadPolicy();
  }

  private async _loadPolicy(): Promise<void> {
    this._loading = true;
    try {
      const res = await this.#fetch(`${this._apiBase}/GetPolicy`);
      if (res.ok) this._policy = await res.json();
    } finally {
      this._loading = false;
    }
  }

  private async _savePolicy(): Promise<void> {
    if (!this._policy) return;
    this._saving = true;
    this._statusMsg = "";
    try {
      const res = await this.#fetch(`${this._apiBase}/SavePolicy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(this._policy),
      });
      if (res.ok) {
        this._policy = await res.json();
        this._statusMsg = "Policy saved successfully.";
      }
    } finally {
      this._saving = false;
    }
  }

  private async _validatePassword(): Promise<void> {
    if (!this._testPassword) return;
    const res = await this.#fetch(`${this._apiBase}/ValidatePassword`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: this._testPassword }),
    });
    if (res.ok) this._validationResult = await res.json();
  }

  private _setField<K extends keyof PasswordPolicy>(key: K, value: PasswordPolicy[K]): void {
    if (this._policy) this._policy = { ...this._policy, [key]: value };
  }

  override render() {
    return html`
      <h1>Password Settings</h1>
      <p class="description">Configure complexity rules, expiration and reuse prevention for member passwords.</p>

      ${this._loading
        ? html`<p>Loading...</p>`
        : this._policy
        ? html`
            <uui-box headline="Password Policy">
              <div class="form-grid">
                <div class="field">
                  <label>Minimum Length</label>
                  <uui-input
                    type="number"
                    .value=${String(this._policy.minLength)}
                    @input=${(e: InputEvent) => this._setField("minLength", parseInt((e.target as HTMLInputElement).value, 10))}
                  ></uui-input>
                </div>
                <div class="field check-row">
                  <uui-toggle
                    ?checked=${this._policy.requireUppercase}
                    @change=${(e: CustomEvent) => this._setField("requireUppercase", (e.target as HTMLInputElement).checked)}
                  ></uui-toggle>
                  <label>Require Uppercase</label>
                </div>
                <div class="field check-row">
                  <uui-toggle
                    ?checked=${this._policy.requireDigit}
                    @change=${(e: CustomEvent) => this._setField("requireDigit", (e.target as HTMLInputElement).checked)}
                  ></uui-toggle>
                  <label>Require Digit</label>
                </div>
                <div class="field check-row">
                  <uui-toggle
                    ?checked=${this._policy.requireSpecial}
                    @change=${(e: CustomEvent) => this._setField("requireSpecial", (e.target as HTMLInputElement).checked)}
                  ></uui-toggle>
                  <label>Require Special Character</label>
                </div>
                <div class="field">
                  <label>Expiration Days (0 = never)</label>
                  <uui-input
                    type="number"
                    .value=${String(this._policy.expirationDays)}
                    @input=${(e: InputEvent) => this._setField("expirationDays", parseInt((e.target as HTMLInputElement).value, 10))}
                  ></uui-input>
                </div>
                <div class="field">
                  <label>Password History Count</label>
                  <uui-input
                    type="number"
                    .value=${String(this._policy.historyCount)}
                    @input=${(e: InputEvent) => this._setField("historyCount", parseInt((e.target as HTMLInputElement).value, 10))}
                  ></uui-input>
                </div>
              </div>
              <div class="actions">
                <uui-button
                  look="primary"
                  label="Save Policy"
                  ?disabled=${this._saving}
                  @click=${this._savePolicy}
                >${this._saving ? "Saving..." : "Save Policy"}</uui-button>
                ${this._statusMsg ? html`<span class="status">${this._statusMsg}</span>` : nothing}
              </div>
            </uui-box>

            <uui-box headline="Test Password Strength" style="margin-top:20px">
              <div class="tester">
                <uui-input
                  placeholder="Enter a password to test..."
                  .value=${this._testPassword}
                  @input=${(e: InputEvent) => (this._testPassword = (e.target as HTMLInputElement).value)}
                  style="width:100%;margin-bottom:10px"
                ></uui-input>
                <uui-button look="secondary" label="Validate" @click=${this._validatePassword}>Validate</uui-button>
                ${this._validationResult
                  ? this._validationResult.valid
                    ? html`<p class="valid-msg">Password meets all requirements.</p>`
                    : html`<ul class="error-list">${this._validationResult.errors.map((e) => html`<li>${e}</li>`)}</ul>`
                  : nothing}
              </div>
            </uui-box>
          `
        : html`<p>No policy found.</p>`}
    `;
  }
}

export default PasswordSettingsDashboardElement;

declare global {
  interface HTMLElementTagNameMap {
    "passwordsettings-dashboard": PasswordSettingsDashboardElement;
  }
}
