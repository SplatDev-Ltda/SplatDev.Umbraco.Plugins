import { LitElement as p, html as l, css as n, state as i, customElement as d } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as m } from "@umbraco-cms/backoffice/element-api";
var h = Object.defineProperty, _ = Object.getOwnPropertyDescriptor, o = (e, t, r, a) => {
  for (var s = a > 1 ? void 0 : a ? _(t, r) : t, b = e.length - 1, c; b >= 0; b--)
    (c = e[b]) && (s = (a ? c(t, r, s) : c(s)) || s);
  return a && s && h(t, r, s), s;
};
let u = class extends m(p) {
  constructor() {
    super(...arguments), this._activeTab = "groups", this._groups = [], this._types = [], this._foundMember = null, this._result = null, this._loading = !1, this._apiBase = "/umbraco/api/membergroups";
  }
  connectedCallback() {
    super.connectedCallback(), this._loadGroups(), this._loadTypes();
  }
  async _loadGroups() {
    try {
      const e = await fetch(`${this._apiBase}/GetMemberGroups`);
      e.ok && (this._groups = await e.json());
    } catch {
      this._groups = [];
    }
  }
  async _loadTypes() {
    try {
      const e = await fetch(`${this._apiBase}/GetMemberTypes`);
      e.ok && (this._types = await e.json());
    } catch {
      this._types = [];
    }
  }
  async _post(e, t) {
    this._loading = !0, this._result = null;
    try {
      const r = typeof t == "string" ? `${this._apiBase}/${e}?${t}` : `${this._apiBase}/${e}`, a = await fetch(r, {
        method: "POST",
        headers: typeof t == "object" ? { "Content-Type": "application/json" } : {},
        body: typeof t == "object" ? JSON.stringify(t) : void 0
      }), s = await a.json();
      this._result = { success: a.ok, message: s.message ?? (a.ok ? "Success" : "Failed") };
    } catch {
      this._result = { success: !1, message: "Network error." };
    } finally {
      this._loading = !1;
    }
  }
  async _lookupMember(e) {
    this._loading = !0, this._foundMember = null, this._result = null;
    try {
      const t = await fetch(`${this._apiBase}/GetMemberByEmail?email=${encodeURIComponent(e)}`);
      t.ok ? this._foundMember = await t.json() : this._result = { success: !1, message: "Member not found." };
    } catch {
      this._result = { success: !1, message: "Network error." };
    } finally {
      this._loading = !1;
    }
  }
  _renderGroups() {
    return l`
      <uui-box headline="Member Groups (${this._groups.length})">
        ${this._groups.length === 0 ? l`<p style="color:var(--uui-color-text-alt,#6b7280)">No member groups found.</p>` : l`
              <uui-table>
                <uui-table-head>
                  <uui-table-head-cell>ID</uui-table-head-cell>
                  <uui-table-head-cell>Name</uui-table-head-cell>
                </uui-table-head>
                ${this._groups.map((e) => l`
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
    return l`
      <uui-box headline="Member Types">
        ${this._types.length === 0 ? l`<p style="color:var(--uui-color-text-alt,#6b7280)">No member types found.</p>` : l`
              <uui-table>
                <uui-table-head>
                  <uui-table-head-cell>Name</uui-table-head-cell>
                  <uui-table-head-cell>Alias</uui-table-head-cell>
                </uui-table-head>
                ${this._types.map((e) => l`
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
    return l`
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

        ${this._foundMember ? l`
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
        ${this._result && !this._foundMember ? l`<div class="result ${this._result.success ? "success" : "error"}">${this._result.message}</div>` : ""}
      </uui-box>
    `;
  }
  render() {
    return l`
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
u.styles = n`
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
o([
  i()
], u.prototype, "_activeTab", 2);
o([
  i()
], u.prototype, "_groups", 2);
o([
  i()
], u.prototype, "_types", 2);
o([
  i()
], u.prototype, "_foundMember", 2);
o([
  i()
], u.prototype, "_result", 2);
o([
  i()
], u.prototype, "_loading", 2);
u = o([
  d("membergroups-dashboard")
], u);
const y = u;
export {
  u as MemberGroupsDashboardElement,
  y as default
};
