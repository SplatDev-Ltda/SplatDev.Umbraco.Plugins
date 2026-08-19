import { LitElement as $, nothing as _, html as u, css as k, state as d, customElement as x } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as C } from "@umbraco-cms/backoffice/element-api";
import "@umbraco-cms/backoffice/document";
import { UMB_AUTH_CONTEXT as H } from "@umbraco-cms/backoffice/auth";
function T(e) {
  let t = null;
  const i = new Promise((a) => {
    e.consumeContext(H, async (s) => {
      var o;
      try {
        t = await ((o = s == null ? void 0 : s.getLatestToken) == null ? void 0 : o.call(s)) ?? null;
      } catch {
        t = null;
      }
      a();
    }), setTimeout(a, 3e3);
  });
  return async (a, s = {}) => {
    await i;
    const o = new Headers(s.headers);
    t && !o.has("Authorization") && o.set("Authorization", `Bearer ${t}`);
    const n = await fetch(a, { ...s, credentials: "same-origin", headers: o });
    return (n.status === 401 || n.status === 403) && console.error(
      `[SplatDev] ${n.status} from ${String(a)} — the backoffice token was ${t ? "sent but rejected" : "not available"}. The dashboard may render as empty.`
    ), n;
  };
}
var E = Object.defineProperty, P = Object.getOwnPropertyDescriptor, f = (e) => {
  throw TypeError(e);
}, h = (e, t, i, a) => {
  for (var s = a > 1 ? void 0 : a ? P(t, i) : t, o = e.length - 1, n; o >= 0; o--)
    (n = e[o]) && (s = (a ? n(t, i, s) : n(s)) || s);
  return a && s && E(t, i, s), s;
}, y = (e, t, i) => t.has(e) || f("Cannot " + i), v = (e, t, i) => (y(e, t, "read from private field"), i ? i.call(e) : t.get(e)), g = (e, t, i) => t.has(e) ? f("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), c = (e, t, i) => (y(e, t, "access private method"), i), b, r, m, w, p;
let l = class extends C($) {
  constructor() {
    super(...arguments), g(this, r), g(this, b, T(this)), this._hidden = [], this._loading = !0, this._busy = !1, this._selection = [], this._result = null, this._api = "/umbraco/api/hiddencontent";
  }
  connectedCallback() {
    super.connectedCallback(), c(this, r, m).call(this);
  }
  render() {
    return u`
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
            @change=${(e) => this._selection = c(this, r, w).call(this, e)}>
          </umb-input-document>
        </div>

        <div class="actions">
          <uui-button look="primary" ?disabled=${this._busy || this._selection.length === 0}
            @click=${() => c(this, r, p).call(this, "Hide", this._selection)}>
            ${this._busy ? "Working…" : "Hide from navigation"}
          </uui-button>
          <uui-button look="secondary" ?disabled=${this._busy || this._selection.length === 0}
            @click=${() => c(this, r, p).call(this, "Show", this._selection)}>
            Restore to navigation
          </uui-button>
        </div>

        ${this._result ? u`<div class="msg ${this._result.success ? "success" : "error"}">
                   ${this._result.message}
                 </div>` : _}
      </uui-box>

      <uui-box headline="Currently hidden" style="margin-top:16px;">
        ${this._loading ? u`<uui-loader></uui-loader>` : this._hidden.length === 0 ? u`<p class="empty">Nothing is hidden from navigation.</p>` : u`
                <uui-table>
                  <uui-table-head>
                    <uui-table-head-cell>Page</uui-table-head-cell>
                    <uui-table-head-cell></uui-table-head-cell>
                  </uui-table-head>
                  ${this._hidden.map((e) => u`
                    <uui-table-row>
                      <uui-table-cell>
                        <strong>${e.name}</strong>
                        ${e.path ? u`<div class="crumb">${e.path}</div>` : _}
                      </uui-table-cell>
                      <uui-table-cell style="text-align:right;white-space:nowrap;">
                        <uui-button look="secondary" compact label="Restore"
                          ?disabled=${this._busy}
                          @click=${() => c(this, r, p).call(this, "Show", [e.key])}>
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
b = /* @__PURE__ */ new WeakMap();
r = /* @__PURE__ */ new WeakSet();
m = async function() {
  this._loading = !0;
  try {
    const e = await v(this, b).call(this, `${this._api}/GetHiddenNodes`, { credentials: "same-origin" });
    e.ok && (this._hidden = await e.json());
  } finally {
    this._loading = !1;
  }
};
w = function(e) {
  const t = e.target;
  return (t.selection ?? String(t.value ?? "").split(",")).filter(Boolean);
};
p = async function(e, t) {
  this._busy = !0, this._result = null;
  try {
    const i = await v(this, b).call(this, `${this._api}/${e}`, {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nodes: t })
    });
    this._result = await i.json(), i.ok && (this._selection = [], await c(this, r, m).call(this));
  } catch (i) {
    this._result = { success: !1, message: `The request failed: ${i.message}`, affected: [] };
  } finally {
    this._busy = !1;
  }
};
l.styles = k`
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
h([
  d()
], l.prototype, "_hidden", 2);
h([
  d()
], l.prototype, "_loading", 2);
h([
  d()
], l.prototype, "_busy", 2);
h([
  d()
], l.prototype, "_selection", 2);
h([
  d()
], l.prototype, "_result", 2);
l = h([
  x("hiddencontent-dashboard")
], l);
const A = l;
export {
  l as HiddenContentDashboardElement,
  A as default
};
