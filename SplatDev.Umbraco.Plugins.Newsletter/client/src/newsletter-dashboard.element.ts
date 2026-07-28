import {
  LitElement,
  css,
  html,
  customElement,
  state,
} from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";

interface SubscriberList {
  id: number;
  name: string;
  createdAt: string;
}

interface Subscriber {
  id: number;
  listId: number;
  email: string;
  name: string | null;
  active: boolean;
  memberKey: string | null;
  subscribedAt: string;
  unsubscribedAt: string | null;
}

interface Campaign {
  id: number;
  name: string;
  templateId: number | null;
  listId: number;
  subject: string;
  status: string;
  scheduledAt: string | null;
  sentAt: string | null;
  createdAt: string;
}

interface CampaignStats {
  id: number;
  campaignId: number;
  opens: number;
  clicks: number;
  delivered: number;
  bounced: number;
  fetchedAt: string;
}

const API_BASE = "/umbraco/management/api/v1/newsletter";

@customElement("newsletter-dashboard")
export class NewsletterDashboardElement extends UmbElementMixin(LitElement) {
  @state() private _lists: SubscriberList[] = [];
  @state() private _subscribers: Subscriber[] = [];
  @state() private _campaigns: Campaign[] = [];
  @state() private _stats: CampaignStats | null = null;
  @state() private _loading = false;
  @state() private _message = "";
  @state() private _messageType: "success" | "error" | "" = "";
  @state() private _activeTab: "subscribers" | "campaigns" | "analytics" =
    "subscribers";

  @state() private _selectedListId: number | null = null;
  @state() private _newListName = "";
  @state() private _newSubEmail = "";
  @state() private _newSubName = "";

  @state() private _showCampaignForm = false;
  @state() private _editingCampaign: Campaign | null = null;
  @state() private _campaignForm = { name: "", subject: "", listId: 0, templateId: "" };

  @state() private _selectedStatsCampaignId: number | null = null;

  connectedCallback() {
    super.connectedCallback();
    this._loadLists();
    this._loadCampaigns();
  }

  // ── Shared helpers ────────────────────────────────────────────────────────

  private _showMessage(text: string, type: "success" | "error" = "success") {
    this._message = text;
    this._messageType = type;
    setTimeout(() => {
      this._message = "";
      this._messageType = "";
    }, 4000);
  }

  private async _api<T>(url: string, init?: RequestInit): Promise<T | null> {
    try {
      const r = await fetch(`${API_BASE}${url}`, {
        headers: { "Content-Type": "application/json", ...init?.headers },
        ...init,
      });
      if (r.status === 204) return null;
      if (r.ok) return r.json();
      const err = await r.text();
      this._showMessage(err || `Request failed (${r.status})`, "error");
      return null;
    } catch {
      this._showMessage("Network error", "error");
      return null;
    }
  }

  // ── List loading ──────────────────────────────────────────────────────────

  private async _loadLists() {
    const lists = await this._api<SubscriberList[]>("/lists");
    if (lists) this._lists = lists;
  }

  private async _loadSubscribers(listId: number) {
    this._selectedListId = listId;
    this._loading = true;
    const subs = await this._api<Subscriber[]>(`/lists/${listId}/subscribers`);
    this._subscribers = subs ?? [];
    this._loading = false;
  }

  private async _createList() {
    const name = this._newListName.trim();
    if (!name) return;
    const created = await this._api<SubscriberList>("/lists", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
    if (created) {
      this._newListName = "";
      await this._loadLists();
      this._showMessage(`List "${name}" created.`);
    }
  }

  private async _deleteList(id: number) {
    this._loading = true;
    await this._api(`/lists/${id}`, { method: "DELETE" });
    await this._loadLists();
    if (this._selectedListId === id) {
      this._selectedListId = null;
      this._subscribers = [];
    }
    this._loading = false;
  }

  // ── Subscriber actions ────────────────────────────────────────────────────

  private async _subscribe() {
    if (!this._selectedListId) return;
    const email = this._newSubEmail.trim();
    if (!email) return;
    const name = this._newSubName.trim() || null;
    const sub = await this._api<Subscriber>(
      `/lists/${this._selectedListId}/subscribers`,
      {
        method: "POST",
        body: JSON.stringify({ email, name }),
      }
    );
    if (sub) {
      this._newSubEmail = "";
      this._newSubName = "";
      await this._loadSubscribers(this._selectedListId);
      this._showMessage(`Subscriber ${email} added.`);
    }
  }

  private async _deleteSubscriber(id: number) {
    this._loading = true;
    await this._api(`/subscribers/${id}`, { method: "DELETE" });
    if (this._selectedListId)
      await this._loadSubscribers(this._selectedListId);
    this._loading = false;
  }

  private async _unsubscribe(listId: number, email: string) {
    this._loading = true;
    await this._api(`/lists/${listId}/subscribers/${encodeURIComponent(email)}`, {
      method: "DELETE",
    });
    if (this._selectedListId)
      await this._loadSubscribers(this._selectedListId);
    this._loading = false;
  }

  // ── Campaign actions ─────────────────────────────────────────────────────

  private async _loadCampaigns() {
    const campaigns = await this._api<Campaign[]>("/campaigns");
    if (campaigns) this._campaigns = campaigns;
  }

  private _openCreateCampaign() {
    this._editingCampaign = null;
    this._campaignForm = { name: "", subject: "", listId: 0, templateId: "" };
    this._showCampaignForm = true;
  }

  private _openEditCampaign(c: Campaign) {
    this._editingCampaign = c;
    this._campaignForm = {
      name: c.name,
      subject: c.subject,
      listId: c.listId,
      templateId: c.templateId?.toString() ?? "",
    };
    this._showCampaignForm = true;
  }

  private async _saveCampaign() {
    const payload = {
      name: this._campaignForm.name.trim(),
      subject: this._campaignForm.subject.trim(),
      listId: this._campaignForm.listId,
      templateId:
        this._campaignForm.templateId.trim() !== ""
          ? Number(this._campaignForm.templateId)
          : null,
    };
    if (!payload.name) return this._showMessage("Name is required.", "error");

    if (this._editingCampaign) {
      const updated = await this._api<Campaign>(
        `/campaigns/${this._editingCampaign.id}`,
        { method: "PUT", body: JSON.stringify(payload) }
      );
      if (updated) this._showMessage("Campaign updated.");
    } else {
      const created = await this._api<Campaign>("/campaigns", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (created) this._showMessage("Campaign created.");
    }
    this._showCampaignForm = false;
    await this._loadCampaigns();
  }

  private async _deleteCampaign(id: number) {
    this._loading = true;
    await this._api(`/campaigns/${id}`, { method: "DELETE" });
    await this._loadCampaigns();
    this._loading = false;
  }

  private async _sendCampaign(id: number) {
    this._loading = true;
    const result = await this._api<{ sent: number }>(
      `/campaigns/${id}/send`,
      { method: "POST" }
    );
    if (result) this._showMessage(`Campaign sent to ${result.sent} subscribers.`);
    await this._loadCampaigns();
    this._loading = false;
  }

  // ── Stats actions ─────────────────────────────────────────────────────────

  private async _loadStats(campaignId: number) {
    this._selectedStatsCampaignId = campaignId;
    this._loading = true;
    const stats = await this._api<CampaignStats>(
      `/campaigns/${campaignId}/stats`
    );
    this._stats = stats;
    this._loading = false;
  }

  private async _fetchStatsFromMailgun() {
    if (!this._selectedStatsCampaignId) return;
    this._loading = true;
    const stats = await this._api<CampaignStats>(
      `/campaigns/${this._selectedStatsCampaignId}/stats/fetch`,
      { method: "POST" }
    );
    if (stats) {
      this._stats = stats;
      this._showMessage("Stats fetched from Mailgun.");
    }
    this._loading = false;
  }

  // ── Render: Subscribers ──────────────────────────────────────────────────

  private _renderSubscribers() {
    return html`
      <uui-box headline="Subscriber Lists">
        <div class="action-row">
          <uui-input
            .value=${this._newListName}
            @input=${(e: Event) =>
              (this._newListName = (e.target as HTMLInputElement).value)}
            placeholder="New list name..."
            style="flex:1; max-width: 280px;"
          ></uui-input>
          <uui-button
            look="primary"
            label="Create List"
            @click=${this._createList}
            >Create List</uui-button
          >
        </div>
        ${this._lists.length === 0
          ? html`<p class="empty">No subscriber lists yet.</p>`
          : html`
            <uui-table>
              <uui-table-head>
                <uui-table-head-cell>Name</uui-table-head-cell>
                <uui-table-head-cell>Created</uui-table-head-cell>
                <uui-table-head-cell>Actions</uui-table-head-cell>
              </uui-table-head>
              ${this._lists.map(
                (l) => html`
                  <uui-table-row>
                    <uui-table-cell>
                      <uui-button
                        look="secondary"
                        label="View subscribers"
                        @click=${() => this._loadSubscribers(l.id)}
                        >${l.name}</uui-button
                      >
                    </uui-table-cell>
                    <uui-table-cell
                      >${new Date(l.createdAt).toLocaleDateString()}</uui-table-cell
                    >
                    <uui-table-cell>
                      <uui-button
                        look="danger"
                        label="Delete list"
                        @click=${() => this._deleteList(l.id)}
                        >Delete</uui-button
                      >
                    </uui-table-cell>
                  </uui-table-row>
                `
              )}
            </uui-table>
          `}
      </uui-box>

      ${this._selectedListId
        ? html`
            <uui-box headline="Subscribers">
              <div class="action-row">
                <uui-input
                  .value=${this._newSubEmail}
                  @input=${(e: Event) =>
                    (this._newSubEmail = (e.target as HTMLInputElement).value)}
                  placeholder="email@example.com"
                  style="flex:1; max-width: 240px;"
                ></uui-input>
                <uui-input
                  .value=${this._newSubName}
                  @input=${(e: Event) =>
                    (this._newSubName = (e.target as HTMLInputElement).value)}
                  placeholder="Name (optional)"
                  style="flex:1; max-width: 200px;"
                ></uui-input>
                <uui-button
                  look="primary"
                  label="Add Subscriber"
                  @click=${this._subscribe}
                  >Add Subscriber</uui-button
                >
              </div>
              ${this._subscribers.length === 0
                ? html`<p class="empty">No subscribers in this list.</p>`
                : html`
                  <uui-table>
                    <uui-table-head>
                      <uui-table-head-cell>Email</uui-table-head-cell>
                      <uui-table-head-cell>Name</uui-table-head-cell>
                      <uui-table-head-cell>Status</uui-table-head-cell>
                      <uui-table-head-cell>Subscribed</uui-table-head-cell>
                      <uui-table-head-cell>Actions</uui-table-head-cell>
                    </uui-table-head>
                    ${this._subscribers.map(
                      (s) => html`
                        <uui-table-row>
                          <uui-table-cell>${s.email}</uui-table-cell>
                          <uui-table-cell>${s.name ?? "—"}</uui-table-cell>
                          <uui-table-cell>
                            <uui-badge
                              look=${s.active ? "positive" : "default"}
                              >${s.active ? "Active" : "Inactive"}</uui-badge
                            >
                          </uui-table-cell>
                          <uui-table-cell
                            >${new Date(
                              s.subscribedAt
                            ).toLocaleDateString()}</uui-table-cell
                          >
                          <uui-table-cell>
                            ${s.active
                              ? html`<uui-button
                                  look="danger"
                                  label="Unsubscribe"
                                  @click=${() =>
                                    this._unsubscribe(s.listId, s.email)}
                                  >Unsub</uui-button
                                >`
                              : html`<uui-button
                                  look="danger"
                                  label="Delete"
                                  @click=${() =>
                                    this._deleteSubscriber(s.id)}
                                  >Delete</uui-button
                                >`}
                          </uui-table-cell>
                        </uui-table-row>
                      `
                    )}
                  </uui-table>
                `}
            </uui-box>
          `
        : ""}
    `;
  }

  // ── Render: Campaigns ─────────────────────────────────────────────────────

  private _renderCampaignForm() {
    return html`
      <uui-box headline=${this._editingCampaign ? "Edit Campaign" : "New Campaign"}>
        <div class="form-grid">
          <div class="form-field">
            <label>Campaign Name</label>
            <uui-input
              .value=${this._campaignForm.name}
              @input=${(e: Event) =>
                (this._campaignForm.name = (e.target as HTMLInputElement).value)}
              placeholder="My Campaign"
            ></uui-input>
          </div>
          <div class="form-field">
            <label>Subject Line</label>
            <uui-input
              .value=${this._campaignForm.subject}
              @input=${(e: Event) =>
                (this._campaignForm.subject = (
                  e.target as HTMLInputElement
                ).value)}
              placeholder="Email subject..."
            ></uui-input>
          </div>
          <div class="form-field">
            <label>List</label>
            <select
              class="uui-select"
              .value=${String(this._campaignForm.listId)}
              @change=${(e: Event) =>
                (this._campaignForm.listId = Number(
                  (e.target as HTMLSelectElement).value
                ))}
            >
              <option value="0">Select a list...</option>
              ${this._lists.map(
                (l) =>
                  html`<option value=${l.id}>${l.name}</option>`
              )}
            </select>
          </div>
          <div class="form-field">
            <label>Email Template ID (optional)</label>
            <uui-input
              .value=${this._campaignForm.templateId}
              @input=${(e: Event) =>
                (this._campaignForm.templateId = (
                  e.target as HTMLInputElement
                ).value)}
              placeholder="Template ID number"
              type="number"
            ></uui-input>
          </div>
        </div>
        <div class="action-row" style="margin-top: var(--uui-size-space-4);">
          <uui-button look="primary" @click=${this._saveCampaign}
            >Save</uui-button
          >
          <uui-button
            look="secondary"
            @click=${() => (this._showCampaignForm = false)}
            >Cancel</uui-button
          >
        </div>
      </uui-box>
    `;
  }

  private _renderCampaigns() {
    return html`
      <uui-box headline="Campaigns">
        <uui-button
          slot="header-actions"
          look="primary"
          label="New Campaign"
          @click=${this._openCreateCampaign}
          >New Campaign</uui-button
        >
        ${this._campaigns.length === 0
          ? html`<p class="empty">No campaigns yet.</p>`
          : html`
            <uui-table>
              <uui-table-head>
                <uui-table-head-cell>Name</uui-table-head-cell>
                <uui-table-head-cell>Subject</uui-table-head-cell>
                <uui-table-head-cell>Status</uui-table-head-cell>
                <uui-table-head-cell>Created</uui-table-head-cell>
                <uui-table-head-cell>Actions</uui-table-head-cell>
              </uui-table-head>
              ${this._campaigns.map(
                (c) => html`
                  <uui-table-row>
                    <uui-table-cell>${c.name}</uui-table-cell>
                    <uui-table-cell>${c.subject}</uui-table-cell>
                    <uui-table-cell>
                      <uui-badge
                        look=${c.status === "Sent"
                          ? "positive"
                          : c.status === "Sending"
                          ? "warning"
                          : "default"}
                        >${c.status}</uui-badge
                      >
                    </uui-table-cell>
                    <uui-table-cell
                      >${new Date(c.createdAt).toLocaleDateString()}</uui-table-cell
                    >
                    <uui-table-cell>
                      <div class="action-row">
                        <uui-button
                          look="secondary"
                          label="Edit"
                          @click=${() => this._openEditCampaign(c)}
                          >Edit</uui-button
                        >
                        ${c.status === "Draft"
                          ? html`<uui-button
                              look="primary"
                              label="Send"
                              @click=${() => this._sendCampaign(c.id)}
                              >Send</uui-button
                            >`
                          : ""}
                        <uui-button
                          look="danger"
                          label="Delete"
                          @click=${() => this._deleteCampaign(c.id)}
                          >Delete</uui-button
                        >
                      </div>
                    </uui-table-cell>
                  </uui-table-row>
                `
              )}
            </uui-table>
          `}
      </uui-box>
      ${this._showCampaignForm ? this._renderCampaignForm() : ""}
    `;
  }

  // ── Render: Analytics ─────────────────────────────────────────────────────

  private _renderAnalytics() {
    return html`
      <uui-box headline="Campaign Analytics">
        <div class="action-row">
          <select
            class="uui-select"
            @change=${(e: Event) => {
              const val = Number((e.target as HTMLSelectElement).value);
              if (val) this._loadStats(val);
            }}
          >
            <option value="0">Select a campaign...</option>
            ${this._campaigns
              .filter((c) => c.status === "Sent" || c.status === "Sending")
              .map(
                (c) => html`<option value=${c.id}>${c.name}</option>`
              )}
          </select>
          ${this._stats
            ? html`<uui-button
                look="secondary"
                label="Fetch from Mailgun"
                @click=${this._fetchStatsFromMailgun}
                >Fetch from Mailgun</uui-button
              >`
            : ""}
        </div>
      </uui-box>

      ${this._stats
        ? html`
          <uui-box headline="Statistics">
            <div class="stat-grid">
              <div class="stat">
                <span class="stat-value">${this._stats.opens}</span>
                <span class="stat-label">Opens</span>
              </div>
              <div class="stat">
                <span class="stat-value">${this._stats.clicks}</span>
                <span class="stat-label">Clicks</span>
              </div>
              <div class="stat">
                <span class="stat-value">${this._stats.delivered}</span>
                <span class="stat-label">Delivered</span>
              </div>
              <div class="stat">
                <span class="stat-value">${this._stats.bounced}</span>
                <span class="stat-label">Bounced</span>
              </div>
            </div>
            <p class="dim">
              Last fetched:
              ${new Date(this._stats.fetchedAt).toLocaleString()}
            </p>
          </uui-box>
        `
        : html`<p class="empty">Select a campaign to view statistics.</p>`}
    `;
  }

  // ── Main render ───────────────────────────────────────────────────────────

  override render() {
    return html`
      <div class="dashboard">
        ${this._message
          ? html`<div class="message ${this._messageType}">${this._message}</div>`
          : ""}

        <div class="header">
          <h1>Newsletter</h1>
          <p>Manage subscriber lists, campaigns, and analytics.</p>
        </div>

        <uui-tab-group>
          <uui-tab
            label="Subscribers"
            ?active=${this._activeTab === "subscribers"}
            @click=${() => (this._activeTab = "subscribers")}
            >Subscribers</uui-tab
          >
          <uui-tab
            label="Campaigns"
            ?active=${this._activeTab === "campaigns"}
            @click=${() => (this._activeTab = "campaigns")}
            >Campaigns</uui-tab
          >
          <uui-tab
            label="Analytics"
            ?active=${this._activeTab === "analytics"}
            @click=${() => (this._activeTab = "analytics")}
            >Analytics</uui-tab
          >
        </uui-tab-group>

        <div class="tab-content">
          ${this._activeTab === "subscribers"
            ? this._renderSubscribers()
            : ""}
          ${this._activeTab === "campaigns" ? this._renderCampaigns() : ""}
          ${this._activeTab === "analytics" ? this._renderAnalytics() : ""}
        </div>
      </div>
    `;
  }

  static override styles = css`
    :host {
      display: block;
      padding: var(--uui-size-layout-1);
    }
    .dashboard {
      max-width: 1200px;
    }
    .header {
      margin-bottom: var(--uui-size-space-5);
    }
    .header h1 {
      margin: 0 0 var(--uui-size-2) 0;
      font-size: 1.5rem;
    }
    .header p {
      margin: 0;
      color: var(--uui-color-text-alt);
    }
    .tab-content {
      margin-top: var(--uui-size-space-5);
      display: flex;
      flex-direction: column;
      gap: var(--uui-size-space-5);
    }
    .action-row {
      display: flex;
      gap: var(--uui-size-space-3);
      flex-wrap: wrap;
      align-items: center;
    }
    .message {
      padding: var(--uui-size-space-3) var(--uui-size-space-4);
      border-radius: var(--uui-border-radius);
      margin-bottom: var(--uui-size-space-4);
      font-weight: 500;
    }
    .message.success {
      background: var(--uui-color-positive);
      color: #fff;
    }
    .message.error {
      background: var(--uui-color-danger);
      color: #fff;
    }
    .stat-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: var(--uui-size-space-5);
    }
    .stat {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--uui-size-2);
    }
    .stat-value {
      font-size: 2rem;
      font-weight: bold;
      color: var(--uui-color-selected);
    }
    .stat-label {
      font-size: 0.85rem;
      color: var(--uui-color-text-alt);
    }
    .empty {
      color: var(--uui-color-text-alt);
      font-style: italic;
    }
    .dim {
      color: var(--uui-color-text-alt);
      font-size: 0.85rem;
      margin-top: var(--uui-size-space-3);
    }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--uui-size-space-4);
    }
    .form-field {
      display: flex;
      flex-direction: column;
      gap: var(--uui-size-2);
    }
    .form-field label {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--uui-color-text);
    }
    .uui-select {
      padding: var(--uui-size-space-2) var(--uui-size-space-3);
      border: 1px solid var(--uui-color-border);
      border-radius: var(--uui-border-radius);
      background: var(--uui-color-surface);
      color: var(--uui-color-text);
      font-family: inherit;
      font-size: 0.9rem;
      min-height: 40px;
    }
    uui-table {
      width: 100%;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "newsletter-dashboard": NewsletterDashboardElement;
  }
}
