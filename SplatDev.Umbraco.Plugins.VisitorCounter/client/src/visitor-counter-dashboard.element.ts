import { LitElement, html, css, customElement, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";

import { createAuthFetch } from "./auth-fetch";

interface VisitorStats {
  totalVisits: number;
  uniqueVisits: number;
  periodDays: number;
}

interface DailyCount {
  date: string;
  totalVisits: number;
  uniqueVisits: number;
}

@customElement("visitor-counter-dashboard")
export class VisitorCounterDashboardElement extends UmbElementMixin(LitElement) {
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
      color: var(--uui-color-text);
    }

    p.description {
      color: var(--uui-color-text-alt, #6b7280);
      margin: 0 0 24px;
    }

    .stats-grid {
      display: flex;
      gap: var(--uui-size-4);
      flex-wrap: wrap;
      margin-bottom: var(--uui-size-layout-1);
    }

    .stat-card {
      flex: 1;
      min-width: 160px;
      padding: 20px 24px;
      background: var(--uui-color-surface-alt, #f8f9fa);
      border: 1px solid var(--uui-color-border, #dee2e6);
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .stat-value {
      font-size: 2.25rem;
      font-weight: 700;
      color: var(--uui-color-text);
      line-height: 1;
    }

    .stat-label {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--uui-color-text-alt);
      margin-top: 6px;
    }

    .toolbar {
      display: flex;
      gap: var(--uui-size-4);
      align-items: center;
      margin-bottom: var(--uui-size-4);
    }

    .empty-state {
      padding: 32px;
      text-align: center;
      color: var(--uui-color-text-alt);
    }

    uui-table {
      width: 100%;
    }
  `;

  @state() private _loading = false;
  @state() private _stats: VisitorStats | null = null;
  @state() private _daily: DailyCount[] = [];
  @state() private _error: string | null = null;
  @state() private _days = 30;

  override connectedCallback(): void {
    super.connectedCallback();
    this._load();
  }

  private async _load(): Promise<void> {
    this._loading = true;
    this._error = null;

    try {
      const [statsRes, dailyRes] = await Promise.all([
        this.#fetch(`/umbraco/api/visitorcounter/GetStats?days=${this._days}`),
        this.#fetch(`/umbraco/api/visitorcounter/GetDailyCounts?days=${this._days}`),
      ]);

      if (!statsRes.ok) throw new Error(`Stats HTTP ${statsRes.status}`);
      if (!dailyRes.ok) throw new Error(`Daily HTTP ${dailyRes.status}`);

      this._stats = (await statsRes.json()) as VisitorStats;
      const raw = (await dailyRes.json()) as DailyCount[];
      // Sort descending by date for display
      this._daily = raw.slice().sort((a, b) => b.date.localeCompare(a.date));
    } catch (err) {
      this._error = err instanceof Error ? err.message : "Unknown error";
    } finally {
      this._loading = false;
    }
  }

  override render() {
    return html`
      <h1>Visitor Counter</h1>
      <p class="description">Site visitor statistics for the last ${this._days} days.</p>

      ${this._stats
        ? html`
            <div class="stats-grid">
              <div class="stat-card">
                <span class="stat-value">${this._stats.totalVisits.toLocaleString()}</span>
                <span class="stat-label">Total Visits (all time)</span>
              </div>
              <div class="stat-card">
                <span class="stat-value">${this._stats.uniqueVisits.toLocaleString()}</span>
                <span class="stat-label">Unique Visitors (${this._days}d)</span>
              </div>
            </div>
          `
        : ""}

      <uui-box>
        <div class="toolbar">
          <uui-button
            look="secondary"
            label="Refresh"
            ?disabled=${this._loading}
            @click=${this._load}
          >${this._loading ? "Loading…" : "Refresh"}</uui-button>
        </div>

        ${this._error
          ? html`<uui-tag color="danger">${this._error}</uui-tag>`
          : this._loading
          ? html`<uui-loader></uui-loader>`
          : this._daily.length === 0
          ? html`<div class="empty-state">No visitor data recorded yet.</div>`
          : html`
              <uui-table>
                <uui-table-head>
                  <uui-table-head-cell>Date</uui-table-head-cell>
                  <uui-table-head-cell>Total Visits</uui-table-head-cell>
                  <uui-table-head-cell>Unique Visitors</uui-table-head-cell>
                </uui-table-head>
                ${this._daily.map(
                  (day) => html`
                    <uui-table-row>
                      <uui-table-cell>${day.date}</uui-table-cell>
                      <uui-table-cell>${day.totalVisits.toLocaleString()}</uui-table-cell>
                      <uui-table-cell>${day.uniqueVisits.toLocaleString()}</uui-table-cell>
                    </uui-table-row>
                  `
                )}
              </uui-table>
            `}
      </uui-box>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "visitor-counter-dashboard": VisitorCounterDashboardElement;
  }
}
