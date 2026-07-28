import { LitElement as b, html as s, css as p, state as n, customElement as u } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as g } from "@umbraco-cms/backoffice/element-api";
var h = Object.defineProperty, m = Object.getOwnPropertyDescriptor, o = (a, e, t, d) => {
  for (var i = d > 1 ? void 0 : d ? m(e, t) : e, c = a.length - 1, l; c >= 0; c--)
    (l = a[c]) && (i = (d ? l(e, t, i) : l(i)) || i);
  return d && i && h(e, t, i), i;
};
const v = {
  0: "Draft",
  1: "Scheduled",
  2: "Sent"
};
let r = class extends g(b) {
  constructor() {
    super(...arguments), this._subscribers = [], this._campaigns = [], this._loading = !1, this._activeTab = "subscribers", this._apiBase = "/umbraco/api/newsletters";
  }
  connectedCallback() {
    super.connectedCallback(), this._loadSubscribers(), this._loadCampaigns();
  }
  async _loadSubscribers() {
    this._loading = !0;
    try {
      const a = await fetch(`${this._apiBase}/subscribers`);
      a.ok && (this._subscribers = await a.json());
    } finally {
      this._loading = !1;
    }
  }
  async _loadCampaigns() {
    const a = await fetch(`${this._apiBase}/campaigns`);
    a.ok && (this._campaigns = await a.json());
  }
  async _sendCampaign(a) {
    (await fetch(`${this._apiBase}/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ campaignId: a.id })
    })).ok && await this._loadCampaigns();
  }
  _statusBadge(a) {
    const e = ["badge-draft", "badge-scheduled", "badge-sent"][a] ?? "badge-draft";
    return s`<span class="badge ${e}">${v[a] ?? "Unknown"}</span>`;
  }
  render() {
    const a = this._subscribers.filter((t) => t.isConfirmed).length, e = this._campaigns.filter((t) => t.status === 2).length;
    return s`
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
      (t) => s`
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
      (t) => s`
                              <tr>
                                <td>${t.subject}</td>
                                <td>${this._statusBadge(t.status)}</td>
                                <td>
                                  ${t.sentAt ? new Date(t.sentAt).toLocaleString() : "—"}
                                </td>
                                <td>
                                  ${t.status !== 2 ? s`
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
r.styles = p`
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
o([
  n()
], r.prototype, "_subscribers", 2);
o([
  n()
], r.prototype, "_campaigns", 2);
o([
  n()
], r.prototype, "_loading", 2);
o([
  n()
], r.prototype, "_activeTab", 2);
r = o([
  u("newsletters-dashboard")
], r);
export {
  r as NewslettersDashboardElement
};
