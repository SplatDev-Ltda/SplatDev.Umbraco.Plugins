import { LitElement as h, html as i, css as g, state as b, customElement as m } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as v } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as f } from "@umbraco-cms/backoffice/auth";
function _(a) {
  let e = null;
  const t = new Promise((r) => {
    a.consumeContext(f, async (s) => {
      var o;
      try {
        e = await ((o = s == null ? void 0 : s.getLatestToken) == null ? void 0 : o.call(s)) ?? null;
      } catch {
        e = null;
      }
      r();
    }), setTimeout(r, 3e3);
  });
  return async (r, s = {}) => {
    await t;
    const o = new Headers(s.headers);
    e && !o.has("Authorization") && o.set("Authorization", `Bearer ${e}`);
    const d = await fetch(r, { ...s, credentials: "same-origin", headers: o });
    return (d.status === 401 || d.status === 403) && console.error(
      `[SplatDev] ${d.status} from ${String(r)} — the backoffice token was ${e ? "sent but rejected" : "not available"}. The dashboard may render as empty.`
    ), d;
  };
}
var w = Object.defineProperty, x = Object.getOwnPropertyDescriptor, u = (a) => {
  throw TypeError(a);
}, l = (a, e, t, r) => {
  for (var s = r > 1 ? void 0 : r ? x(e, t) : e, o = a.length - 1, d; o >= 0; o--)
    (d = a[o]) && (s = (r ? d(e, t, s) : d(s)) || s);
  return r && s && w(e, t, s), s;
}, y = (a, e, t) => e.has(a) || u("Cannot " + t), p = (a, e, t) => (y(a, e, "read from private field"), t ? t.call(a) : e.get(a)), $ = (a, e, t) => e.has(a) ? u("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(a) : e.set(a, t), c;
const S = {
  0: "Draft",
  1: "Scheduled",
  2: "Sent"
};
let n = class extends v(h) {
  constructor() {
    super(...arguments), $(this, c, _(this)), this._subscribers = [], this._campaigns = [], this._loading = !1, this._activeTab = "subscribers", this._apiBase = "/umbraco/api/newsletters";
  }
  connectedCallback() {
    super.connectedCallback(), this._loadSubscribers(), this._loadCampaigns();
  }
  async _loadSubscribers() {
    this._loading = !0;
    try {
      const a = await p(this, c).call(this, `${this._apiBase}/subscribers`);
      a.ok && (this._subscribers = await a.json());
    } finally {
      this._loading = !1;
    }
  }
  async _loadCampaigns() {
    const a = await p(this, c).call(this, `${this._apiBase}/campaigns`);
    a.ok && (this._campaigns = await a.json());
  }
  async _sendCampaign(a) {
    (await p(this, c).call(this, `${this._apiBase}/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ campaignId: a.id })
    })).ok && await this._loadCampaigns();
  }
  _statusBadge(a) {
    const e = ["badge-draft", "badge-scheduled", "badge-sent"][a] ?? "badge-draft";
    return i`<span class="badge ${e}">${S[a] ?? "Unknown"}</span>`;
  }
  render() {
    const a = this._subscribers.filter((t) => t.isConfirmed).length, e = this._campaigns.filter((t) => t.status === 2).length;
    return i`
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
          <div class="stat-value">${a}</div>
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

      ${this._activeTab === "subscribers" ? i`
            <uui-box headline="Subscribers">
              ${this._loading ? i`<uui-loader></uui-loader>` : this._subscribers.length === 0 ? i`<div class="empty-state">No subscribers yet.</div>` : i`
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
      (t) => i`
                              <tr>
                                <td>${t.email}</td>
                                <td>${t.firstName} ${t.lastName}</td>
                                <td>
                                  <span class="badge ${t.isConfirmed ? "badge-confirmed" : "badge-pending"}">
                                    ${t.isConfirmed ? "Confirmed" : "Pending"}
                                  </span>
                                </td>
                                <td>${new Date(t.subscribedAt).toLocaleDateString()}</td>
                              </tr>
                            `
    )}
                        </tbody>
                      </table>
                    </div>
                  `}
            </uui-box>
          ` : i`
            <uui-box headline="Campaigns">
              ${this._campaigns.length === 0 ? i`<div class="empty-state">No campaigns found.</div>` : i`
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
      (t) => i`
                              <tr>
                                <td>${t.subject}</td>
                                <td>${this._statusBadge(t.status)}</td>
                                <td>
                                  ${t.sentAt ? new Date(t.sentAt).toLocaleString() : "—"}
                                </td>
                                <td>
                                  ${t.status !== 2 ? i`
                                        <uui-button
                                          look="primary"
                                          compact
                                          label="Send"
                                          @click=${() => this._sendCampaign(t)}
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
c = /* @__PURE__ */ new WeakMap();
n.styles = g`
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
  `;
l([
  b()
], n.prototype, "_subscribers", 2);
l([
  b()
], n.prototype, "_campaigns", 2);
l([
  b()
], n.prototype, "_loading", 2);
l([
  b()
], n.prototype, "_activeTab", 2);
n = l([
  m("newsletters-dashboard")
], n);
export {
  n as NewslettersDashboardElement
};
