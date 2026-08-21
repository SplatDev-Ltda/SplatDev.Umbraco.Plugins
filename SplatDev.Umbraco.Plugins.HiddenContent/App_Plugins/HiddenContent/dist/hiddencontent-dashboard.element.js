import { LitElement as H, nothing as w, html as n, css as O, state as b, customElement as N } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as P } from "@umbraco-cms/backoffice/element-api";
import "@umbraco-cms/backoffice/document";
import { UMB_AUTH_CONTEXT as S } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as z } from "@umbraco-cms/backoffice/notification";
function A(e) {
  let t = null, s = null;
  const d = e.consumeContext.bind(e), l = new Promise((i) => {
    d(S, async (a) => {
      var p;
      try {
        t = await ((p = a == null ? void 0 : a.getLatestToken) == null ? void 0 : p.call(a)) ?? null;
      } catch {
        t = null;
      }
      i();
    }), setTimeout(i, 3e3);
  });
  return d(z, (i) => {
    s = i;
  }), async (i, a = {}) => {
    await l;
    const p = new Headers(a.headers);
    t && !p.has("Authorization") && p.set("Authorization", `Bearer ${t}`);
    const h = await fetch(i, { ...a, credentials: "same-origin", headers: p });
    if (!h.ok) {
      const y = h.status === 401 || h.status === 403, E = y ? "Not authorised" : "Could not load data", v = y ? `The backoffice token was ${t ? "sent but rejected" : "not available"} (${h.status}). Anything shown below may be empty because the request was refused, not because there is nothing to show.` : `The request failed with ${h.status}. Anything shown below may be incomplete.`;
      console.error(`[SplatDev] ${h.status} from ${String(i)} — ${v}`), s == null || s.peek("danger", { data: { headline: E, message: v } });
    }
    return h;
  };
}
var D = Object.defineProperty, q = Object.getOwnPropertyDescriptor, x = (e) => {
  throw TypeError(e);
}, c = (e, t, s, d) => {
  for (var l = d > 1 ? void 0 : d ? q(t, s) : t, i = e.length - 1, a; i >= 0; i--)
    (a = e[i]) && (l = (d ? a(t, s, l) : a(l)) || l);
  return d && l && D(t, s, l), l;
}, k = (e, t, s) => t.has(e) || x("Cannot " + s), T = (e, t, s) => (k(e, t, "read from private field"), s ? s.call(e) : t.get(e)), $ = (e, t, s) => t.has(e) ? x("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, s), u = (e, t, s) => (k(e, t, "access private method"), s), g, o, f, C, m, _;
let r = class extends P(H) {
  constructor() {
    super(...arguments), $(this, o), $(this, g, A(this)), this._hidden = [], this._loading = !0, this._busy = !1, this._selection = [], this._result = null, this._loadError = null, this._api = "/umbraco/api/hiddencontent";
  }
  connectedCallback() {
    super.connectedCallback(), u(this, o, f).call(this);
  }
  render() {
    return n`
      ${this._loadError ? n`<div class="splatdev-load-error" role="alert">${this._loadError}</div>` : ""}
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
            @change=${(e) => this._selection = u(this, o, C).call(this, e)}>
          </umb-input-document>
        </div>

        <div class="actions">
          <uui-button look="primary" ?disabled=${this._busy || this._selection.length === 0}
            @click=${() => u(this, o, m).call(this, "Hide", this._selection)}>
            ${this._busy ? "Working…" : "Hide from navigation"}
          </uui-button>
          <uui-button look="secondary" ?disabled=${this._busy || this._selection.length === 0}
            @click=${() => u(this, o, m).call(this, "Show", this._selection)}>
            Restore to navigation
          </uui-button>
        </div>

        ${this._result ? n`<div class="msg ${this._result.success ? "success" : "error"}">
                   ${this._result.message}
                 </div>` : w}
      </uui-box>

      <uui-box headline="Currently hidden" style="margin-top:16px;">
        ${this._loading ? n`<uui-loader></uui-loader>` : this._hidden.length === 0 ? n`<p class="empty">Nothing is hidden from navigation.</p>` : n`
                <uui-table>
                  <uui-table-head>
                    <uui-table-head-cell>Page</uui-table-head-cell>
                    <uui-table-head-cell></uui-table-head-cell>
                  </uui-table-head>
                  ${this._hidden.map((e) => n`
                    <uui-table-row>
                      <uui-table-cell>
                        <strong>${e.name}</strong>
                        ${e.path ? n`<div class="crumb">${e.path}</div>` : w}
                      </uui-table-cell>
                      <uui-table-cell style="text-align:right;white-space:nowrap;">
                        <uui-button look="secondary" compact label="Restore"
                          ?disabled=${this._busy}
                          @click=${() => u(this, o, m).call(this, "Show", [e.key])}>
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
o = /* @__PURE__ */ new WeakSet();
f = async function() {
  this._loading = !0;
  try {
    const e = await T(this, g).call(this, `${this._api}/GetHiddenNodes`, { credentials: "same-origin" });
    u(this, o, _).call(this, e) && (this._hidden = await e.json());
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
    const s = await T(this, g).call(this, `${this._api}/${e}`, {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nodes: t })
    });
    this._result = await s.json(), u(this, o, _).call(this, s) && (this._selection = [], await u(this, o, f).call(this));
  } catch (s) {
    this._result = { success: !1, message: `The request failed: ${s.message}`, affected: [] };
  } finally {
    this._busy = !1;
  }
};
_ = function(e) {
  return e.ok ? (this._loadError = null, !0) : (this._loadError = e.status === 401 || e.status === 403 ? "You are not authorised to do that. The request was refused, so anything shown below may be incomplete." : `The request did not succeed — the server returned ${e.status}${e.statusText ? ` ${e.statusText}` : ""}.`, !1);
};
r.styles = O`
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
c([
  b()
], r.prototype, "_hidden", 2);
c([
  b()
], r.prototype, "_loading", 2);
c([
  b()
], r.prototype, "_busy", 2);
c([
  b()
], r.prototype, "_selection", 2);
c([
  b()
], r.prototype, "_result", 2);
c([
  b()
], r.prototype, "_loadError", 2);
r = c([
  N("hiddencontent-dashboard")
], r);
const F = r;
export {
  r as HiddenContentDashboardElement,
  F as default
};
