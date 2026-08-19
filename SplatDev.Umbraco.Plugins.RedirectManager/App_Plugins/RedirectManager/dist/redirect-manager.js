import { LitElement as p, html as u, css as f, state as c, customElement as b } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as v } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as g } from "@umbraco-cms/backoffice/auth";
function y(e) {
  let t = null;
  const a = new Promise((s) => {
    e.consumeContext(g, async (i) => {
      var l;
      try {
        t = await ((l = i == null ? void 0 : i.getLatestToken) == null ? void 0 : l.call(i)) ?? null;
      } catch {
        t = null;
      }
      s();
    }), setTimeout(s, 3e3);
  });
  return async (s, i = {}) => {
    await a;
    const l = new Headers(i.headers);
    t && !l.has("Authorization") && l.set("Authorization", `Bearer ${t}`);
    const d = await fetch(s, { ...i, credentials: "same-origin", headers: l });
    return (d.status === 401 || d.status === 403) && console.error(
      `[SplatDev] ${d.status} from ${String(s)} — the backoffice token was ${t ? "sent but rejected" : "not available"}. The dashboard may render as empty.`
    ), d;
  };
}
var w = Object.defineProperty, $ = Object.getOwnPropertyDescriptor, _ = (e) => {
  throw TypeError(e);
}, o = (e, t, a, s) => {
  for (var i = s > 1 ? void 0 : s ? $(t, a) : t, l = e.length - 1, d; l >= 0; l--)
    (d = e[l]) && (i = (s ? d(t, a, i) : d(i)) || i);
  return s && i && w(t, a, i), i;
}, T = (e, t, a) => t.has(e) || _("Cannot " + a), h = (e, t, a) => (T(e, t, "read from private field"), a ? a.call(e) : t.get(e)), R = (e, t, a) => t.has(e) ? _("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, a), n;
const m = "/umbraco/backoffice/api/RedirectManager";
let r = class extends v(p) {
  constructor() {
    super(...arguments), R(this, n, y(this)), this._redirects = [], this._loading = !1, this._message = "", this._showForm = !1, this._editItem = null, this._formUrl = "", this._formRedirectTo = "", this._filter = "";
  }
  connectedCallback() {
    super.connectedCallback(), this._load();
  }
  async _load() {
    this._loading = !0;
    try {
      const e = await h(this, n).call(this, `${m}/GetAll`);
      e.ok && (this._redirects = await e.json());
    } catch {
      this._redirects = [];
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
      this._editItem ? (await h(this, n).call(this, `${m}/Put`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(e)
      }), this._message = "Redirect updated.") : (await h(this, n).call(this, `${m}/Post`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(e)
      }), this._message = "Redirect created."), this._showForm = !1, this._editItem = null, await this._load();
    } catch {
      this._message = "Error saving redirect.";
    }
  }
  async _delete(e) {
    if (confirm("Delete this redirect?"))
      try {
        await h(this, n).call(this, `${m}/Delete?id=${e}`, { method: "DELETE" }), await this._load(), this._message = "Redirect deleted.";
      } catch {
        this._message = "Error deleting redirect.";
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
    return u`
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
          ${this._message ? u`<div class="message error">${this._message}</div>` : ""}
          <div class="form-actions">
            <uui-button look="primary" label="Save" @click=${this._save}>Save</uui-button>
            <uui-button look="secondary" label="Cancel" @click=${this._cancelForm}>Cancel</uui-button>
          </div>
        </div>
      </uui-box>
    `;
  }
  render() {
    return u`
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

        ${this._message && !this._showForm ? u`<div class="message success">${this._message}</div>` : ""}

        ${this._showForm ? this._renderForm() : ""}

        <uui-box headline="Redirects (${this._filtered.length})">
          <div slot="header" class="search-wrap">
            <uui-input
              placeholder="Search..."
              .value=${this._filter}
              @input=${(e) => this._filter = e.target.value}
            ></uui-input>
          </div>

          ${this._loading ? u`<div class="loading">Loading...</div>` : this._filtered.length === 0 ? u`<p class="empty">No redirects found.</p>` : u`
              <uui-table>
                <uui-table-head>
                  <uui-table-head-cell>From URL</uui-table-head-cell>
                  <uui-table-head-cell>Redirect To</uui-table-head-cell>
                  <uui-table-head-cell>Created</uui-table-head-cell>
                  <uui-table-head-cell></uui-table-head-cell>
                </uui-table-head>
                ${this._filtered.map(
      (e) => u`
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
n = /* @__PURE__ */ new WeakMap();
r.styles = f`
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
  `;
o([
  c()
], r.prototype, "_redirects", 2);
o([
  c()
], r.prototype, "_loading", 2);
o([
  c()
], r.prototype, "_message", 2);
o([
  c()
], r.prototype, "_showForm", 2);
o([
  c()
], r.prototype, "_editItem", 2);
o([
  c()
], r.prototype, "_formUrl", 2);
o([
  c()
], r.prototype, "_formRedirectTo", 2);
o([
  c()
], r.prototype, "_filter", 2);
r = o([
  b("redirect-manager-dashboard")
], r);
export {
  r as RedirectManagerDashboardElement
};
//# sourceMappingURL=redirect-manager.js.map
