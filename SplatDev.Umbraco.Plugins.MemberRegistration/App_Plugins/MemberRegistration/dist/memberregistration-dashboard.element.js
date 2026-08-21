import { LitElement as T, html as d, css as $, state as p, customElement as P } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as k } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as E } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as O } from "@umbraco-cms/backoffice/notification";
function A(e) {
  let t = null, a = null;
  const n = e.consumeContext.bind(e), o = new Promise((i) => {
    n(E, async (r) => {
      var u;
      try {
        t = await ((u = r == null ? void 0 : r.getLatestToken) == null ? void 0 : u.call(r)) ?? null;
      } catch {
        t = null;
      }
      i();
    }), setTimeout(i, 3e3);
  });
  return n(O, (i) => {
    a = i;
  }), async (i, r = {}) => {
    await o;
    const u = new Headers(r.headers);
    t && !u.has("Authorization") && u.set("Authorization", `Bearer ${t}`);
    const s = await fetch(i, { ...r, credentials: "same-origin", headers: u });
    if (!s.ok) {
      const m = s.status === 401 || s.status === 403, x = m ? "Not authorised" : "Could not load data", g = m ? `The backoffice token was ${t ? "sent but rejected" : "not available"} (${s.status}). Anything shown below may be empty because the request was refused, not because there is nothing to show.` : `The request failed with ${s.status}. Anything shown below may be incomplete.`;
      console.error(`[SplatDev] ${s.status} from ${String(i)} — ${g}`), a == null || a.peek("danger", { data: { headline: x, message: g } });
    }
    return s;
  };
}
var M = Object.defineProperty, D = Object.getOwnPropertyDescriptor, _ = (e) => {
  throw TypeError(e);
}, c = (e, t, a, n) => {
  for (var o = n > 1 ? void 0 : n ? D(t, a) : t, i = e.length - 1, r; i >= 0; i--)
    (r = e[i]) && (o = (n ? r(t, a, o) : r(o)) || o);
  return n && o && M(t, a, o), o;
}, w = (e, t, a) => t.has(e) || _("Cannot " + a), v = (e, t, a) => (w(e, t, "read from private field"), a ? a.call(e) : t.get(e)), f = (e, t, a) => t.has(e) ? _("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, a), C = (e, t, a) => (w(e, t, "access private method"), a), h, b, y;
let l = class extends k(T) {
  constructor() {
    super(...arguments), f(this, b), f(this, h, A(this)), this._activeTab = "overview", this._pending = [], this._loading = !1, this._result = null, this._loadError = null, this._apiBase = "/umbraco/api/memberregistration";
  }
  connectedCallback() {
    super.connectedCallback(), this._loadPending();
  }
  async _loadPending() {
    try {
      const e = await v(this, h).call(this, `${this._apiBase}/GetPending`);
      C(this, b, y).call(this, e) && (this._pending = await e.json());
    } catch {
      this._loadError ?? (this._loadError = "The request failed. See the browser console for details."), this._pending = [];
    }
  }
  async _approveMember(e) {
    await v(this, h).call(this, `${this._apiBase}/Approve?memberId=${e}`, { method: "POST" }), await this._loadPending();
  }
  _formatDate(e) {
    return new Date(e).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  }
  _renderOverview() {
    return d`
      <uui-box headline="Member Registration Plugin">
        <p>Provides member registration functionality:</p>
        <ul>
          <li>Registration form with email/username validation</li>
          <li>Email verification tokens (stored in DB schema: memberreg)</li>
          <li>Admin approval workflow</li>
          <li>Pending member management</li>
        </ul>
        <h4>API Endpoints</h4>
        <ul>
          <li><code>POST /umbraco/api/memberregistration/Register</code></li>
          <li><code>POST /umbraco/api/memberregistration/VerifyEmail</code></li>
          <li><code>POST /umbraco/api/memberregistration/Approve?memberId=X</code></li>
          <li><code>GET /umbraco/api/memberregistration/GetPending</code></li>
        </ul>
      </uui-box>
    `;
  }
  _renderPending() {
    return d`
      <uui-box headline="Pending Members (${this._pending.length})">
        ${this._pending.length === 0 ? d`<p style="color:var(--uui-color-text-alt,#6b7280)">No pending members.</p>` : d`
              <uui-table>
                <uui-table-head>
                  <uui-table-head-cell>Name</uui-table-head-cell>
                  <uui-table-head-cell>Email</uui-table-head-cell>
                  <uui-table-head-cell>Username</uui-table-head-cell>
                  <uui-table-head-cell>Registered</uui-table-head-cell>
                  <uui-table-head-cell>Actions</uui-table-head-cell>
                </uui-table-head>
                ${this._pending.map(
      (e) => d`
                    <uui-table-row>
                      <uui-table-cell>${e.name}</uui-table-cell>
                      <uui-table-cell>${e.email}</uui-table-cell>
                      <uui-table-cell>${e.username}</uui-table-cell>
                      <uui-table-cell>${this._formatDate(e.createDate)}</uui-table-cell>
                      <uui-table-cell>
                        <uui-button look="positive" label="Approve" @click=${() => this._approveMember(e.id)}>
                          Approve
                        </uui-button>
                      </uui-table-cell>
                    </uui-table-row>
                  `
    )}
              </uui-table>
            `}
      </uui-box>
    `;
  }
  render() {
    return d`
      ${this._loadError ? d`<div class="splatdev-load-error" role="alert">${this._loadError}</div>` : ""}
      <h1>Member Registration Manager</h1>
      <p class="description">Manage member registration and approval workflow.</p>

      <div class="tabs">
        <div class="tab ${this._activeTab === "overview" ? "active" : ""}" @click=${() => {
      this._activeTab = "overview";
    }}>Overview</div>
        <div class="tab ${this._activeTab === "pending" ? "active" : ""}" @click=${() => {
      this._activeTab = "pending", this._loadPending();
    }}>
          Pending <span class="badge">${this._pending.length}</span>
        </div>
      </div>

      ${this._activeTab === "overview" ? this._renderOverview() : this._renderPending()}
    `;
  }
};
h = /* @__PURE__ */ new WeakMap();
b = /* @__PURE__ */ new WeakSet();
y = function(e) {
  return e.ok ? (this._loadError = null, !0) : (this._loadError = e.status === 401 || e.status === 403 ? "You are not authorised to do that. The request was refused, so anything shown below may be incomplete." : `The request did not succeed — the server returned ${e.status}${e.statusText ? ` ${e.statusText}` : ""}.`, !1);
};
l.styles = $`
    :host {
      display: block;
      padding: var(--uui-size-layout-1, 24px);
    }
    h1 { font-size: 1.5rem; font-weight: 600; margin: 0 0 8px; }
    p.description { color: var(--uui-color-text-alt, #6b7280); margin: 0 0 24px; }
    .tabs { display: flex; gap: 0; border-bottom: 2px solid var(--uui-color-border, #e5e7eb); margin-bottom: 24px; }
    .tab { padding: 10px 20px; cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -2px; font-weight: 500; }
    .tab.active { border-bottom-color: var(--uui-color-focus, #1a56db); color: var(--uui-color-focus, #1a56db); }
    .form-row { margin-bottom: 16px; }
    .form-row label { display: block; margin-bottom: 4px; font-weight: 500; font-size: 0.875rem; }
    .result { padding: 12px 16px; border-radius: 6px; margin-top: 12px; }
    .result.success { background: #d1fae5; color: #065f46; }
    .result.error { background: #fde8e8; color: #c81e1e; }
    .badge { display: inline-flex; align-items: center; justify-content: center; background: #1a56db; color: #fff; border-radius: 9999px; font-size: 0.75rem; padding: 0 6px; min-width: 20px; margin-left: 4px; }
  
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
c([
  p()
], l.prototype, "_activeTab", 2);
c([
  p()
], l.prototype, "_pending", 2);
c([
  p()
], l.prototype, "_loading", 2);
c([
  p()
], l.prototype, "_result", 2);
c([
  p()
], l.prototype, "_loadError", 2);
l = c([
  P("memberregistration-dashboard")
], l);
const N = l;
export {
  l as MemberRegistrationDashboardElement,
  N as default
};
