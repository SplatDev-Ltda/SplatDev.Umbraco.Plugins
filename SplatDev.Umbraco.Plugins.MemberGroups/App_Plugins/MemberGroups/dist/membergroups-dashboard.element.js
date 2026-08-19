import { LitElement as h, html as o, css as m, state as b, customElement as _ } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as g } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as f } from "@umbraco-cms/backoffice/auth";
function y(e) {
  let t = null;
  const s = new Promise((l) => {
    e.consumeContext(f, async (a) => {
      var r;
      try {
        t = await ((r = a == null ? void 0 : a.getLatestToken) == null ? void 0 : r.call(a)) ?? null;
      } catch {
        t = null;
      }
      l();
    }), setTimeout(l, 3e3);
  });
  return async (l, a = {}) => {
    await s;
    const r = new Headers(a.headers);
    t && !r.has("Authorization") && r.set("Authorization", `Bearer ${t}`);
    const u = await fetch(l, { ...a, credentials: "same-origin", headers: r });
    return (u.status === 401 || u.status === 403) && console.error(
      `[SplatDev] ${u.status} from ${String(l)} — the backoffice token was ${t ? "sent but rejected" : "not available"}. The dashboard may render as empty.`
    ), u;
  };
}
var v = Object.defineProperty, w = Object.getOwnPropertyDescriptor, d = (e) => {
  throw TypeError(e);
}, n = (e, t, s, l) => {
  for (var a = l > 1 ? void 0 : l ? w(t, s) : t, r = e.length - 1, u; r >= 0; r--)
    (u = e[r]) && (a = (l ? u(t, s, a) : u(a)) || a);
  return l && a && v(t, s, a), a;
}, $ = (e, t, s) => t.has(e) || d("Cannot " + s), p = (e, t, s) => ($(e, t, "read from private field"), s ? s.call(e) : t.get(e)), k = (e, t, s) => t.has(e) ? d("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, s), c;
let i = class extends g(h) {
  constructor() {
    super(...arguments), k(this, c, y(this)), this._activeTab = "groups", this._groups = [], this._types = [], this._foundMember = null, this._result = null, this._loading = !1, this._apiBase = "/umbraco/api/membergroups";
  }
  connectedCallback() {
    super.connectedCallback(), this._loadGroups(), this._loadTypes();
  }
  async _loadGroups() {
    try {
      const e = await p(this, c).call(this, `${this._apiBase}/GetMemberGroups`);
      e.ok && (this._groups = await e.json());
    } catch {
      this._groups = [];
    }
  }
  async _loadTypes() {
    try {
      const e = await p(this, c).call(this, `${this._apiBase}/GetMemberTypes`);
      e.ok && (this._types = await e.json());
    } catch {
      this._types = [];
    }
  }
  async _post(e, t) {
    this._loading = !0, this._result = null;
    try {
      const s = typeof t == "string" ? `${this._apiBase}/${e}?${t}` : `${this._apiBase}/${e}`, l = await p(this, c).call(this, s, {
        method: "POST",
        headers: typeof t == "object" ? { "Content-Type": "application/json" } : {},
        body: typeof t == "object" ? JSON.stringify(t) : void 0
      }), a = await l.json();
      this._result = { success: l.ok, message: a.message ?? (l.ok ? "Success" : "Failed") };
    } catch {
      this._result = { success: !1, message: "Network error." };
    } finally {
      this._loading = !1;
    }
  }
  async _lookupMember(e) {
    this._loading = !0, this._foundMember = null, this._result = null;
    try {
      const t = await p(this, c).call(this, `${this._apiBase}/GetMemberByEmail?email=${encodeURIComponent(e)}`);
      t.ok ? this._foundMember = await t.json() : this._result = { success: !1, message: "Member not found." };
    } catch {
      this._result = { success: !1, message: "Network error." };
    } finally {
      this._loading = !1;
    }
  }
  _renderGroups() {
    return o`
      <uui-box headline="Member Groups (${this._groups.length})">
        ${this._groups.length === 0 ? o`<p style="color:var(--uui-color-text-alt,#6b7280)">No member groups found.</p>` : o`
              <uui-table>
                <uui-table-head>
                  <uui-table-head-cell>ID</uui-table-head-cell>
                  <uui-table-head-cell>Name</uui-table-head-cell>
                </uui-table-head>
                ${this._groups.map((e) => o`
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
    return o`
      <uui-box headline="Member Types">
        ${this._types.length === 0 ? o`<p style="color:var(--uui-color-text-alt,#6b7280)">No member types found.</p>` : o`
              <uui-table>
                <uui-table-head>
                  <uui-table-head-cell>Name</uui-table-head-cell>
                  <uui-table-head-cell>Alias</uui-table-head-cell>
                </uui-table-head>
                ${this._types.map((e) => o`
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
    return o`
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

        ${this._foundMember ? o`
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
        ${this._result && !this._foundMember ? o`<div class="result ${this._result.success ? "success" : "error"}">${this._result.message}</div>` : ""}
      </uui-box>
    `;
  }
  render() {
    return o`
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
c = /* @__PURE__ */ new WeakMap();
i.styles = m`
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
  `;
n([
  b()
], i.prototype, "_activeTab", 2);
n([
  b()
], i.prototype, "_groups", 2);
n([
  b()
], i.prototype, "_types", 2);
n([
  b()
], i.prototype, "_foundMember", 2);
n([
  b()
], i.prototype, "_result", 2);
n([
  b()
], i.prototype, "_loading", 2);
i = n([
  _("membergroups-dashboard")
], i);
const E = i;
export {
  i as MemberGroupsDashboardElement,
  E as default
};
