import { LitElement as H, nothing as v, html as c, css as E, state as b, customElement as O } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as N } from "@umbraco-cms/backoffice/element-api";
import "@umbraco-cms/backoffice/document";
import { UMB_AUTH_CONTEXT as P } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as S } from "@umbraco-cms/backoffice/notification";
function A(e) {
  let t = null, i = null;
  const r = e.consumeContext.bind(e), o = new Promise((a) => {
    r(P, async (s) => {
      var h;
      try {
        t = await ((h = s == null ? void 0 : s.getLatestToken) == null ? void 0 : h.call(s)) ?? null;
      } catch {
        t = null;
      }
      a();
    }), setTimeout(a, 3e3);
  });
  return r(S, (a) => {
    i = a;
  }), async (a, s = {}) => {
    await o;
    const h = new Headers(s.headers);
    t && !h.has("Authorization") && h.set("Authorization", `Bearer ${t}`);
    const u = await fetch(a, { ...s, credentials: "same-origin", headers: h });
    if (!u.ok) {
      const f = u.status === 401 || u.status === 403, T = f ? "Not authorised" : "Could not load data", y = f ? `The backoffice token was ${t ? "sent but rejected" : "not available"} (${u.status}). Anything shown below may be empty because the request was refused, not because there is nothing to show.` : `The request failed with ${u.status}. Anything shown below may be incomplete.`;
      console.error(`[SplatDev] ${u.status} from ${String(a)} — ${y}`), i == null || i.peek("danger", { data: { headline: T, message: y } });
    }
    return u;
  };
}
var z = Object.defineProperty, D = Object.getOwnPropertyDescriptor, $ = (e) => {
  throw TypeError(e);
}, p = (e, t, i, r) => {
  for (var o = r > 1 ? void 0 : r ? D(t, i) : t, a = e.length - 1, s; a >= 0; a--)
    (s = e[a]) && (o = (r ? s(t, i, o) : s(o)) || o);
  return r && o && z(t, i, o), o;
}, k = (e, t, i) => t.has(e) || $("Cannot " + i), x = (e, t, i) => (k(e, t, "read from private field"), i ? i.call(e) : t.get(e)), w = (e, t, i) => t.has(e) ? $("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), d = (e, t, i) => (k(e, t, "access private method"), i), g, l, _, C, m;
let n = class extends N(H) {
  constructor() {
    super(...arguments), w(this, l), w(this, g, A(this)), this._hidden = [], this._loading = !0, this._busy = !1, this._selection = [], this._result = null, this._api = "/umbraco/api/hiddencontent";
  }
  connectedCallback() {
    super.connectedCallback(), d(this, l, _).call(this);
  }
  render() {
    return c`
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
            @change=${(e) => this._selection = d(this, l, C).call(this, e)}>
          </umb-input-document>
        </div>

        <div class="actions">
          <uui-button look="primary" ?disabled=${this._busy || this._selection.length === 0}
            @click=${() => d(this, l, m).call(this, "Hide", this._selection)}>
            ${this._busy ? "Working…" : "Hide from navigation"}
          </uui-button>
          <uui-button look="secondary" ?disabled=${this._busy || this._selection.length === 0}
            @click=${() => d(this, l, m).call(this, "Show", this._selection)}>
            Restore to navigation
          </uui-button>
        </div>

        ${this._result ? c`<div class="msg ${this._result.success ? "success" : "error"}">
                   ${this._result.message}
                 </div>` : v}
      </uui-box>

      <uui-box headline="Currently hidden" style="margin-top:16px;">
        ${this._loading ? c`<uui-loader></uui-loader>` : this._hidden.length === 0 ? c`<p class="empty">Nothing is hidden from navigation.</p>` : c`
                <uui-table>
                  <uui-table-head>
                    <uui-table-head-cell>Page</uui-table-head-cell>
                    <uui-table-head-cell></uui-table-head-cell>
                  </uui-table-head>
                  ${this._hidden.map((e) => c`
                    <uui-table-row>
                      <uui-table-cell>
                        <strong>${e.name}</strong>
                        ${e.path ? c`<div class="crumb">${e.path}</div>` : v}
                      </uui-table-cell>
                      <uui-table-cell style="text-align:right;white-space:nowrap;">
                        <uui-button look="secondary" compact label="Restore"
                          ?disabled=${this._busy}
                          @click=${() => d(this, l, m).call(this, "Show", [e.key])}>
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
g = /* @__PURE__ */ new WeakMap();
l = /* @__PURE__ */ new WeakSet();
_ = async function() {
  this._loading = !0;
  try {
    const e = await x(this, g).call(this, `${this._api}/GetHiddenNodes`, { credentials: "same-origin" });
    e.ok && (this._hidden = await e.json());
  } finally {
    this._loading = !1;
  }
};
C = function(e) {
  const t = e.target;
  return (t.selection ?? String(t.value ?? "").split(",")).filter(Boolean);
};
m = async function(e, t) {
  this._busy = !0, this._result = null;
  try {
    const i = await x(this, g).call(this, `${this._api}/${e}`, {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nodes: t })
    });
    this._result = await i.json(), i.ok && (this._selection = [], await d(this, l, _).call(this));
  } catch (i) {
    this._result = { success: !1, message: `The request failed: ${i.message}`, affected: [] };
  } finally {
    this._busy = !1;
  }
};
n.styles = E`
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
p([
  b()
], n.prototype, "_hidden", 2);
p([
  b()
], n.prototype, "_loading", 2);
p([
  b()
], n.prototype, "_busy", 2);
p([
  b()
], n.prototype, "_selection", 2);
p([
  b()
], n.prototype, "_result", 2);
n = p([
  O("hiddencontent-dashboard")
], n);
const q = n;
export {
  n as HiddenContentDashboardElement,
  q as default
};
