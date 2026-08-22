import { LitElement as G, html as a, css as k, state as p, customElement as T } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as M } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as E } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as A } from "@umbraco-cms/backoffice/notification";
function N(e) {
  let t = null, s = null;
  const o = e.consumeContext.bind(e), i = new Promise((n) => {
    o(E, async (l) => {
      var d;
      try {
        t = await ((d = l == null ? void 0 : l.getLatestToken) == null ? void 0 : d.call(l)) ?? null;
      } catch {
        t = null;
      }
      n();
    }), setTimeout(n, 3e3);
  });
  return o(A, (n) => {
    s = n;
  }), async (n, l = {}) => {
    await i;
    const d = new Headers(l.headers);
    t && !d.has("Authorization") && d.set("Authorization", `Bearer ${t}`);
    const c = await fetch(n, { ...l, credentials: "same-origin", headers: d });
    if (!c.ok) {
      const f = c.status === 401 || c.status === 403, x = f ? "Not authorised" : "Could not load data", y = f ? `The backoffice token was ${t ? "sent but rejected" : "not available"} (${c.status}). Anything shown below may be empty because the request was refused, not because there is nothing to show.` : `The request failed with ${c.status}. Anything shown below may be incomplete.`;
      console.error(`[SplatDev] ${c.status} from ${String(n)} — ${y}`), s == null || s.peek("danger", { data: { headline: x, message: y } });
    }
    return c;
  };
}
var C = Object.defineProperty, S = Object.getOwnPropertyDescriptor, w = (e) => {
  throw TypeError(e);
}, u = (e, t, s, o) => {
  for (var i = o > 1 ? void 0 : o ? S(t, s) : t, n = e.length - 1, l; n >= 0; n--)
    (l = e[n]) && (i = (o ? l(t, s, i) : l(i)) || i);
  return o && i && C(t, s, i), i;
}, $ = (e, t, s) => t.has(e) || w("Cannot " + s), m = (e, t, s) => ($(e, t, "read from private field"), s ? s.call(e) : t.get(e)), v = (e, t, s) => t.has(e) ? w("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, s), g = (e, t, s) => ($(e, t, "access private method"), s), h, b, _;
let r = class extends M(G) {
  constructor() {
    super(...arguments), v(this, b), v(this, h, N(this)), this._activeTab = "groups", this._groups = [], this._types = [], this._foundMember = null, this._result = null, this._loading = !1, this._loadError = null, this._newGroupName = "", this._assignEmail = "", this._assignGroup = "", this._busy = "", this._apiBase = "/umbraco/api/membergroups";
  }
  connectedCallback() {
    super.connectedCallback(), this._loadGroups(), this._loadTypes();
  }
  async _loadGroups() {
    try {
      const e = await m(this, h).call(this, `${this._apiBase}/GetMemberGroups`);
      g(this, b, _).call(this, e) && (this._groups = await e.json());
    } catch {
      this._loadError ?? (this._loadError = "The request failed. See the browser console for details."), this._groups = [];
    }
  }
  async _loadTypes() {
    try {
      const e = await m(this, h).call(this, `${this._apiBase}/GetMemberTypes`);
      g(this, b, _).call(this, e) && (this._types = await e.json());
    } catch {
      this._loadError ?? (this._loadError = "The request failed. See the browser console for details."), this._types = [];
    }
  }
  /**
   * Calls one of the mutating endpoints.
   *
   * This helper was already here and nothing ever called it: six of the nine operations
   * the API exposes — create a group, add a member to one, and the rest — had no way in
   * from the dashboard at all.
   */
  async _post(e, t) {
    this._loading = !0, this._result = null;
    try {
      const s = typeof t == "string" ? `${this._apiBase}/${e}?${t}` : `${this._apiBase}/${e}`, o = await m(this, h).call(this, s, {
        method: "POST",
        headers: typeof t == "object" ? { "Content-Type": "application/json" } : {},
        body: typeof t == "object" ? JSON.stringify(t) : void 0
      }), i = await o.json();
      this._result = { success: o.ok, message: i.message ?? (o.ok ? "Success" : "Failed") };
    } catch {
      this._loadError ?? (this._loadError = "The request failed. See the browser console for details."), this._result = { success: !1, message: "Network error." };
    } finally {
      this._loading = !1;
    }
  }
  async _lookupMember(e) {
    this._loading = !0, this._foundMember = null, this._result = null;
    try {
      const t = await m(this, h).call(this, `${this._apiBase}/GetMemberByEmail?email=${encodeURIComponent(e)}`);
      g(this, b, _).call(this, t) ? this._foundMember = await t.json() : this._result = { success: !1, message: "Member not found." };
    } catch {
      this._loadError ?? (this._loadError = "The request failed. See the browser console for details."), this._result = { success: !1, message: "Network error." };
    } finally {
      this._loading = !1;
    }
  }
  /** Creates a member group. SaveMemberGroup is the endpoint that creates *member*
   * groups; CreateGroup creates a backoffice user group, which is a different thing. */
  async _createGroup() {
    var t;
    const e = this._newGroupName.trim();
    if (!e) {
      this._result = { success: !1, message: "Give the group a name." };
      return;
    }
    this._busy = "create", await this._post("SaveMemberGroup", `groupName=${encodeURIComponent(e)}`), this._busy = "", (t = this._result) != null && t.success && (this._newGroupName = "", await this._loadGroups());
  }
  /** Puts an existing member into a group, by the member's email address. */
  async _addToGroup(e, t) {
    var i;
    const s = (e ?? this._assignEmail).trim(), o = (t ?? this._assignGroup).trim();
    if (!s || !o) {
      this._result = { success: !1, message: "Choose a member and a group." };
      return;
    }
    this._busy = "assign", await this._post("AddToGroup", { email: s, group: o }), this._busy = "", (i = this._result) != null && i.success && (this._assignEmail = "");
  }
  _renderGroups() {
    return a`
      <uui-box headline="Member groups (${this._groups.length})">
        ${this._groups.length === 0 ? a`<p style="color:var(--uui-color-text-alt,#6b7280)">No member groups yet. Create one below.</p>` : a`
              <uui-table>
                <uui-table-head>
                  <uui-table-head-cell>ID</uui-table-head-cell>
                  <uui-table-head-cell>Name</uui-table-head-cell>
                </uui-table-head>
                ${this._groups.map((e) => a`
                  <uui-table-row>
                    <uui-table-cell>${e.id}</uui-table-cell>
                    <uui-table-cell><strong>${e.name}</strong></uui-table-cell>
                  </uui-table-row>
                `)}
              </uui-table>
            `}
      </uui-box>

      <uui-box headline="Create a member group">
        <div class="form-row">
          <label for="newGroup">Group name</label>
          <uui-input
            id="newGroup"
            label="Group name"
            placeholder="e.g. Subscribers"
            .value=${this._newGroupName}
            @input=${(e) => this._newGroupName = e.target.value}
          ></uui-input>
        </div>
        <div class="btn-row">
          <uui-button
            look="primary"
            color="positive"
            label="Create group"
            ?disabled=${this._busy === "create" || this._loading}
            @click=${() => this._createGroup()}
            >${this._busy === "create" ? "Creating…" : "Create group"}</uui-button
          >
        </div>
      </uui-box>

      <uui-box headline="Add a member to a group">
        <div class="form-row">
          <label for="assignEmail">Member email</label>
          <uui-input
            id="assignEmail"
            type="email"
            label="Member email"
            placeholder="member@example.com"
            .value=${this._assignEmail}
            @input=${(e) => this._assignEmail = e.target.value}
          ></uui-input>
        </div>
        <div class="form-row">
          <label for="assignGroup">Group</label>
          <uui-select
            id="assignGroup"
            label="Group"
            .value=${this._assignGroup}
            @change=${(e) => this._assignGroup = e.target.value}
            .options=${this._groups.map((e) => ({
      name: e.name,
      value: e.name,
      selected: e.name === this._assignGroup
    }))}
          ></uui-select>
        </div>
        <div class="btn-row">
          <uui-button
            look="primary"
            label="Add to group"
            ?disabled=${this._busy === "assign" || this._groups.length === 0}
            @click=${() => this._addToGroup()}
            >${this._busy === "assign" ? "Adding…" : "Add to group"}</uui-button
          >
        </div>
        ${this._groups.length === 0 ? a`<p style="color:var(--uui-color-text-alt,#6b7280);font-size:0.85rem;margin:10px 0 0">
              Create a group first — there is nothing to add anyone to yet.
            </p>` : ""}
      </uui-box>
    `;
  }
  _renderTypes() {
    return a`
      <uui-box headline="Member Types">
        <p style="color:var(--uui-color-text-alt,#6b7280);font-size:0.875rem;margin:0 0 14px">
          Shown for reference. Member types are created and edited on the Member Types
          dashboard.
        </p>
        ${this._types.length === 0 ? a`<p style="color:var(--uui-color-text-alt,#6b7280)">No member types found.</p>` : a`
              <uui-table>
                <uui-table-head>
                  <uui-table-head-cell>Name</uui-table-head-cell>
                  <uui-table-head-cell>Alias</uui-table-head-cell>
                </uui-table-head>
                ${this._types.map((e) => a`
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
    return a`
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

        ${this._foundMember ? a`
          <uui-box style="margin-top:16px">
            <uui-table>
              <uui-table-row><uui-table-cell><strong>ID</strong></uui-table-cell><uui-table-cell>${this._foundMember.id}</uui-table-cell></uui-table-row>
              <uui-table-row><uui-table-cell><strong>Name</strong></uui-table-cell><uui-table-cell>${this._foundMember.name}</uui-table-cell></uui-table-row>
              <uui-table-row><uui-table-cell><strong>Email</strong></uui-table-cell><uui-table-cell>${this._foundMember.email}</uui-table-cell></uui-table-row>
              <uui-table-row><uui-table-cell><strong>Username</strong></uui-table-cell><uui-table-cell>${this._foundMember.username}</uui-table-cell></uui-table-row>
              <uui-table-row><uui-table-cell><strong>Approved</strong></uui-table-cell><uui-table-cell>${this._foundMember.isApproved ? "Yes" : "No"}</uui-table-cell></uui-table-row>
              <uui-table-row><uui-table-cell><strong>Locked Out</strong></uui-table-cell><uui-table-cell>${this._foundMember.isLockedOut ? "Yes" : "No"}</uui-table-cell></uui-table-row>
            </uui-table>

            <div class="form-row" style="margin-top:16px">
              <label for="lookupAssignGroup">Add this member to a group</label>
              <uui-select
                id="lookupAssignGroup"
                label="Group"
                .value=${this._assignGroup}
                @change=${(e) => this._assignGroup = e.target.value}
                .options=${this._groups.map((e) => ({
      name: e.name,
      value: e.name,
      selected: e.name === this._assignGroup
    }))}
              ></uui-select>
            </div>
            <div class="btn-row">
              <uui-button
                look="primary"
                label="Add ${this._foundMember.email} to the selected group"
                ?disabled=${this._busy === "assign" || this._groups.length === 0}
                @click=${() => {
      var e;
      return this._addToGroup((e = this._foundMember) == null ? void 0 : e.email, this._assignGroup);
    }}
                >${this._busy === "assign" ? "Adding…" : "Add to group"}</uui-button
              >
            </div>
            ${this._groups.length === 0 ? a`<p style="color:var(--uui-color-text-alt,#6b7280);font-size:0.85rem;margin:10px 0 0">
                  There are no member groups yet — create one on the Groups tab.
                </p>` : ""}
            ${this._result ? a`<div class="result ${this._result.success ? "success" : "error"}" style="margin-top:12px">${this._result.message}</div>` : ""}
          </uui-box>
        ` : ""}
        ${this._result && !this._foundMember ? a`<div class="result ${this._result.success ? "success" : "error"}">${this._result.message}</div>` : ""}
      </uui-box>
    `;
  }
  render() {
    return a`
      ${this._loadError ? a`<div class="splatdev-load-error" role="alert">${this._loadError}</div>` : ""}
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
h = /* @__PURE__ */ new WeakMap();
b = /* @__PURE__ */ new WeakSet();
_ = function(e) {
  return e.ok ? (this._loadError = null, !0) : (this._loadError = e.status === 401 || e.status === 403 ? "You are not authorised to do that. The request was refused, so anything shown below may be incomplete." : `The request did not succeed — the server returned ${e.status}${e.statusText ? ` ${e.statusText}` : ""}.`, !1);
};
r.styles = k`
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
u([
  p()
], r.prototype, "_activeTab", 2);
u([
  p()
], r.prototype, "_groups", 2);
u([
  p()
], r.prototype, "_types", 2);
u([
  p()
], r.prototype, "_foundMember", 2);
u([
  p()
], r.prototype, "_result", 2);
u([
  p()
], r.prototype, "_loading", 2);
u([
  p()
], r.prototype, "_loadError", 2);
u([
  p()
], r.prototype, "_newGroupName", 2);
u([
  p()
], r.prototype, "_assignEmail", 2);
u([
  p()
], r.prototype, "_assignGroup", 2);
u([
  p()
], r.prototype, "_busy", 2);
r = u([
  T("membergroups-dashboard")
], r);
const q = r;
export {
  r as MemberGroupsDashboardElement,
  q as default
};
