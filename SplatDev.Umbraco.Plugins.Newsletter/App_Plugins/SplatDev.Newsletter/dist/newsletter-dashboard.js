import { LitElement as v, html as a, css as f, state as u, customElement as w } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as $ } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as y } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as S } from "@umbraco-cms/backoffice/notification";
function C(e) {
  let t = null, i = null;
  const o = e.consumeContext.bind(e), c = new Promise((r) => {
    o(y, async (n) => {
      var p;
      try {
        t = await ((p = n == null ? void 0 : n.getLatestToken) == null ? void 0 : p.call(n)) ?? null;
      } catch {
        t = null;
      }
      r();
    }), setTimeout(r, 3e3);
  });
  return o(S, (r) => {
    i = r;
  }), async (r, n = {}) => {
    await c;
    const p = new Headers(n.headers);
    t && !p.has("Authorization") && p.set("Authorization", `Bearer ${t}`);
    const d = await fetch(r, { ...n, credentials: "same-origin", headers: p });
    if (!d.ok) {
      const b = d.status === 401 || d.status === 403, g = b ? "Not authorised" : "Could not load data", m = b ? `The backoffice token was ${t ? "sent but rejected" : "not available"} (${d.status}). Anything shown below may be empty because the request was refused, not because there is nothing to show.` : `The request failed with ${d.status}. Anything shown below may be incomplete.`;
      console.error(`[SplatDev] ${d.status} from ${String(r)} — ${m}`), i == null || i.peek("danger", { data: { headline: g, message: m } });
    }
    return d;
  };
}
var k = Object.defineProperty, L = Object.getOwnPropertyDescriptor, _ = (e) => {
  throw TypeError(e);
}, l = (e, t, i, o) => {
  for (var c = o > 1 ? void 0 : o ? L(t, i) : t, r = e.length - 1, n; r >= 0; r--)
    (n = e[r]) && (c = (o ? n(t, i, c) : n(c)) || c);
  return o && c && k(t, i, c), c;
}, I = (e, t, i) => t.has(e) || _("Cannot " + i), T = (e, t, i) => (I(e, t, "read from private field"), i ? i.call(e) : t.get(e)), N = (e, t, i) => t.has(e) ? _("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), h;
const x = "/umbraco/management/api/v1/newsletter";
let s = class extends $(v) {
  constructor() {
    super(...arguments), N(this, h, C(this)), this._lists = [], this._subscribers = [], this._campaigns = [], this._stats = null, this._loading = !1, this._message = "", this._messageType = "", this._activeTab = "subscribers", this._selectedListId = null, this._newListName = "", this._newSubEmail = "", this._newSubName = "", this._showCampaignForm = !1, this._editingCampaign = null, this._campaignForm = { name: "", subject: "", listId: 0, templateId: "" }, this._selectedStatsCampaignId = null;
  }
  connectedCallback() {
    super.connectedCallback(), this._loadLists(), this._loadCampaigns();
  }
  // ── Shared helpers ────────────────────────────────────────────────────────
  _showMessage(e, t = "success") {
    this._message = e, this._messageType = t, setTimeout(() => {
      this._message = "", this._messageType = "";
    }, 4e3);
  }
  async _api(e, t) {
    try {
      const i = await T(this, h).call(this, `${x}${e}`, {
        headers: { "Content-Type": "application/json", ...t == null ? void 0 : t.headers },
        ...t
      });
      if (i.status === 204) return null;
      if (i.ok) return i.json();
      const o = await i.text();
      return this._showMessage(o || `Request failed (${i.status})`, "error"), null;
    } catch {
      return this._showMessage("Network error", "error"), null;
    }
  }
  // ── List loading ──────────────────────────────────────────────────────────
  async _loadLists() {
    const e = await this._api("/lists");
    e && (this._lists = e);
  }
  async _loadSubscribers(e) {
    this._selectedListId = e, this._loading = !0;
    const t = await this._api(`/lists/${e}/subscribers`);
    this._subscribers = t ?? [], this._loading = !1;
  }
  async _createList() {
    const e = this._newListName.trim();
    if (!e) return;
    await this._api("/lists", {
      method: "POST",
      body: JSON.stringify({ name: e })
    }) && (this._newListName = "", await this._loadLists(), this._showMessage(`List "${e}" created.`));
  }
  async _deleteList(e) {
    this._loading = !0, await this._api(`/lists/${e}`, { method: "DELETE" }), await this._loadLists(), this._selectedListId === e && (this._selectedListId = null, this._subscribers = []), this._loading = !1;
  }
  // ── Subscriber actions ────────────────────────────────────────────────────
  async _subscribe() {
    if (!this._selectedListId) return;
    const e = this._newSubEmail.trim();
    if (!e) return;
    const t = this._newSubName.trim() || null;
    await this._api(
      `/lists/${this._selectedListId}/subscribers`,
      {
        method: "POST",
        body: JSON.stringify({ email: e, name: t })
      }
    ) && (this._newSubEmail = "", this._newSubName = "", await this._loadSubscribers(this._selectedListId), this._showMessage(`Subscriber ${e} added.`));
  }
  async _deleteSubscriber(e) {
    this._loading = !0, await this._api(`/subscribers/${e}`, { method: "DELETE" }), this._selectedListId && await this._loadSubscribers(this._selectedListId), this._loading = !1;
  }
  async _unsubscribe(e, t) {
    this._loading = !0, await this._api(`/lists/${e}/subscribers/${encodeURIComponent(t)}`, {
      method: "DELETE"
    }), this._selectedListId && await this._loadSubscribers(this._selectedListId), this._loading = !1;
  }
  // ── Campaign actions ─────────────────────────────────────────────────────
  async _loadCampaigns() {
    const e = await this._api("/campaigns");
    e && (this._campaigns = e);
  }
  _openCreateCampaign() {
    this._editingCampaign = null, this._campaignForm = { name: "", subject: "", listId: 0, templateId: "" }, this._showCampaignForm = !0;
  }
  _openEditCampaign(e) {
    var t;
    this._editingCampaign = e, this._campaignForm = {
      name: e.name,
      subject: e.subject,
      listId: e.listId,
      templateId: ((t = e.templateId) == null ? void 0 : t.toString()) ?? ""
    }, this._showCampaignForm = !0;
  }
  async _saveCampaign() {
    const e = {
      name: this._campaignForm.name.trim(),
      subject: this._campaignForm.subject.trim(),
      listId: this._campaignForm.listId,
      templateId: this._campaignForm.templateId.trim() !== "" ? Number(this._campaignForm.templateId) : null
    };
    if (!e.name) return this._showMessage("Name is required.", "error");
    this._editingCampaign ? await this._api(
      `/campaigns/${this._editingCampaign.id}`,
      { method: "PUT", body: JSON.stringify(e) }
    ) && this._showMessage("Campaign updated.") : await this._api("/campaigns", {
      method: "POST",
      body: JSON.stringify(e)
    }) && this._showMessage("Campaign created."), this._showCampaignForm = !1, await this._loadCampaigns();
  }
  async _deleteCampaign(e) {
    this._loading = !0, await this._api(`/campaigns/${e}`, { method: "DELETE" }), await this._loadCampaigns(), this._loading = !1;
  }
  async _sendCampaign(e) {
    this._loading = !0;
    const t = await this._api(
      `/campaigns/${e}/send`,
      { method: "POST" }
    );
    t && this._showMessage(`Campaign sent to ${t.sent} subscribers.`), await this._loadCampaigns(), this._loading = !1;
  }
  // ── Stats actions ─────────────────────────────────────────────────────────
  async _loadStats(e) {
    this._selectedStatsCampaignId = e, this._loading = !0;
    const t = await this._api(
      `/campaigns/${e}/stats`
    );
    this._stats = t, this._loading = !1;
  }
  async _fetchStatsFromMailgun() {
    if (!this._selectedStatsCampaignId) return;
    this._loading = !0;
    const e = await this._api(
      `/campaigns/${this._selectedStatsCampaignId}/stats/fetch`,
      { method: "POST" }
    );
    e && (this._stats = e, this._showMessage("Stats fetched from Mailgun.")), this._loading = !1;
  }
  // ── Render: Subscribers ──────────────────────────────────────────────────
  _renderSubscribers() {
    return a`
      <uui-box headline="Subscriber Lists">
        <div class="action-row">
          <uui-input
            .value=${this._newListName}
            @input=${(e) => this._newListName = e.target.value}
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
        ${this._lists.length === 0 ? a`<p class="empty">No subscriber lists yet.</p>` : a`
            <uui-table>
              <uui-table-head>
                <uui-table-head-cell>Name</uui-table-head-cell>
                <uui-table-head-cell>Created</uui-table-head-cell>
                <uui-table-head-cell>Actions</uui-table-head-cell>
              </uui-table-head>
              ${this._lists.map(
      (e) => a`
                  <uui-table-row>
                    <uui-table-cell>
                      <uui-button
                        look="secondary"
                        label="View subscribers"
                        @click=${() => this._loadSubscribers(e.id)}
                        >${e.name}</uui-button
                      >
                    </uui-table-cell>
                    <uui-table-cell
                      >${new Date(e.createdAt).toLocaleDateString()}</uui-table-cell
                    >
                    <uui-table-cell>
                      <uui-button
                        look="danger"
                        label="Delete list"
                        @click=${() => this._deleteList(e.id)}
                        >Delete</uui-button
                      >
                    </uui-table-cell>
                  </uui-table-row>
                `
    )}
            </uui-table>
          `}
      </uui-box>

      ${this._selectedListId ? a`
            <uui-box headline="Subscribers">
              <div class="action-row">
                <uui-input
                  .value=${this._newSubEmail}
                  @input=${(e) => this._newSubEmail = e.target.value}
                  placeholder="email@example.com"
                  style="flex:1; max-width: 240px;"
                ></uui-input>
                <uui-input
                  .value=${this._newSubName}
                  @input=${(e) => this._newSubName = e.target.value}
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
              ${this._subscribers.length === 0 ? a`<p class="empty">No subscribers in this list.</p>` : a`
                  <uui-table>
                    <uui-table-head>
                      <uui-table-head-cell>Email</uui-table-head-cell>
                      <uui-table-head-cell>Name</uui-table-head-cell>
                      <uui-table-head-cell>Status</uui-table-head-cell>
                      <uui-table-head-cell>Subscribed</uui-table-head-cell>
                      <uui-table-head-cell>Actions</uui-table-head-cell>
                    </uui-table-head>
                    ${this._subscribers.map(
      (e) => a`
                        <uui-table-row>
                          <uui-table-cell>${e.email}</uui-table-cell>
                          <uui-table-cell>${e.name ?? "—"}</uui-table-cell>
                          <uui-table-cell>
                            <uui-badge
                              look=${e.active ? "positive" : "default"}
                              >${e.active ? "Active" : "Inactive"}</uui-badge
                            >
                          </uui-table-cell>
                          <uui-table-cell
                            >${new Date(
        e.subscribedAt
      ).toLocaleDateString()}</uui-table-cell
                          >
                          <uui-table-cell>
                            ${e.active ? a`<uui-button
                                  look="danger"
                                  label="Unsubscribe"
                                  @click=${() => this._unsubscribe(e.listId, e.email)}
                                  >Unsub</uui-button
                                >` : a`<uui-button
                                  look="danger"
                                  label="Delete"
                                  @click=${() => this._deleteSubscriber(e.id)}
                                  >Delete</uui-button
                                >`}
                          </uui-table-cell>
                        </uui-table-row>
                      `
    )}
                  </uui-table>
                `}
            </uui-box>
          ` : ""}
    `;
  }
  // ── Render: Campaigns ─────────────────────────────────────────────────────
  _renderCampaignForm() {
    return a`
      <uui-box headline=${this._editingCampaign ? "Edit Campaign" : "New Campaign"}>
        <div class="form-grid">
          <div class="form-field">
            <label>Campaign Name</label>
            <uui-input
              .value=${this._campaignForm.name}
              @input=${(e) => this._campaignForm.name = e.target.value}
              placeholder="My Campaign"
            ></uui-input>
          </div>
          <div class="form-field">
            <label>Subject Line</label>
            <uui-input
              .value=${this._campaignForm.subject}
              @input=${(e) => this._campaignForm.subject = e.target.value}
              placeholder="Email subject..."
            ></uui-input>
          </div>
          <div class="form-field">
            <label>List</label>
            <select
              class="uui-select"
              .value=${String(this._campaignForm.listId)}
              @change=${(e) => this._campaignForm.listId = Number(
      e.target.value
    )}
            >
              <option value="0">Select a list...</option>
              ${this._lists.map(
      (e) => a`<option value=${e.id}>${e.name}</option>`
    )}
            </select>
          </div>
          <div class="form-field">
            <label>Email Template ID (optional)</label>
            <uui-input
              .value=${this._campaignForm.templateId}
              @input=${(e) => this._campaignForm.templateId = e.target.value}
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
            @click=${() => this._showCampaignForm = !1}
            >Cancel</uui-button
          >
        </div>
      </uui-box>
    `;
  }
  _renderCampaigns() {
    return a`
      <uui-box headline="Campaigns">
        <uui-button
          slot="header-actions"
          look="primary"
          label="New Campaign"
          @click=${this._openCreateCampaign}
          >New Campaign</uui-button
        >
        ${this._campaigns.length === 0 ? a`<p class="empty">No campaigns yet.</p>` : a`
            <uui-table>
              <uui-table-head>
                <uui-table-head-cell>Name</uui-table-head-cell>
                <uui-table-head-cell>Subject</uui-table-head-cell>
                <uui-table-head-cell>Status</uui-table-head-cell>
                <uui-table-head-cell>Created</uui-table-head-cell>
                <uui-table-head-cell>Actions</uui-table-head-cell>
              </uui-table-head>
              ${this._campaigns.map(
      (e) => a`
                  <uui-table-row>
                    <uui-table-cell>${e.name}</uui-table-cell>
                    <uui-table-cell>${e.subject}</uui-table-cell>
                    <uui-table-cell>
                      <uui-badge
                        look=${e.status === "Sent" ? "positive" : e.status === "Sending" ? "warning" : "default"}
                        >${e.status}</uui-badge
                      >
                    </uui-table-cell>
                    <uui-table-cell
                      >${new Date(e.createdAt).toLocaleDateString()}</uui-table-cell
                    >
                    <uui-table-cell>
                      <div class="action-row">
                        <uui-button
                          look="secondary"
                          label="Edit"
                          @click=${() => this._openEditCampaign(e)}
                          >Edit</uui-button
                        >
                        ${e.status === "Draft" ? a`<uui-button
                              look="primary"
                              label="Send"
                              @click=${() => this._sendCampaign(e.id)}
                              >Send</uui-button
                            >` : ""}
                        <uui-button
                          look="danger"
                          label="Delete"
                          @click=${() => this._deleteCampaign(e.id)}
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
  _renderAnalytics() {
    return a`
      <uui-box headline="Campaign Analytics">
        <div class="action-row">
          <select
            class="uui-select"
            @change=${(e) => {
      const t = Number(e.target.value);
      t && this._loadStats(t);
    }}
          >
            <option value="0">Select a campaign...</option>
            ${this._campaigns.filter((e) => e.status === "Sent" || e.status === "Sending").map(
      (e) => a`<option value=${e.id}>${e.name}</option>`
    )}
          </select>
          ${this._stats ? a`<uui-button
                look="secondary"
                label="Fetch from Mailgun"
                @click=${this._fetchStatsFromMailgun}
                >Fetch from Mailgun</uui-button
              >` : ""}
        </div>
      </uui-box>

      ${this._stats ? a`
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
        ` : a`<p class="empty">Select a campaign to view statistics.</p>`}
    `;
  }
  // ── Main render ───────────────────────────────────────────────────────────
  render() {
    return a`
      <div class="dashboard">
        ${this._message ? a`<div class="message ${this._messageType}">${this._message}</div>` : ""}

        <div class="header">
          <h1>Newsletter</h1>
          <p>Manage subscriber lists, campaigns, and analytics.</p>
        </div>

        <uui-tab-group>
          <uui-tab
            label="Subscribers"
            ?active=${this._activeTab === "subscribers"}
            @click=${() => this._activeTab = "subscribers"}
            >Subscribers</uui-tab
          >
          <uui-tab
            label="Campaigns"
            ?active=${this._activeTab === "campaigns"}
            @click=${() => this._activeTab = "campaigns"}
            >Campaigns</uui-tab
          >
          <uui-tab
            label="Analytics"
            ?active=${this._activeTab === "analytics"}
            @click=${() => this._activeTab = "analytics"}
            >Analytics</uui-tab
          >
        </uui-tab-group>

        <div class="tab-content">
          ${this._activeTab === "subscribers" ? this._renderSubscribers() : ""}
          ${this._activeTab === "campaigns" ? this._renderCampaigns() : ""}
          ${this._activeTab === "analytics" ? this._renderAnalytics() : ""}
        </div>
      </div>
    `;
  }
};
h = /* @__PURE__ */ new WeakMap();
s.styles = f`
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
l([
  u()
], s.prototype, "_lists", 2);
l([
  u()
], s.prototype, "_subscribers", 2);
l([
  u()
], s.prototype, "_campaigns", 2);
l([
  u()
], s.prototype, "_stats", 2);
l([
  u()
], s.prototype, "_loading", 2);
l([
  u()
], s.prototype, "_message", 2);
l([
  u()
], s.prototype, "_messageType", 2);
l([
  u()
], s.prototype, "_activeTab", 2);
l([
  u()
], s.prototype, "_selectedListId", 2);
l([
  u()
], s.prototype, "_newListName", 2);
l([
  u()
], s.prototype, "_newSubEmail", 2);
l([
  u()
], s.prototype, "_newSubName", 2);
l([
  u()
], s.prototype, "_showCampaignForm", 2);
l([
  u()
], s.prototype, "_editingCampaign", 2);
l([
  u()
], s.prototype, "_campaignForm", 2);
l([
  u()
], s.prototype, "_selectedStatsCampaignId", 2);
s = l([
  w("newsletter-dashboard")
], s);
export {
  s as NewsletterDashboardElement
};
//# sourceMappingURL=newsletter-dashboard.js.map
