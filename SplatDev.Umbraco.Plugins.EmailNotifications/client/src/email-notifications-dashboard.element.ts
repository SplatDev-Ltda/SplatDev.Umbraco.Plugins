import {
  LitElement,
  html,
  css,
  nothing,
} from "@umbraco-cms/backoffice/external/lit";
import { customElement, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import { createAuthFetch } from "./auth-fetch";

import {
  UmbNotificationContext,
  UMB_NOTIFICATION_CONTEXT,
} from "@umbraco-cms/backoffice/notification";

interface Notification {
  id: number;
  memberId: string;
  type: "Contract" | "Payment" | "System" | "Newsletter";
  message: string;
  isRead: boolean;
  createdAt: string;
  readAt: string | null;
}

interface Subscriber {
  id: number;
  memberId: string | null;
  email: string;
  listId: string | null;
  optedIn: boolean;
  subscribedAt: string;
  optedOutAt: string | null;
  firstName: string | null;
  lastName: string | null;
}

interface Campaign {
  id: number;
  templateId: number | null;
  subject: string;
  listId: string | null;
  status: "Draft" | "Scheduled" | "Sending" | "Sent" | "Failed" | "Cancelled";
  sendAt: string | null;
  sentAt: string | null;
  recipientCount: number;
  sentCount: number;
  createdAt: string;
  updatedAt: string | null;
  template: { id: number; name: string } | null;
}

interface CampaignStats {
  totalSent: number;
  delivered: number;
  opens: number;
  uniqueOpens: number;
  clicks: number;
  uniqueClicks: number;
  bounces: number;
  unsubscribes: number;
  complaints: number;
}

interface EmailTemplate {
  id: number;
  name: string;
  subject: string;
  headerHtml: string | null;
  bodyHtml: string;
  footerHtml: string | null;
  globalStyles: string | null;
  isBuiltIn: boolean;
  createdAt: string;
  updatedAt: string | null;
}

type Tab = "notifications" | "subscribers" | "campaigns" | "templates";

const API_BASE = "/umbraco/api";

@customElement("email-notifications-dashboard")
export class EmailNotificationsDashboardElement extends UmbElementMixin(LitElement) {
  readonly #fetch = createAuthFetch(this);

  static override styles = css`
    :host {
      display: block;
      padding: var(--uui-size-layout-1, 24px);
    }

    h1 {
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0 0 var(--uui-size-space-1, 4px);
    }

    p.description {
      color: var(--uui-color-text-alt, #6b7280);
      margin: 0 0 var(--uui-size-space-5, 16px);
      font-size: 0.875rem;
    }

    uui-tab-group {
      margin-bottom: var(--uui-size-space-5, 16px);
    }

    .tab-content {
      margin-top: var(--uui-size-space-5, 16px);
    }

    .toolbar {
      display: flex;
      align-items: center;
      gap: var(--uui-size-space-4, 12px);
      margin-bottom: var(--uui-size-space-4, 12px);
      flex-wrap: wrap;
    }

    .toolbar uui-input,
    .toolbar uui-select {
      min-width: 200px;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 10px;
      border-radius: 9999px;
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .badge.read {
      background: #d1fae5;
      color: #065f46;
    }
    .badge.unread {
      background: #fef3c7;
      color: #92400e;
    }
    .badge.opted-in {
      background: #d1fae5;
      color: #065f46;
    }
    .badge.opted-out {
      background: #fee2e2;
      color: #991b1b;
    }
    .badge.draft {
      background: #e0e7ff;
      color: #3730a3;
    }
    .badge.scheduled {
      background: #fef3c7;
      color: #92400e;
    }
    .badge.sending {
      background: #dbeafe;
      color: #1e40af;
    }
    .badge.sent {
      background: #d1fae5;
      color: #065f46;
    }
    .badge.failed {
      background: #fee2e2;
      color: #991b1b;
    }
    .badge.cancelled {
      background: #f3f4f6;
      color: #6b7280;
    }
    .badge.builtin {
      background: #ede9fe;
      color: #5b21b6;
    }
    .badge.custom {
      background: #dbeafe;
      color: #1e40af;
    }
    .badge.contract {
      background: #dbeafe;
      color: #1e40af;
    }
    .badge.payment {
      background: #d1fae5;
      color: #065f46;
    }
    .badge.system {
      background: #f3f4f6;
      color: #6b7280;
    }
    .badge.newsletter {
      background: #ede9fe;
      color: #5b21b6;
    }

    uui-table {
      width: 100%;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--uui-size-space-4, 12px);
      max-width: 720px;
    }

    .form-field {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .form-field.full-width {
      grid-column: 1 / -1;
    }

    .form-field label {
      font-size: 0.8rem;
      font-weight: 600;
    }

    .form-field textarea {
      width: 100%;
      padding: 8px;
      border: 1px solid var(--uui-color-border, #d1d5db);
      border-radius: var(--uui-border-radius, 4px);
      font-family: inherit;
      font-size: 0.875rem;
      resize: vertical;
      min-height: 80px;
      box-sizing: border-box;
    }

    .form-field select {
      padding: 8px;
      border: 1px solid var(--uui-color-border, #d1d5db);
      border-radius: var(--uui-border-radius, 4px);
      font-size: 0.875rem;
      font-family: inherit;
      background: var(--uui-color-surface, #fff);
      color: var(--uui-color-text, #111827);
      box-sizing: border-box;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: var(--uui-size-space-3, 8px);
    }

    .stat-card {
      background: var(--uui-color-surface, #fff);
      border: 1px solid var(--uui-color-border, #e5e7eb);
      border-radius: var(--uui-border-radius, 4px);
      padding: var(--uui-size-space-3, 8px) var(--uui-size-space-4, 12px);
      text-align: center;
    }

    .stat-card .stat-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--uui-color-text, #111827);
      line-height: 1.2;
    }

    .stat-card .stat-label {
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--uui-color-text-alt, #6b7280);
    }

    .empty-state {
      text-align: center;
      padding: var(--uui-size-space-10, 32px) var(--uui-size-space-4, 12px);
      color: var(--uui-color-text-alt, #6b7280);
    }

    .actions {
      display: flex;
      gap: var(--uui-size-space-2, 6px);
    }

    .preview-iframe {
      width: 100%;
      height: 400px;
      border: 1px solid var(--uui-color-border, #e5e7eb);
      border-radius: var(--uui-border-radius, 4px);
    }

    .preview-header {
      display: flex;
      align-items: center;
      gap: var(--uui-size-space-3, 8px);
      margin-bottom: var(--uui-size-space-4, 12px);
    }
  `;

  @state() private _activeTab: Tab = "notifications";

  @state() private _loading: boolean = false;

  @state() private _notifications: Notification[] = [];
  @state() private _notificationMemberId: string = "";
  @state() private _newNotificationType: string = "System";
  @state() private _newNotificationMessage: string = "";

  @state() private _subscribers: Subscriber[] = [];
  @state() private _subscriberListId: string = "";
  @state() private _subscribeEmail: string = "";
  @state() private _subscribeFirstName: string = "";
  @state() private _subscribeLastName: string = "";
  @state() private _unsubscribeEmail: string = "";

  @state() private _campaigns: Campaign[] = [];
  @state() private _newCampaignSubject: string = "";
  @state() private _newCampaignTemplateId: string = "";
  @state() private _newCampaignListId: string = "";
  @state() private _statsCampaignId: number | null = null;
  @state() private _campaignStats: CampaignStats | null = null;

  @state() private _templates: EmailTemplate[] = [];
  @state() private _previewTemplateId: number | null = null;
  @state() private _previewHtml: string = "";

  private _notificationContext?: UmbNotificationContext;

  constructor() {
    super();
    this.consumeContext(UMB_NOTIFICATION_CONTEXT, (ctx) => {
      this._notificationContext = ctx;
    });
  }

  private _notify(level: "default" | "positive" | "warning" | "danger", message: string) {
    this._notificationContext?.peek(message, {
      color: level === "danger" ? "danger" : level === "warning" ? "warning" : level === "positive" ? "positive" : undefined,
    });
  }

  private async _api<T>(path: string, options?: RequestInit): Promise<T | null> {
    try {
      const res = await this.#fetch(`${API_BASE}${path}`, {
        headers: { "Content-Type": "application/json", ...options?.headers },
        ...options,
      });
      if (res.status === 204) return null as T;
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("text/html")) {
        return (await res.text()) as unknown as T;
      }
      return (await res.json()) as T;
    } catch (err: any) {
      this._notify("danger", err.message || "Request failed");
      return null;
    }
  }

  // ── Notifications ──

  private async _loadNotifications() {
    if (!this._notificationMemberId.trim()) {
      this._notify("warning", "Enter a member ID to load notifications.");
      return;
    }
    this._loading = true;
    const data = await this._api<Notification[]>(
      `/admin/notifications?memberId=${encodeURIComponent(this._notificationMemberId)}`
    );
    this._notifications = data ?? [];
    this._loading = false;
  }

  private async _createNotification() {
    if (!this._notificationMemberId.trim() || !this._newNotificationMessage.trim()) {
      this._notify("warning", "Member ID and message are required.");
      return;
    }
    const result = await this._api<Notification>("/admin/notifications", {
      method: "POST",
      body: JSON.stringify({
        memberId: this._notificationMemberId,
        type: this._newNotificationType,
        message: this._newNotificationMessage,
      }),
    });
    if (result) {
      this._notify("positive", "Notification created.");
      this._newNotificationMessage = "";
      await this._loadNotifications();
    }
  }

  private async _markRead(id: number) {
    await this._api(`/admin/notifications/${id}/read`, { method: "POST" });
    await this._loadNotifications();
  }

  private async _markAllRead() {
    if (!this._notificationMemberId.trim()) return;
    await this._api(`/admin/notifications/${encodeURIComponent(this._notificationMemberId)}/read-all`, {
      method: "POST",
    });
    this._notify("positive", "All notifications marked read.");
    await this._loadNotifications();
  }

  // ── Subscribers ──

  private async _loadSubscribers() {
    this._loading = true;
    const query = this._subscriberListId.trim()
      ? `?listId=${encodeURIComponent(this._subscriberListId)}`
      : "";
    const data = await this._api<Subscriber[]>(`/newsletter/subscribers${query}`);
    this._subscribers = data ?? [];
    this._loading = false;
  }

  private async _subscribe() {
    if (!this._subscribeEmail.trim()) {
      this._notify("warning", "Email is required.");
      return;
    }
    const result = await this._api<Subscriber>("/newsletter/subscribe", {
      method: "POST",
      body: JSON.stringify({
        email: this._subscribeEmail,
        listId: this._subscriberListId || null,
        firstName: this._subscribeFirstName || null,
        lastName: this._subscribeLastName || null,
      }),
    });
    if (result) {
      this._notify("positive", "Subscriber added.");
      this._subscribeEmail = "";
      this._subscribeFirstName = "";
      this._subscribeLastName = "";
      await this._loadSubscribers();
    }
  }

  private async _unsubscribe() {
    if (!this._unsubscribeEmail.trim()) {
      this._notify("warning", "Email is required.");
      return;
    }
    await this._api("/newsletter/unsubscribe", {
      method: "POST",
      body: JSON.stringify({
        email: this._unsubscribeEmail,
        listId: this._subscriberListId || null,
      }),
    });
    this._notify("positive", "Unsubscribe processed.");
    this._unsubscribeEmail = "";
    await this._loadSubscribers();
  }

  // ── Campaigns ──

  private async _loadCampaigns() {
    this._loading = true;
    const data = await this._api<Campaign[]>("/newsletter/campaigns");
    this._campaigns = data ?? [];
    this._loading = false;
  }

  private async _createCampaign() {
    if (!this._newCampaignSubject.trim()) {
      this._notify("warning", "Subject is required.");
      return;
    }
    const body: Record<string, any> = {
      subject: this._newCampaignSubject,
      listId: this._newCampaignListId || null,
      templateId: this._newCampaignTemplateId ? parseInt(this._newCampaignTemplateId) : null,
      status: "Draft",
    };
    const result = await this._api<Campaign>("/newsletter/campaigns", {
      method: "POST",
      body: JSON.stringify(body),
    });
    if (result) {
      this._notify("positive", "Campaign created.");
      this._newCampaignSubject = "";
      this._newCampaignTemplateId = "";
      this._newCampaignListId = "";
      await this._loadCampaigns();
    }
  }

  private async _sendCampaign(id: number) {
    const result = await this._api<CampaignStats>(`/newsletter/campaigns/${id}/send`, { method: "POST" });
    if (result) {
      this._notify("positive", "Campaign sending initiated.");
      await this._loadCampaigns();
    }
  }

  private async _showStats(id: number) {
    this._loading = true;
    const data = await this._api<CampaignStats>(`/newsletter/campaigns/${id}/stats`);
    this._campaignStats = data;
    this._statsCampaignId = id;
    this._loading = false;
  }

  // ── Templates ──

  private async _loadTemplates() {
    this._loading = true;
    const data = await this._api<EmailTemplate[]>("/email-templates");
    this._templates = data ?? [];
    this._loading = false;
  }

  private async _previewTemplate(id: number) {
    this._loading = true;
    this._previewTemplateId = id;
    this._previewHtml = (await this._api<string>(`/email-templates/${id}/preview`)) ?? "";
    this._loading = false;
  }

  // ── Tab navigation ──

  private _switchTab(tab: Tab) {
    this._activeTab = tab;
    switch (tab) {
      case "subscribers":
        this._loadSubscribers();
        break;
      case "campaigns":
        this._loadCampaigns();
        break;
      case "templates":
        this._loadTemplates();
        break;
    }
  }

  // ── Render sections ──

  private _renderNotifications() {
    return html`
      <uui-box>
        <div slot="headline">Notifications</div>
        <div class="toolbar">
          <uui-input
            placeholder="Member ID"
            .value=${this._notificationMemberId}
            @input=${(e: InputEvent) => {
              this._notificationMemberId = (e.target as HTMLInputElement).value;
            }}
          ></uui-input>
          <uui-button look="primary" label="Load" @click=${this._loadNotifications}></uui-button>
          <uui-button
            look="outline"
            label="Mark All Read"
            ?disabled=${this._notifications.length === 0}
            @click=${this._markAllRead}
          >
            Mark All Read
          </uui-button>
        </div>

        ${this._notifications.length > 0
          ? html`
              <uui-table>
                <uui-table-head>
                  <uui-table-head-cell>ID</uui-table-head-cell>
                  <uui-table-head-cell>Type</uui-table-head-cell>
                  <uui-table-head-cell>Message</uui-table-head-cell>
                  <uui-table-head-cell>Status</uui-table-head-cell>
                  <uui-table-head-cell>Created</uui-table-head-cell>
                  <uui-table-head-cell>Actions</uui-table-head-cell>
                </uui-table-head>
                ${this._notifications.map(
                  (n) => html`
                    <uui-table-row>
                      <uui-table-cell>${n.id}</uui-table-cell>
                      <uui-table-cell>
                        <span class="badge ${n.type.toLowerCase()}">${n.type}</span>
                      </uui-table-cell>
                      <uui-table-cell>
                        <span style="max-width:300px;display:inline-block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                          ${n.message}
                        </span>
                      </uui-table-cell>
                      <uui-table-cell>
                        <span class="badge ${n.isRead ? "read" : "unread"}">
                          ${n.isRead ? "Read" : "Unread"}
                        </span>
                      </uui-table-cell>
                      <uui-table-cell>
                        <span style="font-size:0.75rem;color:var(--uui-color-text-alt,#6b7280);">
                          ${new Date(n.createdAt).toLocaleDateString()}
                        </span>
                      </uui-table-cell>
                      <uui-table-cell>
                        <div class="actions">
                          ${!n.isRead
                            ? html`
                                <uui-button
                                  size="s"
                                  look="outline"
                                  label="Mark Read"
                                  @click=${() => this._markRead(n.id)}
                                >
                                  Mark Read
                                </uui-button>
                              `
                            : nothing}
                        </div>
                      </uui-table-cell>
                    </uui-table-row>
                  `
                )}
              </uui-table>
            `
          : html`
              <div class="empty-state">
                ${this._notificationMemberId
                  ? "No notifications found for this member."
                  : "Enter a member ID and click Load to view notifications."}
              </div>
            `}
      </uui-box>

      <uui-box headline="Create Notification" style="margin-top:var(--uui-size-space-4,12px);">
        <div class="form-grid">
          <div class="form-field">
            <label>Type</label>
            <select
              .value=${this._newNotificationType}
              @change=${(e: Event) => {
                this._newNotificationType = (e.target as HTMLSelectElement).value;
              }}
            >
              <option value="System">System</option>
              <option value="Contract">Contract</option>
              <option value="Payment">Payment</option>
              <option value="Newsletter">Newsletter</option>
            </select>
          </div>
          <div class="form-field full-width">
            <label>Message</label>
            <textarea
              placeholder="Notification message content..."
              .value=${this._newNotificationMessage}
              @input=${(e: InputEvent) => {
                this._newNotificationMessage = (e.target as HTMLTextAreaElement).value;
              }}
            ></textarea>
          </div>
          <div class="form-field full-width" style="margin-top:8px;">
            <uui-button
              look="primary"
              label="Create Notification"
              @click=${this._createNotification}
            >
              Create Notification
            </uui-button>
          </div>
        </div>
      </uui-box>
    `;
  }

  private _renderSubscribers() {
    return html`
      <uui-box>
        <div slot="headline">Subscribers</div>
        <div class="toolbar">
          <uui-input
            placeholder="List ID (optional filter)"
            .value=${this._subscriberListId}
            @input=${(e: InputEvent) => {
              this._subscriberListId = (e.target as HTMLInputElement).value;
            }}
          ></uui-input>
          <uui-button look="primary" label="Load" @click=${this._loadSubscribers}></uui-button>
        </div>

        ${this._subscribers.length > 0
          ? html`
              <uui-table>
                <uui-table-head>
                  <uui-table-head-cell>ID</uui-table-head-cell>
                  <uui-table-head-cell>Email</uui-table-head-cell>
                  <uui-table-head-cell>Name</uui-table-head-cell>
                  <uui-table-head-cell>List ID</uui-table-head-cell>
                  <uui-table-head-cell>Status</uui-table-head-cell>
                  <uui-table-head-cell>Subscribed</uui-table-head-cell>
                </uui-table-head>
                ${this._subscribers.map(
                  (s) => html`
                    <uui-table-row>
                      <uui-table-cell>${s.id}</uui-table-cell>
                      <uui-table-cell>${s.email}</uui-table-cell>
                      <uui-table-cell>${[s.firstName, s.lastName].filter(Boolean).join(" ") || "-"}</uui-table-cell>
                      <uui-table-cell>${s.listId ?? "-"}</uui-table-cell>
                      <uui-table-cell>
                        <span class="badge ${s.optedIn ? "opted-in" : "opted-out"}">
                          ${s.optedIn ? "Opted In" : "Opted Out"}
                        </span>
                      </uui-table-cell>
                      <uui-table-cell>
                        <span style="font-size:0.75rem;color:var(--uui-color-text-alt,#6b7280);">
                          ${new Date(s.subscribedAt).toLocaleDateString()}
                        </span>
                      </uui-table-cell>
                    </uui-table-row>
                  `
                )}
              </uui-table>
            `
          : html`
              <div class="empty-state">
                No subscribers found. Click Load to fetch subscriber data.
              </div>
            `}
      </uui-box>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--uui-size-space-4,12px);margin-top:var(--uui-size-space-4,12px);">
        <uui-box headline="Subscribe">
          <div class="form-grid">
            <div class="form-field full-width">
              <label>Email *</label>
              <uui-input
                placeholder="member@example.com"
                .value=${this._subscribeEmail}
                @input=${(e: InputEvent) => {
                  this._subscribeEmail = (e.target as HTMLInputElement).value;
                }}
              ></uui-input>
            </div>
            <div class="form-field">
              <label>First Name</label>
              <uui-input
                placeholder="John"
                .value=${this._subscribeFirstName}
                @input=${(e: InputEvent) => {
                  this._subscribeFirstName = (e.target as HTMLInputElement).value;
                }}
              ></uui-input>
            </div>
            <div class="form-field">
              <label>Last Name</label>
              <uui-input
                placeholder="Doe"
                .value=${this._subscribeLastName}
                @input=${(e: InputEvent) => {
                  this._subscribeLastName = (e.target as HTMLInputElement).value;
                }}
              ></uui-input>
            </div>
            <div class="form-field full-width" style="margin-top:8px;">
              <uui-button look="primary" label="Subscribe" @click=${this._subscribe}>Subscribe</uui-button>
            </div>
          </div>
        </uui-box>

        <uui-box headline="Unsubscribe">
          <div class="form-grid">
            <div class="form-field full-width">
              <label>Email *</label>
              <uui-input
                placeholder="member@example.com"
                .value=${this._unsubscribeEmail}
                @input=${(e: InputEvent) => {
                  this._unsubscribeEmail = (e.target as HTMLInputElement).value;
                }}
              ></uui-input>
            </div>
            <div class="form-field full-width" style="margin-top:8px;">
              <uui-button look="danger" label="Unsubscribe" @click=${this._unsubscribe}>Unsubscribe</uui-button>
            </div>
          </div>
        </uui-box>
      </div>
    `;
  }

  private _renderCampaigns() {
    return html`
      <uui-box>
        <div slot="headline">Campaigns</div>
        ${this._campaigns.length > 0
          ? html`
              <uui-table>
                <uui-table-head>
                  <uui-table-head-cell>ID</uui-table-head-cell>
                  <uui-table-head-cell>Subject</uui-table-head-cell>
                  <uui-table-head-cell>Template</uui-table-head-cell>
                  <uui-table-head-cell>Status</uui-table-head-cell>
                  <uui-table-head-cell>Recipients</uui-table-head-cell>
                  <uui-table-head-cell>Actions</uui-table-head-cell>
                </uui-table-head>
                ${this._campaigns.map(
                  (c) => html`
                    <uui-table-row>
                      <uui-table-cell>${c.id}</uui-table-cell>
                      <uui-table-cell>${c.subject}</uui-table-cell>
                      <uui-table-cell>${c.template?.name ?? "-"}</uui-table-cell>
                      <uui-table-cell>
                        <span class="badge ${c.status.toLowerCase()}">${c.status}</span>
                      </uui-table-cell>
                      <uui-table-cell>${c.recipientCount}</uui-table-cell>
                      <uui-table-cell>
                        <div class="actions">
                          ${c.status === "Draft" || c.status === "Scheduled"
                            ? html`
                                <uui-button
                                  size="s"
                                  look="primary"
                                  label="Send"
                                  @click=${() => this._sendCampaign(c.id)}
                                >
                                  Send
                                </uui-button>
                              `
                            : nothing}
                          ${c.status === "Sent" || c.status === "Sending"
                            ? html`
                                <uui-button
                                  size="s"
                                  look="outline"
                                  label="Stats"
                                  @click=${() => this._showStats(c.id)}
                                >
                                  Stats
                                </uui-button>
                              `
                            : nothing}
                        </div>
                      </uui-table-cell>
                    </uui-table-row>
                  `
                )}
              </uui-table>
            `
          : html`<div class="empty-state">No campaigns found. Create one below.</div>`}
      </uui-box>

      <uui-box headline="New Campaign" style="margin-top:var(--uui-size-space-4,12px);">
        <div class="form-grid">
          <div class="form-field full-width">
            <label>Subject *</label>
            <uui-input
              placeholder="Campaign subject line"
              .value=${this._newCampaignSubject}
              @input=${(e: InputEvent) => {
                this._newCampaignSubject = (e.target as HTMLInputElement).value;
              }}
            ></uui-input>
          </div>
          <div class="form-field">
            <label>Template ID</label>
            <uui-input
              placeholder="e.g., 1"
              type="number"
              .value=${this._newCampaignTemplateId}
              @input=${(e: InputEvent) => {
                this._newCampaignTemplateId = (e.target as HTMLInputElement).value;
              }}
            ></uui-input>
          </div>
          <div class="form-field">
            <label>List ID</label>
            <uui-input
              placeholder="Target subscriber list"
              .value=${this._newCampaignListId}
              @input=${(e: InputEvent) => {
                this._newCampaignListId = (e.target as HTMLInputElement).value;
              }}
            ></uui-input>
          </div>
          <div class="form-field full-width" style="margin-top:8px;">
            <uui-button look="primary" label="Create Campaign" @click=${this._createCampaign}>
              Create Campaign
            </uui-button>
          </div>
        </div>
      </uui-box>

      ${this._campaignStats
        ? html`
            <uui-box
              headline="Campaign Stats"
              style="margin-top:var(--uui-size-space-4,12px);"
            >
              <div class="stats-grid">
                ${[
                  { label: "Total Sent", value: this._campaignStats.totalSent },
                  { label: "Delivered", value: this._campaignStats.delivered },
                  { label: "Opens", value: this._campaignStats.opens },
                  { label: "Unique Opens", value: this._campaignStats.uniqueOpens },
                  { label: "Clicks", value: this._campaignStats.clicks },
                  { label: "Unique Clicks", value: this._campaignStats.uniqueClicks },
                  { label: "Bounces", value: this._campaignStats.bounces },
                  { label: "Unsubscribes", value: this._campaignStats.unsubscribes },
                ].map(
                  (stat) => html`
                    <div class="stat-card">
                      <div class="stat-value">${stat.value}</div>
                      <div class="stat-label">${stat.label}</div>
                    </div>
                  `
                )}
              </div>
            </uui-box>
          `
        : nothing}
    `;
  }

  private _renderTemplates() {
    return html`
      <uui-box headline="Email Templates">
        ${this._templates.length > 0
          ? html`
              <uui-table>
                <uui-table-head>
                  <uui-table-head-cell>ID</uui-table-head-cell>
                  <uui-table-head-cell>Name</uui-table-head-cell>
                  <uui-table-head-cell>Subject</uui-table-head-cell>
                  <uui-table-head-cell>Type</uui-table-head-cell>
                  <uui-table-head-cell>Created</uui-table-head-cell>
                  <uui-table-head-cell>Actions</uui-table-head-cell>
                </uui-table-head>
                ${this._templates.map(
                  (t) => html`
                    <uui-table-row>
                      <uui-table-cell>${t.id}</uui-table-cell>
                      <uui-table-cell>${t.name}</uui-table-cell>
                      <uui-table-cell>${t.subject}</uui-table-cell>
                      <uui-table-cell>
                        <span class="badge ${t.isBuiltIn ? "builtin" : "custom"}">
                          ${t.isBuiltIn ? "Built-in" : "Custom"}
                        </span>
                      </uui-table-cell>
                      <uui-table-cell>
                        <span style="font-size:0.75rem;color:var(--uui-color-text-alt,#6b7280);">
                          ${new Date(t.createdAt).toLocaleDateString()}
                        </span>
                      </uui-table-cell>
                      <uui-table-cell>
                        <uui-button
                          size="s"
                          look="outline"
                          label="Preview"
                          @click=${() => this._previewTemplate(t.id)}
                        >
                          Preview
                        </uui-button>
                      </uui-table-cell>
                    </uui-table-row>
                  `
                )}
              </uui-table>
            `
          : html`<div class="empty-state">No templates found. Click a tab to load data.</div>`}
      </uui-box>

      ${this._previewHtml
        ? html`
            <uui-box headline="Template Preview" style="margin-top:var(--uui-size-space-4,12px);">
              <div class="preview-header">
                <span style="font-size:0.8rem;color:var(--uui-color-text-alt,#6b7280);">
                  Template #${this._previewTemplateId}
                </span>
                <uui-button
                  size="s"
                  look="placeholder"
                  label="Close Preview"
                  @click=${() => {
                    this._previewHtml = "";
                    this._previewTemplateId = null;
                  }}
                >
                  Close Preview
                </uui-button>
              </div>
              <iframe
                class="preview-iframe"
                srcdoc=${this._previewHtml}
                title="Email Template Preview"
                sandbox="allow-same-origin"
              ></iframe>
            </uui-box>
          `
        : nothing}
    `;
  }

  override render() {
    const tabLabels: Record<Tab, string> = {
      notifications: "Notifications",
      subscribers: "Subscribers",
      campaigns: "Campaigns",
      templates: "Templates",
    };

    const tabs: Tab[] = ["notifications", "subscribers", "campaigns", "templates"];

    return html`
      <h1>Email Notifications</h1>
      <p class="description">
        Manage member notifications, newsletter subscribers, email campaigns, and templates.
      </p>

      <uui-tab-group>
        ${tabs.map(
          (tab) => html`
            <uui-tab
              label=${tabLabels[tab]}
              ?active=${this._activeTab === tab}
              @click=${() => this._switchTab(tab)}
            >
              ${tabLabels[tab]}
            </uui-tab>
          `
        )}
      </uui-tab-group>

      <div class="tab-content">
        ${this._activeTab === "notifications"
          ? this._renderNotifications()
          : this._activeTab === "subscribers"
          ? this._renderSubscribers()
          : this._activeTab === "campaigns"
          ? this._renderCampaigns()
          : this._renderTemplates()}
      </div>

      ${this._loading
        ? html`<uui-loader-bar style="margin-top:var(--uui-size-space-4,12px);"></uui-loader-bar>`
        : nothing}
    `;
  }
}

export default EmailNotificationsDashboardElement;

declare global {
  interface HTMLElementTagNameMap {
    "email-notifications-dashboard": EmailNotificationsDashboardElement;
  }
}
