import { LitElement as m, nothing as d, html as a, css as h, state as u, customElement as f } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as g } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as _ } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as v } from "@umbraco-cms/backoffice/notification";
function w(e) {
  let i = null;
  const t = new Promise((o) => {
    e.consumeContext(_, async (r) => {
      var n;
      try {
        i = await ((n = r == null ? void 0 : r.getLatestToken) == null ? void 0 : n.call(r)) ?? null;
      } catch {
        i = null;
      }
      o();
    }), setTimeout(o, 3e3);
  });
  return async (o, r = {}) => {
    await t;
    const n = new Headers(r.headers);
    i && !n.has("Authorization") && n.set("Authorization", `Bearer ${i}`);
    const c = await fetch(o, { ...r, credentials: "same-origin", headers: n });
    return (c.status === 401 || c.status === 403) && console.error(
      `[SplatDev] ${c.status} from ${String(o)} — the backoffice token was ${i ? "sent but rejected" : "not available"}. The dashboard may render as empty.`
    ), c;
  };
}
var y = Object.defineProperty, x = Object.getOwnPropertyDescriptor, p = (e) => {
  throw TypeError(e);
}, l = (e, i, t, o) => {
  for (var r = o > 1 ? void 0 : o ? x(i, t) : i, n = e.length - 1, c; n >= 0; n--)
    (c = e[n]) && (r = (o ? c(i, t, r) : c(r)) || r);
  return o && r && y(i, t, r), r;
}, $ = (e, i, t) => i.has(e) || p("Cannot " + t), C = (e, i, t) => ($(e, i, "read from private field"), t ? t.call(e) : i.get(e)), I = (e, i, t) => i.has(e) ? p("Cannot add the same private member more than once") : i instanceof WeakSet ? i.add(e) : i.set(e, t), b;
const S = "/umbraco/api";
let s = class extends g(m) {
  constructor() {
    super(), I(this, b, w(this)), this._activeTab = "notifications", this._loading = !1, this._notifications = [], this._notificationMemberId = "", this._newNotificationType = "System", this._newNotificationMessage = "", this._subscribers = [], this._subscriberListId = "", this._subscribeEmail = "", this._subscribeFirstName = "", this._subscribeLastName = "", this._unsubscribeEmail = "", this._campaigns = [], this._newCampaignSubject = "", this._newCampaignTemplateId = "", this._newCampaignListId = "", this._statsCampaignId = null, this._campaignStats = null, this._templates = [], this._previewTemplateId = null, this._previewHtml = "", this.consumeContext(v, (e) => {
      this._notificationContext = e;
    });
  }
  _notify(e, i) {
    var t;
    (t = this._notificationContext) == null || t.peek(i, {
      color: e === "danger" ? "danger" : e === "warning" ? "warning" : e === "positive" ? "positive" : void 0
    });
  }
  async _api(e, i) {
    try {
      const t = await C(this, b).call(this, `${S}${e}`, {
        headers: { "Content-Type": "application/json", ...i == null ? void 0 : i.headers },
        ...i
      });
      if (t.status === 204) return null;
      if (!t.ok) {
        const r = await t.text();
        throw new Error(r || `HTTP ${t.status}`);
      }
      return (t.headers.get("content-type") || "").includes("text/html") ? await t.text() : await t.json();
    } catch (t) {
      return this._notify("danger", t.message || "Request failed"), null;
    }
  }
  // ── Notifications ──
  async _loadNotifications() {
    if (!this._notificationMemberId.trim()) {
      this._notify("warning", "Enter a member ID to load notifications.");
      return;
    }
    this._loading = !0;
    const e = await this._api(
      `/admin/notifications?memberId=${encodeURIComponent(this._notificationMemberId)}`
    );
    this._notifications = e ?? [], this._loading = !1;
  }
  async _createNotification() {
    if (!this._notificationMemberId.trim() || !this._newNotificationMessage.trim()) {
      this._notify("warning", "Member ID and message are required.");
      return;
    }
    await this._api("/admin/notifications", {
      method: "POST",
      body: JSON.stringify({
        memberId: this._notificationMemberId,
        type: this._newNotificationType,
        message: this._newNotificationMessage
      })
    }) && (this._notify("positive", "Notification created."), this._newNotificationMessage = "", await this._loadNotifications());
  }
  async _markRead(e) {
    await this._api(`/admin/notifications/${e}/read`, { method: "POST" }), await this._loadNotifications();
  }
  async _markAllRead() {
    this._notificationMemberId.trim() && (await this._api(`/admin/notifications/${encodeURIComponent(this._notificationMemberId)}/read-all`, {
      method: "POST"
    }), this._notify("positive", "All notifications marked read."), await this._loadNotifications());
  }
  // ── Subscribers ──
  async _loadSubscribers() {
    this._loading = !0;
    const e = this._subscriberListId.trim() ? `?listId=${encodeURIComponent(this._subscriberListId)}` : "", i = await this._api(`/newsletter/subscribers${e}`);
    this._subscribers = i ?? [], this._loading = !1;
  }
  async _subscribe() {
    if (!this._subscribeEmail.trim()) {
      this._notify("warning", "Email is required.");
      return;
    }
    await this._api("/newsletter/subscribe", {
      method: "POST",
      body: JSON.stringify({
        email: this._subscribeEmail,
        listId: this._subscriberListId || null,
        firstName: this._subscribeFirstName || null,
        lastName: this._subscribeLastName || null
      })
    }) && (this._notify("positive", "Subscriber added."), this._subscribeEmail = "", this._subscribeFirstName = "", this._subscribeLastName = "", await this._loadSubscribers());
  }
  async _unsubscribe() {
    if (!this._unsubscribeEmail.trim()) {
      this._notify("warning", "Email is required.");
      return;
    }
    await this._api("/newsletter/unsubscribe", {
      method: "POST",
      body: JSON.stringify({
        email: this._unsubscribeEmail,
        listId: this._subscriberListId || null
      })
    }), this._notify("positive", "Unsubscribe processed."), this._unsubscribeEmail = "", await this._loadSubscribers();
  }
  // ── Campaigns ──
  async _loadCampaigns() {
    this._loading = !0;
    const e = await this._api("/newsletter/campaigns");
    this._campaigns = e ?? [], this._loading = !1;
  }
  async _createCampaign() {
    if (!this._newCampaignSubject.trim()) {
      this._notify("warning", "Subject is required.");
      return;
    }
    const e = {
      subject: this._newCampaignSubject,
      listId: this._newCampaignListId || null,
      templateId: this._newCampaignTemplateId ? parseInt(this._newCampaignTemplateId) : null,
      status: "Draft"
    };
    await this._api("/newsletter/campaigns", {
      method: "POST",
      body: JSON.stringify(e)
    }) && (this._notify("positive", "Campaign created."), this._newCampaignSubject = "", this._newCampaignTemplateId = "", this._newCampaignListId = "", await this._loadCampaigns());
  }
  async _sendCampaign(e) {
    await this._api(`/newsletter/campaigns/${e}/send`, { method: "POST" }) && (this._notify("positive", "Campaign sending initiated."), await this._loadCampaigns());
  }
  async _showStats(e) {
    this._loading = !0;
    const i = await this._api(`/newsletter/campaigns/${e}/stats`);
    this._campaignStats = i, this._statsCampaignId = e, this._loading = !1;
  }
  // ── Templates ──
  async _loadTemplates() {
    this._loading = !0;
    const e = await this._api("/email-templates");
    this._templates = e ?? [], this._loading = !1;
  }
  async _previewTemplate(e) {
    this._loading = !0, this._previewTemplateId = e, this._previewHtml = await this._api(`/email-templates/${e}/preview`) ?? "", this._loading = !1;
  }
  // ── Tab navigation ──
  _switchTab(e) {
    switch (this._activeTab = e, e) {
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
  _renderNotifications() {
    return a`
      <uui-box>
        <div slot="headline">Notifications</div>
        <div class="toolbar">
          <uui-input
            placeholder="Member ID"
            .value=${this._notificationMemberId}
            @input=${(e) => {
      this._notificationMemberId = e.target.value;
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

        ${this._notifications.length > 0 ? a`
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
      (e) => a`
                    <uui-table-row>
                      <uui-table-cell>${e.id}</uui-table-cell>
                      <uui-table-cell>
                        <span class="badge ${e.type.toLowerCase()}">${e.type}</span>
                      </uui-table-cell>
                      <uui-table-cell>
                        <span style="max-width:300px;display:inline-block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                          ${e.message}
                        </span>
                      </uui-table-cell>
                      <uui-table-cell>
                        <span class="badge ${e.isRead ? "read" : "unread"}">
                          ${e.isRead ? "Read" : "Unread"}
                        </span>
                      </uui-table-cell>
                      <uui-table-cell>
                        <span style="font-size:0.75rem;color:var(--uui-color-text-alt,#6b7280);">
                          ${new Date(e.createdAt).toLocaleDateString()}
                        </span>
                      </uui-table-cell>
                      <uui-table-cell>
                        <div class="actions">
                          ${e.isRead ? d : a`
                                <uui-button
                                  size="s"
                                  look="outline"
                                  label="Mark Read"
                                  @click=${() => this._markRead(e.id)}
                                >
                                  Mark Read
                                </uui-button>
                              `}
                        </div>
                      </uui-table-cell>
                    </uui-table-row>
                  `
    )}
              </uui-table>
            ` : a`
              <div class="empty-state">
                ${this._notificationMemberId ? "No notifications found for this member." : "Enter a member ID and click Load to view notifications."}
              </div>
            `}
      </uui-box>

      <uui-box headline="Create Notification" style="margin-top:var(--uui-size-space-4,12px);">
        <div class="form-grid">
          <div class="form-field">
            <label>Type</label>
            <select
              .value=${this._newNotificationType}
              @change=${(e) => {
      this._newNotificationType = e.target.value;
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
              @input=${(e) => {
      this._newNotificationMessage = e.target.value;
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
  _renderSubscribers() {
    return a`
      <uui-box>
        <div slot="headline">Subscribers</div>
        <div class="toolbar">
          <uui-input
            placeholder="List ID (optional filter)"
            .value=${this._subscriberListId}
            @input=${(e) => {
      this._subscriberListId = e.target.value;
    }}
          ></uui-input>
          <uui-button look="primary" label="Load" @click=${this._loadSubscribers}></uui-button>
        </div>

        ${this._subscribers.length > 0 ? a`
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
      (e) => a`
                    <uui-table-row>
                      <uui-table-cell>${e.id}</uui-table-cell>
                      <uui-table-cell>${e.email}</uui-table-cell>
                      <uui-table-cell>${[e.firstName, e.lastName].filter(Boolean).join(" ") || "-"}</uui-table-cell>
                      <uui-table-cell>${e.listId ?? "-"}</uui-table-cell>
                      <uui-table-cell>
                        <span class="badge ${e.optedIn ? "opted-in" : "opted-out"}">
                          ${e.optedIn ? "Opted In" : "Opted Out"}
                        </span>
                      </uui-table-cell>
                      <uui-table-cell>
                        <span style="font-size:0.75rem;color:var(--uui-color-text-alt,#6b7280);">
                          ${new Date(e.subscribedAt).toLocaleDateString()}
                        </span>
                      </uui-table-cell>
                    </uui-table-row>
                  `
    )}
              </uui-table>
            ` : a`
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
                @input=${(e) => {
      this._subscribeEmail = e.target.value;
    }}
              ></uui-input>
            </div>
            <div class="form-field">
              <label>First Name</label>
              <uui-input
                placeholder="John"
                .value=${this._subscribeFirstName}
                @input=${(e) => {
      this._subscribeFirstName = e.target.value;
    }}
              ></uui-input>
            </div>
            <div class="form-field">
              <label>Last Name</label>
              <uui-input
                placeholder="Doe"
                .value=${this._subscribeLastName}
                @input=${(e) => {
      this._subscribeLastName = e.target.value;
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
                @input=${(e) => {
      this._unsubscribeEmail = e.target.value;
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
  _renderCampaigns() {
    return a`
      <uui-box>
        <div slot="headline">Campaigns</div>
        ${this._campaigns.length > 0 ? a`
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
      (e) => {
        var i;
        return a`
                    <uui-table-row>
                      <uui-table-cell>${e.id}</uui-table-cell>
                      <uui-table-cell>${e.subject}</uui-table-cell>
                      <uui-table-cell>${((i = e.template) == null ? void 0 : i.name) ?? "-"}</uui-table-cell>
                      <uui-table-cell>
                        <span class="badge ${e.status.toLowerCase()}">${e.status}</span>
                      </uui-table-cell>
                      <uui-table-cell>${e.recipientCount}</uui-table-cell>
                      <uui-table-cell>
                        <div class="actions">
                          ${e.status === "Draft" || e.status === "Scheduled" ? a`
                                <uui-button
                                  size="s"
                                  look="primary"
                                  label="Send"
                                  @click=${() => this._sendCampaign(e.id)}
                                >
                                  Send
                                </uui-button>
                              ` : d}
                          ${e.status === "Sent" || e.status === "Sending" ? a`
                                <uui-button
                                  size="s"
                                  look="outline"
                                  label="Stats"
                                  @click=${() => this._showStats(e.id)}
                                >
                                  Stats
                                </uui-button>
                              ` : d}
                        </div>
                      </uui-table-cell>
                    </uui-table-row>
                  `;
      }
    )}
              </uui-table>
            ` : a`<div class="empty-state">No campaigns found. Create one below.</div>`}
      </uui-box>

      <uui-box headline="New Campaign" style="margin-top:var(--uui-size-space-4,12px);">
        <div class="form-grid">
          <div class="form-field full-width">
            <label>Subject *</label>
            <uui-input
              placeholder="Campaign subject line"
              .value=${this._newCampaignSubject}
              @input=${(e) => {
      this._newCampaignSubject = e.target.value;
    }}
            ></uui-input>
          </div>
          <div class="form-field">
            <label>Template ID</label>
            <uui-input
              placeholder="e.g., 1"
              type="number"
              .value=${this._newCampaignTemplateId}
              @input=${(e) => {
      this._newCampaignTemplateId = e.target.value;
    }}
            ></uui-input>
          </div>
          <div class="form-field">
            <label>List ID</label>
            <uui-input
              placeholder="Target subscriber list"
              .value=${this._newCampaignListId}
              @input=${(e) => {
      this._newCampaignListId = e.target.value;
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

      ${this._campaignStats ? a`
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
      { label: "Unsubscribes", value: this._campaignStats.unsubscribes }
    ].map(
      (e) => a`
                    <div class="stat-card">
                      <div class="stat-value">${e.value}</div>
                      <div class="stat-label">${e.label}</div>
                    </div>
                  `
    )}
              </div>
            </uui-box>
          ` : d}
    `;
  }
  _renderTemplates() {
    return a`
      <uui-box headline="Email Templates">
        ${this._templates.length > 0 ? a`
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
      (e) => a`
                    <uui-table-row>
                      <uui-table-cell>${e.id}</uui-table-cell>
                      <uui-table-cell>${e.name}</uui-table-cell>
                      <uui-table-cell>${e.subject}</uui-table-cell>
                      <uui-table-cell>
                        <span class="badge ${e.isBuiltIn ? "builtin" : "custom"}">
                          ${e.isBuiltIn ? "Built-in" : "Custom"}
                        </span>
                      </uui-table-cell>
                      <uui-table-cell>
                        <span style="font-size:0.75rem;color:var(--uui-color-text-alt,#6b7280);">
                          ${new Date(e.createdAt).toLocaleDateString()}
                        </span>
                      </uui-table-cell>
                      <uui-table-cell>
                        <uui-button
                          size="s"
                          look="outline"
                          label="Preview"
                          @click=${() => this._previewTemplate(e.id)}
                        >
                          Preview
                        </uui-button>
                      </uui-table-cell>
                    </uui-table-row>
                  `
    )}
              </uui-table>
            ` : a`<div class="empty-state">No templates found. Click a tab to load data.</div>`}
      </uui-box>

      ${this._previewHtml ? a`
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
      this._previewHtml = "", this._previewTemplateId = null;
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
          ` : d}
    `;
  }
  render() {
    const e = {
      notifications: "Notifications",
      subscribers: "Subscribers",
      campaigns: "Campaigns",
      templates: "Templates"
    };
    return a`
      <h1>Email Notifications</h1>
      <p class="description">
        Manage member notifications, newsletter subscribers, email campaigns, and templates.
      </p>

      <uui-tab-group>
        ${["notifications", "subscribers", "campaigns", "templates"].map(
      (t) => a`
            <uui-tab
              label=${e[t]}
              ?active=${this._activeTab === t}
              @click=${() => this._switchTab(t)}
            >
              ${e[t]}
            </uui-tab>
          `
    )}
      </uui-tab-group>

      <div class="tab-content">
        ${this._activeTab === "notifications" ? this._renderNotifications() : this._activeTab === "subscribers" ? this._renderSubscribers() : this._activeTab === "campaigns" ? this._renderCampaigns() : this._renderTemplates()}
      </div>

      ${this._loading ? a`<uui-loader-bar style="margin-top:var(--uui-size-space-4,12px);"></uui-loader-bar>` : d}
    `;
  }
};
b = /* @__PURE__ */ new WeakMap();
s.styles = h`
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
l([
  u()
], s.prototype, "_activeTab", 2);
l([
  u()
], s.prototype, "_loading", 2);
l([
  u()
], s.prototype, "_notifications", 2);
l([
  u()
], s.prototype, "_notificationMemberId", 2);
l([
  u()
], s.prototype, "_newNotificationType", 2);
l([
  u()
], s.prototype, "_newNotificationMessage", 2);
l([
  u()
], s.prototype, "_subscribers", 2);
l([
  u()
], s.prototype, "_subscriberListId", 2);
l([
  u()
], s.prototype, "_subscribeEmail", 2);
l([
  u()
], s.prototype, "_subscribeFirstName", 2);
l([
  u()
], s.prototype, "_subscribeLastName", 2);
l([
  u()
], s.prototype, "_unsubscribeEmail", 2);
l([
  u()
], s.prototype, "_campaigns", 2);
l([
  u()
], s.prototype, "_newCampaignSubject", 2);
l([
  u()
], s.prototype, "_newCampaignTemplateId", 2);
l([
  u()
], s.prototype, "_newCampaignListId", 2);
l([
  u()
], s.prototype, "_statsCampaignId", 2);
l([
  u()
], s.prototype, "_campaignStats", 2);
l([
  u()
], s.prototype, "_templates", 2);
l([
  u()
], s.prototype, "_previewTemplateId", 2);
l([
  u()
], s.prototype, "_previewHtml", 2);
s = l([
  f("email-notifications-dashboard")
], s);
const E = s;
export {
  s as EmailNotificationsDashboardElement,
  E as default
};
