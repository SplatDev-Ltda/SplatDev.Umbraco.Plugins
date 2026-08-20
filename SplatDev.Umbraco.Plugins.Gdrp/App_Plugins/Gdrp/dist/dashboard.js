import { LitElement as k, nothing as b, html as a, css as D, state as d, customElement as C } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as S } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as T } from "@umbraco-cms/backoffice/auth";
function q(t) {
  let e = null;
  const s = new Promise((r) => {
    t.consumeContext(T, async (i) => {
      var u;
      try {
        e = await ((u = i == null ? void 0 : i.getLatestToken) == null ? void 0 : u.call(i)) ?? null;
      } catch {
        e = null;
      }
      r();
    }), setTimeout(r, 3e3);
  });
  return async (r, i = {}) => {
    await s;
    const u = new Headers(i.headers);
    e && !u.has("Authorization") && u.set("Authorization", `Bearer ${e}`);
    const h = await fetch(r, { ...i, credentials: "same-origin", headers: u });
    return (h.status === 401 || h.status === 403) && console.error(
      `[SplatDev] ${h.status} from ${String(r)} — the backoffice token was ${e ? "sent but rejected" : "not available"}. The dashboard may render as empty.`
    ), h;
  };
}
var P = Object.defineProperty, E = Object.getOwnPropertyDescriptor, f = (t) => {
  throw TypeError(t);
}, c = (t, e, s, r) => {
  for (var i = r > 1 ? void 0 : r ? E(e, s) : e, u = t.length - 1, h; u >= 0; u--)
    (h = t[u]) && (i = (r ? h(e, s, i) : h(i)) || i);
  return r && i && P(e, s, i), i;
}, $ = (t, e, s) => e.has(t) || f("Cannot " + s), y = (t, e, s) => ($(t, e, "read from private field"), s ? s.call(t) : e.get(t)), _ = (t, e, s) => e.has(t) ? f("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, s), n = (t, e, s) => ($(t, e, "access private method"), s), p, l, g, v, w, x, m;
let o = class extends S(k) {
  constructor() {
    super(...arguments), _(this, l), _(this, p, q(this)), this._summary = null, this._requests = [], this._statusFilter = "pending", this._lookup = "", this._history = null, this._retentionDays = 365, this._loading = !0, this._busy = !1, this._msg = null, this._api = "/umbraco/api/gdrp";
  }
  connectedCallback() {
    super.connectedCallback(), n(this, l, g).call(this);
  }
  render() {
    const t = this._summary;
    return a`
      <h1>Privacy &amp; consent</h1>
      <p class="description">
        Consent decisions and data-subject requests. Consent is append-only: every change is
        kept, so the record shows what was agreed and when it changed rather than only the
        latest state.
      </p>

      ${this._loading ? a`<uui-loader></uui-loader>` : b}

      ${t ? a`
            <uui-box headline="Consent now">
              <div class="stats">
                ${n(this, l, m).call(this, t.sessions, "sessions")}
                ${n(this, l, m).call(this, t.all, "accepted all")}
                ${n(this, l, m).call(this, t.essential, "essential only")}
                ${n(this, l, m).call(this, t.none, "declined")}
                ${n(this, l, m).call(this, t.pendingRequests, "requests pending")}
              </div>
              <p class="hint" style="margin-top:12px;">
                ${t.recordsHeld} record(s) held${t.oldestRecordUtc ? a`, oldest ${new Date(t.oldestRecordUtc).toLocaleDateString()}` : b}.
                Each session counts once, by its most recent decision.
              </p>
            </uui-box>` : b}

      ${this._msg ? a`<div class="msg ${this._msg.ok ? "success" : "error"}">${this._msg.text}</div>` : b}

      <uui-box headline="Look up a session" style="margin-top:16px;">
        <div class="row">
          <div class="field">
            <label for="sid">Session id</label>
            <input id="sid" .value=${this._lookup}
              @input=${(e) => this._lookup = e.target.value} />
          </div>
          <uui-button look="secondary" ?disabled=${this._busy || !this._lookup.trim()}
            @click=${n(this, l, v)}>Show history</uui-button>
        </div>

        ${this._history && this._history.length > 0 ? a`
              <uui-table style="margin-top:12px;">
                <uui-table-head>
                  <uui-table-head-cell>When</uui-table-head-cell>
                  <uui-table-head-cell>Decision</uui-table-head-cell>
                  <uui-table-head-cell>IP</uui-table-head-cell>
                  <uui-table-head-cell>User agent</uui-table-head-cell>
                </uui-table-head>
                ${this._history.map((e) => a`
                  <uui-table-row>
                    <uui-table-cell>${new Date(e.consentDate).toLocaleString()}</uui-table-cell>
                    <uui-table-cell><uui-tag look="secondary">${e.consentType}</uui-tag></uui-table-cell>
                    <uui-table-cell class="mono">${e.ipAddress ?? "—"}</uui-table-cell>
                    <uui-table-cell class="hint" style="max-width:260px;overflow-wrap:anywhere;">
                      ${e.userAgent ?? "—"}
                    </uui-table-cell>
                  </uui-table-row>`)}
              </uui-table>` : b}
      </uui-box>

      <uui-box headline="Data subject requests" style="margin-top:16px;">
        <div class="row">
          ${["pending", "completed", ""].map((e) => a`
            <uui-button
              look=${this._statusFilter === e ? "primary" : "secondary"}
              compact
              @click=${async () => {
      this._statusFilter = e, await n(this, l, g).call(this);
    }}>
              ${e === "" ? "All" : e}
            </uui-button>`)}
        </div>

        ${this._requests.length === 0 ? a`<p class="empty">No ${this._statusFilter || ""} requests.</p>` : a`
              <uui-table style="margin-top:12px;">
                <uui-table-head>
                  <uui-table-head-cell>Email</uui-table-head-cell>
                  <uui-table-head-cell>Type</uui-table-head-cell>
                  <uui-table-head-cell>Requested</uui-table-head-cell>
                  <uui-table-head-cell>Status</uui-table-head-cell>
                  <uui-table-head-cell></uui-table-head-cell>
                </uui-table-head>
                ${this._requests.map((e) => a`
                  <uui-table-row>
                    <uui-table-cell class="mono">${e.email}</uui-table-cell>
                    <uui-table-cell>${e.requestType}</uui-table-cell>
                    <uui-table-cell class="hint">
                      ${new Date(e.requestedAt).toLocaleDateString()}
                    </uui-table-cell>
                    <uui-table-cell>
                      <uui-tag look=${e.status === "pending" ? "warning" : "positive"}>
                        ${e.status}
                      </uui-tag>
                    </uui-table-cell>
                    <uui-table-cell style="text-align:right;">
                      ${e.status === "pending" ? a`<uui-button look="secondary" compact ?disabled=${this._busy}
                                 @click=${() => n(this, l, w).call(this, e)}>Mark complete</uui-button>` : a`<span class="hint">
                                 ${e.completedAt ? new Date(e.completedAt).toLocaleDateString() : ""}
                               </span>`}
                    </uui-table-cell>
                  </uui-table-row>`)}
              </uui-table>`}
      </uui-box>

      <uui-box headline="Retention" style="margin-top:16px;">
        <p class="hint">
          Consent records hold an IP address and a user agent, which are personal data.
          Deleting old ones also deletes the evidence of those decisions, so keep them at
          least as long as you may need to demonstrate consent.
        </p>
        <div class="row" style="margin-top:8px;">
          <div class="field">
            <label for="ret">Delete records older than (days)</label>
            <input id="ret" type="number" min="1" style="min-width:120px;"
              .value=${String(this._retentionDays)}
              @input=${(e) => this._retentionDays = Number(e.target.value)} />
          </div>
          <uui-button look="secondary" color="danger" ?disabled=${this._busy || this._retentionDays < 1}
            @click=${n(this, l, x)}>Purge</uui-button>
        </div>
      </uui-box>
    `;
  }
};
p = /* @__PURE__ */ new WeakMap();
l = /* @__PURE__ */ new WeakSet();
g = async function() {
  this._loading = !0;
  try {
    const [t, e] = await Promise.all([
      y(this, p).call(this, `${this._api}/GetSummary`, { credentials: "same-origin" }),
      y(this, p).call(this, `${this._api}/GetRequests?status=${encodeURIComponent(this._statusFilter)}`, { credentials: "same-origin" })
    ]);
    t.ok && (this._summary = await t.json()), e.ok && (this._requests = await e.json());
  } finally {
    this._loading = !1;
  }
};
v = async function() {
  if (this._lookup.trim()) {
    this._busy = !0, this._msg = null;
    try {
      const t = await y(this, p).call(this, `${this._api}/GetConsentHistory?sessionId=${encodeURIComponent(this._lookup.trim())}`, { credentials: "same-origin" });
      if (!t.ok) throw new Error(String(t.status));
      this._history = await t.json(), this._history.length === 0 && (this._msg = { ok: !1, text: "No consent recorded for that session." });
    } catch (t) {
      this._msg = { ok: !1, text: `Lookup failed (${t.message}).` };
    } finally {
      this._busy = !1;
    }
  }
};
w = async function(t) {
  if (confirm(`Mark the ${t.requestType} request for ${t.email} as complete?`)) {
    this._busy = !0, this._msg = null;
    try {
      const s = await (await y(this, p).call(this, `${this._api}/CompleteRequest`, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: t.id })
      })).json();
      this._msg = { ok: s.success, text: s.message }, await n(this, l, g).call(this);
    } catch (e) {
      this._msg = { ok: !1, text: `The request failed (${e.message}).` };
    } finally {
      this._busy = !1;
    }
  }
};
x = async function() {
  if (confirm(
    `Delete consent records older than ${this._retentionDays} days? This removes the evidence of those decisions permanently.`
  )) {
    this._busy = !0, this._msg = null;
    try {
      const t = await y(this, p).call(this, `${this._api}/PurgeConsent?olderThanDays=${this._retentionDays}`, {
        method: "POST",
        credentials: "same-origin"
      }), e = await t.json();
      this._msg = { ok: t.ok, text: e.message }, await n(this, l, g).call(this);
    } catch (t) {
      this._msg = { ok: !1, text: `Purge failed (${t.message}).` };
    } finally {
      this._busy = !1;
    }
  }
};
m = function(t, e) {
  return a`<div class="stat"><div class="n">${t}</div><div class="l">${e}</div></div>`;
};
o.styles = D`
    :host { display: block; padding: var(--uui-size-layout-1, 24px); }
    h1 { font-size: 1.5rem; font-weight: 600; margin: 0 0 8px; }
    p.description { color: var(--uui-color-text-alt, #6b7280); margin: 0 0 24px; max-width: 64ch; }
    .stats { display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); }
    .stat { border: 1px solid var(--uui-color-border, #e5e7eb); border-radius: 6px; padding: 12px 14px; }
    .stat .n { font-size: 1.6rem; font-weight: 600; line-height: 1.1; }
    .stat .l { color: var(--uui-color-text-alt, #6b7280); font-size: 0.8125rem; }
    .row { display: flex; gap: 10px; align-items: flex-end; flex-wrap: wrap; }
    .field { display: flex; flex-direction: column; gap: 4px; }
    .field label { font-weight: 600; font-size: 0.8125rem; }
    .field input { padding: 8px; border: 1px solid var(--uui-color-border, #d1d5db);
                   border-radius: 4px; font: inherit; min-width: 220px; }
    .msg { padding: 10px 14px; border-radius: 4px; margin-top: 14px; }
    .msg.success { background: #d1fae5; color: #065f46; }
    .msg.error { background: #fee2e2; color: #991b1b; }
    .hint { color: var(--uui-color-text-alt, #6b7280); font-size: 0.8125rem; }
    .mono { font-family: var(--uui-font-monospace, monospace); font-size: 0.8125rem; }
    .empty { color: var(--uui-color-text-alt, #6b7280); padding: 12px 0; }
    uui-table { width: 100%; }
  `;
c([
  d()
], o.prototype, "_summary", 2);
c([
  d()
], o.prototype, "_requests", 2);
c([
  d()
], o.prototype, "_statusFilter", 2);
c([
  d()
], o.prototype, "_lookup", 2);
c([
  d()
], o.prototype, "_history", 2);
c([
  d()
], o.prototype, "_retentionDays", 2);
c([
  d()
], o.prototype, "_loading", 2);
c([
  d()
], o.prototype, "_busy", 2);
c([
  d()
], o.prototype, "_msg", 2);
o = c([
  C("gdrp-dashboard")
], o);
const L = o;
export {
  o as GdrpDashboardElement,
  L as default
};
