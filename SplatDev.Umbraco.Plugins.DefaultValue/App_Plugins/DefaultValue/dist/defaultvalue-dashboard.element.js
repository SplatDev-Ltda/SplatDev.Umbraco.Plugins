import { LitElement as f, html as n, nothing as m, css as b, state as d, customElement as _ } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as y } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as g } from "@umbraco-cms/backoffice/auth";
function v(e) {
  let t = null;
  const l = new Promise((i) => {
    e.consumeContext(g, async (a) => {
      var r;
      try {
        t = await ((r = a == null ? void 0 : a.getLatestToken) == null ? void 0 : r.call(a)) ?? null;
      } catch {
        t = null;
      }
      i();
    }), setTimeout(i, 3e3);
  });
  return async (i, a = {}) => {
    await l;
    const r = new Headers(a.headers);
    t && !r.has("Authorization") && r.set("Authorization", `Bearer ${t}`);
    const u = await fetch(i, { ...a, credentials: "same-origin", headers: r });
    return (u.status === 401 || u.status === 403) && console.error(
      `[SplatDev] ${u.status} from ${String(i)} — the backoffice token was ${t ? "sent but rejected" : "not available"}. The dashboard may render as empty.`
    ), u;
  };
}
var w = Object.defineProperty, $ = Object.getOwnPropertyDescriptor, h = (e) => {
  throw TypeError(e);
}, s = (e, t, l, i) => {
  for (var a = i > 1 ? void 0 : i ? $(t, l) : t, r = e.length - 1, u; r >= 0; r--)
    (u = e[r]) && (a = (i ? u(t, l, a) : u(a)) || a);
  return i && a && w(t, l, a), a;
}, x = (e, t, l) => t.has(e) || h("Cannot " + l), c = (e, t, l) => (x(e, t, "read from private field"), l ? l.call(e) : t.get(e)), A = (e, t, l) => t.has(e) ? h("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, l), p;
let o = class extends y(f) {
  constructor() {
    super(...arguments), A(this, p, v(this)), this._rules = [], this._loading = !1, this._showForm = !1, this._saving = !1, this._filter = "", this._form = this._emptyForm(), this._api = "/umbraco/api/defaultvalue";
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
      const e = await c(this, p).call(this, `${this._api}/GetRules`);
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
      (t) => t.documentTypeAlias.toLowerCase().includes(e) || t.propertyAlias.toLowerCase().includes(e)
    ) : this._rules;
  }
  _edit(e) {
    this._form = { ...e }, this._showForm = !0;
  }
  async _delete(e) {
    confirm("Delete this rule?") && (await c(this, p).call(this, `${this._api}/DeleteRule?id=${e.id}`, { method: "DELETE" }), await this._load());
  }
  async _save() {
    this._saving = !0;
    try {
      await c(this, p).call(this, `${this._api}/SaveRule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(this._form)
      }), this._showForm = !1, await this._load();
    } finally {
      this._saving = !1;
    }
  }
  _renderForm() {
    return n`
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
    return n`
      <h1>Default Values</h1>
      <p class="description">Configure default property values per document type. Applied automatically when new content nodes are created.</p>

      <div class="toolbar">
        <uui-button look="primary" label="Add Rule" @click=${() => {
      this._form = this._emptyForm(), this._showForm = !0;
    }}>Add Rule</uui-button>
        <uui-input placeholder="Filter by doc type or property..." @input=${(e) => this._filter = e.target.value} style="flex:1;max-width:300px;"></uui-input>
      </div>

      ${this._showForm ? this._renderForm() : m}

      ${this._loading ? n`<p>Loading rules...</p>` : this._filtered.length === 0 ? n`<p class="empty">No rules found. Click "Add Rule" to create one.</p>` : n`
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
              ${this._filtered.map((e) => n`
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
p = /* @__PURE__ */ new WeakMap();
o.styles = b`
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
s([
  d()
], o.prototype, "_rules", 2);
s([
  d()
], o.prototype, "_loading", 2);
s([
  d()
], o.prototype, "_showForm", 2);
s([
  d()
], o.prototype, "_saving", 2);
s([
  d()
], o.prototype, "_filter", 2);
s([
  d()
], o.prototype, "_form", 2);
o = s([
  _("defaultvalue-dashboard")
], o);
const T = o;
export {
  o as DefaultValueDashboardElement,
  T as default
};
