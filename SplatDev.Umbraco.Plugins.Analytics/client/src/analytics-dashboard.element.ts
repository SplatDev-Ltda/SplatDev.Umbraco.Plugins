import { LitElement, html, css } from "@umbraco-cms/backoffice/external/lit";
import { customElement, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";

type Bucket = { name: string; count: number };
type Day = { date: string; count: number };
type Summary = {
  totalVisits: number;
  uniqueVisitors: number;
  browsers: Bucket[];
  countries: Bucket[];
  paths: Bucket[];
  daily: Day[];
};

@customElement("analytics-dashboard")
export class AnalyticsAnalyticsDashboardElement extends UmbElementMixin(LitElement) {
  static override styles = css`
    :host { display: block; padding: var(--uui-size-layout-1, 24px); color: var(--uui-color-text, #1f2937); }
    h1 { margin: 0 0 6px; font-size: 1.5rem; font-weight: 600; }
    .description { margin: 0 0 24px; color: var(--uui-color-text-alt, #6b7280); max-width: 720px; line-height: 1.5; }
    .toolbar { display: flex; gap: 8px; align-items: center; margin-bottom: 16px; }
    .toolbar span { margin-left: auto; color: var(--uui-color-text-alt, #6b7280); font-size: .85rem; }
    .kpis, .columns { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
    .card { background: var(--uui-color-surface, #fff); border: 1px solid var(--uui-color-border, #e5e7eb); border-radius: 6px; padding: 18px; }
    .kpi-label { color: var(--uui-color-text-alt, #6b7280); font-size: .85rem; }
    .kpi-value { display: block; margin-top: 6px; font-size: 1.8rem; font-weight: 650; }
    h2 { margin: 0 0 14px; font-size: 1rem; font-weight: 600; }
    .columns { margin-top: 16px; grid-template-columns: repeat(3, minmax(0, 1fr)); }
    .row { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 12px; margin: 10px 0; font-size: .875rem; }
    .bar { height: 6px; margin-top: 5px; border-radius: 4px; background: var(--uui-color-surface-alt, #e5e7eb); overflow: hidden; }
    .bar > i { display: block; height: 100%; background: var(--uui-color-interactive, #1d4ed8); }
    .empty, .error { padding: 24px; text-align: center; color: var(--uui-color-text-alt, #6b7280); }
    .error { color: var(--uui-color-danger, #b91c1c); }
    @media (max-width: 900px) { .kpis, .columns { grid-template-columns: 1fr; } .toolbar span { margin-left: 0; } }
  `;

  @state() private _summary?: Summary;
  @state() private _loading = true;
  @state() private _error = "";
  @state() private _days = 30;

  override connectedCallback(): void {
    super.connectedCallback();
    void this._load();
  }

  private async _load(): Promise<void> {
    this._loading = true;
    this._error = "";
    try {
      const response = await fetch(`/umbraco/api/analytics/Summary?days=${this._days}`, { credentials: "same-origin" });
      if (!response.ok) throw new Error(`Request failed (${response.status})`);
      this._summary = await response.json() as Summary;
    } catch (error) {
      this._error = error instanceof Error ? error.message : "Unable to load analytics.";
    } finally {
      this._loading = false;
    }
  }

  private _max(items: Bucket[]): number { return Math.max(1, ...items.map(item => item.count)); }

  private _list(title: string, items: Bucket[]) {
    const max = this._max(items);
    return html`<section class="card"><h2>${title}</h2>${items.length === 0 ? html`<div class="empty">No data yet.</div>` : items.map(item => html`
      <div class="row"><div>${item.name}<div class="bar"><i style="width:${Math.round(item.count / max * 100)}%"></i></div></div><strong>${item.count}</strong></div>`)} </section>`;
  }

  override render() {
    if (this._loading) return html`<h1>Analytics</h1><div class="card empty" role="status">Loading visit data…</div>`;
    if (this._error) return html`<h1>Analytics</h1><div class="card error" role="alert">${this._error}<br><uui-button look="secondary" label="Retry" @click=${this._load}>Retry</uui-button></div>`;
    const summary = this._summary ?? { totalVisits: 0, uniqueVisitors: 0, browsers: [], countries: [], paths: [], daily: [] };
    return html`
      <h1>Analytics</h1>
      <p class="description">Privacy-conscious, self-hosted visit analytics. Raw IP addresses are never stored and data stays in your Umbraco database.</p>
      <div class="toolbar"><uui-select label="Period" .value=${String(this._days)} @change=${(event: Event) => { this._days = Number((event.target as HTMLSelectElement).value); void this._load(); }}><uui-option value="7">Last 7 days</uui-option><uui-option value="30">Last 30 days</uui-option><uui-option value="90">Last 90 days</uui-option></uui-select><span>Updated ${new Date().toLocaleString()}</span></div>
      <div class="kpis"><div class="card"><span class="kpi-label">Visits</span><strong class="kpi-value">${summary.totalVisits}</strong></div><div class="card"><span class="kpi-label">Unique visitors</span><strong class="kpi-value">${summary.uniqueVisitors}</strong></div><div class="card"><span class="kpi-label">Tracked days</span><strong class="kpi-value">${summary.daily.length}</strong></div></div>
      <div class="columns">${this._list("Top pages", summary.paths)}${this._list("Browsers", summary.browsers)}${this._list("Countries", summary.countries)}</div>
    `;
  }
}

export default AnalyticsAnalyticsDashboardElement;
