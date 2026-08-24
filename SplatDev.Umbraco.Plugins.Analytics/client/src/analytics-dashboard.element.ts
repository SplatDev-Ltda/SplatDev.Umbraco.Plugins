import { LitElement, html, css, nothing } from "@umbraco-cms/backoffice/external/lit";
import { customElement, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";

import { createAuthFetch } from "./auth-fetch";

interface DailyCount {
  date: string;
  count: number;
}

interface Summary {
  totalVisits: number;
  uniqueVisitors: number;
  recurringVisits: number;
  realTimeVisits: number;
  botVisits: number;
  daily: DailyCount[];
}

interface VisitFilter {
  filter: string;
  count: number;
}

interface Visit {
  id: number;
  contentNodeId: number;
  ipAddress?: string;
  entryUrl?: string;
  exitUrl?: string;
  resolution?: string;
  country?: string;
  city?: string;
  visitStarted: string;
  visitFinished?: string | null;
  recurringVisit: boolean;
  visitLength?: string | null;
}

interface Paged<T> {
  results: T[];
  pageNumber: number;
  pageSize: number;
  found: number;
  totalPages: number;
}

/**
 * First-party visitor analytics.
 *
 * This replaces a placeholder that described Google Analytics GA4 and called nothing —
 * the plugin had been reduced to a shim forwarding to the GoogleAnalytics package, so the
 * self-hosted analytics the v7/v8 plugin provided was simply missing.
 */
@customElement("analytics-dashboard")
export class AnalyticsDashboardElement extends UmbElementMixin(LitElement) {
  static override styles = css`
    :host { display: block; padding: var(--uui-size-layout-1, 24px); }
    h1 { font-size: 1.5rem; font-weight: 600; margin: 0 0 6px; }
    .description { color: var(--uui-color-text-alt, #6b7280); margin: 0 0 22px; max-width: 64ch; }

    uui-box { margin-bottom: 18px; }

    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 14px; }
    .stat {
      background: var(--uui-color-surface-alt, #f6f6f7);
      border-radius: 6px;
      padding: 14px 16px;
    }
    .stat__value { font-size: 1.7rem; font-weight: 700; font-variant-numeric: tabular-nums; line-height: 1.1; }
    .stat__label {
      font-size: 0.72rem; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase;
      color: var(--uui-color-text-alt, #6b7280); margin-top: 4px;
    }
    .stat--live .stat__value { color: var(--uui-color-positive, #2f9e44); }

    .chart { display: flex; align-items: flex-end; gap: 2px; height: 120px; margin-top: 6px; }
    .chart__bar {
      flex: 1 1 0;
      min-width: 2px;
      background: var(--uui-color-selected, #3544b1);
      border-radius: 2px 2px 0 0;
      min-height: 1px;
    }
    .chart__bar[data-empty="true"] { background: var(--uui-color-border, #e5e7eb); }
    .chart__axis {
      display: flex; justify-content: space-between;
      font-size: 0.72rem; color: var(--uui-color-text-alt, #6b7280); margin-top: 6px;
    }

    table { width: 100%; border-collapse: collapse; }
    th {
      text-align: left; font-size: 0.72rem; letter-spacing: 0.05em; text-transform: uppercase;
      color: var(--uui-color-text-alt, #6b7280); padding: 8px 10px; white-space: nowrap;
      border-bottom: 1px solid var(--uui-color-border, #e5e7eb);
    }
    td { padding: 9px 10px; border-bottom: 1px solid var(--uui-color-border, #e5e7eb); font-size: 0.9rem; }
    tr:last-child td { border-bottom: none; }
    td.num { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
    .truncate { max-width: 340px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .empty { color: var(--uui-color-text-alt, #6b7280); padding: 14px 10px; }
    .two-up { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 18px; }

    .tag {
      display: inline-block; padding: 1px 7px; border-radius: 9999px;
      font-size: 0.68rem; font-weight: 700; text-transform: uppercase;
      background: var(--uui-color-surface-alt, #f3f4f6);
    }

    .actions { display: flex; gap: 10px; align-items: center; margin-top: 14px; flex-wrap: wrap; }

    .splatdev-load-error {
      display: block; margin: 0 0 14px; padding: 12px 14px;
      border-left: 3px solid var(--uui-color-danger, #d42054);
      background: var(--uui-color-danger-emphasis, #fdeaef);
      color: var(--uui-color-danger-contrast, #6d0f28);
      font-size: 0.9rem; border-radius: 3px;
    }
  `;

  @state() private _summary: Summary | null = null;
  @state() private _entry: VisitFilter[] = [];
  @state() private _exit: VisitFilter[] = [];
  @state() private _countries: VisitFilter[] = [];
  @state() private _visits: Paged<Visit> | null = null;
  @state() private _loading = true;
  @state() private _days = 30;
  @state() private _loadError: string | null = null;

  readonly #fetch = createAuthFetch(this);
  private readonly _api = "/umbraco/api/analyticsstats";

  override connectedCallback(): void {
    super.connectedCallback();
    void this.#load();
  }

  /**
   * A dashboard that gates on response.ok and renders its empty state otherwise makes a
   * 401 indistinguishable from a site with no traffic. Failures are surfaced instead.
   */
  async #get<T>(path: string): Promise<T | null> {
    try {
      const response = await this.#fetch(`${this._api}${path}`);
      if (response.ok) return (await response.json()) as T;

      this._loadError =
        response.status === 401 || response.status === 403
          ? "You are not authorised to read analytics. The request was refused, so anything shown below may be incomplete."
          : `The request did not succeed — the server returned ${response.status}${response.statusText ? ` ${response.statusText}` : ""}.`;
      return null;
    } catch {
      this._loadError ??= "The request failed. See the browser console for details.";
      return null;
    }
  }

  async #load(): Promise<void> {
    this._loading = true;
    this._loadError = null;

    const [summary, entry, exit, countries, visits] = await Promise.all([
      this.#get<Summary>(`/summary?days=${this._days}`),
      this.#get<VisitFilter[]>("/by-entry-url?take=10"),
      this.#get<VisitFilter[]>("/by-exit-url?take=10"),
      this.#get<VisitFilter[]>("/results-by?filter=country&take=10"),
      this.#get<Paged<Visit>>("/visits?page=1&pageSize=20"),
    ]);

    if (summary) this._summary = summary;
    if (entry) this._entry = entry;
    if (exit) this._exit = exit;
    if (countries) this._countries = countries;
    if (visits) this._visits = visits;
    this._loading = false;
  }

  #setDays(days: number): void {
    this._days = days;
    void this.#load();
  }

  #when(iso: string | null | undefined): string {
    if (!iso) return "—";
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? iso : d.toLocaleString();
  }

  #renderChart() {
    const daily = this._summary?.daily ?? [];
    if (daily.length === 0) return nothing;

    const peak = Math.max(1, ...daily.map((d) => d.count));
    const first = daily[0]?.date ?? "";
    const last = daily[daily.length - 1]?.date ?? "";

    return html`
      <div class="chart" role="img" aria-label="Visits per day over the last ${this._days} days">
        ${daily.map(
          (d) => html`<div
            class="chart__bar"
            data-empty=${d.count === 0 ? "true" : "false"}
            style="height: ${Math.round((d.count / peak) * 100)}%"
            title="${d.date}: ${d.count} visit${d.count === 1 ? "" : "s"}"
          ></div>`,
        )}
      </div>
      <div class="chart__axis"><span>${first}</span><span>peak ${peak}</span><span>${last}</span></div>
    `;
  }

  #renderBreakdown(title: string, rows: VisitFilter[], header: string) {
    return html`
      <uui-box headline=${title}>
        ${rows.length === 0
          ? html`<p class="empty">Nothing recorded yet.</p>`
          : html`
              <table>
                <thead><tr><th>${header}</th><th class="num">Visits</th></tr></thead>
                <tbody>
                  ${rows.map(
                    (r) => html`<tr>
                      <td><div class="truncate" title=${r.filter}>${r.filter}</div></td>
                      <td class="num">${r.count}</td>
                    </tr>`,
                  )}
                </tbody>
              </table>
            `}
      </uui-box>
    `;
  }

  override render() {
    const s = this._summary;

    return html`
      <h1>Analytics</h1>
      <p class="description">
        Visits recorded by this site, stored in your own database. Automated traffic is
        identified and excluded from the figures below.
      </p>

      ${this._loadError
        ? html`<div class="splatdev-load-error" role="alert">${this._loadError}</div>`
        : nothing}

      ${this._loading
        ? html`<uui-loader></uui-loader>`
        : html`
            <uui-box headline="Overview">
              <div class="stats">
                <div class="stat"><div class="stat__value">${s?.totalVisits ?? 0}</div><div class="stat__label">Total visits</div></div>
                <div class="stat"><div class="stat__value">${s?.uniqueVisitors ?? 0}</div><div class="stat__label">Unique visitors</div></div>
                <div class="stat"><div class="stat__value">${s?.recurringVisits ?? 0}</div><div class="stat__label">Returning</div></div>
                <div class="stat stat--live"><div class="stat__value">${s?.realTimeVisits ?? 0}</div><div class="stat__label">Active now</div></div>
                <div class="stat"><div class="stat__value">${s?.botVisits ?? 0}</div><div class="stat__label">Bots excluded</div></div>
              </div>

              ${this.#renderChart()}

              <div class="actions">
                ${[7, 30, 90].map(
                  (d) => html`<uui-button
                    look=${this._days === d ? "primary" : "secondary"}
                    label="Last ${d} days"
                    @click=${() => this.#setDays(d)}
                    >Last ${d} days</uui-button
                  >`,
                )}
                <uui-button look="secondary" label="Refresh" @click=${() => this.#load()}>Refresh</uui-button>
              </div>
            </uui-box>

            <div class="two-up">
              ${this.#renderBreakdown("Entry pages", this._entry, "Url")}
              ${this.#renderBreakdown("Exit pages", this._exit, "Url")}
            </div>

            ${this._countries.length > 0 ? this.#renderBreakdown("Countries", this._countries, "Country") : nothing}

            <uui-box headline="Recent visits">
              ${!this._visits || this._visits.results.length === 0
                ? html`<p class="empty">
                    No visits recorded yet. Add the tracking component to your templates —
                    <code>@await Component.InvokeAsync("Analytics", new { nodeId = Model.Id })</code>
                  </p>`
                : html`
                    <table>
                      <thead>
                        <tr>
                          <th>Started</th><th>Entry</th><th>Exit</th>
                          <th>Stayed</th><th>Where</th><th>Screen</th><th></th>
                        </tr>
                      </thead>
                      <tbody>
                        ${this._visits.results.map(
                          (v) => html`
                            <tr>
                              <td class="num">${this.#when(v.visitStarted)}</td>
                              <td><div class="truncate" title=${v.entryUrl ?? ""}>${v.entryUrl ?? "—"}</div></td>
                              <td><div class="truncate" title=${v.exitUrl ?? ""}>${v.exitUrl ?? "—"}</div></td>
                              <td class="num">${v.visitLength ?? "—"}</td>
                              <td>${[v.city, v.country].filter(Boolean).join(", ") || "—"}</td>
                              <td class="num">${v.resolution ?? "—"}</td>
                              <td>${v.recurringVisit ? html`<span class="tag">returning</span>` : nothing}</td>
                            </tr>
                          `,
                        )}
                      </tbody>
                    </table>
                    <p class="empty">
                      Showing ${this._visits.results.length} of ${this._visits.found} recorded visits.
                    </p>
                  `}
            </uui-box>
          `}
    `;
  }
}

export default AnalyticsDashboardElement;

declare global {
  interface HTMLElementTagNameMap {
    "analytics-dashboard": AnalyticsDashboardElement;
  }
}
