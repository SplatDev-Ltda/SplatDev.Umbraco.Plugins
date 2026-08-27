import { LitElement as L, nothing as p, html as r, css as P, state as d, customElement as U } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as B } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as G } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as F } from "@umbraco-cms/backoffice/notification";
function q(t) {
  let e = null, a = null;
  const c = t.consumeContext.bind(t), n = new Promise((u) => {
    c(G, async (h) => {
      var v;
      try {
        e = await ((v = h == null ? void 0 : h.getLatestToken) == null ? void 0 : v.call(h)) ?? null;
      } catch {
        e = null;
      }
      u();
    }), setTimeout(u, 3e3);
  });
  return c(F, (u) => {
    a = u;
  }), async (u, h = {}) => {
    await n;
    const v = new Headers(h.headers);
    e && !v.has("Authorization") && v.set("Authorization", `Bearer ${e}`);
    const g = await fetch(u, { ...h, credentials: "same-origin", headers: v });
    if (!g.ok) {
      const M = g.status === 401 || g.status === 403, z = M ? "Not authorised" : "Could not load data", S = M ? `The backoffice token was ${e ? "sent but rejected" : "not available"} (${g.status}). Anything shown below may be empty because the request was refused, not because there is nothing to show.` : `The request failed with ${g.status}. Anything shown below may be incomplete.`;
      console.error(`[SplatDev] ${g.status} from ${String(u)} — ${S}`), a == null || a.peek("danger", { data: { headline: z, message: S } });
    }
    return g;
  };
}
var H = Object.defineProperty, W = Object.getOwnPropertyDescriptor, E = (t) => {
  throw TypeError(t);
}, l = (t, e, a, c) => {
  for (var n = c > 1 ? void 0 : c ? W(e, a) : e, u = t.length - 1, h; u >= 0; u--)
    (h = t[u]) && (n = (c ? h(e, a, n) : h(n)) || n);
  return c && n && H(e, a, n), n;
}, k = (t, e, a) => e.has(t) || E("Cannot " + a), j = (t, e, a) => (k(t, e, "read from private field"), a ? a.call(t) : e.get(t)), C = (t, e, a) => e.has(t) ? E("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, a), i = (t, e, a) => (k(t, e, "access private method"), a), w, s, x, f, _, m, N, D, T, A, b, I, y, O, R;
const $ = "/umbraco/api/getnet", X = {
  CONFIRMED: "positive",
  AUTHORIZED: "warning",
  PENDING: "warning",
  DENIED: "danger",
  ERROR: "danger",
  CANCELED: "default",
  REFUNDED: "default"
};
let o = class extends B(L) {
  constructor() {
    super(...arguments), C(this, s), C(this, w, q(this)), this._tab = "overview", this._days = 30, this._loading = !0, this._error = null, this._timeline = [], this._byStatus = [], this._byMethod = [], this._filterStatus = "", this._filterMethod = "", this._search = "", this._pageNo = 1;
  }
  connectedCallback() {
    super.connectedCallback(), i(this, s, x).call(this);
  }
  render() {
    return r`
      <umb-body-layout headline="Getnet">
        <div slot="header" class="range">
          ${[7, 30, 90, 365].map((t) => r`
            <uui-button
              look="${this._days === t ? "primary" : "secondary"}"
              compact
              label="${t} days"
              @click=${() => i(this, s, N).call(this, t)}></uui-button>`)}
        </div>

        <uui-box>
          <uui-tab-group>
            <uui-tab ?active=${this._tab === "overview"} @click=${() => this._tab = "overview"}>Overview</uui-tab>
            <uui-tab ?active=${this._tab === "transactions"} @click=${() => this._tab = "transactions"}>Transactions</uui-tab>
            <uui-tab ?active=${this._tab === "connection"} @click=${() => this._tab = "connection"}>Connection</uui-tab>
          </uui-tab-group>

          ${this._error ? i(this, s, D).call(this) : p}
          ${this._loading ? r`<uui-loader></uui-loader>` : i(this, s, T).call(this)}
        </uui-box>
      </umb-body-layout>`;
  }
};
w = /* @__PURE__ */ new WeakMap();
s = /* @__PURE__ */ new WeakSet();
x = async function() {
  this._loading = !0, this._error = null;
  try {
    const [t, e, a, c] = await Promise.all([
      i(this, s, _).call(this, `${$}/Summary?days=${this._days}`),
      i(this, s, _).call(this, `${$}/Timeline?days=${this._days}`),
      i(this, s, _).call(this, `${$}/Breakdown?days=${this._days}`),
      i(this, s, _).call(this, `${$}/Connection`)
    ]);
    this._summary = t, this._timeline = e, this._byStatus = a.byStatus, this._byMethod = a.byMethod, this._connection = c, await i(this, s, f).call(this);
  } catch (t) {
    this._error = t instanceof Error ? t.message : String(t);
  } finally {
    this._loading = !1;
  }
};
f = async function() {
  const t = new URLSearchParams({ days: String(this._days), page: String(this._pageNo), pageSize: "25" });
  this._filterStatus && t.set("status", this._filterStatus), this._filterMethod && t.set("method", this._filterMethod), this._search && t.set("search", this._search), this._page = await i(this, s, _).call(this, `${$}/Transactions?${t}`);
};
_ = async function(t) {
  const e = await j(this, w).call(this, t);
  if (!e.ok) throw new Error(`${t.replace($, "")} answered ${e.status}`);
  return await e.json();
};
m = function(t, e = ((a) => (a = this._summary) == null ? void 0 : a.currency)() ?? "BRL") {
  return new Intl.NumberFormat(void 0, { style: "currency", currency: e }).format((t ?? 0) / 100);
};
N = function(t) {
  this._days = t, this._pageNo = 1, i(this, s, x).call(this);
};
D = function() {
  return r`
      <div class="error">
        <strong>Could not load Getnet data.</strong>
        <div>${this._error}</div>
        <div class="muted">
          Anything shown below may be empty because the request failed, not because there is
          nothing to show.
        </div>
      </div>`;
};
T = function() {
  return this._tab === "transactions" ? i(this, s, O).call(this) : this._tab === "connection" ? i(this, s, R).call(this) : i(this, s, A).call(this);
};
A = function() {
  const t = this._summary;
  if (!t) return p;
  const e = t.previousSettledMinor === 0 ? null : Math.round((t.settledMinor - t.previousSettledMinor) / t.previousSettledMinor * 100);
  return r`
      <div class="cards">
        ${i(this, s, b).call(this, "Settled", i(this, s, m).call(this, t.settledMinor), e === null ? `${t.settledCount} payments` : r`<span class="${e >= 0 ? "up" : "down"}">${e >= 0 ? "▲" : "▼"} ${Math.abs(e)}%</span> vs previous ${this._days} days`)}
        ${i(this, s, b).call(this, "Approval rate", `${Math.round(t.approvalRate * 100)}%`, `${t.settledCount} of ${t.settledCount + t.failedCount} concluded`)}
        ${i(this, s, b).call(this, "Average ticket", i(this, s, m).call(this, t.averageTicketMinor), `${t.totalCount} attempts`)}
        ${i(this, s, b).call(this, "Refunded", i(this, s, m).call(this, t.refundedMinor), `${t.refundedCount} refunds`)}
      </div>

      <div class="grid">
        <section>
          <h4>Settled volume</h4>
          ${i(this, s, I).call(this, this._timeline)}
        </section>
        <section>
          <h4>By status</h4>
          ${i(this, s, y).call(this, this._byStatus, t.totalCount)}
          <h4>By payment method</h4>
          ${i(this, s, y).call(this, this._byMethod, t.totalCount)}
        </section>
      </div>`;
};
b = function(t, e, a) {
  return r`
      <div class="card">
        <div class="label">${t}</div>
        <div class="value">${e}</div>
        <div class="note">${a}</div>
      </div>`;
};
I = function(t) {
  var a, c;
  if (!t.length) return r`<p class="muted">No activity in this period.</p>`;
  const e = Math.max(...t.map((n) => n.settledMinor), 1);
  return r`
      <div class="bars" role="img" aria-label="Settled volume per day">
        ${t.map((n) => r`
          <div class="bar" title="${n.date}: ${i(this, s, m).call(this, n.settledMinor)} over ${n.count} attempts">
            <div class="fill" style="height:${Math.max(n.settledMinor / e * 100, n.settledMinor > 0 ? 2 : 0)}%"></div>
          </div>`)}
      </div>
      <div class="axis"><span>${(a = t[0]) == null ? void 0 : a.date}</span><span>${(c = t[t.length - 1]) == null ? void 0 : c.date}</span></div>`;
};
y = function(t, e) {
  return t.length ? r`
      <table class="slices">
        ${t.map((a) => r`
          <tr>
            <td class="k">${a.key.toLowerCase()}</td>
            <td class="meter"><div style="width:${e ? a.count / e * 100 : 0}%"></div></td>
            <td class="n">${a.count}</td>
            <td class="n">${i(this, s, m).call(this, a.settledMinor)}</td>
          </tr>`)}
      </table>` : r`<p class="muted">Nothing to show.</p>`;
};
O = function() {
  const t = this._page;
  return r`
      <div class="filters">
        <uui-input
          placeholder="Order, payment id, customer…"
          .value=${this._search}
          @change=${(e) => {
    this._search = e.target.value, this._pageNo = 1, i(this, s, f).call(this);
  }}></uui-input>
        <select @change=${(e) => {
    this._filterStatus = e.target.value, this._pageNo = 1, i(this, s, f).call(this);
  }}>
          <option value="">Any status</option>
          ${["CONFIRMED", "AUTHORIZED", "PENDING", "DENIED", "CANCELED", "REFUNDED", "ERROR"].map((e) => r`<option value="${e}" ?selected=${this._filterStatus === e}>${e.toLowerCase()}</option>`)}
        </select>
        <select @change=${(e) => {
    this._filterMethod = e.target.value, this._pageNo = 1, i(this, s, f).call(this);
  }}>
          <option value="">Any method</option>
          ${["credit", "debit", "pix", "boleto"].map((e) => r`<option value="${e}" ?selected=${this._filterMethod === e}>${e}</option>`)}
        </select>
      </div>

      ${!t || t.items.length === 0 ? r`<p class="muted">No transactions match this filter.</p>` : r`
          <table class="rows">
            <thead>
              <tr><th>When</th><th>Order</th><th>Customer</th><th>Method</th><th>Status</th><th class="n">Amount</th></tr>
            </thead>
            <tbody>
              ${t.items.map((e) => r`
                <tr>
                  <td>${new Date(e.createdAt).toLocaleString()}</td>
                  <td><code>${e.orderRef}</code>${e.paymentId ? r`<div class="muted">${e.paymentId}</div>` : p}</td>
                  <td>${e.customerName ?? "—"}</td>
                  <td>
                    ${e.paymentMethod ?? "—"}
                    ${e.cardLast4 ? r`<div class="muted">${e.cardBrand ?? "card"} ····${e.cardLast4}${e.installments > 1 ? ` ×${e.installments}` : ""}</div>` : p}
                  </td>
                  <td>
                    <uui-tag look="${X[e.status] ?? "default"}">${e.status.toLowerCase()}</uui-tag>
                    ${e.errorMessage ? r`<div class="muted err">${e.errorMessage}</div>` : p}
                  </td>
                  <td class="n">
                    ${i(this, s, m).call(this, e.amountMinor, e.currency)}
                    ${e.refundedMinor > 0 ? r`<div class="muted">−${i(this, s, m).call(this, e.refundedMinor, e.currency)} refunded</div>` : p}
                  </td>
                </tr>`)}
            </tbody>
          </table>
          <div class="pager">
            <uui-button compact label="Previous" ?disabled=${t.page <= 1}
              @click=${() => {
    this._pageNo = t.page - 1, i(this, s, f).call(this);
  }}></uui-button>
            <span class="muted">${(t.page - 1) * t.pageSize + 1}–${Math.min(t.page * t.pageSize, t.total)} of ${t.total}</span>
            <uui-button compact label="Next" ?disabled=${t.page * t.pageSize >= t.total}
              @click=${() => {
    this._pageNo = t.page + 1, i(this, s, f).call(this);
  }}></uui-button>
          </div>`}`;
};
R = function() {
  const t = this._connection;
  if (!t) return p;
  const e = (a) => r`<uui-tag look="${a ? "positive" : "danger"}">${a ? "set" : "missing"}</uui-tag>`;
  return r`
      <table class="rows">
        <tr><th>Environment</th><td><uui-tag look="${t.environment === "production" ? "positive" : "warning"}">${t.environment}</uui-tag></td></tr>
        <tr><th>Base URL</th><td><code>${t.baseUrl}</code></td></tr>
        <tr><th>Seller ID</th><td>${e(t.hasSellerId)} ${t.sellerIdMasked ? r`<code>${t.sellerIdMasked}</code>` : p}</td></tr>
        <tr><th>Client ID</th><td>${e(t.hasClientId)}</td></tr>
        <tr><th>Client secret</th><td>${e(t.hasClientSecret)}</td></tr>
        <tr><th>Development mock</th><td>${t.mockEnabled ? r`<uui-tag look="warning">enabled</uui-tag>` : "off"}</td></tr>
      </table>
      <p class="muted">
        These come from the <code>Getnet:</code> section of configuration and are changed there,
        not from this screen. Secrets are reported as present or missing and never sent to the
        browser.
      </p>`;
};
o.styles = P`
    :host { display: block; padding: var(--uui-size-layout-1, 24px); }
    .range { display: flex; gap: 4px; }
    .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin: 16px 0 24px; }
    .card { border: 1px solid var(--uui-color-border); border-radius: var(--uui-border-radius, 3px); padding: 12px 16px; }
    .card .label { color: var(--uui-color-text-alt); font-size: 12px; text-transform: uppercase; letter-spacing: .04em; }
    .card .value { font-size: 26px; font-weight: 700; margin: 4px 0; }
    .card .note, .muted { color: var(--uui-color-text-alt); font-size: 12px; }
    .up { color: var(--uui-color-positive); } .down { color: var(--uui-color-danger); }
    .grid { display: grid; grid-template-columns: 2fr 1fr; gap: 24px; }
    @media (max-width: 900px) { .grid { grid-template-columns: 1fr; } }
    h4 { margin: 16px 0 8px; }
    .bars { display: flex; align-items: flex-end; gap: 2px; height: 180px; border-bottom: 1px solid var(--uui-color-border); }
    .bar { flex: 1; height: 100%; display: flex; align-items: flex-end; }
    .fill { width: 100%; background: var(--uui-color-selected); border-radius: 2px 2px 0 0; }
    .axis { display: flex; justify-content: space-between; color: var(--uui-color-text-alt); font-size: 11px; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; }
    .slices td { padding: 4px 6px; font-size: 13px; }
    .slices .k { white-space: nowrap; }
    .slices .meter { width: 100%; }
    .slices .meter div { background: var(--uui-color-selected); height: 8px; border-radius: 4px; min-width: 2px; }
    .rows th, .rows td { text-align: left; padding: 8px 6px; border-bottom: 1px solid var(--uui-color-border); vertical-align: top; font-size: 13px; }
    .n { text-align: right; white-space: nowrap; }
    .err { color: var(--uui-color-danger); }
    .filters { display: flex; gap: 8px; margin: 16px 0; flex-wrap: wrap; }
    .pager { display: flex; align-items: center; gap: 12px; margin-top: 12px; }
    .error { border-left: 4px solid var(--uui-color-danger); background: var(--uui-color-surface-alt); padding: 12px 16px; margin: 12px 0; }
    code { font-size: 12px; }
  `;
l([
  d()
], o.prototype, "_tab", 2);
l([
  d()
], o.prototype, "_days", 2);
l([
  d()
], o.prototype, "_loading", 2);
l([
  d()
], o.prototype, "_error", 2);
l([
  d()
], o.prototype, "_summary", 2);
l([
  d()
], o.prototype, "_timeline", 2);
l([
  d()
], o.prototype, "_byStatus", 2);
l([
  d()
], o.prototype, "_byMethod", 2);
l([
  d()
], o.prototype, "_page", 2);
l([
  d()
], o.prototype, "_connection", 2);
l([
  d()
], o.prototype, "_filterStatus", 2);
l([
  d()
], o.prototype, "_filterMethod", 2);
l([
  d()
], o.prototype, "_search", 2);
l([
  d()
], o.prototype, "_pageNo", 2);
o = l([
  U("getnet-dashboard")
], o);
const V = o;
export {
  o as GetnetDashboardElement,
  V as default
};
