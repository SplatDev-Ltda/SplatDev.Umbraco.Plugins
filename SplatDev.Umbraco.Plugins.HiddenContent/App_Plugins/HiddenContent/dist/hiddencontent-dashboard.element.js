import { LitElement as $, nothing as g, html as o, css as k, state as u, customElement as E } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as C } from "@umbraco-cms/backoffice/element-api";
import "@umbraco-cms/backoffice/document";
import { c as H } from "./chunks/auth-fetch-BzMCmNwW.js";
var T = Object.defineProperty, P = Object.getOwnPropertyDescriptor, v = (t) => {
  throw TypeError(t);
}, n = (t, e, i, d) => {
  for (var r = d > 1 ? void 0 : d ? P(e, i) : e, p = t.length - 1, b; p >= 0; p--)
    (b = t[p]) && (r = (d ? b(e, i, r) : b(r)) || r);
  return d && r && T(e, i, r), r;
}, y = (t, e, i) => e.has(t) || v("Cannot " + i), x = (t, e, i) => (y(t, e, "read from private field"), i ? i.call(t) : e.get(t)), f = (t, e, i) => e.has(t) ? v("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, i), l = (t, e, i) => (y(t, e, "access private method"), i), h, a, m, w, c, _;
let s = class extends C($) {
  constructor() {
    super(...arguments), f(this, a), f(this, h, H(this)), this._hidden = [], this._loading = !0, this._busy = !1, this._selection = [], this._result = null, this._loadError = null, this._api = "/umbraco/api/hiddencontent";
  }
  connectedCallback() {
    super.connectedCallback(), l(this, a, m).call(this);
  }
  render() {
    return o`
      ${this._loadError ? o`<div class="splatdev-load-error" role="alert">${this._loadError}</div>` : ""}
      <h1>Hidden content</h1>
      <p class="description">
        Hide pages from navigation without unpublishing them. This sets the standard
        <code>umbracoNaviHide</code> property, so menus built the usual way will skip them
        while the page stays reachable by URL.
      </p>

      <uui-box headline="Hide or restore pages">
        <div class="field">
          <label for="pages">Pages</label>
          <p class="help">Pick one or several. Restoring works on the same selection.</p>
          <umb-input-document
            id="pages"
            .selection=${this._selection}
            @change=${(t) => this._selection = l(this, a, w).call(this, t)}>
          </umb-input-document>
        </div>

        <div class="actions">
          <uui-button look="primary" ?disabled=${this._busy || this._selection.length === 0}
            @click=${() => l(this, a, c).call(this, "Hide", this._selection)}>
            ${this._busy ? "Working…" : "Hide from navigation"}
          </uui-button>
          <uui-button look="secondary" ?disabled=${this._busy || this._selection.length === 0}
            @click=${() => l(this, a, c).call(this, "Show", this._selection)}>
            Restore to navigation
          </uui-button>
        </div>

        ${this._result ? o`<div class="msg ${this._result.success ? "success" : "error"}">
                   ${this._result.message}
                 </div>` : g}
      </uui-box>

      <uui-box headline="Currently hidden" style="margin-top:16px;">
        ${this._loading ? o`<uui-loader></uui-loader>` : this._hidden.length === 0 ? o`<p class="empty">Nothing is hidden from navigation.</p>` : o`
                <uui-table>
                  <uui-table-head>
                    <uui-table-head-cell>Page</uui-table-head-cell>
                    <uui-table-head-cell></uui-table-head-cell>
                  </uui-table-head>
                  ${this._hidden.map((t) => o`
                    <uui-table-row>
                      <uui-table-cell>
                        <strong>${t.name}</strong>
                        ${t.path ? o`<div class="crumb">${t.path}</div>` : g}
                      </uui-table-cell>
                      <uui-table-cell style="text-align:right;white-space:nowrap;">
                        <uui-button look="secondary" compact label="Restore"
                          ?disabled=${this._busy}
                          @click=${() => l(this, a, c).call(this, "Show", [t.key])}>
                          Restore
                        </uui-button>
                      </uui-table-cell>
                    </uui-table-row>
                  `)}
                </uui-table>
              `}
      </uui-box>
    `;
  }
};
h = /* @__PURE__ */ new WeakMap();
a = /* @__PURE__ */ new WeakSet();
m = async function() {
  this._loading = !0;
  try {
    const t = await x(this, h).call(this, `${this._api}/GetHiddenNodes`, { credentials: "same-origin" });
    l(this, a, _).call(this, t) && (this._hidden = await t.json());
  } finally {
    this._loading = !1;
  }
};
w = function(t) {
  const e = t.target;
  return (e.selection ?? String(e.value ?? "").split(",")).filter(Boolean);
};
c = async function(t, e) {
  this._busy = !0, this._result = null;
  try {
    const i = await x(this, h).call(this, `${this._api}/${t}`, {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nodes: e })
    });
    this._result = await i.json(), l(this, a, _).call(this, i) && (this._selection = [], await l(this, a, m).call(this));
  } catch (i) {
    this._result = { success: !1, message: `The request failed: ${i.message}`, affected: [] };
  } finally {
    this._busy = !1;
  }
};
_ = function(t) {
  return t.ok ? (this._loadError = null, !0) : (this._loadError = t.status === 401 || t.status === 403 ? "You are not authorised to do that. The request was refused, so anything shown below may be incomplete." : `The request did not succeed — the server returned ${t.status}${t.statusText ? ` ${t.statusText}` : ""}.`, !1);
};
s.styles = k`
    :host { display: block; padding: var(--uui-size-layout-1, 24px); }
    h1 { font-size: 1.5rem; font-weight: 600; margin: 0 0 8px; }
    p.description { color: var(--uui-color-text-alt, #6b7280); margin: 0 0 24px; max-width: 62ch; }
    .field { margin-bottom: 16px; }
    .field > label { display: block; font-weight: 600; font-size: 0.875rem; margin-bottom: 4px; }
    .field > .help { color: var(--uui-color-text-alt, #6b7280); font-size: 0.8125rem; margin: 0 0 6px; }
    .actions { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
    .msg { padding: 10px 14px; border-radius: 4px; margin-top: 16px; }
    .msg.success { background: #d1fae5; color: #065f46; }
    .msg.error { background: #fee2e2; color: #991b1b; }
    .crumb { color: var(--uui-color-text-alt, #6b7280); font-size: 0.8125rem; }
    .empty { color: var(--uui-color-text-alt, #6b7280); padding: 16px 0; }
    uui-table { width: 100%; }
  
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
  u()
], s.prototype, "_hidden", 2);
n([
  u()
], s.prototype, "_loading", 2);
n([
  u()
], s.prototype, "_busy", 2);
n([
  u()
], s.prototype, "_selection", 2);
n([
  u()
], s.prototype, "_result", 2);
n([
  u()
], s.prototype, "_loadError", 2);
s = n([
  E("hiddencontent-dashboard")
], s);
const R = s;
export {
  s as HiddenContentDashboardElement,
  R as default
};
