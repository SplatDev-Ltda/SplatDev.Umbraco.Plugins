import { LitElement as p, html as o, nothing as c, css as h, state as u, customElement as f } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as b } from "@umbraco-cms/backoffice/element-api";
var m = Object.defineProperty, _ = Object.getOwnPropertyDescriptor, a = (e, l, s, r) => {
  for (var i = r > 1 ? void 0 : r ? _(l, s) : l, d = e.length - 1, n; d >= 0; d--)
    (n = e[d]) && (i = (r ? n(l, s, i) : n(i)) || i);
  return r && i && m(l, s, i), i;
};
let t = class extends b(p) {
  constructor() {
    super(...arguments), this._rules = [], this._loading = !1, this._showForm = !1, this._saving = !1, this._filter = "", this._form = this._emptyForm(), this._api = "/umbraco/api/defaultvalue";
  }
  _emptyForm() {
    return { documentTypeAlias: "", propertyAlias: "", defaultValue: "", isEnabled: !0, priority: 0 };
  }
  connectedCallback() {
    super.connectedCallback(), this._load();
  }
  async _load() {
    this._loading = !0;
    try {
      const e = await fetch(`${this._api}/GetRules`);
      e.ok && (this._rules = await e.json());
    } catch {
      this._rules = [];
    } finally {
      this._loading = !1;
    }
  }
  get _filtered() {
    const e = this._filter.toLowerCase();
    return e ? this._rules.filter(
      (l) => l.documentTypeAlias.toLowerCase().includes(e) || l.propertyAlias.toLowerCase().includes(e)
    ) : this._rules;
  }
  _edit(e) {
    this._form = { ...e }, this._showForm = !0;
  }
  async _delete(e) {
    confirm("Delete this rule?") && (await fetch(`${this._api}/DeleteRule?id=${e.id}`, { method: "DELETE" }), await this._load());
  }
  async _save() {
    this._saving = !0;
    try {
      await fetch(`${this._api}/SaveRule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(this._form)
      }), this._showForm = !1, await this._load();
    } finally {
      this._saving = !1;
    }
  }
  _renderForm() {
    return o`
      <div class="form-card">
        <h3>${this._form.id ? "Edit" : "New"} Default Value Rule</h3>
        <div class="form-row">
          <label>Document Type Alias</label>
          <uui-input .value=${this._form.documentTypeAlias} @input=${(e) => this._form = { ...this._form, documentTypeAlias: e.target.value }} placeholder="blogPost"></uui-input>
        </div>
        <div class="form-row">
          <label>Property Alias</label>
          <uui-input .value=${this._form.propertyAlias} @input=${(e) => this._form = { ...this._form, propertyAlias: e.target.value }} placeholder="pageTitle"></uui-input>
        </div>
        <div class="form-row">
          <label>Default Value</label>
          <uui-input .value=${this._form.defaultValue} @input=${(e) => this._form = { ...this._form, defaultValue: e.target.value }} placeholder="Untitled"></uui-input>
        </div>
        <div class="form-row">
          <label>Priority (lower = higher priority)</label>
          <uui-input type="number" .value=${String(this._form.priority)} @input=${(e) => this._form = { ...this._form, priority: parseInt(e.target.value) || 0 }}></uui-input>
        </div>
        <div class="form-row">
          <uui-toggle .checked=${this._form.isEnabled} @change=${(e) => this._form = { ...this._form, isEnabled: e.target.checked }} label="Enabled"></uui-toggle>
        </div>
        <div class="form-actions">
          <uui-button look="primary" label="Save" ?disabled=${this._saving} @click=${this._save}>Save</uui-button>
          <uui-button look="secondary" label="Cancel" @click=${() => this._showForm = !1}>Cancel</uui-button>
        </div>
      </div>
    `;
  }
  render() {
    return o`
      <h1>Default Values</h1>
      <p class="description">Configure default property values per document type. Applied automatically when new content nodes are created.</p>

      <div class="toolbar">
        <uui-button look="primary" label="Add Rule" @click=${() => {
      this._form = this._emptyForm(), this._showForm = !0;
    }}>Add Rule</uui-button>
        <uui-input placeholder="Filter by doc type or property..." @input=${(e) => this._filter = e.target.value} style="flex:1;max-width:300px;"></uui-input>
      </div>

      ${this._showForm ? this._renderForm() : c}

      ${this._loading ? o`<p>Loading rules...</p>` : this._filtered.length === 0 ? o`<p class="empty">No rules found. Click "Add Rule" to create one.</p>` : o`
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
              ${this._filtered.map((e) => o`
                <uui-table-row>
                  <uui-table-cell><code>${e.documentTypeAlias}</code></uui-table-cell>
                  <uui-table-cell><code>${e.propertyAlias}</code></uui-table-cell>
                  <uui-table-cell>${e.defaultValue}</uui-table-cell>
                  <uui-table-cell>${e.priority}</uui-table-cell>
                  <uui-table-cell><span class="${e.isEnabled ? "badge-enabled" : "badge-disabled"}">${e.isEnabled ? "Yes" : "No"}</span></uui-table-cell>
                  <uui-table-cell>
                    <div class="actions">
                      <uui-button look="secondary" label="Edit" @click=${() => this._edit(e)}>Edit</uui-button>
                      <uui-button look="danger" label="Delete" @click=${() => this._delete(e)}>Delete</uui-button>
                    </div>
                  </uui-table-cell>
                </uui-table-row>
              `)}
            </uui-table>
          </uui-box>
        `}
    `;
  }
};
t.styles = h`
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
a([
  u()
], t.prototype, "_rules", 2);
a([
  u()
], t.prototype, "_loading", 2);
a([
  u()
], t.prototype, "_showForm", 2);
a([
  u()
], t.prototype, "_saving", 2);
a([
  u()
], t.prototype, "_filter", 2);
a([
  u()
], t.prototype, "_form", 2);
t = a([
  f("defaultvalue-dashboard")
], t);
const v = t;
export {
  t as DefaultValueDashboardElement,
  v as default
};
