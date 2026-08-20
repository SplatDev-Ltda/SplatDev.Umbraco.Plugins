import { LitElement as x, nothing as m, html as s, css as k, state as h, customElement as C } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as A } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as D } from "@umbraco-cms/backoffice/auth";
function E(t) {
  let a = null;
  const e = new Promise((l) => {
    t.consumeContext(D, async (i) => {
      var r;
      try {
        a = await ((r = i == null ? void 0 : i.getLatestToken) == null ? void 0 : r.call(i)) ?? null;
      } catch {
        a = null;
      }
      l();
    }), setTimeout(l, 3e3);
  });
  return async (l, i = {}) => {
    await e;
    const r = new Headers(i.headers);
    a && !r.has("Authorization") && r.set("Authorization", `Bearer ${a}`);
    const u = await fetch(l, { ...i, credentials: "same-origin", headers: r });
    return (u.status === 401 || u.status === 403) && console.error(
      `[SplatDev] ${u.status} from ${String(l)} — the backoffice token was ${a ? "sent but rejected" : "not available"}. The dashboard may render as empty.`
    ), u;
  };
}
var S = Object.defineProperty, T = Object.getOwnPropertyDescriptor, g = (t) => {
  throw TypeError(t);
}, c = (t, a, e, l) => {
  for (var i = l > 1 ? void 0 : l ? T(a, e) : a, r = t.length - 1, u; r >= 0; r--)
    (u = t[r]) && (i = (l ? u(a, e, i) : u(i)) || i);
  return l && i && S(a, e, i), i;
}, $ = (t, a, e) => a.has(t) || g("Cannot " + e), f = (t, a, e) => ($(t, a, "read from private field"), e ? e.call(t) : a.get(t)), _ = (t, a, e) => a.has(t) ? g("Cannot add the same private member more than once") : a instanceof WeakSet ? a.add(t) : a.set(t, e), d = (t, a, e) => ($(t, a, "access private method"), e), b, o, p, y, v, w;
let n = class extends A(x) {
  constructor() {
    super(...arguments), _(this, o), _(this, b, E(this)), this._overview = null, this._carts = [], this._days = 7, this._onlyAbandoned = !1, this._loading = !0, this._busy = !1, this._msg = null, this._api = "/umbraco/api/shopcart/admin";
  }
  connectedCallback() {
    super.connectedCallback(), d(this, o, p).call(this);
  }
  render() {
    const t = this._overview;
    return s`
      <h1>Carts</h1>
      <p class="description">
        Baskets across the site. A cart is a set of lines sharing a session, and its age is
        the most recent line added — the only timestamp the data carries, and what makes an
        abandoned basket identifiable.
      </p>

      ${this._loading ? s`<uui-loader></uui-loader>` : m}

      ${t ? s`
            <uui-box headline="Overview">
              <div class="stats">
                ${s`<div class="stat"><div class="n">${t.carts}</div><div class="l">carts</div></div>`}
                ${s`<div class="stat"><div class="n">${t.items}</div><div class="l">items</div></div>`}
                ${s`<div class="stat"><div class="n">${d(this, o, v).call(this, t.value)}</div><div class="l">total value</div></div>`}
                ${s`<div class="stat ${t.abandoned ? "warn" : ""}">
                         <div class="n">${t.abandoned}</div><div class="l">abandoned</div></div>`}
                ${s`<div class="stat ${t.abandoned ? "warn" : ""}">
                         <div class="n">${d(this, o, v).call(this, t.abandonedValue)}</div>
                         <div class="l">abandoned value</div></div>`}
              </div>
            </uui-box>` : m}

      ${this._msg ? s`<div class="msg ${this._msg.ok ? "ok" : "bad"}">${this._msg.text}</div>` : m}

      <uui-box headline="Carts" style="margin-top:16px;">
        <div class="row">
          <div class="field">
            <label for="d">Abandoned after (days)</label>
            <input id="d" type="number" min="1" .value=${String(this._days)}
              @change=${async (a) => {
      this._days = Number(a.target.value) || 7, await d(this, o, p).call(this);
    }} />
          </div>
          <uui-button look=${this._onlyAbandoned ? "primary" : "secondary"} compact
            @click=${async () => {
      this._onlyAbandoned = !this._onlyAbandoned, await d(this, o, p).call(this);
    }}>
            ${this._onlyAbandoned ? "Showing abandoned only" : "Show abandoned only"}
          </uui-button>
          <uui-button look="secondary" color="danger" compact ?disabled=${this._busy || !(t != null && t.abandoned)}
            @click=${() => confirm(`Clear all carts untouched for ${this._days}+ days?`) && d(this, o, y).call(this, `ClearAbandoned?olderThanDays=${this._days}`, "POST")}>
            Clear abandoned
          </uui-button>
        </div>

        ${this._carts.length === 0 ? s`<p class="empty">No carts.</p>` : s`
              <uui-table style="margin-top:12px;">
                <uui-table-head>
                  <uui-table-head-cell>Session</uui-table-head-cell>
                  <uui-table-head-cell>Items</uui-table-head-cell>
                  <uui-table-head-cell>Value</uui-table-head-cell>
                  <uui-table-head-cell>Last activity</uui-table-head-cell>
                  <uui-table-head-cell></uui-table-head-cell>
                </uui-table-head>
                ${this._carts.map((a) => s`
                  <uui-table-row>
                    <uui-table-cell class="mono">
                      ${a.sessionId.slice(0, 12)}…
                      ${a.abandoned ? s`<uui-tag look="warning">abandoned</uui-tag>` : m}
                    </uui-table-cell>
                    <uui-table-cell>${a.items}</uui-table-cell>
                    <uui-table-cell>${d(this, o, v).call(this, a.value)}</uui-table-cell>
                    <uui-table-cell class="hint">${d(this, o, w).call(this, a.lastActivity)}</uui-table-cell>
                    <uui-table-cell style="text-align:right;">
                      <uui-button look="secondary" color="danger" compact ?disabled=${this._busy}
                        @click=${() => confirm("Empty this cart?") && d(this, o, y).call(this, `ClearCart?sessionId=${encodeURIComponent(a.sessionId)}`, "DELETE")}>
                        Clear
                      </uui-button>
                    </uui-table-cell>
                  </uui-table-row>`)}
              </uui-table>`}
      </uui-box>`;
  }
};
b = /* @__PURE__ */ new WeakMap();
o = /* @__PURE__ */ new WeakSet();
p = async function() {
  this._loading = !0;
  try {
    const [t, a] = await Promise.all([
      f(this, b).call(this, `${this._api}/Overview?abandonedAfterDays=${this._days}`, { credentials: "same-origin" }),
      f(this, b).call(this, `${this._api}/Carts?abandonedAfterDays=${this._days}&onlyAbandoned=${this._onlyAbandoned}`, { credentials: "same-origin" })
    ]);
    t.ok && (this._overview = await t.json()), a.ok && (this._carts = await a.json());
  } finally {
    this._loading = !1;
  }
};
y = async function(t, a) {
  this._busy = !0, this._msg = null;
  try {
    const e = await f(this, b).call(this, `${this._api}/${t}`, { method: a, credentials: "same-origin" }), l = await e.json();
    this._msg = { ok: e.ok, text: l.message ?? (e.ok ? "Done." : "Failed.") }, await d(this, o, p).call(this);
  } catch (e) {
    this._msg = { ok: !1, text: `The request failed: ${e.message}` };
  } finally {
    this._busy = !1;
  }
};
v = function(t) {
  return t.toLocaleString(void 0, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
w = function(t) {
  const a = Math.floor((Date.now() - Date.parse(t)) / 864e5);
  return a === 0 ? "today" : a === 1 ? "1 day ago" : `${a} days ago`;
};
n.styles = k`
    :host { display: block; padding: var(--uui-size-layout-1, 24px); }
    h1 { font-size: 1.5rem; font-weight: 600; margin: 0 0 8px; }
    p.description { color: var(--uui-color-text-alt, #6b7280); margin: 0 0 24px; max-width: 62ch; }
    .stats { display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); }
    .stat { border: 1px solid var(--uui-color-border, #e5e7eb); border-radius: 6px; padding: 12px 14px; }
    .stat.warn { border-color: #d97706; background: #fffbeb; }
    .stat .n { font-size: 1.6rem; font-weight: 600; line-height: 1.1; }
    .stat .l { color: var(--uui-color-text-alt, #6b7280); font-size: 0.8125rem; }
    .row { display: flex; gap: 10px; align-items: flex-end; flex-wrap: wrap; }
    .field { display: flex; flex-direction: column; gap: 4px; }
    .field label { font-weight: 600; font-size: 0.8125rem; }
    .field input { padding: 8px; border: 1px solid var(--uui-color-border, #d1d5db);
                   border-radius: 4px; font: inherit; width: 90px; }
    .msg { padding: 10px 14px; border-radius: 4px; margin-top: 14px; }
    .msg.ok { background: #d1fae5; color: #065f46; }
    .msg.bad { background: #fee2e2; color: #991b1b; }
    .mono { font-family: var(--uui-font-monospace, monospace); font-size: 0.8125rem; }
    .hint { color: var(--uui-color-text-alt, #6b7280); font-size: 0.8125rem; }
    .empty { color: var(--uui-color-text-alt, #6b7280); padding: 14px 0; }
    uui-table { width: 100%; }
  `;
c([
  h()
], n.prototype, "_overview", 2);
c([
  h()
], n.prototype, "_carts", 2);
c([
  h()
], n.prototype, "_days", 2);
c([
  h()
], n.prototype, "_onlyAbandoned", 2);
c([
  h()
], n.prototype, "_loading", 2);
c([
  h()
], n.prototype, "_busy", 2);
c([
  h()
], n.prototype, "_msg", 2);
n = c([
  C("shopcart-dashboard")
], n);
const I = n;
export {
  n as ShopCartDashboardElement,
  I as default
};
