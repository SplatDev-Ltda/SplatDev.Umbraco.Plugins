import { LitElement as x, nothing as d, html as s, css as $, state as u, customElement as v } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as w } from "@umbraco-cms/backoffice/element-api";
var k = Object.defineProperty, D = Object.getOwnPropertyDescriptor, g = (t) => {
  throw TypeError(t);
}, n = (t, e, l, p) => {
  for (var r = p > 1 ? void 0 : p ? D(e, l) : e, m = t.length - 1, b; m >= 0; m--)
    (b = t[m]) && (r = (p ? b(e, l, r) : b(r)) || r);
  return p && r && k(e, l, r), r;
}, q = (t, e, l) => e.has(t) || g("Cannot " + l), C = (t, e, l) => e.has(t) ? g("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, l), o = (t, e, l) => (q(t, e, "access private method"), l), i, h, y, _, f, c;
let a = class extends w(x) {
  constructor() {
    super(...arguments), C(this, i), this._summary = null, this._requests = [], this._statusFilter = "pending", this._lookup = "", this._history = null, this._retentionDays = 365, this._loading = !0, this._busy = !1, this._msg = null, this._api = "/umbraco/api/gdrp";
  }
  connectedCallback() {
    super.connectedCallback(), o(this, i, h).call(this);
  }
  render() {
    const t = this._summary;
    return s`
      <h1>Privacy &amp; consent</h1>
      <p class="description">
        Consent decisions and data-subject requests. Consent is append-only: every change is
        kept, so the record shows what was agreed and when it changed rather than only the
        latest state.
      </p>

      ${this._loading ? s`<uui-loader></uui-loader>` : d}

      ${t ? s`
            <uui-box headline="Consent now">
              <div class="stats">
                ${o(this, i, c).call(this, t.sessions, "sessions")}
                ${o(this, i, c).call(this, t.all, "accepted all")}
                ${o(this, i, c).call(this, t.essential, "essential only")}
                ${o(this, i, c).call(this, t.none, "declined")}
                ${o(this, i, c).call(this, t.pendingRequests, "requests pending")}
              </div>
              <p class="hint" style="margin-top:12px;">
                ${t.recordsHeld} record(s) held${t.oldestRecordUtc ? s`, oldest ${new Date(t.oldestRecordUtc).toLocaleDateString()}` : d}.
                Each session counts once, by its most recent decision.
              </p>
            </uui-box>` : d}

      ${this._msg ? s`<div class="msg ${this._msg.ok ? "success" : "error"}">${this._msg.text}</div>` : d}

      <uui-box headline="Look up a session" style="margin-top:16px;">
        <div class="row">
          <div class="field">
            <label for="sid">Session id</label>
            <input id="sid" .value=${this._lookup}
              @input=${(e) => this._lookup = e.target.value} />
          </div>
          <uui-button look="secondary" ?disabled=${this._busy || !this._lookup.trim()}
            @click=${o(this, i, y)}>Show history</uui-button>
        </div>

        ${this._history && this._history.length > 0 ? s`
              <uui-table style="margin-top:12px;">
                <uui-table-head>
                  <uui-table-head-cell>When</uui-table-head-cell>
                  <uui-table-head-cell>Decision</uui-table-head-cell>
                  <uui-table-head-cell>IP</uui-table-head-cell>
                  <uui-table-head-cell>User agent</uui-table-head-cell>
                </uui-table-head>
                ${this._history.map((e) => s`
                  <uui-table-row>
                    <uui-table-cell>${new Date(e.consentDate).toLocaleString()}</uui-table-cell>
                    <uui-table-cell><uui-tag look="secondary">${e.consentType}</uui-tag></uui-table-cell>
                    <uui-table-cell class="mono">${e.ipAddress ?? "—"}</uui-table-cell>
                    <uui-table-cell class="hint" style="max-width:260px;overflow-wrap:anywhere;">
                      ${e.userAgent ?? "—"}
                    </uui-table-cell>
                  </uui-table-row>`)}
              </uui-table>` : d}
      </uui-box>

      <uui-box headline="Data subject requests" style="margin-top:16px;">
        <div class="row">
          ${["pending", "completed", ""].map((e) => s`
            <uui-button
              look=${this._statusFilter === e ? "primary" : "secondary"}
              compact
              @click=${async () => {
      this._statusFilter = e, await o(this, i, h).call(this);
    }}>
              ${e === "" ? "All" : e}
            </uui-button>`)}
        </div>

        ${this._requests.length === 0 ? s`<p class="empty">No ${this._statusFilter || ""} requests.</p>` : s`
              <uui-table style="margin-top:12px;">
                <uui-table-head>
                  <uui-table-head-cell>Email</uui-table-head-cell>
                  <uui-table-head-cell>Type</uui-table-head-cell>
                  <uui-table-head-cell>Requested</uui-table-head-cell>
                  <uui-table-head-cell>Status</uui-table-head-cell>
                  <uui-table-head-cell></uui-table-head-cell>
                </uui-table-head>
                ${this._requests.map((e) => s`
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
                      ${e.status === "pending" ? s`<uui-button look="secondary" compact ?disabled=${this._busy}
                                 @click=${() => o(this, i, _).call(this, e)}>Mark complete</uui-button>` : s`<span class="hint">
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
            @click=${o(this, i, f)}>Purge</uui-button>
        </div>
      </uui-box>
    `;
  }
};
i = /* @__PURE__ */ new WeakSet();
h = async function() {
  this._loading = !0;
  try {
    const [t, e] = await Promise.all([
      fetch(`${this._api}/GetSummary`, { credentials: "same-origin" }),
      fetch(
        `${this._api}/GetRequests?status=${encodeURIComponent(this._statusFilter)}`,
        { credentials: "same-origin" }
      )
    ]);
    t.ok && (this._summary = await t.json()), e.ok && (this._requests = await e.json());
  } finally {
    this._loading = !1;
  }
};
y = async function() {
  if (this._lookup.trim()) {
    this._busy = !0, this._msg = null;
    try {
      const t = await fetch(
        `${this._api}/GetConsentHistory?sessionId=${encodeURIComponent(this._lookup.trim())}`,
        { credentials: "same-origin" }
      );
      if (!t.ok) throw new Error(String(t.status));
      this._history = await t.json(), this._history.length === 0 && (this._msg = { ok: !1, text: "No consent recorded for that session." });
    } catch (t) {
      this._msg = { ok: !1, text: `Lookup failed (${t.message}).` };
    } finally {
      this._busy = !1;
    }
  }
};
_ = async function(t) {
  if (confirm(`Mark the ${t.requestType} request for ${t.email} as complete?`)) {
    this._busy = !0, this._msg = null;
    try {
      const l = await (await fetch(`${this._api}/CompleteRequest`, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: t.id })
      })).json();
      this._msg = { ok: l.success, text: l.message }, await o(this, i, h).call(this);
    } catch (e) {
      this._msg = { ok: !1, text: `The request failed (${e.message}).` };
    } finally {
      this._busy = !1;
    }
  }
};
f = async function() {
  if (confirm(
    `Delete consent records older than ${this._retentionDays} days? This removes the evidence of those decisions permanently.`
  )) {
    this._busy = !0, this._msg = null;
    try {
      const t = await fetch(`${this._api}/PurgeConsent?olderThanDays=${this._retentionDays}`, {
        method: "POST",
        credentials: "same-origin"
      }), e = await t.json();
      this._msg = { ok: t.ok, text: e.message }, await o(this, i, h).call(this);
    } catch (t) {
      this._msg = { ok: !1, text: `Purge failed (${t.message}).` };
    } finally {
      this._busy = !1;
    }
  }
};
c = function(t, e) {
  return s`<div class="stat"><div class="n">${t}</div><div class="l">${e}</div></div>`;
};
a.styles = $`
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
n([
  u()
], a.prototype, "_summary", 2);
n([
  u()
], a.prototype, "_requests", 2);
n([
  u()
], a.prototype, "_statusFilter", 2);
n([
  u()
], a.prototype, "_lookup", 2);
n([
  u()
], a.prototype, "_history", 2);
n([
  u()
], a.prototype, "_retentionDays", 2);
n([
  u()
], a.prototype, "_loading", 2);
n([
  u()
], a.prototype, "_busy", 2);
n([
  u()
], a.prototype, "_msg", 2);
a = n([
  v("gdrp-dashboard")
], a);
const E = a;
export {
  a as GdrpDashboardElement,
  E as default
};
