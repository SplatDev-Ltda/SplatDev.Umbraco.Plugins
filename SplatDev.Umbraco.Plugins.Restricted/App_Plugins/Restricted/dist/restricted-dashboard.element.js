import { LitElement as E, html as l, css as T, state as d, customElement as R, nothing as f } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as C } from "@umbraco-cms/backoffice/element-api";
import "@umbraco-cms/backoffice/document";
import "@umbraco-cms/backoffice/member-group";
import { UMB_AUTH_CONTEXT as A } from "@umbraco-cms/backoffice/auth";
function S(e) {
  let t = null;
  const i = new Promise((s) => {
    e.consumeContext(A, async (a) => {
      var u;
      try {
        t = await ((u = a == null ? void 0 : a.getLatestToken) == null ? void 0 : u.call(a)) ?? null;
      } catch {
        t = null;
      }
      s();
    }), setTimeout(s, 3e3);
  });
  return async (s, a = {}) => {
    await i;
    const u = new Headers(a.headers);
    t && !u.has("Authorization") && u.set("Authorization", `Bearer ${t}`);
    const h = await fetch(s, { ...a, credentials: "same-origin", headers: u });
    return (h.status === 401 || h.status === 403) && console.error(
      `[SplatDev] ${h.status} from ${String(s)} — the backoffice token was ${t ? "sent but rejected" : "not available"}. The dashboard may render as empty.`
    ), h;
  };
}
var z = Object.defineProperty, D = Object.getOwnPropertyDescriptor, v = (e) => {
  throw TypeError(e);
}, c = (e, t, i, s) => {
  for (var a = s > 1 ? void 0 : s ? D(t, i) : t, u = e.length - 1, h; u >= 0; u--)
    (h = e[u]) && (a = (s ? h(t, i, a) : h(a)) || a);
  return s && a && z(t, i, a), a;
}, y = (e, t, i) => t.has(e) || v("Cannot " + i), b = (e, t, i) => (y(e, t, "read from private field"), i ? i.call(e) : t.get(e)), _ = (e, t, i) => t.has(e) ? v("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), r = (e, t, i) => (y(e, t, "access private method"), i), g, o, m, p, w, $, P, k, x;
let n = class extends C(E) {
  constructor() {
    super(...arguments), _(this, o), _(this, g, S(this)), this._restricted = [], this._loading = !0, this._saving = !1, this._node = [], this._loginPage = [], this._errorPage = [], this._groups = [], this._result = null, this._api = "/umbraco/api/restricted";
  }
  connectedCallback() {
    super.connectedCallback(), r(this, o, m).call(this);
  }
  render() {
    return l`
      <h1>Restricted content</h1>
      <p class="description">
        Require membership of a group to view a page. Protection applies to the page and
        everything beneath it, and is the same public-access rule Umbraco applies from the
        content tree.
      </p>

      ${r(this, o, k).call(this)}

      <uui-box headline="Protected pages" style="margin-top:16px;">
        ${this._loading ? l`<uui-loader></uui-loader>` : this._restricted.length === 0 ? l`<p class="empty">Nothing is protected yet.</p>` : l`
                <uui-table>
                  <uui-table-head>
                    <uui-table-head-cell>Page</uui-table-head-cell>
                    <uui-table-head-cell>Allowed groups</uui-table-head-cell>
                    <uui-table-head-cell>Login</uui-table-head-cell>
                    <uui-table-head-cell>Access denied</uui-table-head-cell>
                    <uui-table-head-cell></uui-table-head-cell>
                  </uui-table-head>
                  ${this._restricted.map((e) => r(this, o, x).call(this, e))}
                </uui-table>
              `}
      </uui-box>
    `;
  }
};
g = /* @__PURE__ */ new WeakMap();
o = /* @__PURE__ */ new WeakSet();
m = async function() {
  this._loading = !0;
  try {
    const e = await b(this, g).call(this, `${this._api}/GetRestrictedNodes`, { credentials: "same-origin" });
    e.ok && (this._restricted = await e.json());
  } finally {
    this._loading = !1;
  }
};
p = function(e) {
  return (e.target.selection ?? String(e.target.value ?? "").split(",")).filter(Boolean);
};
w = async function() {
  this._saving = !0, this._result = null;
  try {
    const e = await b(this, g).call(this, `${this._api}/RestrictNode`, {
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
    this._result = await e.json(), e.ok && (this._node = [], this._groups = [], await r(this, o, m).call(this));
  } catch (e) {
    this._result = { success: !1, message: `The request failed: ${e.message}` };
  } finally {
    this._saving = !1;
  }
};
$ = async function(e) {
  if (confirm(`Make "${e.node.name}" public again? Everything beneath it becomes public too.`)) {
    this._result = null;
    try {
      const t = await b(this, g).call(this, `${this._api}/UnrestrictNode?node=${encodeURIComponent(e.node.key)}`, {
        method: "DELETE",
        credentials: "same-origin"
      });
      this._result = await t.json(), await r(this, o, m).call(this);
    } catch (t) {
      this._result = { success: !1, message: `The request failed: ${t.message}` };
    }
  }
};
P = function(e) {
  this._node = [e.node.key], this._loginPage = e.loginPage ? [e.loginPage.key] : [], this._errorPage = e.errorPage ? [e.errorPage.key] : [], this._groups = e.memberGroups.filter((t) => t.key !== "00000000-0000-0000-0000-000000000000").map((t) => t.key), this._result = null, this.scrollIntoView({ behavior: "smooth", block: "start" });
};
k = function() {
  return l`
      <uui-box headline="Protect a page">
        <div class="field">
          <label for="node">Page to protect</label>
          <p class="help">The page and everything beneath it will require membership.</p>
          <umb-input-document
            id="node"
            max="1"
            .selection=${this._node}
            @change=${(e) => this._node = r(this, o, p).call(this, e)}>
          </umb-input-document>
        </div>

        <div class="field">
          <label for="groups">Member groups allowed</label>
          <p class="help">A member in any one of these groups can see the page.</p>
          <umb-input-member-group
            id="groups"
            .selection=${this._groups}
            @change=${(e) => this._groups = r(this, o, p).call(this, e)}>
          </umb-input-member-group>
        </div>

        <div class="field">
          <label for="login">Login page</label>
          <p class="help">Where visitors who are not signed in are sent.</p>
          <umb-input-document
            id="login"
            max="1"
            .selection=${this._loginPage}
            @change=${(e) => this._loginPage = r(this, o, p).call(this, e)}>
          </umb-input-document>
        </div>

        <div class="field">
          <label for="error">Access denied page</label>
          <p class="help">Where signed-in members who are not in an allowed group are sent.</p>
          <umb-input-document
            id="error"
            max="1"
            .selection=${this._errorPage}
            @change=${(e) => this._errorPage = r(this, o, p).call(this, e)}>
          </umb-input-document>
        </div>

        <div class="actions">
          <uui-button
            look="primary"
            ?disabled=${this._saving || this._node.length === 0}
            @click=${r(this, o, w)}>
            ${this._saving ? "Saving…" : "Protect page"}
          </uui-button>
        </div>

        ${this._result ? l`<div class="msg ${this._result.success ? "success" : "error"}">
                   ${this._result.message}
                 </div>` : f}
      </uui-box>
    `;
};
x = function(e) {
  var t, i;
  return l`
      <uui-table-row>
        <uui-table-cell>
          <strong>${e.node.name}</strong>
          ${e.node.path ? l`<div class="crumb">${e.node.path}</div>` : f}
        </uui-table-cell>
        <uui-table-cell>
          <div class="groups">
            ${e.memberGroups.map((s) => s.key === "00000000-0000-0000-0000-000000000000" ? l`<uui-tag look="warning" title="This group no longer exists">
                         ${s.name}
                       </uui-tag>` : l`<uui-tag look="secondary">${s.name}</uui-tag>`)}
          </div>
        </uui-table-cell>
        <uui-table-cell>
          ${((t = e.loginPage) == null ? void 0 : t.name) ?? l`<span class="missing">missing</span>`}
        </uui-table-cell>
        <uui-table-cell>
          ${((i = e.errorPage) == null ? void 0 : i.name) ?? l`<span class="missing">missing</span>`}
        </uui-table-cell>
        <uui-table-cell style="text-align:right;white-space:nowrap;">
          <uui-button look="secondary" compact label="Edit" @click=${() => r(this, o, P).call(this, e)}>
            Edit
          </uui-button>
          <uui-button look="secondary" color="danger" compact label="Remove"
            @click=${() => r(this, o, $).call(this, e)}>
            Remove
          </uui-button>
        </uui-table-cell>
      </uui-table-row>
    `;
};
n.styles = T`
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
c([
  d()
], n.prototype, "_restricted", 2);
c([
  d()
], n.prototype, "_loading", 2);
c([
  d()
], n.prototype, "_saving", 2);
c([
  d()
], n.prototype, "_node", 2);
c([
  d()
], n.prototype, "_loginPage", 2);
c([
  d()
], n.prototype, "_errorPage", 2);
c([
  d()
], n.prototype, "_groups", 2);
c([
  d()
], n.prototype, "_result", 2);
n = c([
  R("restricted-dashboard")
], n);
const L = n;
export {
  n as RestrictedDashboardElement,
  L as default
};
