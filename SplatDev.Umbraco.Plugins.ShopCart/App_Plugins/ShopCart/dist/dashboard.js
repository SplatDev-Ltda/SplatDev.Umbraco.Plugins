import { LitElement as _, nothing as h, html as i, css as g, state as r, customElement as x } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as $ } from "@umbraco-cms/backoffice/element-api";
var w = Object.defineProperty, k = Object.getOwnPropertyDescriptor, y = (a) => {
  throw TypeError(a);
}, n = (a, t, e, c) => {
  for (var d = c > 1 ? void 0 : c ? k(t, e) : t, p = a.length - 1, m; p >= 0; p--)
    (m = a[p]) && (d = (c ? m(t, e, d) : m(d)) || d);
  return c && d && w(t, e, d), d;
}, C = (a, t, e) => t.has(a) || y("Cannot " + e), A = (a, t, e) => t.has(a) ? y("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(a) : t.set(a, e), o = (a, t, e) => (C(a, t, "access private method"), e), s, u, v, b, f;
let l = class extends $(_) {
  constructor() {
    super(...arguments), A(this, s), this._overview = null, this._carts = [], this._days = 7, this._onlyAbandoned = !1, this._loading = !0, this._busy = !1, this._msg = null, this._api = "/umbraco/api/shopcart/admin";
  }
  connectedCallback() {
    super.connectedCallback(), o(this, s, u).call(this);
  }
  render() {
    const a = this._overview;
    return i`
      <h1>Carts</h1>
      <p class="description">
        Baskets across the site. A cart is a set of lines sharing a session, and its age is
        the most recent line added — the only timestamp the data carries, and what makes an
        abandoned basket identifiable.
      </p>

      ${this._loading ? i`<uui-loader></uui-loader>` : h}

      ${a ? i`
            <uui-box headline="Overview">
              <div class="stats">
                ${i`<div class="stat"><div class="n">${a.carts}</div><div class="l">carts</div></div>`}
                ${i`<div class="stat"><div class="n">${a.items}</div><div class="l">items</div></div>`}
                ${i`<div class="stat"><div class="n">${o(this, s, b).call(this, a.value)}</div><div class="l">total value</div></div>`}
                ${i`<div class="stat ${a.abandoned ? "warn" : ""}">
                         <div class="n">${a.abandoned}</div><div class="l">abandoned</div></div>`}
                ${i`<div class="stat ${a.abandoned ? "warn" : ""}">
                         <div class="n">${o(this, s, b).call(this, a.abandonedValue)}</div>
                         <div class="l">abandoned value</div></div>`}
              </div>
            </uui-box>` : h}

      ${this._msg ? i`<div class="msg ${this._msg.ok ? "ok" : "bad"}">${this._msg.text}</div>` : h}

      <uui-box headline="Carts" style="margin-top:16px;">
        <div class="row">
          <div class="field">
            <label for="d">Abandoned after (days)</label>
            <input id="d" type="number" min="1" .value=${String(this._days)}
              @change=${async (t) => {
      this._days = Number(t.target.value) || 7, await o(this, s, u).call(this);
    }} />
          </div>
          <uui-button look=${this._onlyAbandoned ? "primary" : "secondary"} compact
            @click=${async () => {
      this._onlyAbandoned = !this._onlyAbandoned, await o(this, s, u).call(this);
    }}>
            ${this._onlyAbandoned ? "Showing abandoned only" : "Show abandoned only"}
          </uui-button>
          <uui-button look="secondary" color="danger" compact ?disabled=${this._busy || !(a != null && a.abandoned)}
            @click=${() => confirm(`Clear all carts untouched for ${this._days}+ days?`) && o(this, s, v).call(this, `ClearAbandoned?olderThanDays=${this._days}`, "POST")}>
            Clear abandoned
          </uui-button>
        </div>

        ${this._carts.length === 0 ? i`<p class="empty">No carts.</p>` : i`
              <uui-table style="margin-top:12px;">
                <uui-table-head>
                  <uui-table-head-cell>Session</uui-table-head-cell>
                  <uui-table-head-cell>Items</uui-table-head-cell>
                  <uui-table-head-cell>Value</uui-table-head-cell>
                  <uui-table-head-cell>Last activity</uui-table-head-cell>
                  <uui-table-head-cell></uui-table-head-cell>
                </uui-table-head>
                ${this._carts.map((t) => i`
                  <uui-table-row>
                    <uui-table-cell class="mono">
                      ${t.sessionId.slice(0, 12)}…
                      ${t.abandoned ? i`<uui-tag look="warning">abandoned</uui-tag>` : h}
                    </uui-table-cell>
                    <uui-table-cell>${t.items}</uui-table-cell>
                    <uui-table-cell>${o(this, s, b).call(this, t.value)}</uui-table-cell>
                    <uui-table-cell class="hint">${o(this, s, f).call(this, t.lastActivity)}</uui-table-cell>
                    <uui-table-cell style="text-align:right;">
                      <uui-button look="secondary" color="danger" compact ?disabled=${this._busy}
                        @click=${() => confirm("Empty this cart?") && o(this, s, v).call(this, `ClearCart?sessionId=${encodeURIComponent(t.sessionId)}`, "DELETE")}>
                        Clear
                      </uui-button>
                    </uui-table-cell>
                  </uui-table-row>`)}
              </uui-table>`}
      </uui-box>`;
  }
};
s = /* @__PURE__ */ new WeakSet();
u = async function() {
  this._loading = !0;
  try {
    const [a, t] = await Promise.all([
      fetch(`${this._api}/Overview?abandonedAfterDays=${this._days}`, { credentials: "same-origin" }),
      fetch(
        `${this._api}/Carts?abandonedAfterDays=${this._days}&onlyAbandoned=${this._onlyAbandoned}`,
        { credentials: "same-origin" }
      )
    ]);
    a.ok && (this._overview = await a.json()), t.ok && (this._carts = await t.json());
  } finally {
    this._loading = !1;
  }
};
v = async function(a, t) {
  this._busy = !0, this._msg = null;
  try {
    const e = await fetch(`${this._api}/${a}`, { method: t, credentials: "same-origin" }), c = await e.json();
    this._msg = { ok: e.ok, text: c.message ?? (e.ok ? "Done." : "Failed.") }, await o(this, s, u).call(this);
  } catch (e) {
    this._msg = { ok: !1, text: `The request failed: ${e.message}` };
  } finally {
    this._busy = !1;
  }
};
b = function(a) {
  return a.toLocaleString(void 0, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
f = function(a) {
  const t = Math.floor((Date.now() - Date.parse(a)) / 864e5);
  return t === 0 ? "today" : t === 1 ? "1 day ago" : `${t} days ago`;
};
l.styles = g`
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
n([
  r()
], l.prototype, "_overview", 2);
n([
  r()
], l.prototype, "_carts", 2);
n([
  r()
], l.prototype, "_days", 2);
n([
  r()
], l.prototype, "_onlyAbandoned", 2);
n([
  r()
], l.prototype, "_loading", 2);
n([
  r()
], l.prototype, "_busy", 2);
n([
  r()
], l.prototype, "_msg", 2);
l = n([
  x("shopcart-dashboard")
], l);
const S = l;
export {
  l as ShopCartDashboardElement,
  S as default
};
