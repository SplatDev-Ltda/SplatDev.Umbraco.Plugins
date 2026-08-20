import { LitElement, html, css, nothing } from "@umbraco-cms/backoffice/external/lit";
import { customElement, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";

import { createAuthFetch } from "./auth-fetch";

interface DefaultValueRule {
  id: number;
  documentTypeAlias: string;
  propertyAlias: string;
  defaultValue: string;
  isEnabled: boolean;
  priority: number;
}

type FormData = Omit<DefaultValueRule, "id"> & { id?: number };

@customElement("defaultvalue-dashboard")
export class DefaultValueDashboardElement extends UmbElementMixin(LitElement) {
  readonly #fetch = createAuthFetch(this);

  static override styles = css`
    :host { display: block; padding: var(--uui-size-layout-1, 24px); }
    h1 { font-size: 1.5rem; font-weight: 600; margin: 0 0 8px; }
    p.description { color: var(--uui-color-text-alt, #6b7280); margin: 0 0 24px; }
    .toolbar { display: flex; gap: 12px; align-items: center; margin-bottom: 16px; flex-wrap: wrap; }
    .form-card { background: var(--uui-color-surface-alt, #f9fafb); border: 1px solid var(--uui-color-border, #e5e7eb); border-radius: 6px; padding: 20px; margin-bottom: 20px; }
    .form-card h3 { margin: 0 0 16px; font-size: 1rem; }
    .form-row { margin-bottom: 12px; display: flex; flex-direction: column; gap: 4px; }
    label { font-size: 0.8rem; font-weight: 600; }
    .form-actions { display: flex; gap: 8px; margin-top: 16px; }
    .badge-enabled { color: #065f46; font-weight: 600; }
    .badge-disabled { color: #9ca3af; }
    .actions { display: flex; gap: 6px; }
    .empty { color: var(--uui-color-text-alt, #6b7280); padding: 24px 0; }
    uui-table { width: 100%; }
    code { background: #f3f4f6; padding: 1px 6px; border-radius: 4px; font-size: 0.8rem; }
  `;

  @state() private _rules: DefaultValueRule[] = [];
  @state() private _loading = false;
  @state() private _showForm = false;
  @state() private _saving = false;
  @state() private _filter = "";
  @state() private _form: FormData = this._emptyForm();

  private readonly _api = "/umbraco/api/defaultvalue";

  private _emptyForm(): FormData {
    return { documentTypeAlias: "", propertyAlias: "", defaultValue: "", isEnabled: true, priority: 0 };
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this._load();
  }

  private async _load(): Promise<void> {
    this._loading = true;
    try {
      const r = await this.#fetch(`${this._api}/GetRules`);
      if (r.ok) this._rules = await r.json();
    } catch { this._rules = []; }
    finally { this._loading = false; }
  }

  private get _filtered(): DefaultValueRule[] {
    const f = this._filter.toLowerCase();
    if (!f) return this._rules;
    return this._rules.filter(r =>
      r.documentTypeAlias.toLowerCase().includes(f) || r.propertyAlias.toLowerCase().includes(f)
    );
  }

  private _edit(rule: DefaultValueRule): void {
    this._form = { ...rule };
    this._showForm = true;
  }

  private async _delete(rule: DefaultValueRule): Promise<void> {
    if (!confirm("Delete this rule?")) return;
    await this.#fetch(`${this._api}/DeleteRule?id=${rule.id}`, { method: "DELETE" });
    await this._load();
  }

  private async _save(): Promise<void> {
    this._saving = true;
    try {
      await this.#fetch(`${this._api}/SaveRule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(this._form),
      });
      this._showForm = false;
      await this._load();
    } finally { this._saving = false; }
  }

  private _renderForm() {
    return html`
      <div class="form-card">
        <h3>${this._form.id ? "Edit" : "New"} Default Value Rule</h3>
        <div class="form-row">
          <label>Document Type Alias</label>
          <uui-input .value=${this._form.documentTypeAlias} @input=${(e: Event) => (this._form = { ...this._form, documentTypeAlias: (e.target as HTMLInputElement).value })} placeholder="blogPost"></uui-input>
        </div>
        <div class="form-row">
          <label>Property Alias</label>
          <uui-input .value=${this._form.propertyAlias} @input=${(e: Event) => (this._form = { ...this._form, propertyAlias: (e.target as HTMLInputElement).value })} placeholder="pageTitle"></uui-input>
        </div>
        <div class="form-row">
          <label>Default Value</label>
          <uui-input .value=${this._form.defaultValue} @input=${(e: Event) => (this._form = { ...this._form, defaultValue: (e.target as HTMLInputElement).value })} placeholder="Untitled"></uui-input>
        </div>
        <div class="form-row">
          <label>Priority (lower = higher priority)</label>
          <uui-input type="number" .value=${String(this._form.priority)} @input=${(e: Event) => (this._form = { ...this._form, priority: parseInt((e.target as HTMLInputElement).value) || 0 })}></uui-input>
        </div>
        <div class="form-row">
          <uui-toggle .checked=${this._form.isEnabled} @change=${(e: Event) => (this._form = { ...this._form, isEnabled: (e.target as HTMLInputElement).checked })} label="Enabled"></uui-toggle>
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
      <h1>Default Values</h1>
      <p class="description">Configure default property values per document type. Applied automatically when new content nodes are created.</p>

      <div class="toolbar">
        <uui-button look="primary" label="Add Rule" @click=${() => { this._form = this._emptyForm(); this._showForm = true; }}>Add Rule</uui-button>
        <uui-input placeholder="Filter by doc type or property..." @input=${(e: Event) => (this._filter = (e.target as HTMLInputElement).value)} style="flex:1;max-width:300px;"></uui-input>
      </div>

      ${this._showForm ? this._renderForm() : nothing}

      ${this._loading
        ? html`<p>Loading rules...</p>`
        : this._filtered.length === 0
        ? html`<p class="empty">No rules found. Click "Add Rule" to create one.</p>`
        : html`
          <uui-box headline="Default Value Rules (${this._filtered.length})">
            <uui-table>
              <uui-table-head>
                <uui-table-head-cell>Document Type</uui-table-head-cell>
                <uui-table-head-cell>Property Alias</uui-table-head-cell>
                <uui-table-head-cell>Default Value</uui-table-head-cell>
                <uui-table-head-cell>Priority</uui-table-head-cell>
                <uui-table-head-cell>Enabled</uui-table-head-cell>
                <uui-table-head-cell>Actions</uui-table-head-cell>
              </uui-table-head>
              ${this._filtered.map(r => html`
                <uui-table-row>
                  <uui-table-cell><code>${r.documentTypeAlias}</code></uui-table-cell>
                  <uui-table-cell><code>${r.propertyAlias}</code></uui-table-cell>
                  <uui-table-cell>${r.defaultValue}</uui-table-cell>
                  <uui-table-cell>${r.priority}</uui-table-cell>
                  <uui-table-cell><span class="${r.isEnabled ? "badge-enabled" : "badge-disabled"}">${r.isEnabled ? "Yes" : "No"}</span></uui-table-cell>
                  <uui-table-cell>
                    <div class="actions">
                      <uui-button look="secondary" label="Edit" @click=${() => this._edit(r)}>Edit</uui-button>
                      <uui-button look="danger" label="Delete" @click=${() => this._delete(r)}>Delete</uui-button>
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

export default DefaultValueDashboardElement;

declare global {
  interface HTMLElementTagNameMap {
    "defaultvalue-dashboard": DefaultValueDashboardElement;
  }
}
