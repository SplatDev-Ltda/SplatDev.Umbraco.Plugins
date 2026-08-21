import { LitElement as x, html as s, nothing as g, css as k, state as b, customElement as T } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as F } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as A } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as D } from "@umbraco-cms/backoffice/notification";
function O(e) {
  let t = null, a = null;
  const u = e.consumeContext.bind(e), r = new Promise((i) => {
    u(A, async (l) => {
      var c;
      try {
        t = await ((c = l == null ? void 0 : l.getLatestToken) == null ? void 0 : c.call(l)) ?? null;
      } catch {
        t = null;
      }
      i();
    }), setTimeout(i, 3e3);
  });
  return u(D, (i) => {
    a = i;
  }), async (i, l = {}) => {
    await r;
    const c = new Headers(l.headers);
    t && !c.has("Authorization") && c.set("Authorization", `Bearer ${t}`);
    const n = await fetch(i, { ...l, credentials: "same-origin", headers: c });
    if (!n.ok) {
      const f = n.status === 401 || n.status === 403, E = f ? "Not authorised" : "Could not load data", _ = f ? `The backoffice token was ${t ? "sent but rejected" : "not available"} (${n.status}). Anything shown below may be empty because the request was refused, not because there is nothing to show.` : `The request failed with ${n.status}. Anything shown below may be incomplete.`;
      console.error(`[SplatDev] ${n.status} from ${String(i)} — ${_}`), a == null || a.peek("danger", { data: { headline: E, message: _ } });
    }
    return n;
  };
}
var C = Object.defineProperty, S = Object.getOwnPropertyDescriptor, w = (e) => {
  throw TypeError(e);
}, d = (e, t, a, u) => {
  for (var r = u > 1 ? void 0 : u ? S(t, a) : t, i = e.length - 1, l; i >= 0; i--)
    (l = e[i]) && (r = (u ? l(t, a, r) : l(r)) || r);
  return u && r && C(t, a, r), r;
}, $ = (e, t, a) => t.has(e) || w("Cannot " + a), p = (e, t, a) => ($(e, t, "read from private field"), a ? a.call(e) : t.get(e)), v = (e, t, a) => t.has(e) ? w("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, a), N = (e, t, a) => ($(e, t, "access private method"), a), h, m, y;
let o = class extends F(x) {
  constructor() {
    super(...arguments), v(this, m), v(this, h, O(this)), this._features = [], this._loading = !1, this._showForm = !1, this._saving = !1, this._form = this._emptyForm(), this._loadError = null, this._api = "/umbraco/api/onoff";
  }
  _emptyForm() {
    return { name: "", alias: "", description: "", isEnabled: !1, scheduledEnableAt: null, scheduledDisableAt: null };
  }
  connectedCallback() {
    super.connectedCallback(), this._load();
  }
  async _load() {
    this._loading = !0;
    try {
      const e = await p(this, h).call(this, `${this._api}/GetAll`);
      N(this, m, y).call(this, e) && (this._features = await e.json());
    } catch {
      this._loadError ?? (this._loadError = "The request failed. See the browser console for details."), this._features = [];
    } finally {
      this._loading = !1;
    }
  }
  async _toggle(e) {
    const t = e.isEnabled ? "Disable" : "Enable";
    await p(this, h).call(this, `${this._api}/${t}?alias=${encodeURIComponent(e.alias)}`, { method: "POST" }), await this._load();
  }
  async _delete(e) {
    confirm(`Delete feature '${e.name}'?`) && (await p(this, h).call(this, `${this._api}/Delete?id=${e.id}`, { method: "DELETE" }), await this._load());
  }
  _edit(e) {
    this._form = { ...e }, this._showForm = !0;
  }
  _newFeature() {
    this._form = this._emptyForm(), this._showForm = !0;
  }
  async _save() {
    this._saving = !0;
    try {
      await p(this, h).call(this, `${this._api}/UpsertFeature`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(this._form)
      }), this._showForm = !1, await this._load();
    } finally {
      this._saving = !1;
    }
  }
  _formatDate(e) {
    return e ? new Date(e).toLocaleString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";
  }
  _renderForm() {
    return s`
      <div class="form-card">
        <h3>${this._form.id ? "Edit" : "New"} Feature Toggle</h3>
        <div class="form-row">
          <label>Name</label>
          <uui-input .value=${this._form.name} @input=${(e) => this._form = { ...this._form, name: e.target.value }} placeholder="My Feature"></uui-input>
        </div>
        <div class="form-row">
          <label>Alias</label>
          <uui-input .value=${this._form.alias} @input=${(e) => this._form = { ...this._form, alias: e.target.value }} placeholder="myFeature"></uui-input>
        </div>
        <div class="form-row">
          <label>Description</label>
          <uui-input .value=${this._form.description} @input=${(e) => this._form = { ...this._form, description: e.target.value }} placeholder="Optional description"></uui-input>
        </div>
        <div class="form-row">
          <uui-toggle .checked=${this._form.isEnabled} @change=${(e) => this._form = { ...this._form, isEnabled: e.target.checked }} label="Enabled"></uui-toggle>
        </div>
        <div class="form-row">
          <label>Scheduled Enable At (UTC)</label>
          <uui-input type="datetime-local" .value=${this._form.scheduledEnableAt ?? ""} @input=${(e) => this._form = { ...this._form, scheduledEnableAt: e.target.value || null }}></uui-input>
        </div>
        <div class="form-row">
          <label>Scheduled Disable At (UTC)</label>
          <uui-input type="datetime-local" .value=${this._form.scheduledDisableAt ?? ""} @input=${(e) => this._form = { ...this._form, scheduledDisableAt: e.target.value || null }}></uui-input>
        </div>
        <div class="form-actions">
          <uui-button look="primary" label="Save" ?disabled=${this._saving} @click=${this._save}>Save</uui-button>
          <uui-button look="secondary" label="Cancel" @click=${() => this._showForm = !1}>Cancel</uui-button>
        </div>
      </div>
    `;
  }
  render() {
    return s`
      ${this._loadError ? s`<div class="splatdev-load-error" role="alert">${this._loadError}</div>` : ""}
      <h1>Feature Toggles</h1>
      <p class="description">Enable, disable and schedule site features from the Umbraco backoffice.</p>

      <div class="toolbar">
        <uui-button look="primary" label="Add Feature Toggle" @click=${this._newFeature}>Add Feature Toggle</uui-button>
      </div>

      ${this._showForm ? this._renderForm() : g}

      ${this._loading ? s`<p>Loading feature toggles...</p>` : this._features.length === 0 ? s`<p class="empty">No feature toggles found. Click "Add Feature Toggle" to create one.</p>` : s`
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
              ${this._features.map((e) => s`
                <uui-table-row>
                  <uui-table-cell>
                    <strong>${e.name}</strong>
                    ${e.description ? s`<br/><small style="color:#6b7280">${e.description}</small>` : g}
                  </uui-table-cell>
                  <uui-table-cell><code>${e.alias}</code></uui-table-cell>
                  <uui-table-cell><span class="badge ${e.isEnabled ? "on" : "off"}">${e.isEnabled ? "ON" : "OFF"}</span></uui-table-cell>
                  <uui-table-cell>${this._formatDate(e.scheduledEnableAt)}</uui-table-cell>
                  <uui-table-cell>${this._formatDate(e.scheduledDisableAt)}</uui-table-cell>
                  <uui-table-cell>${this._formatDate(e.updatedAt)}</uui-table-cell>
                  <uui-table-cell>
                    <div class="actions">
                      <uui-button look="secondary" label="${e.isEnabled ? "Disable" : "Enable"}" @click=${() => this._toggle(e)}>${e.isEnabled ? "Disable" : "Enable"}</uui-button>
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
m = /* @__PURE__ */ new WeakSet();
y = function(e) {
  return e.ok ? (this._loadError = null, !0) : (this._loadError = e.status === 401 || e.status === 403 ? "You are not authorised to do that. The request was refused, so anything shown below may be incomplete." : `The request did not succeed — the server returned ${e.status}${e.statusText ? ` ${e.statusText}` : ""}.`, !1);
};
o.styles = k`
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
d([
  b()
], o.prototype, "_features", 2);
d([
  b()
], o.prototype, "_loading", 2);
d([
  b()
], o.prototype, "_showForm", 2);
d([
  b()
], o.prototype, "_saving", 2);
d([
  b()
], o.prototype, "_form", 2);
d([
  b()
], o.prototype, "_loadError", 2);
o = d([
  T("onoff-dashboard")
], o);
const q = o;
export {
  o as OnOffDashboardElement,
  q as default
};
