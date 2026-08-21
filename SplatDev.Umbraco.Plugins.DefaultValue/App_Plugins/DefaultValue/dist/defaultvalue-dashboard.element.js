import { LitElement as x, html as d, nothing as E, css as T, state as h, customElement as k } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as A } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as D } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as C } from "@umbraco-cms/backoffice/notification";
function F(e) {
  let t = null, a = null;
  const u = e.consumeContext.bind(e), o = new Promise((i) => {
    u(D, async (l) => {
      var c;
      try {
        t = await ((c = l == null ? void 0 : l.getLatestToken) == null ? void 0 : c.call(l)) ?? null;
      } catch {
        t = null;
      }
      i();
    }), setTimeout(i, 3e3);
  });
  return u(C, (i) => {
    a = i;
  }), async (i, l = {}) => {
    await o;
    const c = new Headers(l.headers);
    t && !c.has("Authorization") && c.set("Authorization", `Bearer ${t}`);
    const n = await fetch(i, { ...l, credentials: "same-origin", headers: c });
    if (!n.ok) {
      const b = n.status === 401 || n.status === 403, $ = b ? "Not authorised" : "Could not load data", _ = b ? `The backoffice token was ${t ? "sent but rejected" : "not available"} (${n.status}). Anything shown below may be empty because the request was refused, not because there is nothing to show.` : `The request failed with ${n.status}. Anything shown below may be incomplete.`;
      console.error(`[SplatDev] ${n.status} from ${String(i)} — ${_}`), a == null || a.peek("danger", { data: { headline: $, message: _ } });
    }
    return n;
  };
}
var V = Object.defineProperty, O = Object.getOwnPropertyDescriptor, y = (e) => {
  throw TypeError(e);
}, s = (e, t, a, u) => {
  for (var o = u > 1 ? void 0 : u ? O(t, a) : t, i = e.length - 1, l; i >= 0; i--)
    (l = e[i]) && (o = (u ? l(t, a, o) : l(o)) || o);
  return u && o && V(t, a, o), o;
}, v = (e, t, a) => t.has(e) || y("Cannot " + a), f = (e, t, a) => (v(e, t, "read from private field"), a ? a.call(e) : t.get(e)), g = (e, t, a) => t.has(e) ? y("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, a), P = (e, t, a) => (v(e, t, "access private method"), a), p, m, w;
let r = class extends A(x) {
  constructor() {
    super(...arguments), g(this, m), g(this, p, F(this)), this._rules = [], this._loading = !1, this._showForm = !1, this._saving = !1, this._filter = "", this._form = this._emptyForm(), this._loadError = null, this._api = "/umbraco/api/defaultvalue";
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
      const e = await f(this, p).call(this, `${this._api}/GetRules`);
      P(this, m, w).call(this, e) && (this._rules = await e.json());
    } catch {
      this._loadError ?? (this._loadError = "The request failed. See the browser console for details."), this._rules = [];
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
    confirm("Delete this rule?") && (await f(this, p).call(this, `${this._api}/DeleteRule?id=${e.id}`, { method: "DELETE" }), await this._load());
  }
  async _save() {
    this._saving = !0;
    try {
      await f(this, p).call(this, `${this._api}/SaveRule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(this._form)
      }), this._showForm = !1, await this._load();
    } finally {
      this._saving = !1;
    }
  }
  _renderForm() {
    return d`
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
    return d`
      ${this._loadError ? d`<div class="splatdev-load-error" role="alert">${this._loadError}</div>` : ""}
      <h1>Default Values</h1>
      <p class="description">Configure default property values per document type. Applied automatically when new content nodes are created.</p>

      <div class="toolbar">
        <uui-button look="primary" label="Add Rule" @click=${() => {
      this._form = this._emptyForm(), this._showForm = !0;
    }}>Add Rule</uui-button>
        <uui-input placeholder="Filter by doc type or property..." @input=${(e) => this._filter = e.target.value} style="flex:1;max-width:300px;"></uui-input>
      </div>

      ${this._showForm ? this._renderForm() : E}

      ${this._loading ? d`<p>Loading rules...</p>` : this._filtered.length === 0 ? d`<p class="empty">No rules found. Click "Add Rule" to create one.</p>` : d`
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
              ${this._filtered.map((e) => d`
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
m = /* @__PURE__ */ new WeakSet();
w = function(e) {
  return e.ok ? (this._loadError = null, !0) : (this._loadError = e.status === 401 || e.status === 403 ? "You are not authorised to do that. The request was refused, so anything shown below may be incomplete." : `The request did not succeed — the server returned ${e.status}${e.statusText ? ` ${e.statusText}` : ""}.`, !1);
};
r.styles = T`
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
  
    .splatdev-load-error {
      display: flex;
      gap: 8px;
      align-items: flex-start;
      margin: 0 0 16px;
      padding: 12px 14px;
      border-left: 3px solid var(--uui-color-danger, #d42054);
      background: var(--uui-color-danger-emphasis, #fdeaef);
      color: var(--uui-color-danger-contrast, #6d0f28);
      font-size: 0.9rem;
      border-radius: 3px;
    }
  `;
s([
  h()
], r.prototype, "_rules", 2);
s([
  h()
], r.prototype, "_loading", 2);
s([
  h()
], r.prototype, "_showForm", 2);
s([
  h()
], r.prototype, "_saving", 2);
s([
  h()
], r.prototype, "_filter", 2);
s([
  h()
], r.prototype, "_form", 2);
s([
  h()
], r.prototype, "_loadError", 2);
r = s([
  k("defaultvalue-dashboard")
], r);
const L = r;
export {
  r as DefaultValueDashboardElement,
  L as default
};
