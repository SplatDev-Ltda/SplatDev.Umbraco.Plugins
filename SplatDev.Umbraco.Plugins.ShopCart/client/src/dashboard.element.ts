import { LitElement, html, css, nothing } from "@umbraco-cms/backoffice/external/lit";
import { customElement, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";

interface Overview {
  carts: number; items: number; value: number;
  abandoned: number; abandonedValue: number;
}

interface CartSummary {
  sessionId: string; items: number; value: number;
  lastActivity: string; abandoned: boolean;
}

/**
 * Carts across the site.
 *
 * The previous dashboard was the estate's shared placeholder, and there was nothing for
 * it to call: every endpoint was shopper-scoped and anonymous. The admin API this reads
 * is new, and deliberately lives on its own authorized controller — adding cross-session
 * reads to the anonymous one is how the original IDOR would have come back.
 */
@customElement("shopcart-dashboard")
export class ShopCartDashboardElement extends UmbElementMixin(LitElement) {
  static override styles = css`
    :host { display: block; padding: var(--uui-size-layout-1, 24px); }
    h1 { font-size: 1.5rem; font-weight: 600; margin: 0 0 8px; }
    p.description { color: var(--uui-color-text-alt, #6b7280); margin: 0 0 24px; max-width: 62ch; }
    .stats { display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); }
    .stat { border: 1px solid var(--uui-color-border, #e5e7eb); border-radius: 6px; padding: 12px 14px; }
    .stat.warn { border-color: #d97706; background: #fffbeb; }
    .stat .n { font-size: 1.6rem; font-weight: 600; line-height: 1.1; }
    .stat .l { color: var(--uui-color-text-alt, #6b7280); font-size: 0.8125rem; }
    .row { display: flex; gap: 10px; align-items: flex-end; flex-wrap: wrap; }
    .field { display: flex; flex-direction: column; gap: 4px; }
    .field label { font-weight: 600; font-size: 0.8125rem; }
    .field input { padding: 8px; border: 1px solid var(--uui-color-border, #d1d5db);
                   border-radius: 4px; font: inherit; width: 90px; }
    .msg { padding: 10px 14px; border-radius: 4px; margin-top: 14px; }
    .msg.ok { background: #d1fae5; color: #065f46; }
    .msg.bad { background: #fee2e2; color: #991b1b; }
    .mono { font-family: var(--uui-font-monospace, monospace); font-size: 0.8125rem; }
    .hint { color: var(--uui-color-text-alt, #6b7280); font-size: 0.8125rem; }
    .empty { color: var(--uui-color-text-alt, #6b7280); padding: 14px 0; }
    uui-table { width: 100%; }
  `;

  @state() private _overview: Overview | null = null;
  @state() private _carts: CartSummary[] = [];
  @state() private _days = 7;
  @state() private _onlyAbandoned = false;
  @state() private _loading = true;
  @state() private _busy = false;
  @state() private _msg: { ok: boolean; text: string } | null = null;

  private readonly _api = "/umbraco/api/shopcart/admin";

  override connectedCallback(): void {
    super.connectedCallback();
    void this.#load();
  }

  async #load(): Promise<void> {
    this._loading = true;
    try {
      const [o, c] = await Promise.all([
        fetch(`${this._api}/Overview?abandonedAfterDays=${this._days}`, { credentials: "same-origin" }),
        fetch(`${this._api}/Carts?abandonedAfterDays=${this._days}&onlyAbandoned=${this._onlyAbandoned}`,
              { credentials: "same-origin" }),
      ]);
      if (o.ok) this._overview = await o.json();
      if (c.ok) this._carts = await c.json();
    } finally {
      this._loading = false;
    }
  }

  async #send(path: string, method: string): Promise<void> {
    this._busy = true;
    this._msg = null;
    try {
      const r = await fetch(`${this._api}/${path}`, { method, credentials: "same-origin" });
      const result = await r.json();
      this._msg = { ok: r.ok, text: result.message ?? (r.ok ? "Done." : "Failed.") };
      await this.#load();
    } catch (e) {
      this._msg = { ok: false, text: `The request failed: ${(e as Error).message}` };
    } finally {
      this._busy = false;
    }
  }

  #money(v: number) {
    return v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  #age(iso: string) {
    const days = Math.floor((Date.now() - Date.parse(iso)) / 86_400_000);
    return days === 0 ? "today" : days === 1 ? "1 day ago" : `${days} days ago`;
  }

  override render() {
    const o = this._overview;
    return html`
      <h1>Carts</h1>
      <p class="description">
        Baskets across the site. A cart is a set of lines sharing a session, and its age is
        the most recent line added — the only timestamp the data carries, and what makes an
        abandoned basket identifiable.
      </p>

      ${this._loading ? html`<uui-loader></uui-loader>` : nothing}

      ${o
        ? html`
            <uui-box headline="Overview">
              <div class="stats">
                ${html`<div class="stat"><div class="n">${o.carts}</div><div class="l">carts</div></div>`}
                ${html`<div class="stat"><div class="n">${o.items}</div><div class="l">items</div></div>`}
                ${html`<div class="stat"><div class="n">${this.#money(o.value)}</div><div class="l">total value</div></div>`}
                ${html`<div class="stat ${o.abandoned ? "warn" : ""}">
                         <div class="n">${o.abandoned}</div><div class="l">abandoned</div></div>`}
                ${html`<div class="stat ${o.abandoned ? "warn" : ""}">
                         <div class="n">${this.#money(o.abandonedValue)}</div>
                         <div class="l">abandoned value</div></div>`}
              </div>
            </uui-box>`
        : nothing}

      ${this._msg ? html`<div class="msg ${this._msg.ok ? "ok" : "bad"}">${this._msg.text}</div>` : nothing}

      <uui-box headline="Carts" style="margin-top:16px;">
        <div class="row">
          <div class="field">
            <label for="d">Abandoned after (days)</label>
            <input id="d" type="number" min="1" .value=${String(this._days)}
              @change=${async (e: Event) => {
                this._days = Number((e.target as HTMLInputElement).value) || 7;
                await this.#load();
              }} />
          </div>
          <uui-button look=${this._onlyAbandoned ? "primary" : "secondary"} compact
            @click=${async () => { this._onlyAbandoned = !this._onlyAbandoned; await this.#load(); }}>
            ${this._onlyAbandoned ? "Showing abandoned only" : "Show abandoned only"}
          </uui-button>
          <uui-button look="secondary" color="danger" compact ?disabled=${this._busy || !o?.abandoned}
            @click=${() => confirm(`Clear all carts untouched for ${this._days}+ days?`)
              && this.#send(`ClearAbandoned?olderThanDays=${this._days}`, "POST")}>
            Clear abandoned
          </uui-button>
        </div>

        ${this._carts.length === 0
          ? html`<p class="empty">No carts.</p>`
          : html`
              <uui-table style="margin-top:12px;">
                <uui-table-head>
                  <uui-table-head-cell>Session</uui-table-head-cell>
                  <uui-table-head-cell>Items</uui-table-head-cell>
                  <uui-table-head-cell>Value</uui-table-head-cell>
                  <uui-table-head-cell>Last activity</uui-table-head-cell>
                  <uui-table-head-cell></uui-table-head-cell>
                </uui-table-head>
                ${this._carts.map(c => html`
                  <uui-table-row>
                    <uui-table-cell class="mono">
                      ${c.sessionId.slice(0, 12)}…
                      ${c.abandoned ? html`<uui-tag look="warning">abandoned</uui-tag>` : nothing}
                    </uui-table-cell>
                    <uui-table-cell>${c.items}</uui-table-cell>
                    <uui-table-cell>${this.#money(c.value)}</uui-table-cell>
                    <uui-table-cell class="hint">${this.#age(c.lastActivity)}</uui-table-cell>
                    <uui-table-cell style="text-align:right;">
                      <uui-button look="secondary" color="danger" compact ?disabled=${this._busy}
                        @click=${() => confirm("Empty this cart?")
                          && this.#send(`ClearCart?sessionId=${encodeURIComponent(c.sessionId)}`, "DELETE")}>
                        Clear
                      </uui-button>
                    </uui-table-cell>
                  </uui-table-row>`)}
              </uui-table>`}
      </uui-box>`;
  }
}

export default ShopCartDashboardElement;

declare global {
  interface HTMLElementTagNameMap { "shopcart-dashboard": ShopCartDashboardElement; }
}
