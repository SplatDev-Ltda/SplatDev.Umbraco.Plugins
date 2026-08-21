import { LitElement as w, html as n, nothing as _, css as y, state as b, customElement as $ } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as E } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as k } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as x } from "@umbraco-cms/backoffice/notification";
function F(e) {
  let t = null, a = null;
  const r = e.consumeContext.bind(e), o = new Promise((i) => {
    r(k, async (l) => {
      var d;
      try {
        t = await ((d = l == null ? void 0 : l.getLatestToken) == null ? void 0 : d.call(l)) ?? null;
      } catch {
        t = null;
      }
      i();
    }), setTimeout(i, 3e3);
  });
  return r(x, (i) => {
    a = i;
  }), async (i, l = {}) => {
    await o;
    const d = new Headers(l.headers);
    t && !d.has("Authorization") && d.set("Authorization", `Bearer ${t}`);
    const u = await fetch(i, { ...l, credentials: "same-origin", headers: d });
    if (!u.ok) {
      const m = u.status === 401 || u.status === 403, v = m ? "Not authorised" : "Could not load data", f = m ? `The backoffice token was ${t ? "sent but rejected" : "not available"} (${u.status}). Anything shown below may be empty because the request was refused, not because there is nothing to show.` : `The request failed with ${u.status}. Anything shown below may be incomplete.`;
      console.error(`[SplatDev] ${u.status} from ${String(i)} — ${f}`), a == null || a.peek("danger", { data: { headline: v, message: f } });
    }
    return u;
  };
}
var A = Object.defineProperty, D = Object.getOwnPropertyDescriptor, g = (e) => {
  throw TypeError(e);
}, h = (e, t, a, r) => {
  for (var o = r > 1 ? void 0 : r ? D(t, a) : t, i = e.length - 1, l; i >= 0; i--)
    (l = e[i]) && (o = (r ? l(t, a, o) : l(o)) || o);
  return r && o && A(t, a, o), o;
}, T = (e, t, a) => t.has(e) || g("Cannot " + a), p = (e, t, a) => (T(e, t, "read from private field"), a ? a.call(e) : t.get(e)), C = (e, t, a) => t.has(e) ? g("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, a), c;
let s = class extends E(w) {
  constructor() {
    super(...arguments), C(this, c, F(this)), this._features = [], this._loading = !1, this._showForm = !1, this._saving = !1, this._form = this._emptyForm(), this._api = "/umbraco/api/onoff";
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
      const e = await p(this, c).call(this, `${this._api}/GetAll`);
      e.ok && (this._features = await e.json());
    } catch {
      this._features = [];
    } finally {
      this._loading = !1;
    }
  }
  async _toggle(e) {
    const t = e.isEnabled ? "Disable" : "Enable";
    await p(this, c).call(this, `${this._api}/${t}?alias=${encodeURIComponent(e.alias)}`, { method: "POST" }), await this._load();
  }
  async _delete(e) {
    confirm(`Delete feature '${e.name}'?`) && (await p(this, c).call(this, `${this._api}/Delete?id=${e.id}`, { method: "DELETE" }), await this._load());
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
      await p(this, c).call(this, `${this._api}/UpsertFeature`, {
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
    return n`
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
    return n`
      <h1>Feature Toggles</h1>
      <p class="description">Enable, disable and schedule site features from the Umbraco backoffice.</p>

      <div class="toolbar">
        <uui-button look="primary" label="Add Feature Toggle" @click=${this._newFeature}>Add Feature Toggle</uui-button>
      </div>

      ${this._showForm ? this._renderForm() : _}

      ${this._loading ? n`<p>Loading feature toggles...</p>` : this._features.length === 0 ? n`<p class="empty">No feature toggles found. Click "Add Feature Toggle" to create one.</p>` : n`
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
              ${this._features.map((e) => n`
                <uui-table-row>
                  <uui-table-cell>
                    <strong>${e.name}</strong>
                    ${e.description ? n`<br/><small style="color:#6b7280">${e.description}</small>` : _}
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
c = /* @__PURE__ */ new WeakMap();
s.styles = y`
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
h([
  b()
], s.prototype, "_features", 2);
h([
  b()
], s.prototype, "_loading", 2);
h([
  b()
], s.prototype, "_showForm", 2);
h([
  b()
], s.prototype, "_saving", 2);
h([
  b()
], s.prototype, "_form", 2);
s = h([
  $("onoff-dashboard")
], s);
const z = s;
export {
  s as OnOffDashboardElement,
  z as default
};
