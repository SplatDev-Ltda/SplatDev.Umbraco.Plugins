import { LitElement as v, html as c, css as y, state as u, customElement as U } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as w } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as C } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as S } from "@umbraco-cms/backoffice/notification";
function $(e) {
  let t = null, i = null;
  const n = e.consumeContext.bind(e), l = new Promise((r) => {
    n(C, async (o) => {
      var d;
      try {
        t = await ((d = o == null ? void 0 : o.getLatestToken) == null ? void 0 : d.call(o)) ?? null;
      } catch {
        t = null;
      }
      r();
    }), setTimeout(r, 3e3);
  });
  return n(S, (r) => {
    i = r;
  }), async (r, o = {}) => {
    await l;
    const d = new Headers(o.headers);
    t && !d.has("Authorization") && d.set("Authorization", `Bearer ${t}`);
    const h = await fetch(r, { ...o, credentials: "same-origin", headers: d });
    if (!h.ok) {
      const f = h.status === 401 || h.status === 403, g = f ? "Not authorised" : "Could not load data", _ = f ? `The backoffice token was ${t ? "sent but rejected" : "not available"} (${h.status}). Anything shown below may be empty because the request was refused, not because there is nothing to show.` : `The request failed with ${h.status}. Anything shown below may be incomplete.`;
      console.error(`[SplatDev] ${h.status} from ${String(r)} — ${_}`), i == null || i.peek("danger", { data: { headline: g, message: _ } });
    }
    return h;
  };
}
var T = Object.defineProperty, L = Object.getOwnPropertyDescriptor, b = (e) => {
  throw TypeError(e);
}, s = (e, t, i, n) => {
  for (var l = n > 1 ? void 0 : n ? L(t, i) : t, r = e.length - 1, o; r >= 0; r--)
    (o = e[r]) && (l = (n ? o(t, i, l) : o(l)) || l);
  return n && l && T(t, i, l), l;
}, z = (e, t, i) => t.has(e) || b("Cannot " + i), m = (e, t, i) => (z(e, t, "read from private field"), i ? i.call(e) : t.get(e)), k = (e, t, i) => t.has(e) ? b("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), p;
let a = class extends w(v) {
  constructor() {
    super(...arguments), k(this, p, $(this)), this._apiAvailable = !1, this._apiBase = "/umbraco/management/api/v1/short-urls", this._shortUrls = [], this._filter = "", this._loading = !1, this._showForm = !1, this._formMode = "create", this._editingId = null, this._formShortCode = "", this._formTargetUrl = "", this._formSaving = !1;
  }
  _handleFilterInput(e) {
    const t = e.target;
    this._filter = t.value;
  }
  async _load() {
    if (this._apiAvailable) {
      this._loading = !0;
      try {
        const e = await m(this, p).call(this, this._apiBase, {
          headers: { "Content-Type": "application/json" }
        });
        if (e.ok) {
          const t = await e.json();
          this._shortUrls = t;
        }
      } catch {
      } finally {
        this._loading = !1;
      }
    }
  }
  _openCreateForm() {
    this._formMode = "create", this._formShortCode = "", this._formTargetUrl = "", this._editingId = null, this._showForm = !0;
  }
  _openEditForm(e) {
    this._formMode = "edit", this._formShortCode = e.shortCode, this._formTargetUrl = e.targetUrl, this._editingId = e.id, this._showForm = !0;
  }
  _cancelForm() {
    this._showForm = !1, this._editingId = null;
  }
  async _saveForm() {
    if (!(!this._formShortCode.trim() || !this._formTargetUrl.trim())) {
      if (!this._apiAvailable) {
        this._showForm = !1;
        return;
      }
      this._formSaving = !0;
      try {
        const e = {
          shortCode: this._formShortCode.trim(),
          targetUrl: this._formTargetUrl.trim()
        }, t = this._formMode === "edit" && this._editingId ? `${this._apiBase}/${this._editingId}` : this._apiBase, i = this._formMode === "edit" ? "PUT" : "POST";
        (await m(this, p).call(this, t, {
          method: i,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(e)
        })).ok && (await this._load(), this._showForm = !1);
      } catch {
      } finally {
        this._formSaving = !1;
      }
    }
  }
  async _delete(e) {
    if (this._apiAvailable)
      try {
        (await m(this, p).call(this, `${this._apiBase}/${e}`, {
          method: "DELETE"
        })).ok && (this._shortUrls = this._shortUrls.filter((i) => i.id !== e));
      } catch {
      }
  }
  get _filteredShortUrls() {
    if (!this._filter.trim()) return this._shortUrls;
    const e = this._filter.toLowerCase();
    return this._shortUrls.filter(
      (t) => t.shortCode.toLowerCase().includes(e) || t.targetUrl.toLowerCase().includes(e)
    );
  }
  _renderForm() {
    return c`
      <div class="section">
        <uui-box
          headline=${this._formMode === "create" ? "Create Short URL" : "Edit Short URL"}
        >
          <div class="form-grid">
            <uui-form-layout-item>
              <uui-label slot="label" for="shortCode">Short Code</uui-label>
              <uui-input
                id="shortCode"
                placeholder="e.g. abc123"
                label="Short code"
                .value=${this._formShortCode}
                @input=${(e) => {
      this._formShortCode = e.target.value;
    }}
              ></uui-input>
              <span slot="description">
                The URL will be accessible at <code>/s/{shortCode}</code>
              </span>
            </uui-form-layout-item>

            <uui-form-layout-item>
              <uui-label slot="label" for="targetUrl">Target URL</uui-label>
              <uui-input
                id="targetUrl"
                type="url"
                placeholder="https://example.com/some/long/path"
                label="Target URL"
                .value=${this._formTargetUrl}
                @input=${(e) => {
      this._formTargetUrl = e.target.value;
    }}
              ></uui-input>
              <span slot="description">
                The destination URL that visitors will be redirected to.
              </span>
            </uui-form-layout-item>
          </div>

          <div class="form-actions">
            <uui-button
              look="secondary"
              label="Cancel"
              @click=${this._cancelForm}
            >
              Cancel
            </uui-button>
            <uui-button
              look="primary"
              color="positive"
              label="Save"
              ?disabled=${this._formSaving || !this._formShortCode.trim() || !this._formTargetUrl.trim()}
              @click=${this._saveForm}
            >
              ${this._formSaving ? "Saving…" : "Save"}
            </uui-button>
          </div>
        </uui-box>
      </div>
    `;
  }
  render() {
    const e = this._filteredShortUrls;
    return c`
      <div class="dashboard-header">
        <h1>Short URLs</h1>
        <p>
          Manage short URL redirects. Each short URL follows the pattern
          <code>/s/{code}</code> and redirects visitors to the configured target
          URL.
        </p>
      </div>

      <div class="section">
        <uui-box headline="API Status">
          <div class="pending-notice">
            <uui-icon name="alert"></uui-icon>
            <span>
              The Short URLs CRUD API
              (<code>/umbraco/management/api/v1/short-urls</code>) will be
              available once the <strong>Phase 3 backend</strong> is deployed.
              The create, edit, and delete actions are ready in the UI and will
              become functional after the backend is in place.
            </span>
          </div>
        </uui-box>
      </div>

      ${this._showForm ? this._renderForm() : ""}

      <div class="section">
        <uui-box headline="Short URL List">
          <div class="toolbar">
            <uui-input
              type="search"
              placeholder="Search by short code or target URL…"
              label="Search short URLs"
              .value=${this._filter}
              @input=${this._handleFilterInput}
            ></uui-input>
            <uui-button
              look="primary"
              label="Create Short URL"
              ?disabled=${this._showForm}
              @click=${this._openCreateForm}
            >
              + Create Short URL
            </uui-button>
            <uui-button
              look="secondary"
              label="Refresh"
              ?disabled=${this._loading || !this._apiAvailable}
              @click=${this._load}
            >
              ${this._loading ? "Loading…" : "Refresh"}
            </uui-button>
          </div>

          ${e.length > 0 ? c`
                <uui-table>
                  <uui-table-head>
                    <uui-table-head-cell>Short URL</uui-table-head-cell>
                    <uui-table-head-cell>Target URL</uui-table-head-cell>
                    <uui-table-head-cell>Created</uui-table-head-cell>
                    <uui-table-head-cell>Actions</uui-table-head-cell>
                  </uui-table-head>
                  ${e.map(
      (t) => c`
                      <uui-table-row>
                        <uui-table-cell>
                          <span class="short-url-chip"
                            >/s/${t.shortCode}</span
                          >
                        </uui-table-cell>
                        <uui-table-cell>${t.targetUrl}</uui-table-cell>
                        <uui-table-cell>${t.created}</uui-table-cell>
                        <uui-table-cell>
                          <div class="action-cell">
                            <uui-button
                              look="secondary"
                              label="Edit"
                              @click=${() => this._openEditForm(t)}
                            >
                              Edit
                            </uui-button>
                            <uui-button
                              look="secondary"
                              color="danger"
                              label="Delete"
                              @click=${() => this._delete(t.id)}
                            >
                              Delete
                            </uui-button>
                          </div>
                        </uui-table-cell>
                      </uui-table-row>
                    `
    )}
                </uui-table>
              ` : c`
                <uui-table>
                  <uui-table-head>
                    <uui-table-head-cell>Short URL</uui-table-head-cell>
                    <uui-table-head-cell>Target URL</uui-table-head-cell>
                    <uui-table-head-cell>Created</uui-table-head-cell>
                    <uui-table-head-cell>Actions</uui-table-head-cell>
                  </uui-table-head>
                </uui-table>
                <div class="empty-state">
                  <uui-icon name="link"></uui-icon>
                  <p>No short URLs configured.</p>
                </div>
              `}
        </uui-box>
      </div>
    `;
  }
};
p = /* @__PURE__ */ new WeakMap();
a.styles = y`
    :host {
      display: block;
      padding: var(--uui-size-layout-1);
    }

    .dashboard-header {
      margin-bottom: var(--uui-size-layout-2);
    }

    .dashboard-header h1 {
      margin: 0 0 var(--uui-size-4) 0;
      font-size: var(--uui-size-10);
      font-weight: 700;
      color: var(--uui-color-text);
    }

    .dashboard-header p {
      margin: 0;
      color: var(--uui-color-text-alt);
      font-size: var(--uui-size-5);
    }

    .section {
      margin-bottom: var(--uui-size-layout-2);
    }

    .toolbar {
      display: flex;
      gap: var(--uui-size-4);
      align-items: center;
      margin-bottom: var(--uui-size-4);
      flex-wrap: wrap;
    }

    .toolbar uui-input {
      flex: 1;
      min-width: 240px;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--uui-size-layout-3) var(--uui-size-layout-1);
      color: var(--uui-color-text-alt);
      gap: var(--uui-size-4);
    }

    .empty-state uui-icon {
      font-size: 3rem;
      opacity: 0.4;
    }

    .empty-state p {
      margin: 0;
      font-size: var(--uui-size-5);
    }

    uui-table {
      width: 100%;
    }

    uui-table-head-cell {
      font-weight: 600;
    }

    .action-cell {
      display: flex;
      gap: var(--uui-size-2);
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--uui-size-4);
      margin-bottom: var(--uui-size-4);
    }

    @media (max-width: 600px) {
      .form-grid {
        grid-template-columns: 1fr;
      }
    }

    .form-actions {
      display: flex;
      gap: var(--uui-size-3);
      justify-content: flex-end;
    }

    .pending-notice {
      display: flex;
      align-items: flex-start;
      gap: var(--uui-size-3);
      font-size: var(--uui-size-5);
      color: var(--uui-color-text-alt);
      line-height: 1.6;
    }

    .pending-notice uui-icon {
      flex-shrink: 0;
      margin-top: 2px;
    }

    .short-url-chip {
      font-family: var(--uui-font-monospace, monospace);
      background: var(--uui-color-surface-emphasis);
      padding: 2px 6px;
      border-radius: var(--uui-border-radius);
      font-size: 0.9em;
    }
  `;
s([
  u()
], a.prototype, "_shortUrls", 2);
s([
  u()
], a.prototype, "_filter", 2);
s([
  u()
], a.prototype, "_loading", 2);
s([
  u()
], a.prototype, "_showForm", 2);
s([
  u()
], a.prototype, "_formMode", 2);
s([
  u()
], a.prototype, "_editingId", 2);
s([
  u()
], a.prototype, "_formShortCode", 2);
s([
  u()
], a.prototype, "_formTargetUrl", 2);
s([
  u()
], a.prototype, "_formSaving", 2);
a = s([
  U("short-urls-dashboard")
], a);
const A = a;
export {
  a as ShortUrlsDashboardElement,
  A as default
};
