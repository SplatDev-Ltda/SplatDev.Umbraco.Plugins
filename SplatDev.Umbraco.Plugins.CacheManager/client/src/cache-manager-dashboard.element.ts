import {
  LitElement,
  css,
  html,
  customElement,
  state,
} from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";

import { createAuthFetch } from "./auth-fetch";

interface CacheEntry {
  id: number;
  url: string;
  status: string;
  cachedAt: string;
}

interface UrlNotFound {
  url: string;
  referrer?: string;
  date: string;
}

interface CacheStats {
  count: number;
  dbKeys: string[];
  methodKeys: string[];
}

const API_BASE = "/umbraco/backoffice/api/CacheWarmer";

@customElement("cache-manager-dashboard")
export class CacheManagerDashboardElement extends UmbElementMixin(LitElement) {
  readonly #fetch = createAuthFetch(this);

  @state() private _stats: CacheStats | null = null;
  @state() private _history: CacheEntry[] = [];
  @state() private _notFound: UrlNotFound[] = [];
  @state() private _loading = false;
  @state() private _message = "";
  @state() private _activeTab: "overview" | "history" | "notfound" = "overview";

  connectedCallback() {
    super.connectedCallback();
    this._loadAll();
  }

  private async _loadAll() {
    this._loading = true;
    await Promise.all([
      this._loadStats(),
      this._loadHistory(),
      this._loadNotFound(),
    ]);
    this._loading = false;
  }

  private async _loadStats() {
    try {
      const r = await this.#fetch(`${API_BASE}/GetStatistics`);
      if (r.ok) this._stats = await r.json();
    } catch {
      // stats endpoint requires preview features — may not be available
    }
  }

  private async _loadHistory() {
    try {
      const r = await this.#fetch(`${API_BASE}/GetLastTask`);
      if (r.ok) this._history = await r.json();
    } catch {
      this._history = [];
    }
  }

  private async _loadNotFound() {
    try {
      const r = await this.#fetch(`${API_BASE}/GetUrlNotFound`);
      if (r.ok) this._notFound = await r.json();
    } catch {
      this._notFound = [];
    }
  }

  private async _clearCache() {
    this._loading = true;
    try {
      const r = await this.#fetch(`${API_BASE}/ClearCache`, { method: "POST" });
      this._message = r.ok ? "Cache cleared successfully." : "Failed to clear cache.";
    } catch {
      this._message = "Error clearing cache.";
    }
    this._loading = false;
  }

  private async _refreshCache() {
    this._loading = true;
    this._message = "Refreshing cache — this may take a moment...";
    try {
      const r = await this.#fetch(`${API_BASE}/RefreshCache`, { method: "POST" });
      this._message = r.ok ? "Cache refreshed successfully." : "Failed to refresh cache.";
      if (r.ok) await this._loadHistory();
    } catch {
      this._message = "Error refreshing cache.";
    }
    this._loading = false;
  }

  private async _clearLog() {
    try {
      await this.#fetch(`${API_BASE}/ClearLog`, { method: "POST" });
      this._history = [];
      this._message = "Cache log cleared.";
    } catch {
      this._message = "Error clearing log.";
    }
  }

  private _renderOverview() {
    return html`
      <uui-box headline="Cache Actions">
        ${this._message
          ? html`<div class="message">${this._message}</div>`
          : ""}
        <div class="action-row">
          <uui-button
            look="primary"
            label="Refresh Cache"
            ?disabled=${this._loading}
            @click=${this._refreshCache}
          >
            Refresh Cache
          </uui-button>
          <uui-button
            look="danger"
            label="Clear Cache"
            ?disabled=${this._loading}
            @click=${this._clearCache}
          >
            Clear Cache
          </uui-button>
        </div>
      </uui-box>

      ${this._stats
        ? html`
          <uui-box headline="Cache Statistics">
            <div class="stat-grid">
              <div class="stat">
                <span class="stat-value">${this._stats.count}</span>
                <span class="stat-label">Total Keys</span>
              </div>
              <div class="stat">
                <span class="stat-value">${this._stats.dbKeys?.length ?? 0}</span>
                <span class="stat-label">DB Keys</span>
              </div>
              <div class="stat">
                <span class="stat-value">${this._stats.methodKeys?.length ?? 0}</span>
                <span class="stat-label">Method Keys</span>
              </div>
            </div>
          </uui-box>
        `
        : ""}
    `;
  }

  private _renderHistory() {
    return html`
      <uui-box headline="Cache Warm-up History">
        <uui-button
          slot="header-actions"
          look="secondary"
          label="Clear Log"
          @click=${this._clearLog}
        >Clear Log</uui-button>
        ${this._history.length === 0
          ? html`<p class="empty">No cache history available.</p>`
          : html`
            <uui-table>
              <uui-table-head>
                <uui-table-head-cell>URL</uui-table-head-cell>
                <uui-table-head-cell>Status</uui-table-head-cell>
                <uui-table-head-cell>Cached At</uui-table-head-cell>
              </uui-table-head>
              ${this._history.map(
                (e) => html`
                  <uui-table-row>
                    <uui-table-cell>${e.url}</uui-table-cell>
                    <uui-table-cell>${e.status}</uui-table-cell>
                    <uui-table-cell>${new Date(e.cachedAt).toLocaleString()}</uui-table-cell>
                  </uui-table-row>
                `
              )}
            </uui-table>
          `}
      </uui-box>
    `;
  }

  private _renderNotFound() {
    return html`
      <uui-box headline="404 — URLs Not Found">
        ${this._notFound.length === 0
          ? html`<p class="empty">No 404s recorded.</p>`
          : html`
            <uui-table>
              <uui-table-head>
                <uui-table-head-cell>URL</uui-table-head-cell>
                <uui-table-head-cell>Referrer</uui-table-head-cell>
                <uui-table-head-cell>Date</uui-table-head-cell>
              </uui-table-head>
              ${this._notFound.map(
                (e) => html`
                  <uui-table-row>
                    <uui-table-cell>${e.url}</uui-table-cell>
                    <uui-table-cell>${e.referrer ?? "—"}</uui-table-cell>
                    <uui-table-cell>${new Date(e.date).toLocaleString()}</uui-table-cell>
                  </uui-table-row>
                `
              )}
            </uui-table>
          `}
      </uui-box>
    `;
  }

  override render() {
    return html`
      <div class="dashboard">
        <div class="header">
          <h1>Cache Manager</h1>
          <p>Manage the Umbraco content cache and monitor cache warm-up activity.</p>
        </div>

        <uui-tab-group>
          <uui-tab
            label="Overview"
            ?active=${this._activeTab === "overview"}
            @click=${() => (this._activeTab = "overview")}
          >Overview</uui-tab>
          <uui-tab
            label="History"
            ?active=${this._activeTab === "history"}
            @click=${() => (this._activeTab = "history")}
          >History</uui-tab>
          <uui-tab
            label="404s"
            ?active=${this._activeTab === "notfound"}
            @click=${() => (this._activeTab = "notfound")}
          >404s (${this._notFound.length})</uui-tab>
        </uui-tab-group>

        <div class="tab-content">
          ${this._activeTab === "overview" ? this._renderOverview() : ""}
          ${this._activeTab === "history" ? this._renderHistory() : ""}
          ${this._activeTab === "notfound" ? this._renderNotFound() : ""}
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
    }
    .message {
      padding: var(--uui-size-space-3);
      background: var(--uui-color-surface-alt);
      border-radius: var(--uui-border-radius);
      margin-bottom: var(--uui-size-space-3);
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
    uui-table {
      width: 100%;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "cache-manager-dashboard": CacheManagerDashboardElement;
  }
}
