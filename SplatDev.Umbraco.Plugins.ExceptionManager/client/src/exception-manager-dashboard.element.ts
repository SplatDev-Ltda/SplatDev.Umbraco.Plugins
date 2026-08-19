import { LitElement, html, css, customElement, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";

import { createAuthFetch } from "./auth-fetch";

// NOTE: The API endpoint /umbraco/management/api/v1/exception-manager is pending
// Phase 3 backend deployment. The Refresh button and filter input are wired up
// but the fetch call is guarded behind an availability flag until Phase 3 is live.

interface ExceptionEntry {
  url: string;
  ip: string;
  statusCode: number;
  date: string;
  message: string;
}

@customElement("exception-manager-dashboard")
export class ExceptionManagerDashboardElement extends UmbElementMixin(LitElement) {
  readonly #fetch = createAuthFetch(this);

  static override styles = css`
    :host {
      display: block;
      padding: var(--uui-size-layout-1);
    }

    .dashboard-header {
      margin-bottom: var(--uui-size-layout-2);
    }

    .dashboard-header h1 {
      margin: 0 0 var(--uui-size-4) 0;
      font-size: var(--uui-size-10);
      font-weight: 700;
      color: var(--uui-color-text);
    }

    .dashboard-header p {
      margin: 0;
      color: var(--uui-color-text-alt);
      font-size: var(--uui-size-5);
    }

    .section {
      margin-bottom: var(--uui-size-layout-2);
    }

    .toolbar {
      display: flex;
      gap: var(--uui-size-4);
      align-items: center;
      margin-bottom: var(--uui-size-4);
      flex-wrap: wrap;
    }

    .toolbar uui-input {
      flex: 1;
      min-width: 240px;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--uui-size-layout-3) var(--uui-size-layout-1);
      color: var(--uui-color-text-alt);
      gap: var(--uui-size-4);
    }

    .empty-state uui-icon {
      font-size: 3rem;
      opacity: 0.4;
    }

    .empty-state p {
      margin: 0;
      font-size: var(--uui-size-5);
    }

    uui-table {
      width: 100%;
    }

    uui-table-head-cell {
      font-weight: 600;
    }

    .pending-notice {
      display: flex;
      align-items: flex-start;
      gap: var(--uui-size-3);
      font-size: var(--uui-size-5);
      color: var(--uui-color-text-alt);
      line-height: 1.6;
    }

    .pending-notice uui-icon {
      flex-shrink: 0;
      margin-top: 2px;
    }
  `;

  @state()
  private _filter = "";

  @state()
  private _loading = false;

  @state()
  private _exceptions: ExceptionEntry[] = [];

  // Phase 3 BE: set this to true once the backend API is deployed.
  private readonly _apiAvailable = false;
  private readonly _apiBase = "/umbraco/management/api/v1/exception-manager";

  private _handleFilterInput(e: Event): void {
    const input = e.target as HTMLInputElement;
    this._filter = input.value;
  }

  private async _refresh(): Promise<void> {
    // TODO (Phase 3 BE): Remove the guard below once the API is deployed.
    if (!this._apiAvailable) {
      return;
    }

    this._loading = true;
    try {
      const url = this._filter
        ? `${this._apiBase}?filter=${encodeURIComponent(this._filter)}`
        : this._apiBase;

      const response = await this.#fetch(url, {
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        const data = (await response.json()) as ExceptionEntry[];
        this._exceptions = data;
      }
    } catch (_err) {
      // Silently fail until Phase 3 BE is available.
    } finally {
      this._loading = false;
    }
  }

  private get _filteredExceptions(): ExceptionEntry[] {
    if (!this._filter.trim()) return this._exceptions;
    const q = this._filter.toLowerCase();
    return this._exceptions.filter(
      (ex) =>
        ex.url.toLowerCase().includes(q) ||
        ex.ip.includes(q) ||
        ex.message.toLowerCase().includes(q) ||
        String(ex.statusCode).includes(q)
    );
  }

  override render() {
    const filtered = this._filteredExceptions;

    return html`
      <div class="dashboard-header">
        <h1>Exception Manager</h1>
        <p>
          View and filter exceptions logged by the application. Drill into
          individual records to inspect request details.
        </p>
      </div>

      <div class="section">
        <uui-box headline="API Status">
          <div class="pending-notice">
            <uui-icon name="alert"></uui-icon>
            <span>
              The exception log API
              (<code>/umbraco/management/api/v1/exception-manager</code>) will
              be available once the <strong>Phase 3 backend</strong> is
              deployed. The table below is currently showing a placeholder
              empty state.
            </span>
          </div>
        </uui-box>
      </div>

      <div class="section">
        <uui-box headline="Exception Log">
          <div class="toolbar">
            <uui-input
              type="search"
              placeholder="Filter by URL, IP, status code, or message…"
              label="Filter exceptions"
              .value=${this._filter}
              @input=${this._handleFilterInput}
            ></uui-input>
            <uui-button
              look="secondary"
              label="Refresh"
              ?disabled=${this._loading || !this._apiAvailable}
              @click=${this._refresh}
            >
              ${this._loading ? "Loading…" : "Refresh"}
            </uui-button>
          </div>

          ${filtered.length > 0
            ? html`
                <uui-table>
                  <uui-table-head>
                    <uui-table-head-cell>URL</uui-table-head-cell>
                    <uui-table-head-cell>IP</uui-table-head-cell>
                    <uui-table-head-cell>Status Code</uui-table-head-cell>
                    <uui-table-head-cell>Date</uui-table-head-cell>
                    <uui-table-head-cell>Message</uui-table-head-cell>
                  </uui-table-head>
                  ${filtered.map(
                    (ex) => html`
                      <uui-table-row>
                        <uui-table-cell>${ex.url}</uui-table-cell>
                        <uui-table-cell>${ex.ip}</uui-table-cell>
                        <uui-table-cell>${ex.statusCode}</uui-table-cell>
                        <uui-table-cell>${ex.date}</uui-table-cell>
                        <uui-table-cell>${ex.message}</uui-table-cell>
                      </uui-table-row>
                    `
                  )}
                </uui-table>
              `
            : html`
                <uui-table>
                  <uui-table-head>
                    <uui-table-head-cell>URL</uui-table-head-cell>
                    <uui-table-head-cell>IP</uui-table-head-cell>
                    <uui-table-head-cell>Status Code</uui-table-head-cell>
                    <uui-table-head-cell>Date</uui-table-head-cell>
                    <uui-table-head-cell>Message</uui-table-head-cell>
                  </uui-table-head>
                </uui-table>
                <div class="empty-state">
                  <uui-icon name="info"></uui-icon>
                  <p>No exceptions logged.</p>
                </div>
              `}
        </uui-box>
      </div>
    `;
  }
}

export default ExceptionManagerDashboardElement;

declare global {
  interface HTMLElementTagNameMap {
    "exception-manager-dashboard": ExceptionManagerDashboardElement;
  }
}
