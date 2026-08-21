import { LitElement as T, html as s, css as C, state as p, customElement as S } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as k } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as E } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as A } from "@umbraco-cms/backoffice/notification";
function N(t) {
  let e = null, a = null;
  const n = t.consumeContext.bind(t), o = new Promise((i) => {
    n(E, async (r) => {
      var c;
      try {
        e = await ((c = r == null ? void 0 : r.getLatestToken) == null ? void 0 : c.call(r)) ?? null;
      } catch {
        e = null;
      }
      i();
    }), setTimeout(i, 3e3);
  });
  return n(A, (i) => {
    a = i;
  }), async (i, r = {}) => {
    await o;
    const c = new Headers(r.headers);
    e && !c.has("Authorization") && c.set("Authorization", `Bearer ${e}`);
    const l = await fetch(i, { ...r, credentials: "same-origin", headers: c });
    if (!l.ok) {
      const f = l.status === 401 || l.status === 403, y = f ? "Not authorised" : "Could not load data", _ = f ? `The backoffice token was ${e ? "sent but rejected" : "not available"} (${l.status}). Anything shown below may be empty because the request was refused, not because there is nothing to show.` : `The request failed with ${l.status}. Anything shown below may be incomplete.`;
      console.error(`[SplatDev] ${l.status} from ${String(i)} — ${_}`), a == null || a.peek("danger", { data: { headline: y, message: _ } });
    }
    return l;
  };
}
var O = Object.defineProperty, z = Object.getOwnPropertyDescriptor, x = (t) => {
  throw TypeError(t);
}, b = (t, e, a, n) => {
  for (var o = n > 1 ? void 0 : n ? z(e, a) : e, i = t.length - 1, r; i >= 0; i--)
    (r = t[i]) && (o = (n ? r(e, a, o) : r(o)) || o);
  return n && o && O(e, a, o), o;
}, $ = (t, e, a) => e.has(t) || x("Cannot " + a), m = (t, e, a) => ($(t, e, "read from private field"), a ? a.call(t) : e.get(t)), w = (t, e, a) => e.has(t) ? x("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, a), v = (t, e, a) => ($(t, e, "access private method"), a), u, h, g;
const B = {
  0: "Draft",
  1: "Scheduled",
  2: "Sent"
};
let d = class extends k(T) {
  constructor() {
    super(...arguments), w(this, h), w(this, u, N(this)), this._subscribers = [], this._campaigns = [], this._loading = !1, this._activeTab = "subscribers", this._loadError = null, this._apiBase = "/umbraco/api/newsletters";
  }
  connectedCallback() {
    super.connectedCallback(), this._loadSubscribers(), this._loadCampaigns();
  }
  async _loadSubscribers() {
    this._loading = !0;
    try {
      const t = await m(this, u).call(this, `${this._apiBase}/subscribers`);
      v(this, h, g).call(this, t) && (this._subscribers = await t.json());
    } finally {
      this._loading = !1;
    }
  }
  async _loadCampaigns() {
    const t = await m(this, u).call(this, `${this._apiBase}/campaigns`);
    v(this, h, g).call(this, t) && (this._campaigns = await t.json());
  }
  async _sendCampaign(t) {
    const e = await m(this, u).call(this, `${this._apiBase}/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ campaignId: t.id })
    });
    v(this, h, g).call(this, e) && await this._loadCampaigns();
  }
  _statusBadge(t) {
    const e = ["badge-draft", "badge-scheduled", "badge-sent"][t] ?? "badge-draft";
    return s`<span class="badge ${e}">${B[t] ?? "Unknown"}</span>`;
  }
  render() {
    const t = this._subscribers.filter((a) => a.isConfirmed).length, e = this._campaigns.filter((a) => a.status === 2).length;
    return s`
      ${this._loadError ? s`<div class="splatdev-load-error" role="alert">${this._loadError}</div>` : ""}
      <h1>Newsletters</h1>
      <p class="description">
        Manage newsletter subscribers and send campaigns to your audience.
      </p>

      <div class="stat-cards">
        <div class="stat-card">
          <div class="stat-value">${this._subscribers.length}</div>
          <div class="stat-label">Total Subscribers</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${t}</div>
          <div class="stat-label">Confirmed</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${this._campaigns.length}</div>
          <div class="stat-label">Campaigns</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${e}</div>
          <div class="stat-label">Sent</div>
        </div>
      </div>

      <div class="tabs">
        <button
          class="tab-btn ${this._activeTab === "subscribers" ? "active" : ""}"
          @click=${() => this._activeTab = "subscribers"}
        >
          Subscribers (${this._subscribers.length})
        </button>
        <button
          class="tab-btn ${this._activeTab === "campaigns" ? "active" : ""}"
          @click=${() => this._activeTab = "campaigns"}
        >
          Campaigns (${this._campaigns.length})
        </button>
      </div>

      ${this._activeTab === "subscribers" ? s`
            <uui-box headline="Subscribers">
              ${this._loading ? s`<uui-loader></uui-loader>` : this._subscribers.length === 0 ? s`<div class="empty-state">No subscribers yet.</div>` : s`
                    <div class="table-wrap">
                      <table>
                        <thead>
                          <tr>
                            <th>Email</th>
                            <th>Name</th>
                            <th>Status</th>
                            <th>Subscribed</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${this._subscribers.map(
      (a) => s`
                              <tr>
                                <td>${a.email}</td>
                                <td>${a.firstName} ${a.lastName}</td>
                                <td>
                                  <span class="badge ${a.isConfirmed ? "badge-confirmed" : "badge-pending"}">
                                    ${a.isConfirmed ? "Confirmed" : "Pending"}
                                  </span>
                                </td>
                                <td>${new Date(a.subscribedAt).toLocaleDateString()}</td>
                              </tr>
                            `
    )}
                        </tbody>
                      </table>
                    </div>
                  `}
            </uui-box>
          ` : s`
            <uui-box headline="Campaigns">
              ${this._campaigns.length === 0 ? s`<div class="empty-state">No campaigns found.</div>` : s`
                    <div class="table-wrap">
                      <table>
                        <thead>
                          <tr>
                            <th>Subject</th>
                            <th>Status</th>
                            <th>Sent At</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${this._campaigns.map(
      (a) => s`
                              <tr>
                                <td>${a.subject}</td>
                                <td>${this._statusBadge(a.status)}</td>
                                <td>
                                  ${a.sentAt ? new Date(a.sentAt).toLocaleString() : "—"}
                                </td>
                                <td>
                                  ${a.status !== 2 ? s`
                                        <uui-button
                                          look="primary"
                                          compact
                                          label="Send"
                                          @click=${() => this._sendCampaign(a)}
                                        >
                                          Send
                                        </uui-button>
                                      ` : "—"}
                                </td>
                              </tr>
                            `
    )}
                        </tbody>
                      </table>
                    </div>
                  `}
            </uui-box>
          `}
    `;
  }
};
u = /* @__PURE__ */ new WeakMap();
h = /* @__PURE__ */ new WeakSet();
g = function(t) {
  return t.ok ? (this._loadError = null, !0) : (this._loadError = t.status === 401 || t.status === 403 ? "You are not authorised to do that. The request was refused, so anything shown below may be incomplete." : `The request did not succeed — the server returned ${t.status}${t.statusText ? ` ${t.statusText}` : ""}.`, !1);
};
d.styles = C`
    :host {
      display: block;
      padding: var(--uui-size-layout-1, 24px);
    }

    h1 {
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0 0 8px;
    }

    p.description {
      color: var(--uui-color-text-alt, #6b7280);
      margin: 0 0 24px;
    }

    .tabs {
      display: flex;
      gap: 4px;
      margin-bottom: 24px;
      border-bottom: 2px solid var(--uui-color-border, #e5e7eb);
    }

    .tab-btn {
      padding: 8px 16px;
      background: none;
      border: none;
      border-bottom: 2px solid transparent;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 500;
      margin-bottom: -2px;
      color: var(--uui-color-text-alt, #6b7280);
    }

    .tab-btn.active {
      border-bottom-color: #2563eb;
      color: #2563eb;
    }

    .stat-cards {
      display: flex;
      gap: 16px;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }

    .stat-card {
      background: var(--uui-color-surface-alt, #f9fafb);
      border: 1px solid var(--uui-color-border, #e5e7eb);
      border-radius: 8px;
      padding: 16px 24px;
      min-width: 140px;
    }

    .stat-card .stat-value {
      font-size: 2rem;
      font-weight: 700;
    }

    .stat-card .stat-label {
      font-size: 0.8rem;
      color: var(--uui-color-text-alt, #6b7280);
    }

    .table-wrap {
      overflow-x: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.875rem;
    }

    th {
      text-align: left;
      padding: 8px 12px;
      border-bottom: 2px solid var(--uui-color-border, #e5e7eb);
      font-weight: 600;
    }

    td {
      padding: 8px 12px;
      border-bottom: 1px solid var(--uui-color-border, #e5e7eb);
    }

    .badge {
      border-radius: 9999px;
      padding: 2px 10px;
      font-size: 0.7rem;
      font-weight: 600;
    }

    .badge-confirmed { background: #dcfce7; color: #166534; }
    .badge-pending   { background: #fef9c3; color: #854d0e; }
    .badge-draft     { background: #f3f4f6; color: #374151; }
    .badge-scheduled { background: #dbeafe; color: #1e40af; }
    .badge-sent      { background: #dcfce7; color: #166534; }

    .empty-state {
      text-align: center;
      padding: 32px;
      color: var(--uui-color-text-alt, #6b7280);
    }
  
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
b([
  p()
], d.prototype, "_subscribers", 2);
b([
  p()
], d.prototype, "_campaigns", 2);
b([
  p()
], d.prototype, "_loading", 2);
b([
  p()
], d.prototype, "_activeTab", 2);
b([
  p()
], d.prototype, "_loadError", 2);
d = b([
  S("newsletters-dashboard")
], d);
export {
  d as NewslettersDashboardElement
};
