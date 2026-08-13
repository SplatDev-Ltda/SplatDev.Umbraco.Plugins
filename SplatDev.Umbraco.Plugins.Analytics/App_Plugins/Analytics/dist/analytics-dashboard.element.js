import { LitElement as e, css as t, customElement as n, html as r, state as i } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as a } from "@umbraco-cms/backoffice/element-api";
//#region src/analytics-dashboard.element.ts
var o = @n("analytics-dashboard") class extends a(e) {
	static styles = t`
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
	@i() _summary;
	@i() _loading = !0;
	@i() _error = "";
	@i() _days = 30;
	connectedCallback() {
		super.connectedCallback(), this._load();
	}
	async _load() {
		this._loading = !0, this._error = "";
		try {
			let e = await fetch(`/umbraco/api/analytics/Summary?days=${this._days}`, { credentials: "same-origin" });
			if (!e.ok) throw Error(`Request failed (${e.status})`);
			this._summary = await e.json();
		} catch (e) {
			this._error = e instanceof Error ? e.message : "Unable to load analytics.";
		} finally {
			this._loading = !1;
		}
	}
	_max(e) {
		return Math.max(1, ...e.map((e) => e.count));
	}
	_list(e, t) {
		let n = this._max(t);
		return r`<section class="card"><h2>${e}</h2>${t.length === 0 ? r`<div class="empty">No data yet.</div>` : t.map((e) => r`
      <div class="row"><div>${e.name}<div class="bar"><i style="width:${Math.round(e.count / n * 100)}%"></i></div></div><strong>${e.count}</strong></div>`)} </section>`;
	}
	render() {
		if (this._loading) return r`<h1>Analytics</h1><div class="card empty" role="status">Loading visit data…</div>`;
		if (this._error) return r`<h1>Analytics</h1><div class="card error" role="alert">${this._error}<br><uui-button look="secondary" label="Retry" @click=${this._load}>Retry</uui-button></div>`;
		let e = this._summary ?? {
			totalVisits: 0,
			uniqueVisitors: 0,
			browsers: [],
			countries: [],
			paths: [],
			daily: []
		};
		return r`
      <h1>Analytics</h1>
      <p class="description">Privacy-conscious, self-hosted visit analytics. Raw IP addresses are never stored and data stays in your Umbraco database.</p>
      <div class="toolbar"><uui-select label="Period" .value=${String(this._days)} @change=${(e) => {
			this._days = Number(e.target.value), this._load();
		}}><uui-option value="7">Last 7 days</uui-option><uui-option value="30">Last 30 days</uui-option><uui-option value="90">Last 90 days</uui-option></uui-select><span>Updated ${(/* @__PURE__ */ new Date()).toLocaleString()}</span></div>
      <div class="kpis"><div class="card"><span class="kpi-label">Visits</span><strong class="kpi-value">${e.totalVisits}</strong></div><div class="card"><span class="kpi-label">Unique visitors</span><strong class="kpi-value">${e.uniqueVisitors}</strong></div><div class="card"><span class="kpi-label">Tracked days</span><strong class="kpi-value">${e.daily.length}</strong></div></div>
      <div class="columns">${this._list("Top pages", e.paths)}${this._list("Browsers", e.browsers)}${this._list("Countries", e.countries)}</div>
    `;
	}
};
//#endregion
export { o as AnalyticsAnalyticsDashboardElement, o as default };
