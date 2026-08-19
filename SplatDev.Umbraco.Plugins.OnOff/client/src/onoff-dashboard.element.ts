import { LitElement, html, css, nothing } from "@umbraco-cms/backoffice/external/lit";
import { customElement, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";

import { createAuthFetch } from "./auth-fetch";

interface FeatureToggle {
  id: number;
  name: string;
  alias: string;
  description: string;
  isEnabled: boolean;
  scheduledEnableAt: string | null;
  scheduledDisableAt: string | null;
  updatedAt: string;
}

type FormData = Omit<FeatureToggle, "id" | "updatedAt"> & { id?: number };

@customElement("onoff-dashboard")
export class OnOffDashboardElement extends UmbElementMixin(LitElement) {
  readonly #fetch = createAuthFetch(this);

  static override styles = css`
    :host { display: block; padding: var(--uui-size-layout-1, 24px); }
    h1 { font-size: 1.5rem; font-weight: 600; margin: 0 0 8px; }
    p.description { color: var(--uui-color-text-alt, #6b7280); margin: 0 0 24px; }
    .toolbar { margin-bottom: 16px; }
    .form-card { background: var(--uui-color-surface-alt, #f9fafb); border: 1px solid var(--uui-color-border, #e5e7eb); border-radius: 6px; padding: 20px; margin-bottom: 20px; }
    .form-card h3 { margin: 0 0 16px; font-size: 1rem; }
    .form-row { margin-bottom: 12px; display: flex; flex-direction: column; gap: 4px; }
    label { font-size: 0.8rem; font-weight: 600; color: var(--uui-color-text, #374151); }
    .form-actions { display: flex; gap: 8px; margin-top: 16px; }
    .badge { padding: 2px 10px; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; }
    .badge.on { background: #d1fae5; color: #065f46; }
    .badge.off { background: #fee2e2; color: #991b1b; }
    .actions { display: flex; gap: 6px; flex-wrap: wrap; }
    .empty { color: var(--uui-color-text-alt, #6b7280); padding: 24px 0; }
    uui-table { width: 100%; }
    code { background: #f3f4f6; padding: 1px 6px; border-radius: 4px; font-size: 0.8rem; }
  `;

  @state() private _features: FeatureToggle[] = [];
  @state() private _loading = false;
  @state() private _showForm = false;
  @state() private _saving = false;
  @state() private _form: FormData = this._emptyForm();

  private readonly _api = "/umbraco/api/onoff";

  private _emptyForm(): FormData {
    return { name: "", alias: "", description: "", isEnabled: false, scheduledEnableAt: null, scheduledDisableAt: null };
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this._load();
  }

  private async _load(): Promise<void> {
    this._loading = true;
    try {
      const r = await this.#fetch(`${this._api}/GetAll`);
      if (r.ok) this._features = await r.json();
    } catch { this._features = []; }
    finally { this._loading = false; }
  }

  private async _toggle(feature: FeatureToggle): Promise<void> {
    const action = feature.isEnabled ? "Disable" : "Enable";
    await this.#fetch(`${this._api}/${action}?alias=${encodeURIComponent(feature.alias)}`, { method: "POST" });
    await this._load();
  }

  private async _delete(feature: FeatureToggle): Promise<void> {
    if (!confirm(`Delete feature '${feature.name}'?`)) return;
    await this.#fetch(`${this._api}/Delete?id=${feature.id}`, { method: "DELETE" });
    await this._load();
  }

  private _edit(feature: FeatureToggle): void {
    this._form = { ...feature };
    this._showForm = true;
  }

  private _newFeature(): void {
    this._form = this._emptyForm();
    this._showForm = true;
  }

  private async _save(): Promise<void> {
    this._saving = true;
    try {
      await this.#fetch(`${this._api}/UpsertFeature`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(this._form),
      });
      this._showForm = false;
      await this._load();
    } finally { this._saving = false; }
  }

  private _formatDate(d: string | null): string {
    if (!d) return "—";
    return new Date(d).toLocaleString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  private _renderForm() {
    return html`
      <div class="form-card">
        <h3>${this._form.id ? "Edit" : "New"} Feature Toggle</h3>
        <div class="form-row">
          <label>Name</label>
          <uui-input .value=${this._form.name} @input=${(e: Event) => (this._form = { ...this._form, name: (e.target as HTMLInputElement).value })} placeholder="My Feature"></uui-input>
        </div>
        <div class="form-row">
          <label>Alias</label>
          <uui-input .value=${this._form.alias} @input=${(e: Event) => (this._form = { ...this._form, alias: (e.target as HTMLInputElement).value })} placeholder="myFeature"></uui-input>
        </div>
        <div class="form-row">
          <label>Description</label>
          <uui-input .value=${this._form.description} @input=${(e: Event) => (this._form = { ...this._form, description: (e.target as HTMLInputElement).value })} placeholder="Optional description"></uui-input>
        </div>
        <div class="form-row">
          <uui-toggle .checked=${this._form.isEnabled} @change=${(e: Event) => (this._form = { ...this._form, isEnabled: (e.target as HTMLInputElement).checked })} label="Enabled"></uui-toggle>
        </div>
        <div class="form-row">
          <label>Scheduled Enable At (UTC)</label>
          <uui-input type="datetime-local" .value=${this._form.scheduledEnableAt ?? ""} @input=${(e: Event) => (this._form = { ...this._form, scheduledEnableAt: (e.target as HTMLInputElement).value || null })}></uui-input>
        </div>
        <div class="form-row">
          <label>Scheduled Disable At (UTC)</label>
          <uui-input type="datetime-local" .value=${this._form.scheduledDisableAt ?? ""} @input=${(e: Event) => (this._form = { ...this._form, scheduledDisableAt: (e.target as HTMLInputElement).value || null })}></uui-input>
        </div>
        <div class="form-actions">
          <uui-button look="primary" label="Save" ?disabled=${this._saving} @click=${this._save}>Save</uui-button>
          <uui-button look="secondary" label="Cancel" @click=${() => (this._showForm = false)}>Cancel</uui-button>
        </div>
      </div>
    `;
  }

  override render() {
    return html`
      <h1>Feature Toggles</h1>
      <p class="description">Enable, disable and schedule site features from the Umbraco backoffice.</p>

      <div class="toolbar">
        <uui-button look="primary" label="Add Feature Toggle" @click=${this._newFeature}>Add Feature Toggle</uui-button>
      </div>

      ${this._showForm ? this._renderForm() : nothing}

      ${this._loading
        ? html`<p>Loading feature toggles...</p>`
        : this._features.length === 0
        ? html`<p class="empty">No feature toggles found. Click "Add Feature Toggle" to create one.</p>`
        : html`
          <uui-box headline="Feature Toggles (${this._features.length})">
            <uui-table>
              <uui-table-head>
                <uui-table-head-cell>Name</uui-table-head-cell>
                <uui-table-head-cell>Alias</uui-table-head-cell>
                <uui-table-head-cell>Status</uui-table-head-cell>
                <uui-table-head-cell>Scheduled Enable</uui-table-head-cell>
                <uui-table-head-cell>Scheduled Disable</uui-table-head-cell>
                <uui-table-head-cell>Updated</uui-table-head-cell>
                <uui-table-head-cell>Actions</uui-table-head-cell>
              </uui-table-head>
              ${this._features.map(f => html`
                <uui-table-row>
                  <uui-table-cell>
                    <strong>${f.name}</strong>
                    ${f.description ? html`<br/><small style="color:#6b7280">${f.description}</small>` : nothing}
                  </uui-table-cell>
                  <uui-table-cell><code>${f.alias}</code></uui-table-cell>
                  <uui-table-cell><span class="badge ${f.isEnabled ? "on" : "off"}">${f.isEnabled ? "ON" : "OFF"}</span></uui-table-cell>
                  <uui-table-cell>${this._formatDate(f.scheduledEnableAt)}</uui-table-cell>
                  <uui-table-cell>${this._formatDate(f.scheduledDisableAt)}</uui-table-cell>
                  <uui-table-cell>${this._formatDate(f.updatedAt)}</uui-table-cell>
                  <uui-table-cell>
                    <div class="actions">
                      <uui-button look="secondary" label="${f.isEnabled ? "Disable" : "Enable"}" @click=${() => this._toggle(f)}>${f.isEnabled ? "Disable" : "Enable"}</uui-button>
                      <uui-button look="secondary" label="Edit" @click=${() => this._edit(f)}>Edit</uui-button>
                      <uui-button look="danger" label="Delete" @click=${() => this._delete(f)}>Delete</uui-button>
                    </div>
                  </uui-table-cell>
                </uui-table-row>
              `)}
            </uui-table>
          </uui-box>
        `}
    `;
  }
}

export default OnOffDashboardElement;

declare global {
  interface HTMLElementTagNameMap {
    "onoff-dashboard": OnOffDashboardElement;
  }
}
