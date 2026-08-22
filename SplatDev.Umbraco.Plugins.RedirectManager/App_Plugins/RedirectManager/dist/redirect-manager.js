import { LitElement as E, html as d, css as R, state as u, customElement as x } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as k } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as U } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as C } from "@umbraco-cms/backoffice/notification";
function F(e) {
  let t = null, r = null;
  const c = e.consumeContext.bind(e), l = new Promise((s) => {
    c(U, async (i) => {
      var h;
      try {
        t = await ((h = i == null ? void 0 : i.getLatestToken) == null ? void 0 : h.call(i)) ?? null;
      } catch {
        t = null;
      }
      s();
    }), setTimeout(s, 3e3);
  });
  return c(C, (s) => {
    r = s;
  }), async (s, i = {}) => {
    await l;
    const h = new Headers(i.headers);
    t && !h.has("Authorization") && h.set("Authorization", `Bearer ${t}`);
    const n = await fetch(s, { ...i, credentials: "same-origin", headers: h });
    if (!n.ok) {
      const b = n.status === 401 || n.status === 403, $ = b ? "Not authorised" : "Could not load data", g = b ? `The backoffice token was ${t ? "sent but rejected" : "not available"} (${n.status}). Anything shown below may be empty because the request was refused, not because there is nothing to show.` : `The request failed with ${n.status}. Anything shown below may be incomplete.`;
      console.error(`[SplatDev] ${n.status} from ${String(s)} — ${g}`), r == null || r.peek("danger", { data: { headline: $, message: g } });
    }
    return n;
  };
}
var z = Object.defineProperty, S = Object.getOwnPropertyDescriptor, w = (e) => {
  throw TypeError(e);
}, o = (e, t, r, c) => {
  for (var l = c > 1 ? void 0 : c ? S(t, r) : t, s = e.length - 1, i; s >= 0; s--)
    (i = e[s]) && (l = (c ? i(t, r, l) : i(l)) || l);
  return c && l && z(t, r, l), l;
}, y = (e, t, r) => t.has(e) || w("Cannot " + r), _ = (e, t, r) => (y(e, t, "read from private field"), r ? r.call(e) : t.get(e)), v = (e, t, r) => t.has(e) ? w("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), O = (e, t, r) => (y(e, t, "access private method"), r), m, f, T;
const p = "/umbraco/api/redirectmanager";
let a = class extends k(E) {
  constructor() {
    super(...arguments), v(this, f), v(this, m, F(this)), this._redirects = [], this._loading = !1, this._message = "", this._showForm = !1, this._editItem = null, this._formUrl = "", this._formRedirectTo = "", this._filter = "", this._loadError = null;
  }
  connectedCallback() {
    super.connectedCallback(), this._load();
  }
  async _load() {
    this._loading = !0;
    try {
      const e = await _(this, m).call(this, `${p}/all`);
      O(this, f, T).call(this, e) && (this._redirects = await e.json());
    } catch {
      this._loadError ?? (this._loadError = "The request failed. See the browser console for details."), this._redirects = [];
    }
    this._loading = !1;
  }
  _openCreate() {
    this._editItem = null, this._formUrl = "", this._formRedirectTo = "", this._showForm = !0, this._message = "";
  }
  _openEdit(e) {
    this._editItem = e, this._formUrl = e.url, this._formRedirectTo = e.redirectToUrl, this._showForm = !0, this._message = "";
  }
  _cancelForm() {
    this._showForm = !1, this._editItem = null, this._formUrl = "", this._formRedirectTo = "";
  }
  async _save() {
    var t;
    if (!this._formUrl.trim() || !this._formRedirectTo.trim()) {
      this._message = "Both URL and Redirect To are required.";
      return;
    }
    const e = {
      id: ((t = this._editItem) == null ? void 0 : t.id) ?? 0,
      url: this._formUrl.trim(),
      redirectToUrl: this._formRedirectTo.trim()
    };
    try {
      this._editItem ? (await _(this, m).call(this, `${p}/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(e)
      }), this._message = "Redirect updated.") : (await _(this, m).call(this, `${p}/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(e)
      }), this._message = "Redirect created."), this._showForm = !1, this._editItem = null, await this._load();
    } catch {
      this._loadError ?? (this._loadError = "The request failed. See the browser console for details."), this._message = "Error saving redirect.";
    }
  }
  async _delete(e) {
    if (confirm("Delete this redirect?"))
      try {
        await _(this, m).call(this, `${p}/${e}`, { method: "DELETE" }), await this._load(), this._message = "Redirect deleted.";
      } catch {
        this._loadError ?? (this._loadError = "The request failed. See the browser console for details."), this._message = "Error deleting redirect.";
      }
  }
  get _filtered() {
    if (!this._filter) return this._redirects;
    const e = this._filter.toLowerCase();
    return this._redirects.filter(
      (t) => t.url.toLowerCase().includes(e) || t.redirectToUrl.toLowerCase().includes(e)
    );
  }
  _renderForm() {
    return d`
      <uui-box headline=${this._editItem ? "Edit Redirect" : "New Redirect"}>
        <div class="form">
          <div class="field">
            <label>From URL</label>
            <uui-input
              .value=${this._formUrl}
              placeholder="/old-path"
              @input=${(e) => this._formUrl = e.target.value}
            ></uui-input>
          </div>
          <div class="field">
            <label>Redirect To</label>
            <uui-input
              .value=${this._formRedirectTo}
              placeholder="/new-path"
              @input=${(e) => this._formRedirectTo = e.target.value}
            ></uui-input>
          </div>
          ${this._message ? d`<div class="message error">${this._message}</div>` : ""}
          <div class="form-actions">
            <uui-button look="primary" label="Save" @click=${this._save}>Save</uui-button>
            <uui-button look="secondary" label="Cancel" @click=${this._cancelForm}>Cancel</uui-button>
          </div>
        </div>
      </uui-box>
    `;
  }
  render() {
    return d`
      ${this._loadError ? d`<div class="splatdev-load-error" role="alert">${this._loadError}</div>` : ""}
      <div class="dashboard">
        <div class="header">
          <div>
            <h1>Redirect Manager</h1>
            <p>Manage URL redirects for your Umbraco site.</p>
          </div>
          <uui-button
            look="primary"
            label="Add Redirect"
            @click=${this._openCreate}
          >+ Add Redirect</uui-button>
        </div>

        ${this._message && !this._showForm ? d`<div class="message success">${this._message}</div>` : ""}

        ${this._showForm ? this._renderForm() : ""}

        <uui-box headline="Redirects (${this._filtered.length})">
          <div slot="header" class="search-wrap">
            <uui-input
              placeholder="Search..."
              .value=${this._filter}
              @input=${(e) => this._filter = e.target.value}
            ></uui-input>
          </div>

          ${this._loading ? d`<div class="loading">Loading...</div>` : this._filtered.length === 0 ? d`<p class="empty">No redirects found.</p>` : d`
              <uui-table>
                <uui-table-head>
                  <uui-table-head-cell>From URL</uui-table-head-cell>
                  <uui-table-head-cell>Redirect To</uui-table-head-cell>
                  <uui-table-head-cell>Created</uui-table-head-cell>
                  <uui-table-head-cell></uui-table-head-cell>
                </uui-table-head>
                ${this._filtered.map(
      (e) => d`
                    <uui-table-row>
                      <uui-table-cell>${e.url}</uui-table-cell>
                      <uui-table-cell>${e.redirectToUrl}</uui-table-cell>
                      <uui-table-cell>
                        ${e.createdOn ? new Date(e.createdOn).toLocaleDateString() : "—"}
                      </uui-table-cell>
                      <uui-table-cell class="actions-cell">
                        <uui-button
                          compact
                          look="secondary"
                          label="Edit"
                          @click=${() => this._openEdit(e)}
                        >Edit</uui-button>
                        <uui-button
                          compact
                          look="danger"
                          label="Delete"
                          @click=${() => this._delete(e.id)}
                        >Delete</uui-button>
                      </uui-table-cell>
                    </uui-table-row>
                  `
    )}
              </uui-table>
            `}
        </uui-box>
      </div>
    `;
  }
};
m = /* @__PURE__ */ new WeakMap();
f = /* @__PURE__ */ new WeakSet();
T = function(e) {
  return e.ok ? (this._loadError = null, !0) : (this._loadError = e.status === 401 || e.status === 403 ? "You are not authorised to do that. The request was refused, so anything shown below may be incomplete." : `The request did not succeed — the server returned ${e.status}${e.statusText ? ` ${e.statusText}` : ""}.`, !1);
};
a.styles = R`
    :host {
      display: block;
      padding: var(--uui-size-layout-1);
    }
    .dashboard {
      max-width: 1200px;
      display: flex;
      flex-direction: column;
      gap: var(--uui-size-space-5);
    }
    .header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: var(--uui-size-space-3);
    }
    .header h1 {
      margin: 0 0 var(--uui-size-2) 0;
      font-size: 1.5rem;
    }
    .header p {
      margin: 0;
      color: var(--uui-color-text-alt);
    }
    .form {
      display: flex;
      flex-direction: column;
      gap: var(--uui-size-space-3);
      max-width: 600px;
    }
    .field {
      display: flex;
      flex-direction: column;
      gap: var(--uui-size-2);
    }
    .field label {
      font-weight: 600;
      font-size: 0.875rem;
    }
    .field uui-input {
      width: 100%;
    }
    .form-actions {
      display: flex;
      gap: var(--uui-size-space-3);
    }
    .message {
      padding: var(--uui-size-space-3);
      border-radius: var(--uui-border-radius);
    }
    .message.success {
      background: var(--uui-color-positive-standalone);
      color: white;
    }
    .message.error {
      background: var(--uui-color-danger-standalone);
      color: white;
    }
    .search-wrap {
      margin-bottom: var(--uui-size-space-3);
    }
    .loading,
    .empty {
      color: var(--uui-color-text-alt);
      font-style: italic;
    }
    .actions-cell {
      display: flex;
      gap: var(--uui-size-2);
    }
    uui-table {
      width: 100%;
    }
  
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
o([
  u()
], a.prototype, "_redirects", 2);
o([
  u()
], a.prototype, "_loading", 2);
o([
  u()
], a.prototype, "_message", 2);
o([
  u()
], a.prototype, "_showForm", 2);
o([
  u()
], a.prototype, "_editItem", 2);
o([
  u()
], a.prototype, "_formUrl", 2);
o([
  u()
], a.prototype, "_formRedirectTo", 2);
o([
  u()
], a.prototype, "_filter", 2);
o([
  u()
], a.prototype, "_loadError", 2);
a = o([
  x("redirect-manager-dashboard")
], a);
export {
  a as RedirectManagerDashboardElement
};
//# sourceMappingURL=redirect-manager.js.map
