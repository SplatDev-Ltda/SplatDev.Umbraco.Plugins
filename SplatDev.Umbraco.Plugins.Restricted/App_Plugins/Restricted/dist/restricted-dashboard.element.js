import { LitElement as $, html as s, css as w, state as u, customElement as P, nothing as m } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as k } from "@umbraco-cms/backoffice/element-api";
import "@umbraco-cms/backoffice/document";
import "@umbraco-cms/backoffice/member-group";
var E = Object.defineProperty, R = Object.getOwnPropertyDescriptor, b = (e) => {
  throw TypeError(e);
}, r = (e, t, a, n) => {
  for (var c = n > 1 ? void 0 : n ? R(t, a) : t, p = e.length - 1, g; p >= 0; p--)
    (g = e[p]) && (c = (n ? g(t, a, c) : g(c)) || c);
  return n && c && E(t, a, c), c;
}, C = (e, t, a) => t.has(e) || b("Cannot " + a), T = (e, t, a) => t.has(e) ? b("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, a), l = (e, t, a) => (C(e, t, "access private method"), a), i, d, h, _, f, v, x, y;
let o = class extends k($) {
  constructor() {
    super(...arguments), T(this, i), this._restricted = [], this._loading = !0, this._saving = !1, this._node = [], this._loginPage = [], this._errorPage = [], this._groups = [], this._result = null, this._api = "/umbraco/api/restricted";
  }
  connectedCallback() {
    super.connectedCallback(), l(this, i, d).call(this);
  }
  render() {
    return s`
      <h1>Restricted content</h1>
      <p class="description">
        Require membership of a group to view a page. Protection applies to the page and
        everything beneath it, and is the same public-access rule Umbraco applies from the
        content tree.
      </p>

      ${l(this, i, x).call(this)}

      <uui-box headline="Protected pages" style="margin-top:16px;">
        ${this._loading ? s`<uui-loader></uui-loader>` : this._restricted.length === 0 ? s`<p class="empty">Nothing is protected yet.</p>` : s`
                <uui-table>
                  <uui-table-head>
                    <uui-table-head-cell>Page</uui-table-head-cell>
                    <uui-table-head-cell>Allowed groups</uui-table-head-cell>
                    <uui-table-head-cell>Login</uui-table-head-cell>
                    <uui-table-head-cell>Access denied</uui-table-head-cell>
                    <uui-table-head-cell></uui-table-head-cell>
                  </uui-table-head>
                  ${this._restricted.map((e) => l(this, i, y).call(this, e))}
                </uui-table>
              `}
      </uui-box>
    `;
  }
};
i = /* @__PURE__ */ new WeakSet();
d = async function() {
  this._loading = !0;
  try {
    const e = await fetch(`${this._api}/GetRestrictedNodes`, { credentials: "same-origin" });
    e.ok && (this._restricted = await e.json());
  } finally {
    this._loading = !1;
  }
};
h = function(e) {
  return (e.target.selection ?? String(e.target.value ?? "").split(",")).filter(Boolean);
};
_ = async function() {
  this._saving = !0, this._result = null;
  try {
    const e = await fetch(`${this._api}/RestrictNode`, {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        node: this._node[0] ?? "",
        loginPage: this._loginPage[0] ?? "",
        errorPage: this._errorPage[0] ?? "",
        memberGroups: this._groups
      })
    });
    this._result = await e.json(), e.ok && (this._node = [], this._groups = [], await l(this, i, d).call(this));
  } catch (e) {
    this._result = { success: !1, message: `The request failed: ${e.message}` };
  } finally {
    this._saving = !1;
  }
};
f = async function(e) {
  if (confirm(`Make "${e.node.name}" public again? Everything beneath it becomes public too.`)) {
    this._result = null;
    try {
      const t = await fetch(`${this._api}/UnrestrictNode?node=${encodeURIComponent(e.node.key)}`, {
        method: "DELETE",
        credentials: "same-origin"
      });
      this._result = await t.json(), await l(this, i, d).call(this);
    } catch (t) {
      this._result = { success: !1, message: `The request failed: ${t.message}` };
    }
  }
};
v = function(e) {
  this._node = [e.node.key], this._loginPage = e.loginPage ? [e.loginPage.key] : [], this._errorPage = e.errorPage ? [e.errorPage.key] : [], this._groups = e.memberGroups.filter((t) => t.key !== "00000000-0000-0000-0000-000000000000").map((t) => t.key), this._result = null, this.scrollIntoView({ behavior: "smooth", block: "start" });
};
x = function() {
  return s`
      <uui-box headline="Protect a page">
        <div class="field">
          <label for="node">Page to protect</label>
          <p class="help">The page and everything beneath it will require membership.</p>
          <umb-input-document
            id="node"
            max="1"
            .value=${this._node}
            @change=${(e) => this._node = l(this, i, h).call(this, e)}>
          </umb-input-document>
        </div>

        <div class="field">
          <label for="groups">Member groups allowed</label>
          <p class="help">A member in any one of these groups can see the page.</p>
          <umb-input-member-group
            id="groups"
            .value=${this._groups}
            @change=${(e) => this._groups = l(this, i, h).call(this, e)}>
          </umb-input-member-group>
        </div>

        <div class="field">
          <label for="login">Login page</label>
          <p class="help">Where visitors who are not signed in are sent.</p>
          <umb-input-document
            id="login"
            max="1"
            .value=${this._loginPage}
            @change=${(e) => this._loginPage = l(this, i, h).call(this, e)}>
          </umb-input-document>
        </div>

        <div class="field">
          <label for="error">Access denied page</label>
          <p class="help">Where signed-in members who are not in an allowed group are sent.</p>
          <umb-input-document
            id="error"
            max="1"
            .value=${this._errorPage}
            @change=${(e) => this._errorPage = l(this, i, h).call(this, e)}>
          </umb-input-document>
        </div>

        <div class="actions">
          <uui-button
            look="primary"
            ?disabled=${this._saving || this._node.length === 0}
            @click=${l(this, i, _)}>
            ${this._saving ? "Saving…" : "Protect page"}
          </uui-button>
        </div>

        ${this._result ? s`<div class="msg ${this._result.success ? "success" : "error"}">
                   ${this._result.message}
                 </div>` : m}
      </uui-box>
    `;
};
y = function(e) {
  var t, a;
  return s`
      <uui-table-row>
        <uui-table-cell>
          <strong>${e.node.name}</strong>
          ${e.node.path ? s`<div class="crumb">${e.node.path}</div>` : m}
        </uui-table-cell>
        <uui-table-cell>
          <div class="groups">
            ${e.memberGroups.map((n) => n.key === "00000000-0000-0000-0000-000000000000" ? s`<uui-tag look="warning" title="This group no longer exists">
                         ${n.name}
                       </uui-tag>` : s`<uui-tag look="secondary">${n.name}</uui-tag>`)}
          </div>
        </uui-table-cell>
        <uui-table-cell>
          ${((t = e.loginPage) == null ? void 0 : t.name) ?? s`<span class="missing">missing</span>`}
        </uui-table-cell>
        <uui-table-cell>
          ${((a = e.errorPage) == null ? void 0 : a.name) ?? s`<span class="missing">missing</span>`}
        </uui-table-cell>
        <uui-table-cell style="text-align:right;white-space:nowrap;">
          <uui-button look="secondary" compact label="Edit" @click=${() => l(this, i, v).call(this, e)}>
            Edit
          </uui-button>
          <uui-button look="secondary" color="danger" compact label="Remove"
            @click=${() => l(this, i, f).call(this, e)}>
            Remove
          </uui-button>
        </uui-table-cell>
      </uui-table-row>
    `;
};
o.styles = w`
    :host { display: block; padding: var(--uui-size-layout-1, 24px); }
    h1 { font-size: 1.5rem; font-weight: 600; margin: 0 0 8px; }
    p.description { color: var(--uui-color-text-alt, #6b7280); margin: 0 0 24px; max-width: 60ch; }
    .field { margin-bottom: 18px; }
    .field > label { display: block; font-weight: 600; font-size: 0.875rem; margin-bottom: 4px; }
    .field > .help { color: var(--uui-color-text-alt, #6b7280); font-size: 0.8125rem; margin: 0 0 6px; }
    .actions { display: flex; gap: 12px; align-items: center; margin-top: 8px; }
    .msg { padding: 10px 14px; border-radius: 4px; margin-top: 16px; }
    .msg.success { background: #d1fae5; color: #065f46; }
    .msg.error { background: #fee2e2; color: #991b1b; }
    .crumb { color: var(--uui-color-text-alt, #6b7280); font-size: 0.8125rem; }
    .groups { display: flex; gap: 6px; flex-wrap: wrap; }
    .missing { color: #b45309; }
    .empty { color: var(--uui-color-text-alt, #6b7280); padding: 16px 0; }
    uui-table { width: 100%; }
  `;
r([
  u()
], o.prototype, "_restricted", 2);
r([
  u()
], o.prototype, "_loading", 2);
r([
  u()
], o.prototype, "_saving", 2);
r([
  u()
], o.prototype, "_node", 2);
r([
  u()
], o.prototype, "_loginPage", 2);
r([
  u()
], o.prototype, "_errorPage", 2);
r([
  u()
], o.prototype, "_groups", 2);
r([
  u()
], o.prototype, "_result", 2);
o = r([
  P("restricted-dashboard")
], o);
const A = o;
export {
  o as RestrictedDashboardElement,
  A as default
};
