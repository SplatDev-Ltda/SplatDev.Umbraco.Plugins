import { LitElement as D, nothing as f, html as s, css as E, state as b, customElement as S } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as O } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as z } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as I } from "@umbraco-cms/backoffice/notification";
function N(a) {
  let e = null, t = null;
  const r = a.consumeContext.bind(a), u = new Promise((l) => {
    r(z, async (i) => {
      var p;
      try {
        e = await ((p = i == null ? void 0 : i.getLatestToken) == null ? void 0 : p.call(i)) ?? null;
      } catch {
        e = null;
      }
      l();
    }), setTimeout(l, 3e3);
  });
  return r(I, (l) => {
    t = l;
  }), async (l, i = {}) => {
    await u;
    const p = new Headers(i.headers);
    e && !p.has("Authorization") && p.set("Authorization", `Bearer ${e}`);
    const h = await fetch(l, { ...i, credentials: "same-origin", headers: p });
    if (!h.ok) {
      const w = h.status === 401 || h.status === 403, T = w ? "Not authorised" : "Could not load data", $ = w ? `The backoffice token was ${e ? "sent but rejected" : "not available"} (${h.status}). Anything shown below may be empty because the request was refused, not because there is nothing to show.` : `The request failed with ${h.status}. Anything shown below may be incomplete.`;
      console.error(`[SplatDev] ${h.status} from ${String(l)} — ${$}`), t == null || t.peek("danger", { data: { headline: T, message: $ } });
    }
    return h;
  };
}
var P = Object.defineProperty, M = Object.getOwnPropertyDescriptor, k = (a) => {
  throw TypeError(a);
}, c = (a, e, t, r) => {
  for (var u = r > 1 ? void 0 : r ? M(e, t) : e, l = a.length - 1, i; l >= 0; l--)
    (i = a[l]) && (u = (r ? i(e, t, u) : i(u)) || u);
  return r && u && P(e, t, u), u;
}, C = (a, e, t) => e.has(a) || k("Cannot " + t), g = (a, e, t) => (C(a, e, "read from private field"), t ? t.call(a) : e.get(a)), x = (a, e, t) => e.has(a) ? k("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(a) : e.set(a, t), d = (a, e, t) => (C(a, e, "access private method"), t), v, o, m, _, y, A;
let n = class extends O(D) {
  constructor() {
    super(...arguments), x(this, o), x(this, v, N(this)), this._overview = null, this._carts = [], this._days = 7, this._onlyAbandoned = !1, this._loading = !0, this._busy = !1, this._msg = null, this._api = "/umbraco/api/shopcart/admin";
  }
  connectedCallback() {
    super.connectedCallback(), d(this, o, m).call(this);
  }
  render() {
    const a = this._overview;
    return s`
      <h1>Carts</h1>
      <p class="description">
        Baskets across the site. A cart is a set of lines sharing a session, and its age is
        the most recent line added — the only timestamp the data carries, and what makes an
        abandoned basket identifiable.
      </p>

      ${this._loading ? s`<uui-loader></uui-loader>` : f}

      ${a ? s`
            <uui-box headline="Overview">
              <div class="stats">
                ${s`<div class="stat"><div class="n">${a.carts}</div><div class="l">carts</div></div>`}
                ${s`<div class="stat"><div class="n">${a.items}</div><div class="l">items</div></div>`}
                ${s`<div class="stat"><div class="n">${d(this, o, y).call(this, a.value)}</div><div class="l">total value</div></div>`}
                ${s`<div class="stat ${a.abandoned ? "warn" : ""}">
                         <div class="n">${a.abandoned}</div><div class="l">abandoned</div></div>`}
                ${s`<div class="stat ${a.abandoned ? "warn" : ""}">
                         <div class="n">${d(this, o, y).call(this, a.abandonedValue)}</div>
                         <div class="l">abandoned value</div></div>`}
              </div>
            </uui-box>` : f}

      ${this._msg ? s`<div class="msg ${this._msg.ok ? "ok" : "bad"}">${this._msg.text}</div>` : f}

      <uui-box headline="Carts" style="margin-top:16px;">
        <div class="row">
          <div class="field">
            <label for="d">Abandoned after (days)</label>
            <input id="d" type="number" min="1" .value=${String(this._days)}
              @change=${async (e) => {
      this._days = Number(e.target.value) || 7, await d(this, o, m).call(this);
    }} />
          </div>
          <uui-button look=${this._onlyAbandoned ? "primary" : "secondary"} compact
            @click=${async () => {
      this._onlyAbandoned = !this._onlyAbandoned, await d(this, o, m).call(this);
    }}>
            ${this._onlyAbandoned ? "Showing abandoned only" : "Show abandoned only"}
          </uui-button>
          <uui-button look="secondary" color="danger" compact ?disabled=${this._busy || !(a != null && a.abandoned)}
            @click=${() => confirm(`Clear all carts untouched for ${this._days}+ days?`) && d(this, o, _).call(this, `ClearAbandoned?olderThanDays=${this._days}`, "POST")}>
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
                ${this._carts.map((e) => s`
                  <uui-table-row>
                    <uui-table-cell class="mono">
                      ${e.sessionId.slice(0, 12)}…
                      ${e.abandoned ? s`<uui-tag look="warning">abandoned</uui-tag>` : f}
                    </uui-table-cell>
                    <uui-table-cell>${e.items}</uui-table-cell>
                    <uui-table-cell>${d(this, o, y).call(this, e.value)}</uui-table-cell>
                    <uui-table-cell class="hint">${d(this, o, A).call(this, e.lastActivity)}</uui-table-cell>
                    <uui-table-cell style="text-align:right;">
                      <uui-button look="secondary" color="danger" compact ?disabled=${this._busy}
                        @click=${() => confirm("Empty this cart?") && d(this, o, _).call(this, `ClearCart?sessionId=${encodeURIComponent(e.sessionId)}`, "DELETE")}>
                        Clear
                      </uui-button>
                    </uui-table-cell>
                  </uui-table-row>`)}
              </uui-table>`}
      </uui-box>`;
  }
};
v = /* @__PURE__ */ new WeakMap();
o = /* @__PURE__ */ new WeakSet();
m = async function() {
  this._loading = !0;
  try {
    const [a, e] = await Promise.all([
      g(this, v).call(this, `${this._api}/Overview?abandonedAfterDays=${this._days}`, { credentials: "same-origin" }),
      g(this, v).call(this, `${this._api}/Carts?abandonedAfterDays=${this._days}&onlyAbandoned=${this._onlyAbandoned}`, { credentials: "same-origin" })
    ]);
    a.ok && (this._overview = await a.json()), e.ok && (this._carts = await e.json());
  } finally {
    this._loading = !1;
  }
};
_ = async function(a, e) {
  this._busy = !0, this._msg = null;
  try {
    const t = await g(this, v).call(this, `${this._api}/${a}`, { method: e, credentials: "same-origin" }), r = await t.json();
    this._msg = { ok: t.ok, text: r.message ?? (t.ok ? "Done." : "Failed.") }, await d(this, o, m).call(this);
  } catch (t) {
    this._msg = { ok: !1, text: `The request failed: ${t.message}` };
  } finally {
    this._busy = !1;
  }
};
y = function(a) {
  return a.toLocaleString(void 0, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
A = function(a) {
  const e = Math.floor((Date.now() - Date.parse(a)) / 864e5);
  return e === 0 ? "today" : e === 1 ? "1 day ago" : `${e} days ago`;
};
n.styles = E`
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
  b()
], n.prototype, "_overview", 2);
c([
  b()
], n.prototype, "_carts", 2);
c([
  b()
], n.prototype, "_days", 2);
c([
  b()
], n.prototype, "_onlyAbandoned", 2);
c([
  b()
], n.prototype, "_loading", 2);
c([
  b()
], n.prototype, "_busy", 2);
c([
  b()
], n.prototype, "_msg", 2);
n = c([
  S("shopcart-dashboard")
], n);
const q = n;
export {
  n as ShopCartDashboardElement,
  q as default
};
