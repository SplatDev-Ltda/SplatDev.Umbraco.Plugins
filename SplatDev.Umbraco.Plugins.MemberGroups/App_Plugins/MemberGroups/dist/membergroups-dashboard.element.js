import { LitElement as T, html as s, css as k, state as d, customElement as M } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as E } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as G } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as N } from "@umbraco-cms/backoffice/notification";
function C(e) {
  let t = null, a = null;
  const o = e.consumeContext.bind(e), l = new Promise((i) => {
    o(G, async (r) => {
      var b;
      try {
        t = await ((b = r == null ? void 0 : r.getLatestToken) == null ? void 0 : b.call(r)) ?? null;
      } catch {
        t = null;
      }
      i();
    }), setTimeout(i, 3e3);
  });
  return o(N, (i) => {
    a = i;
  }), async (i, r = {}) => {
    await l;
    const b = new Headers(r.headers);
    t && !b.has("Authorization") && b.set("Authorization", `Bearer ${t}`);
    const c = await fetch(i, { ...r, credentials: "same-origin", headers: b });
    if (!c.ok) {
      const g = c.status === 401 || c.status === 403, x = g ? "Not authorised" : "Could not load data", y = g ? `The backoffice token was ${t ? "sent but rejected" : "not available"} (${c.status}). Anything shown below may be empty because the request was refused, not because there is nothing to show.` : `The request failed with ${c.status}. Anything shown below may be incomplete.`;
      console.error(`[SplatDev] ${c.status} from ${String(i)} — ${y}`), a == null || a.peek("danger", { data: { headline: x, message: y } });
    }
    return c;
  };
}
var O = Object.defineProperty, A = Object.getOwnPropertyDescriptor, w = (e) => {
  throw TypeError(e);
}, n = (e, t, a, o) => {
  for (var l = o > 1 ? void 0 : o ? A(t, a) : t, i = e.length - 1, r; i >= 0; i--)
    (r = e[i]) && (l = (o ? r(t, a, l) : r(l)) || l);
  return o && l && O(t, a, l), l;
}, $ = (e, t, a) => t.has(e) || w("Cannot " + a), m = (e, t, a) => ($(e, t, "read from private field"), a ? a.call(e) : t.get(e)), v = (e, t, a) => t.has(e) ? w("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, a), f = (e, t, a) => ($(e, t, "access private method"), a), p, h, _;
let u = class extends E(T) {
  constructor() {
    super(...arguments), v(this, h), v(this, p, C(this)), this._activeTab = "groups", this._groups = [], this._types = [], this._foundMember = null, this._result = null, this._loading = !1, this._loadError = null, this._apiBase = "/umbraco/api/membergroups";
  }
  connectedCallback() {
    super.connectedCallback(), this._loadGroups(), this._loadTypes();
  }
  async _loadGroups() {
    try {
      const e = await m(this, p).call(this, `${this._apiBase}/GetMemberGroups`);
      f(this, h, _).call(this, e) && (this._groups = await e.json());
    } catch {
      this._loadError ?? (this._loadError = "The request failed. See the browser console for details."), this._groups = [];
    }
  }
  async _loadTypes() {
    try {
      const e = await m(this, p).call(this, `${this._apiBase}/GetMemberTypes`);
      f(this, h, _).call(this, e) && (this._types = await e.json());
    } catch {
      this._loadError ?? (this._loadError = "The request failed. See the browser console for details."), this._types = [];
    }
  }
  async _post(e, t) {
    this._loading = !0, this._result = null;
    try {
      const a = typeof t == "string" ? `${this._apiBase}/${e}?${t}` : `${this._apiBase}/${e}`, o = await m(this, p).call(this, a, {
        method: "POST",
        headers: typeof t == "object" ? { "Content-Type": "application/json" } : {},
        body: typeof t == "object" ? JSON.stringify(t) : void 0
      }), l = await o.json();
      this._result = { success: o.ok, message: l.message ?? (o.ok ? "Success" : "Failed") };
    } catch {
      this._loadError ?? (this._loadError = "The request failed. See the browser console for details."), this._result = { success: !1, message: "Network error." };
    } finally {
      this._loading = !1;
    }
  }
  async _lookupMember(e) {
    this._loading = !0, this._foundMember = null, this._result = null;
    try {
      const t = await m(this, p).call(this, `${this._apiBase}/GetMemberByEmail?email=${encodeURIComponent(e)}`);
      f(this, h, _).call(this, t) ? this._foundMember = await t.json() : this._result = { success: !1, message: "Member not found." };
    } catch {
      this._loadError ?? (this._loadError = "The request failed. See the browser console for details."), this._result = { success: !1, message: "Network error." };
    } finally {
      this._loading = !1;
    }
  }
  _renderGroups() {
    return s`
      <uui-box headline="Member Groups (${this._groups.length})">
        ${this._groups.length === 0 ? s`<p style="color:var(--uui-color-text-alt,#6b7280)">No member groups found.</p>` : s`
              <uui-table>
                <uui-table-head>
                  <uui-table-head-cell>ID</uui-table-head-cell>
                  <uui-table-head-cell>Name</uui-table-head-cell>
                </uui-table-head>
                ${this._groups.map((e) => s`
                  <uui-table-row>
                    <uui-table-cell>${e.id}</uui-table-cell>
                    <uui-table-cell><strong>${e.name}</strong></uui-table-cell>
                  </uui-table-row>
                `)}
              </uui-table>
            `}
      </uui-box>
    `;
  }
  _renderTypes() {
    return s`
      <uui-box headline="Member Types">
        ${this._types.length === 0 ? s`<p style="color:var(--uui-color-text-alt,#6b7280)">No member types found.</p>` : s`
              <uui-table>
                <uui-table-head>
                  <uui-table-head-cell>Name</uui-table-head-cell>
                  <uui-table-head-cell>Alias</uui-table-head-cell>
                </uui-table-head>
                ${this._types.map((e) => s`
                  <uui-table-row>
                    <uui-table-cell><strong>${e.name}</strong></uui-table-cell>
                    <uui-table-cell><code>${e.alias}</code></uui-table-cell>
                  </uui-table-row>
                `)}
              </uui-table>
            `}
      </uui-box>
    `;
  }
  _renderLookup() {
    return s`
      <uui-box headline="Lookup Member by Email">
        <div class="form-row">
          <label>Email Address</label>
          <uui-input id="lookupEmail" type="email" placeholder="member@example.com"></uui-input>
        </div>
        <uui-button
          look="primary"
          label="Lookup"
          ?disabled=${this._loading}
          @click=${() => {
      var t;
      const e = (t = this.shadowRoot) == null ? void 0 : t.getElementById("lookupEmail");
      this._lookupMember((e == null ? void 0 : e.value) ?? "");
    }}
        >Lookup</uui-button>

        ${this._foundMember ? s`
          <uui-box style="margin-top:16px">
            <uui-table>
              <uui-table-row><uui-table-cell><strong>ID</strong></uui-table-cell><uui-table-cell>${this._foundMember.id}</uui-table-cell></uui-table-row>
              <uui-table-row><uui-table-cell><strong>Name</strong></uui-table-cell><uui-table-cell>${this._foundMember.name}</uui-table-cell></uui-table-row>
              <uui-table-row><uui-table-cell><strong>Email</strong></uui-table-cell><uui-table-cell>${this._foundMember.email}</uui-table-cell></uui-table-row>
              <uui-table-row><uui-table-cell><strong>Username</strong></uui-table-cell><uui-table-cell>${this._foundMember.username}</uui-table-cell></uui-table-row>
              <uui-table-row><uui-table-cell><strong>Approved</strong></uui-table-cell><uui-table-cell>${this._foundMember.isApproved ? "Yes" : "No"}</uui-table-cell></uui-table-row>
              <uui-table-row><uui-table-cell><strong>Locked Out</strong></uui-table-cell><uui-table-cell>${this._foundMember.isLockedOut ? "Yes" : "No"}</uui-table-cell></uui-table-row>
            </uui-table>
          </uui-box>
        ` : ""}
        ${this._result && !this._foundMember ? s`<div class="result ${this._result.success ? "success" : "error"}">${this._result.message}</div>` : ""}
      </uui-box>
    `;
  }
  render() {
    return s`
      ${this._loadError ? s`<div class="splatdev-load-error" role="alert">${this._loadError}</div>` : ""}
      <h1>Member Groups Manager</h1>
      <p class="description">Manage Umbraco member groups, member types, and user access.</p>

      <div class="tabs">
        <div class="tab ${this._activeTab === "groups" ? "active" : ""}" @click=${() => {
      this._activeTab = "groups";
    }}>Groups</div>
        <div class="tab ${this._activeTab === "types" ? "active" : ""}" @click=${() => {
      this._activeTab = "types";
    }}>Member Types</div>
        <div class="tab ${this._activeTab === "lookup" ? "active" : ""}" @click=${() => {
      this._activeTab = "lookup", this._foundMember = null, this._result = null;
    }}>Lookup Member</div>
      </div>

      ${this._activeTab === "groups" ? this._renderGroups() : this._activeTab === "types" ? this._renderTypes() : this._renderLookup()}
    `;
  }
};
p = /* @__PURE__ */ new WeakMap();
h = /* @__PURE__ */ new WeakSet();
_ = function(e) {
  return e.ok ? (this._loadError = null, !0) : (this._loadError = e.status === 401 || e.status === 403 ? "You are not authorised to do that. The request was refused, so anything shown below may be incomplete." : `The request did not succeed — the server returned ${e.status}${e.statusText ? ` ${e.statusText}` : ""}.`, !1);
};
u.styles = k`
    :host {
      display: block;
      padding: var(--uui-size-layout-1, 24px);
    }
    h1 { font-size: 1.5rem; font-weight: 600; margin: 0 0 8px; }
    p.description { color: var(--uui-color-text-alt, #6b7280); margin: 0 0 24px; }
    .tabs { display: flex; gap: 0; border-bottom: 2px solid var(--uui-color-border, #e5e7eb); margin-bottom: 24px; flex-wrap: wrap; }
    .tab { padding: 10px 16px; cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -2px; font-weight: 500; font-size: 0.875rem; }
    .tab.active { border-bottom-color: var(--uui-color-focus, #1a56db); color: var(--uui-color-focus, #1a56db); }
    .form-row { margin-bottom: 16px; }
    .form-row label { display: block; margin-bottom: 4px; font-weight: 500; font-size: 0.875rem; }
    .result { padding: 12px 16px; border-radius: 6px; margin-top: 12px; }
    .result.success { background: #d1fae5; color: #065f46; }
    .result.error { background: #fde8e8; color: #c81e1e; }
    .btn-row { display: flex; gap: 8px; }
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
n([
  d()
], u.prototype, "_activeTab", 2);
n([
  d()
], u.prototype, "_groups", 2);
n([
  d()
], u.prototype, "_types", 2);
n([
  d()
], u.prototype, "_foundMember", 2);
n([
  d()
], u.prototype, "_result", 2);
n([
  d()
], u.prototype, "_loading", 2);
n([
  d()
], u.prototype, "_loadError", 2);
u = n([
  M("membergroups-dashboard")
], u);
const z = u;
export {
  u as MemberGroupsDashboardElement,
  z as default
};
