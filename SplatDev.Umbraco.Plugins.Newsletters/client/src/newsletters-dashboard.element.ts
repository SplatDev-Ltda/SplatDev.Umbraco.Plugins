import { LitElement, html, css, customElement, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";

import { createAuthFetch } from "./auth-fetch";

interface NewsletterSubscriber {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  subscribedAt: string;
  isConfirmed: boolean;
  unsubscribedAt: string | null;
}

interface NewsletterCampaign {
  id: number;
  subject: string;
  status: number; // 0=Draft, 1=Scheduled, 2=Sent
  scheduledAt: string | null;
  sentAt: string | null;
}

const STATUS_LABELS: Record<number, string> = {
  0: "Draft",
  1: "Scheduled",
  2: "Sent",
};

@customElement("newsletters-dashboard")
export class NewslettersDashboardElement extends UmbElementMixin(LitElement) {
  readonly #fetch = createAuthFetch(this);

  static override styles = css`
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

  @state() private _subscribers: NewsletterSubscriber[] = [];
  @state() private _campaigns: NewsletterCampaign[] = [];
  @state() private _loading = false;
  @state() private _activeTab: "subscribers" | "campaigns" = "subscribers";

  private readonly _apiBase = "/umbraco/api/newsletters";

  override connectedCallback(): void {
    super.connectedCallback();
    this._loadSubscribers();
    this._loadCampaigns();
  }

  private async _loadSubscribers(): Promise<void> {
    this._loading = true;
    try {
      const res = await this.#fetch(`${this._apiBase}/subscribers`);
      if (res.ok) this._subscribers = await res.json() as NewsletterSubscriber[];
    } finally {
      this._loading = false;
    }
  }

  private async _loadCampaigns(): Promise<void> {
    const res = await this.#fetch(`${this._apiBase}/campaigns`);
    if (res.ok) this._campaigns = await res.json() as NewsletterCampaign[];
  }

  private async _sendCampaign(campaign: NewsletterCampaign): Promise<void> {
    const res = await this.#fetch(`${this._apiBase}/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ campaignId: campaign.id }),
    });
    if (res.ok) {
      await this._loadCampaigns();
    }
  }

  private _statusBadge(status: number) {
    const cls = ["badge-draft", "badge-scheduled", "badge-sent"][status] ?? "badge-draft";
    return html`<span class="badge ${cls}">${STATUS_LABELS[status] ?? "Unknown"}</span>`;
  }

  override render() {
    const confirmedCount = this._subscribers.filter((s) => s.isConfirmed).length;
    const sentCampaigns = this._campaigns.filter((c) => c.status === 2).length;

    return html`
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
          <div class="stat-value">${confirmedCount}</div>
          <div class="stat-label">Confirmed</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${this._campaigns.length}</div>
          <div class="stat-label">Campaigns</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${sentCampaigns}</div>
          <div class="stat-label">Sent</div>
        </div>
      </div>

      <div class="tabs">
        <button
          class="tab-btn ${this._activeTab === "subscribers" ? "active" : ""}"
          @click=${() => (this._activeTab = "subscribers")}
        >
          Subscribers (${this._subscribers.length})
        </button>
        <button
          class="tab-btn ${this._activeTab === "campaigns" ? "active" : ""}"
          @click=${() => (this._activeTab = "campaigns")}
        >
          Campaigns (${this._campaigns.length})
        </button>
      </div>

      ${this._activeTab === "subscribers"
        ? html`
            <uui-box headline="Subscribers">
              ${this._loading
                ? html`<uui-loader></uui-loader>`
                : this._subscribers.length === 0
                ? html`<div class="empty-state">No subscribers yet.</div>`
                : html`
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
                            (s) => html`
                              <tr>
                                <td>${s.email}</td>
                                <td>${s.firstName} ${s.lastName}</td>
                                <td>
                                  <span class="badge ${s.isConfirmed ? "badge-confirmed" : "badge-pending"}">
                                    ${s.isConfirmed ? "Confirmed" : "Pending"}
                                  </span>
                                </td>
                                <td>${new Date(s.subscribedAt).toLocaleDateString()}</td>
                              </tr>
                            `
                          )}
                        </tbody>
                      </table>
                    </div>
                  `}
            </uui-box>
          `
        : html`
            <uui-box headline="Campaigns">
              ${this._campaigns.length === 0
                ? html`<div class="empty-state">No campaigns found.</div>`
                : html`
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
                            (c) => html`
                              <tr>
                                <td>${c.subject}</td>
                                <td>${this._statusBadge(c.status)}</td>
                                <td>
                                  ${c.sentAt
                                    ? new Date(c.sentAt).toLocaleString()
                                    : "—"}
                                </td>
                                <td>
                                  ${c.status !== 2
                                    ? html`
                                        <uui-button
                                          look="primary"
                                          compact
                                          label="Send"
                                          @click=${() => this._sendCampaign(c)}
                                        >
                                          Send
                                        </uui-button>
                                      `
                                    : "—"}
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
}

declare global {
  interface HTMLElementTagNameMap {
    "newsletters-dashboard": NewslettersDashboardElement;
  }
}
