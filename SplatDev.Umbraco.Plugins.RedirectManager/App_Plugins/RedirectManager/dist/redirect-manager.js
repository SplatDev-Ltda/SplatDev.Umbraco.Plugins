import { LitElement as w, html as d, css as y, state as u, customElement as $ } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as T } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as R } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as U } from "@umbraco-cms/backoffice/notification";
function k(e) {
  let t = null, i = null;
  const c = e.consumeContext.bind(e), l = new Promise((r) => {
    c(R, async (a) => {
      var h;
      try {
        t = await ((h = a == null ? void 0 : a.getLatestToken) == null ? void 0 : h.call(a)) ?? null;
      } catch {
        t = null;
      }
      r();
    }), setTimeout(r, 3e3);
  });
  return c(U, (r) => {
    i = r;
  }), async (r, a = {}) => {
    await l;
    const h = new Headers(a.headers);
    t && !h.has("Authorization") && h.set("Authorization", `Bearer ${t}`);
    const n = await fetch(r, { ...a, credentials: "same-origin", headers: h });
    if (!n.ok) {
      const f = n.status === 401 || n.status === 403, v = f ? "Not authorised" : "Could not load data", b = f ? `The backoffice token was ${t ? "sent but rejected" : "not available"} (${n.status}). Anything shown below may be empty because the request was refused, not because there is nothing to show.` : `The request failed with ${n.status}. Anything shown below may be incomplete.`;
      console.error(`[SplatDev] ${n.status} from ${String(r)} — ${b}`), i == null || i.peek("danger", { data: { headline: v, message: b } });
    }
    return n;
  };
}
var C = Object.defineProperty, E = Object.getOwnPropertyDescriptor, g = (e) => {
  throw TypeError(e);
}, o = (e, t, i, c) => {
  for (var l = c > 1 ? void 0 : c ? E(t, i) : t, r = e.length - 1, a; r >= 0; r--)
    (a = e[r]) && (l = (c ? a(t, i, l) : a(l)) || l);
  return c && l && C(t, i, l), l;
}, x = (e, t, i) => t.has(e) || g("Cannot " + i), _ = (e, t, i) => (x(e, t, "read from private field"), i ? i.call(e) : t.get(e)), F = (e, t, i) => t.has(e) ? g("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), m;
const p = "/umbraco/backoffice/api/RedirectManager";
let s = class extends T(w) {
  constructor() {
    super(...arguments), F(this, m, k(this)), this._redirects = [], this._loading = !1, this._message = "", this._showForm = !1, this._editItem = null, this._formUrl = "", this._formRedirectTo = "", this._filter = "";
  }
  connectedCallback() {
    super.connectedCallback(), this._load();
  }
  async _load() {
    this._loading = !0;
    try {
      const e = await _(this, m).call(this, `${p}/GetAll`);
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
      this._editItem ? (await _(this, m).call(this, `${p}/Put`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(e)
      }), this._message = "Redirect updated.") : (await _(this, m).call(this, `${p}/Post`, {
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
        await _(this, m).call(this, `${p}/Delete?id=${e}`, { method: "DELETE" }), await this._load(), this._message = "Redirect deleted.";
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
s.styles = y`
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
  u()
], s.prototype, "_redirects", 2);
o([
  u()
], s.prototype, "_loading", 2);
o([
  u()
], s.prototype, "_message", 2);
o([
  u()
], s.prototype, "_showForm", 2);
o([
  u()
], s.prototype, "_editItem", 2);
o([
  u()
], s.prototype, "_formUrl", 2);
o([
  u()
], s.prototype, "_formRedirectTo", 2);
o([
  u()
], s.prototype, "_filter", 2);
s = o([
  $("redirect-manager-dashboard")
], s);
export {
  s as RedirectManagerDashboardElement
};
//# sourceMappingURL=redirect-manager.js.map
