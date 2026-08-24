import { LitElement as z, nothing as _, html as l, css as S, state as p, customElement as U } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as N } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as O } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as V } from "@umbraco-cms/backoffice/notification";
function D(e) {
  let t = null, a = null;
  const s = e.consumeContext.bind(e), r = new Promise((n) => {
    s(O, async (o) => {
      var d;
      try {
        t = await ((d = o == null ? void 0 : o.getLatestToken) == null ? void 0 : d.call(o)) ?? null;
      } catch {
        t = null;
      }
      n();
    }), setTimeout(n, 3e3);
  });
  return s(V, (n) => {
    a = n;
  }), async (n, o = {}) => {
    await r;
    const d = new Headers(o.headers);
    t && !d.has("Authorization") && d.set("Authorization", `Bearer ${t}`);
    const v = await fetch(n, { ...o, credentials: "same-origin", headers: d });
    if (!v.ok) {
      const g = v.status === 401 || v.status === 403, C = g ? "Not authorised" : "Could not load data", x = g ? `The backoffice token was ${t ? "sent but rejected" : "not available"} (${v.status}). Anything shown below may be empty because the request was refused, not because there is nothing to show.` : `The request failed with ${v.status}. Anything shown below may be incomplete.`;
      console.error(`[SplatDev] ${v.status} from ${String(n)} — ${x}`), a == null || a.peek("danger", { data: { headline: C, message: x } });
    }
    return v;
  };
}
var M = Object.defineProperty, q = Object.getOwnPropertyDescriptor, w = (e) => {
  throw TypeError(e);
}, h = (e, t, a, s) => {
  for (var r = s > 1 ? void 0 : s ? q(t, a) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (s ? o(t, a, r) : o(r)) || r);
  return s && r && M(t, a, r), r;
}, k = (e, t, a) => t.has(e) || w("Cannot " + a), B = (e, t, a) => (k(e, t, "read from private field"), a ? a.call(e) : t.get(e)), $ = (e, t, a) => t.has(e) ? w("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, a), c = (e, t, a) => (k(e, t, "access private method"), a), b, i, m, y, E, T, A, f;
let u = class extends N(z) {
  constructor() {
    super(...arguments), $(this, i), this._summary = null, this._entry = [], this._exit = [], this._countries = [], this._visits = null, this._loading = !0, this._days = 30, this._loadError = null, $(this, b, D(this)), this._api = "/umbraco/api/analyticsstats";
  }
  connectedCallback() {
    super.connectedCallback(), c(this, i, y).call(this);
  }
  render() {
    const e = this._summary;
    return l`
      <h1>Analytics</h1>
      <p class="description">
        Visits recorded by this site, stored in your own database. Automated traffic is
        identified and excluded from the figures below.
      </p>

      ${this._loadError ? l`<div class="splatdev-load-error" role="alert">${this._loadError}</div>` : _}

      ${this._loading ? l`<uui-loader></uui-loader>` : l`
            <uui-box headline="Overview">
              <div class="stats">
                <div class="stat"><div class="stat__value">${(e == null ? void 0 : e.totalVisits) ?? 0}</div><div class="stat__label">Total visits</div></div>
                <div class="stat"><div class="stat__value">${(e == null ? void 0 : e.uniqueVisitors) ?? 0}</div><div class="stat__label">Unique visitors</div></div>
                <div class="stat"><div class="stat__value">${(e == null ? void 0 : e.recurringVisits) ?? 0}</div><div class="stat__label">Returning</div></div>
                <div class="stat stat--live"><div class="stat__value">${(e == null ? void 0 : e.realTimeVisits) ?? 0}</div><div class="stat__label">Active now</div></div>
                <div class="stat"><div class="stat__value">${(e == null ? void 0 : e.botVisits) ?? 0}</div><div class="stat__label">Bots excluded</div></div>
              </div>

              ${c(this, i, A).call(this)}

              <div class="actions">
                ${[7, 30, 90].map(
      (t) => l`<uui-button
                    look=${this._days === t ? "primary" : "secondary"}
                    label="Last ${t} days"
                    @click=${() => c(this, i, E).call(this, t)}
                    >Last ${t} days</uui-button
                  >`
    )}
                <uui-button look="secondary" label="Refresh" @click=${() => c(this, i, y).call(this)}>Refresh</uui-button>
              </div>
            </uui-box>

            <div class="two-up">
              ${c(this, i, f).call(this, "Entry pages", this._entry, "Url")}
              ${c(this, i, f).call(this, "Exit pages", this._exit, "Url")}
            </div>

            ${this._countries.length > 0 ? c(this, i, f).call(this, "Countries", this._countries, "Country") : _}

            <uui-box headline="Recent visits">
              ${!this._visits || this._visits.results.length === 0 ? l`<p class="empty">
                    No visits recorded yet. Add the tracking component to your templates —
                    <code>@await Component.InvokeAsync("Analytics", new { nodeId = Model.Id })</code>
                  </p>` : l`
                    <table>
                      <thead>
                        <tr>
                          <th>Started</th><th>Entry</th><th>Exit</th>
                          <th>Stayed</th><th>Where</th><th>Screen</th><th></th>
                        </tr>
                      </thead>
                      <tbody>
                        ${this._visits.results.map(
      (t) => l`
                            <tr>
                              <td class="num">${c(this, i, T).call(this, t.visitStarted)}</td>
                              <td><div class="truncate" title=${t.entryUrl ?? ""}>${t.entryUrl ?? "—"}</div></td>
                              <td><div class="truncate" title=${t.exitUrl ?? ""}>${t.exitUrl ?? "—"}</div></td>
                              <td class="num">${t.visitLength ?? "—"}</td>
                              <td>${[t.city, t.country].filter(Boolean).join(", ") || "—"}</td>
                              <td class="num">${t.resolution ?? "—"}</td>
                              <td>${t.recurringVisit ? l`<span class="tag">returning</span>` : _}</td>
                            </tr>
                          `
    )}
                      </tbody>
                    </table>
                    <p class="empty">
                      Showing ${this._visits.results.length} of ${this._visits.found} recorded visits.
                    </p>
                  `}
            </uui-box>
          `}
    `;
  }
};
b = /* @__PURE__ */ new WeakMap();
i = /* @__PURE__ */ new WeakSet();
m = async function(e) {
  try {
    const t = await B(this, b).call(this, `${this._api}${e}`);
    return t.ok ? await t.json() : (this._loadError = t.status === 401 || t.status === 403 ? "You are not authorised to read analytics. The request was refused, so anything shown below may be incomplete." : `The request did not succeed — the server returned ${t.status}${t.statusText ? ` ${t.statusText}` : ""}.`, null);
  } catch {
    return this._loadError ?? (this._loadError = "The request failed. See the browser console for details."), null;
  }
};
y = async function() {
  this._loading = !0, this._loadError = null;
  const [e, t, a, s, r] = await Promise.all([
    c(this, i, m).call(this, `/summary?days=${this._days}`),
    c(this, i, m).call(this, "/by-entry-url?take=10"),
    c(this, i, m).call(this, "/by-exit-url?take=10"),
    c(this, i, m).call(this, "/results-by?filter=country&take=10"),
    c(this, i, m).call(this, "/visits?page=1&pageSize=20")
  ]);
  e && (this._summary = e), t && (this._entry = t), a && (this._exit = a), s && (this._countries = s), r && (this._visits = r), this._loading = !1;
};
E = function(e) {
  this._days = e, c(this, i, y).call(this);
};
T = function(e) {
  if (!e) return "—";
  const t = new Date(e);
  return Number.isNaN(t.getTime()) ? e : t.toLocaleString();
};
A = function() {
  var r, n, o;
  const e = ((r = this._summary) == null ? void 0 : r.daily) ?? [];
  if (e.length === 0) return _;
  const t = Math.max(1, ...e.map((d) => d.count)), a = ((n = e[0]) == null ? void 0 : n.date) ?? "", s = ((o = e[e.length - 1]) == null ? void 0 : o.date) ?? "";
  return l`
      <div class="chart" role="img" aria-label="Visits per day over the last ${this._days} days">
        ${e.map(
    (d) => l`<div
            class="chart__bar"
            data-empty=${d.count === 0 ? "true" : "false"}
            style="height: ${Math.round(d.count / t * 100)}%"
            title="${d.date}: ${d.count} visit${d.count === 1 ? "" : "s"}"
          ></div>`
  )}
      </div>
      <div class="chart__axis"><span>${a}</span><span>peak ${t}</span><span>${s}</span></div>
    `;
};
f = function(e, t, a) {
  return l`
      <uui-box headline=${e}>
        ${t.length === 0 ? l`<p class="empty">Nothing recorded yet.</p>` : l`
              <table>
                <thead><tr><th>${a}</th><th class="num">Visits</th></tr></thead>
                <tbody>
                  ${t.map(
    (s) => l`<tr>
                      <td><div class="truncate" title=${s.filter}>${s.filter}</div></td>
                      <td class="num">${s.count}</td>
                    </tr>`
  )}
                </tbody>
              </table>
            `}
      </uui-box>
    `;
};
u.styles = S`
    :host { display: block; padding: var(--uui-size-layout-1, 24px); }
    h1 { font-size: 1.5rem; font-weight: 600; margin: 0 0 6px; }
    .description { color: var(--uui-color-text-alt, #6b7280); margin: 0 0 22px; max-width: 64ch; }

    uui-box { margin-bottom: 18px; }

    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 14px; }
    .stat {
      background: var(--uui-color-surface-alt, #f6f6f7);
      border-radius: 6px;
      padding: 14px 16px;
    }
    .stat__value { font-size: 1.7rem; font-weight: 700; font-variant-numeric: tabular-nums; line-height: 1.1; }
    .stat__label {
      font-size: 0.72rem; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase;
      color: var(--uui-color-text-alt, #6b7280); margin-top: 4px;
    }
    .stat--live .stat__value { color: var(--uui-color-positive, #2f9e44); }

    .chart { display: flex; align-items: flex-end; gap: 2px; height: 120px; margin-top: 6px; }
    .chart__bar {
      flex: 1 1 0;
      min-width: 2px;
      background: var(--uui-color-selected, #3544b1);
      border-radius: 2px 2px 0 0;
      min-height: 1px;
    }
    .chart__bar[data-empty="true"] { background: var(--uui-color-border, #e5e7eb); }
    .chart__axis {
      display: flex; justify-content: space-between;
      font-size: 0.72rem; color: var(--uui-color-text-alt, #6b7280); margin-top: 6px;
    }

    table { width: 100%; border-collapse: collapse; }
    th {
      text-align: left; font-size: 0.72rem; letter-spacing: 0.05em; text-transform: uppercase;
      color: var(--uui-color-text-alt, #6b7280); padding: 8px 10px; white-space: nowrap;
      border-bottom: 1px solid var(--uui-color-border, #e5e7eb);
    }
    td { padding: 9px 10px; border-bottom: 1px solid var(--uui-color-border, #e5e7eb); font-size: 0.9rem; }
    tr:last-child td { border-bottom: none; }
    td.num { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
    .truncate { max-width: 340px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .empty { color: var(--uui-color-text-alt, #6b7280); padding: 14px 10px; }
    .two-up { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 18px; }

    .tag {
      display: inline-block; padding: 1px 7px; border-radius: 9999px;
      font-size: 0.68rem; font-weight: 700; text-transform: uppercase;
      background: var(--uui-color-surface-alt, #f3f4f6);
    }

    .actions { display: flex; gap: 10px; align-items: center; margin-top: 14px; flex-wrap: wrap; }

    .splatdev-load-error {
      display: block; margin: 0 0 14px; padding: 12px 14px;
      border-left: 3px solid var(--uui-color-danger, #d42054);
      background: var(--uui-color-danger-emphasis, #fdeaef);
      color: var(--uui-color-danger-contrast, #6d0f28);
      font-size: 0.9rem; border-radius: 3px;
    }
  `;
h([
  p()
], u.prototype, "_summary", 2);
h([
  p()
], u.prototype, "_entry", 2);
h([
  p()
], u.prototype, "_exit", 2);
h([
  p()
], u.prototype, "_countries", 2);
h([
  p()
], u.prototype, "_visits", 2);
h([
  p()
], u.prototype, "_loading", 2);
h([
  p()
], u.prototype, "_days", 2);
h([
  p()
], u.prototype, "_loadError", 2);
u = h([
  U("analytics-dashboard")
], u);
const W = u;
export {
  u as AnalyticsDashboardElement,
  W as default
};
