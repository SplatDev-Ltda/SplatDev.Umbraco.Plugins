import { LitElement, html, css, nothing } from "@umbraco-cms/backoffice/external/lit";
import { customElement, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import { createAuthFetch } from "./auth-fetch";

const API = "/umbraco/api/getnet";

type Summary = {
  totalCount: number; settledCount: number; failedCount: number; pendingCount: number;
  refundedCount: number; settledMinor: number; refundedMinor: number;
  averageTicketMinor: number; approvalRate: number; currency: string;
  previousSettledMinor: number;
};
type Point = { date: string; count: number; settledMinor: number };
type Slice = { key: string; count: number; settledMinor: number };
type Row = {
  id: number; orderRef: string; paymentId?: string; amountMinor: number; refundedMinor: number;
  currency: string; status: string; paymentMethod?: string; cardBrand?: string; cardLast4?: string;
  installments: number; customerName?: string; authorizationCode?: string; errorMessage?: string;
  createdAt: string; updatedAt?: string;
};
type Page = { items: Row[]; total: number; page: number; pageSize: number };
type Connection = {
  environment: string; baseUrl: string; hasSellerId: boolean; hasClientId: boolean;
  hasClientSecret: boolean; mockEnabled: boolean; sellerIdMasked?: string;
};

const STATUS_TONE: Record<string, string> = {
  CONFIRMED: "positive", AUTHORIZED: "warning", PENDING: "warning",
  DENIED: "danger", ERROR: "danger", CANCELED: "default", REFUNDED: "default",
};

@customElement("getnet-dashboard")
export class GetnetDashboardElement extends UmbElementMixin(LitElement) {
  #fetch = createAuthFetch(this);

  @state() private _tab: "overview" | "transactions" | "connection" = "overview";
  @state() private _days = 30;
  @state() private _loading = true;
  @state() private _error: string | null = null;

  @state() private _summary?: Summary;
  @state() private _timeline: Point[] = [];
  @state() private _byStatus: Slice[] = [];
  @state() private _byMethod: Slice[] = [];
  @state() private _page?: Page;
  @state() private _connection?: Connection;

  @state() private _filterStatus = "";
  @state() private _filterMethod = "";
  @state() private _search = "";
  @state() private _pageNo = 1;

  override connectedCallback(): void {
    super.connectedCallback();
    this.#loadAll();
  }

  /**
   * Everything the overview needs, in one place.
   *
   * A failed request is surfaced rather than swallowed. A dashboard that gates on
   * `response.ok` and renders its empty state otherwise makes a 401 indistinguishable from a
   * site that has taken no payments, which is the more alarming of the two to get wrong.
   */
  async #loadAll(): Promise<void> {
    this._loading = true;
    this._error = null;
    try {
      const [summary, timeline, breakdown, connection] = await Promise.all([
        this.#json<Summary>(`${API}/Summary?days=${this._days}`),
        this.#json<Point[]>(`${API}/Timeline?days=${this._days}`),
        this.#json<{ byStatus: Slice[]; byMethod: Slice[] }>(`${API}/Breakdown?days=${this._days}`),
        this.#json<Connection>(`${API}/Connection`),
      ]);
      this._summary = summary;
      this._timeline = timeline;
      this._byStatus = breakdown.byStatus;
      this._byMethod = breakdown.byMethod;
      this._connection = connection;
      await this.#loadPage();
    } catch (err) {
      this._error = err instanceof Error ? err.message : String(err);
    } finally {
      this._loading = false;
    }
  }

  async #loadPage(): Promise<void> {
    const q = new URLSearchParams({ days: String(this._days), page: String(this._pageNo), pageSize: "25" });
    if (this._filterStatus) q.set("status", this._filterStatus);
    if (this._filterMethod) q.set("method", this._filterMethod);
    if (this._search) q.set("search", this._search);
    this._page = await this.#json<Page>(`${API}/Transactions?${q}`);
  }

  async #json<T>(url: string): Promise<T> {
    const res = await this.#fetch(url);
    if (!res.ok) throw new Error(`${url.replace(API, "")} answered ${res.status}`);
    return (await res.json()) as T;
  }

  #money(minor: number, currency = this._summary?.currency ?? "BRL"): string {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format((minor ?? 0) / 100);
  }

  #setDays(days: number) { this._days = days; this._pageNo = 1; this.#loadAll(); }

  override render() {
    return html`
      <umb-body-layout headline="Getnet">
        <div slot="header" class="range">
          ${[7, 30, 90, 365].map((d) => html`
            <uui-button
              look="${this._days === d ? "primary" : "secondary"}"
              compact
              label="${d} days"
              @click=${() => this.#setDays(d)}></uui-button>`)}
        </div>

        <uui-box>
          <uui-tab-group>
            <uui-tab ?active=${this._tab === "overview"} @click=${() => (this._tab = "overview")}>Overview</uui-tab>
            <uui-tab ?active=${this._tab === "transactions"} @click=${() => (this._tab = "transactions")}>Transactions</uui-tab>
            <uui-tab ?active=${this._tab === "connection"} @click=${() => (this._tab = "connection")}>Connection</uui-tab>
          </uui-tab-group>

          ${this._error ? this.#renderError() : nothing}
          ${this._loading ? html`<uui-loader></uui-loader>` : this.#renderTab()}
        </uui-box>
      </umb-body-layout>`;
  }

  #renderError() {
    return html`
      <div class="error">
        <strong>Could not load Getnet data.</strong>
        <div>${this._error}</div>
        <div class="muted">
          Anything shown below may be empty because the request failed, not because there is
          nothing to show.
        </div>
      </div>`;
  }

  #renderTab() {
    if (this._tab === "transactions") return this.#renderTransactions();
    if (this._tab === "connection") return this.#renderConnection();
    return this.#renderOverview();
  }

  #renderOverview() {
    const s = this._summary;
    if (!s) return nothing;

    const delta = s.previousSettledMinor === 0
      ? null
      : Math.round(((s.settledMinor - s.previousSettledMinor) / s.previousSettledMinor) * 100);

    return html`
      <div class="cards">
        ${this.#card("Settled", this.#money(s.settledMinor),
          delta === null ? `${s.settledCount} payments` :
            html`<span class="${delta >= 0 ? "up" : "down"}">${delta >= 0 ? "▲" : "▼"} ${Math.abs(delta)}%</span> vs previous ${this._days} days`)}
        ${this.#card("Approval rate", `${Math.round(s.approvalRate * 100)}%`, `${s.settledCount} of ${s.settledCount + s.failedCount} concluded`)}
        ${this.#card("Average ticket", this.#money(s.averageTicketMinor), `${s.totalCount} attempts`)}
        ${this.#card("Refunded", this.#money(s.refundedMinor), `${s.refundedCount} refunds`)}
      </div>

      <div class="grid">
        <section>
          <h4>Settled volume</h4>
          ${this.#renderBars(this._timeline)}
        </section>
        <section>
          <h4>By status</h4>
          ${this.#renderSlices(this._byStatus, s.totalCount)}
          <h4>By payment method</h4>
          ${this.#renderSlices(this._byMethod, s.totalCount)}
        </section>
      </div>`;
  }

  #card(label: string, value: string, note: unknown) {
    return html`
      <div class="card">
        <div class="label">${label}</div>
        <div class="value">${value}</div>
        <div class="note">${note}</div>
      </div>`;
  }

  /**
   * A bar per day, drawn as plain elements.
   *
   * No charting library: a strict CSP and an offline backoffice make a CDN dependency a
   * liability, and this is a bar chart.
   */
  #renderBars(points: Point[]) {
    if (!points.length) return html`<p class="muted">No activity in this period.</p>`;
    const max = Math.max(...points.map((p) => p.settledMinor), 1);
    return html`
      <div class="bars" role="img" aria-label="Settled volume per day">
        ${points.map((p) => html`
          <div class="bar" title="${p.date}: ${this.#money(p.settledMinor)} over ${p.count} attempts">
            <div class="fill" style="height:${Math.max((p.settledMinor / max) * 100, p.settledMinor > 0 ? 2 : 0)}%"></div>
          </div>`)}
      </div>
      <div class="axis"><span>${points[0]?.date}</span><span>${points[points.length - 1]?.date}</span></div>`;
  }

  #renderSlices(slices: Slice[], total: number) {
    if (!slices.length) return html`<p class="muted">Nothing to show.</p>`;
    return html`
      <table class="slices">
        ${slices.map((s) => html`
          <tr>
            <td class="k">${s.key.toLowerCase()}</td>
            <td class="meter"><div style="width:${total ? (s.count / total) * 100 : 0}%"></div></td>
            <td class="n">${s.count}</td>
            <td class="n">${this.#money(s.settledMinor)}</td>
          </tr>`)}
      </table>`;
  }

  #renderTransactions() {
    const page = this._page;
    return html`
      <div class="filters">
        <uui-input
          placeholder="Order, payment id, customer…"
          .value=${this._search}
          @change=${(e: Event) => { this._search = (e.target as HTMLInputElement).value; this._pageNo = 1; this.#loadPage(); }}></uui-input>
        <select @change=${(e: Event) => { this._filterStatus = (e.target as HTMLSelectElement).value; this._pageNo = 1; this.#loadPage(); }}>
          <option value="">Any status</option>
          ${["CONFIRMED", "AUTHORIZED", "PENDING", "DENIED", "CANCELED", "REFUNDED", "ERROR"]
            .map((s) => html`<option value="${s}" ?selected=${this._filterStatus === s}>${s.toLowerCase()}</option>`)}
        </select>
        <select @change=${(e: Event) => { this._filterMethod = (e.target as HTMLSelectElement).value; this._pageNo = 1; this.#loadPage(); }}>
          <option value="">Any method</option>
          ${["credit", "debit", "pix", "boleto"].map((m) => html`<option value="${m}" ?selected=${this._filterMethod === m}>${m}</option>`)}
        </select>
      </div>

      ${!page || page.items.length === 0
        ? html`<p class="muted">No transactions match this filter.</p>`
        : html`
          <table class="rows">
            <thead>
              <tr><th>When</th><th>Order</th><th>Customer</th><th>Method</th><th>Status</th><th class="n">Amount</th></tr>
            </thead>
            <tbody>
              ${page.items.map((r) => html`
                <tr>
                  <td>${new Date(r.createdAt).toLocaleString()}</td>
                  <td><code>${r.orderRef}</code>${r.paymentId ? html`<div class="muted">${r.paymentId}</div>` : nothing}</td>
                  <td>${r.customerName ?? "—"}</td>
                  <td>
                    ${r.paymentMethod ?? "—"}
                    ${r.cardLast4 ? html`<div class="muted">${r.cardBrand ?? "card"} ····${r.cardLast4}${r.installments > 1 ? ` ×${r.installments}` : ""}</div>` : nothing}
                  </td>
                  <td>
                    <uui-tag look="${STATUS_TONE[r.status] ?? "default"}">${r.status.toLowerCase()}</uui-tag>
                    ${r.errorMessage ? html`<div class="muted err">${r.errorMessage}</div>` : nothing}
                  </td>
                  <td class="n">
                    ${this.#money(r.amountMinor, r.currency)}
                    ${r.refundedMinor > 0 ? html`<div class="muted">−${this.#money(r.refundedMinor, r.currency)} refunded</div>` : nothing}
                  </td>
                </tr>`)}
            </tbody>
          </table>
          <div class="pager">
            <uui-button compact label="Previous" ?disabled=${page.page <= 1}
              @click=${() => { this._pageNo = page.page - 1; this.#loadPage(); }}></uui-button>
            <span class="muted">${(page.page - 1) * page.pageSize + 1}–${Math.min(page.page * page.pageSize, page.total)} of ${page.total}</span>
            <uui-button compact label="Next" ?disabled=${page.page * page.pageSize >= page.total}
              @click=${() => { this._pageNo = page.page + 1; this.#loadPage(); }}></uui-button>
          </div>`}`;
  }

  #renderConnection() {
    const c = this._connection;
    if (!c) return nothing;
    const flag = (ok: boolean) => html`<uui-tag look="${ok ? "positive" : "danger"}">${ok ? "set" : "missing"}</uui-tag>`;
    return html`
      <table class="rows">
        <tr><th>Environment</th><td><uui-tag look="${c.environment === "production" ? "positive" : "warning"}">${c.environment}</uui-tag></td></tr>
        <tr><th>Base URL</th><td><code>${c.baseUrl}</code></td></tr>
        <tr><th>Seller ID</th><td>${flag(c.hasSellerId)} ${c.sellerIdMasked ? html`<code>${c.sellerIdMasked}</code>` : nothing}</td></tr>
        <tr><th>Client ID</th><td>${flag(c.hasClientId)}</td></tr>
        <tr><th>Client secret</th><td>${flag(c.hasClientSecret)}</td></tr>
        <tr><th>Development mock</th><td>${c.mockEnabled ? html`<uui-tag look="warning">enabled</uui-tag>` : "off"}</td></tr>
      </table>
      <p class="muted">
        These come from the <code>Getnet:</code> section of configuration and are changed there,
        not from this screen. Secrets are reported as present or missing and never sent to the
        browser.
      </p>`;
  }

  static override styles = css`
    :host { display: block; padding: var(--uui-size-layout-1, 24px); }
    .range { display: flex; gap: 4px; }
    .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin: 16px 0 24px; }
    .card { border: 1px solid var(--uui-color-border); border-radius: var(--uui-border-radius, 3px); padding: 12px 16px; }
    .card .label { color: var(--uui-color-text-alt); font-size: 12px; text-transform: uppercase; letter-spacing: .04em; }
    .card .value { font-size: 26px; font-weight: 700; margin: 4px 0; }
    .card .note, .muted { color: var(--uui-color-text-alt); font-size: 12px; }
    .up { color: var(--uui-color-positive); } .down { color: var(--uui-color-danger); }
    .grid { display: grid; grid-template-columns: 2fr 1fr; gap: 24px; }
    @media (max-width: 900px) { .grid { grid-template-columns: 1fr; } }
    h4 { margin: 16px 0 8px; }
    .bars { display: flex; align-items: flex-end; gap: 2px; height: 180px; border-bottom: 1px solid var(--uui-color-border); }
    .bar { flex: 1; height: 100%; display: flex; align-items: flex-end; }
    .fill { width: 100%; background: var(--uui-color-selected); border-radius: 2px 2px 0 0; }
    .axis { display: flex; justify-content: space-between; color: var(--uui-color-text-alt); font-size: 11px; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; }
    .slices td { padding: 4px 6px; font-size: 13px; }
    .slices .k { white-space: nowrap; }
    .slices .meter { width: 100%; }
    .slices .meter div { background: var(--uui-color-selected); height: 8px; border-radius: 4px; min-width: 2px; }
    .rows th, .rows td { text-align: left; padding: 8px 6px; border-bottom: 1px solid var(--uui-color-border); vertical-align: top; font-size: 13px; }
    .n { text-align: right; white-space: nowrap; }
    .err { color: var(--uui-color-danger); }
    .filters { display: flex; gap: 8px; margin: 16px 0; flex-wrap: wrap; }
    .pager { display: flex; align-items: center; gap: 12px; margin-top: 12px; }
    .error { border-left: 4px solid var(--uui-color-danger); background: var(--uui-color-surface-alt); padding: 12px 16px; margin: 12px 0; }
    code { font-size: 12px; }
  `;
}

export default GetnetDashboardElement;

declare global {
  interface HTMLElementTagNameMap { "getnet-dashboard": GetnetDashboardElement }
}
