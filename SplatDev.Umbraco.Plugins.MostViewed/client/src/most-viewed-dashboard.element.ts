import { LitElement, html, css, customElement, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";

import { createAuthFetch } from "./auth-fetch";

interface PageViewSummary {
  contentKey: string;
  nodeName: string;
  nodeUrl: string;
  viewCount: number;
}

@customElement("most-viewed-dashboard")
export class MostViewedDashboardElement extends UmbElementMixin(LitElement) {
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

    .toolbar {
      display: flex;
      gap: var(--uui-size-4);
      align-items: center;
      margin-bottom: var(--uui-size-4);
    }

    .rank {
      font-weight: 600;
      color: var(--uui-color-text-alt);
    }

    a {
      color: var(--uui-color-interactive);
      text-decoration: none;
    }

    a:hover {
      text-decoration: underline;
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
  @state() private _pages: PageViewSummary[] = [];
  @state() private _error: string | null = null;
  @state() private _count = 10;
  @state() private _days = 30;

  override connectedCallback(): void {
    super.connectedCallback();
    this._load();
  }

  private async _load(): Promise<void> {
    this._loading = true;
    this._error = null;
    try {
      const url = `/umbraco/api/mostviewed/GetMostViewed?count=${this._count}&days=${this._days}`;
      const response = await this.#fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      this._pages = (await response.json()) as PageViewSummary[];
    } catch (err) {
      this._error = err instanceof Error ? err.message : "Unknown error";
    } finally {
      this._loading = false;
    }
  }

  override render() {
    return html`
      <h1>Most Viewed</h1>
      <p class="description">Top pages by view count in the last ${this._days} days.</p>

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
          : this._pages.length === 0
          ? html`<div class="empty-state">No page views recorded yet.</div>`
          : html`
              <uui-table>
                <uui-table-head>
                  <uui-table-head-cell>#</uui-table-head-cell>
                  <uui-table-head-cell>Page</uui-table-head-cell>
                  <uui-table-head-cell>URL</uui-table-head-cell>
                  <uui-table-head-cell>Views</uui-table-head-cell>
                </uui-table-head>
                ${this._pages.map(
                  (page, i) => html`
                    <uui-table-row>
                      <uui-table-cell><span class="rank">${i + 1}</span></uui-table-cell>
                      <uui-table-cell>${page.nodeName}</uui-table-cell>
                      <uui-table-cell>
                        <a href="${page.nodeUrl}" target="_blank" rel="noopener">${page.nodeUrl}</a>
                      </uui-table-cell>
                      <uui-table-cell>${page.viewCount.toLocaleString()}</uui-table-cell>
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
    "most-viewed-dashboard": MostViewedDashboardElement;
  }
}
