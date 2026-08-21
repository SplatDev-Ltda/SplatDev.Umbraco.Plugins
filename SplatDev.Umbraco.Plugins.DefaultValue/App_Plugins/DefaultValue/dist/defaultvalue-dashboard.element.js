import { LitElement as g, html as c, nothing as v, css as w, state as p, customElement as $ } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as x } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as A } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as k } from "@umbraco-cms/backoffice/notification";
function T(e) {
  let t = null, a = null;
  const s = e.consumeContext.bind(e), r = new Promise((i) => {
    s(A, async (l) => {
      var d;
      try {
        t = await ((d = l == null ? void 0 : l.getLatestToken) == null ? void 0 : d.call(l)) ?? null;
      } catch {
        t = null;
      }
      i();
    }), setTimeout(i, 3e3);
  });
  return s(k, (i) => {
    a = i;
  }), async (i, l = {}) => {
    await r;
    const d = new Headers(l.headers);
    t && !d.has("Authorization") && d.set("Authorization", `Bearer ${t}`);
    const u = await fetch(i, { ...l, credentials: "same-origin", headers: d });
    if (!u.ok) {
      const m = u.status === 401 || u.status === 403, y = m ? "Not authorised" : "Could not load data", b = m ? `The backoffice token was ${t ? "sent but rejected" : "not available"} (${u.status}). Anything shown below may be empty because the request was refused, not because there is nothing to show.` : `The request failed with ${u.status}. Anything shown below may be incomplete.`;
      console.error(`[SplatDev] ${u.status} from ${String(i)} — ${b}`), a == null || a.peek("danger", { data: { headline: y, message: b } });
    }
    return u;
  };
}
var E = Object.defineProperty, C = Object.getOwnPropertyDescriptor, _ = (e) => {
  throw TypeError(e);
}, n = (e, t, a, s) => {
  for (var r = s > 1 ? void 0 : s ? C(t, a) : t, i = e.length - 1, l; i >= 0; i--)
    (l = e[i]) && (r = (s ? l(t, a, r) : l(r)) || r);
  return s && r && E(t, a, r), r;
}, D = (e, t, a) => t.has(e) || _("Cannot " + a), f = (e, t, a) => (D(e, t, "read from private field"), a ? a.call(e) : t.get(e)), F = (e, t, a) => t.has(e) ? _("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, a), h;
let o = class extends x(g) {
  constructor() {
    super(...arguments), F(this, h, T(this)), this._rules = [], this._loading = !1, this._showForm = !1, this._saving = !1, this._filter = "", this._form = this._emptyForm(), this._api = "/umbraco/api/defaultvalue";
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
      const e = await f(this, h).call(this, `${this._api}/GetRules`);
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
    confirm("Delete this rule?") && (await f(this, h).call(this, `${this._api}/DeleteRule?id=${e.id}`, { method: "DELETE" }), await this._load());
  }
  async _save() {
    this._saving = !0;
    try {
      await f(this, h).call(this, `${this._api}/SaveRule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(this._form)
      }), this._showForm = !1, await this._load();
    } finally {
      this._saving = !1;
    }
  }
  _renderForm() {
    return c`
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
    return c`
      <h1>Default Values</h1>
      <p class="description">Configure default property values per document type. Applied automatically when new content nodes are created.</p>

      <div class="toolbar">
        <uui-button look="primary" label="Add Rule" @click=${() => {
      this._form = this._emptyForm(), this._showForm = !0;
    }}>Add Rule</uui-button>
        <uui-input placeholder="Filter by doc type or property..." @input=${(e) => this._filter = e.target.value} style="flex:1;max-width:300px;"></uui-input>
      </div>

      ${this._showForm ? this._renderForm() : v}

      ${this._loading ? c`<p>Loading rules...</p>` : this._filtered.length === 0 ? c`<p class="empty">No rules found. Click "Add Rule" to create one.</p>` : c`
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
              ${this._filtered.map((e) => c`
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
h = /* @__PURE__ */ new WeakMap();
o.styles = w`
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
n([
  p()
], o.prototype, "_rules", 2);
n([
  p()
], o.prototype, "_loading", 2);
n([
  p()
], o.prototype, "_showForm", 2);
n([
  p()
], o.prototype, "_saving", 2);
n([
  p()
], o.prototype, "_filter", 2);
n([
  p()
], o.prototype, "_form", 2);
o = n([
  $("defaultvalue-dashboard")
], o);
const S = o;
export {
  o as DefaultValueDashboardElement,
  S as default
};
