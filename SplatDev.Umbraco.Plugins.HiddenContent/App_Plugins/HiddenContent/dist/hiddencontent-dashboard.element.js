import { LitElement as f, nothing as m, html as l, css as y, state as u, customElement as v } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as x } from "@umbraco-cms/backoffice/element-api";
import "@umbraco-cms/backoffice/document";
var w = Object.defineProperty, $ = Object.getOwnPropertyDescriptor, g = (e) => {
  throw TypeError(e);
}, r = (e, t, i, c) => {
  for (var o = c > 1 ? void 0 : c ? $(t, i) : t, h = e.length - 1, p; h >= 0; h--)
    (p = e[h]) && (o = (c ? p(t, i, o) : p(o)) || o);
  return c && o && w(t, i, o), o;
}, k = (e, t, i) => t.has(e) || g("Cannot " + i), C = (e, t, i) => t.has(e) ? g("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), n = (e, t, i) => (k(e, t, "access private method"), i), a, b, _, d;
let s = class extends x(f) {
  constructor() {
    super(...arguments), C(this, a), this._hidden = [], this._loading = !0, this._busy = !1, this._selection = [], this._result = null, this._api = "/umbraco/api/hiddencontent";
  }
  connectedCallback() {
    super.connectedCallback(), n(this, a, b).call(this);
  }
  render() {
    return l`
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
            .value=${this._selection}
            @change=${(e) => this._selection = n(this, a, _).call(this, e)}>
          </umb-input-document>
        </div>

        <div class="actions">
          <uui-button look="primary" ?disabled=${this._busy || this._selection.length === 0}
            @click=${() => n(this, a, d).call(this, "Hide", this._selection)}>
            ${this._busy ? "Working…" : "Hide from navigation"}
          </uui-button>
          <uui-button look="secondary" ?disabled=${this._busy || this._selection.length === 0}
            @click=${() => n(this, a, d).call(this, "Show", this._selection)}>
            Restore to navigation
          </uui-button>
        </div>

        ${this._result ? l`<div class="msg ${this._result.success ? "success" : "error"}">
                   ${this._result.message}
                 </div>` : m}
      </uui-box>

      <uui-box headline="Currently hidden" style="margin-top:16px;">
        ${this._loading ? l`<uui-loader></uui-loader>` : this._hidden.length === 0 ? l`<p class="empty">Nothing is hidden from navigation.</p>` : l`
                <uui-table>
                  <uui-table-head>
                    <uui-table-head-cell>Page</uui-table-head-cell>
                    <uui-table-head-cell></uui-table-head-cell>
                  </uui-table-head>
                  ${this._hidden.map((e) => l`
                    <uui-table-row>
                      <uui-table-cell>
                        <strong>${e.name}</strong>
                        ${e.path ? l`<div class="crumb">${e.path}</div>` : m}
                      </uui-table-cell>
                      <uui-table-cell style="text-align:right;white-space:nowrap;">
                        <uui-button look="secondary" compact label="Restore"
                          ?disabled=${this._busy}
                          @click=${() => n(this, a, d).call(this, "Show", [e.key])}>
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
a = /* @__PURE__ */ new WeakSet();
b = async function() {
  this._loading = !0;
  try {
    const e = await fetch(`${this._api}/GetHiddenNodes`, { credentials: "same-origin" });
    e.ok && (this._hidden = await e.json());
  } finally {
    this._loading = !1;
  }
};
_ = function(e) {
  const t = e.target;
  return (t.selection ?? String(t.value ?? "").split(",")).filter(Boolean);
};
d = async function(e, t) {
  this._busy = !0, this._result = null;
  try {
    const i = await fetch(`${this._api}/${e}`, {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nodes: t })
    });
    this._result = await i.json(), i.ok && (this._selection = [], await n(this, a, b).call(this));
  } catch (i) {
    this._result = { success: !1, message: `The request failed: ${i.message}`, affected: [] };
  } finally {
    this._busy = !1;
  }
};
s.styles = y`
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
  `;
r([
  u()
], s.prototype, "_hidden", 2);
r([
  u()
], s.prototype, "_loading", 2);
r([
  u()
], s.prototype, "_busy", 2);
r([
  u()
], s.prototype, "_selection", 2);
r([
  u()
], s.prototype, "_result", 2);
s = r([
  v("hiddencontent-dashboard")
], s);
const S = s;
export {
  s as HiddenContentDashboardElement,
  S as default
};
