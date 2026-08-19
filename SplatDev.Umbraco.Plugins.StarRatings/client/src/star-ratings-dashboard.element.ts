import { LitElement, html, css, customElement, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";

import { createAuthFetch } from "./auth-fetch";

interface ContentRatingSummary {
  contentKey: string;
  averageRating: number;
  totalVotes: number;
}

@customElement("star-ratings-dashboard")
export class StarRatingsDashboardElement extends UmbElementMixin(LitElement) {
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

    .stars {
      color: #f5a623;
      letter-spacing: 1px;
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
  @state() private _topRated: ContentRatingSummary[] = [];
  @state() private _error: string | null = null;
  @state() private _count = 10;

  override connectedCallback(): void {
    super.connectedCallback();
    this._load();
  }

  private async _load(): Promise<void> {
    this._loading = true;
    this._error = null;
    try {
      const response = await this.#fetch(`/umbraco/api/starratings/GetTopRated?count=${this._count}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      this._topRated = (await response.json()) as ContentRatingSummary[];
    } catch (err) {
      this._error = err instanceof Error ? err.message : "Unknown error";
    } finally {
      this._loading = false;
    }
  }

  private _renderStars(avg: number): string {
    const filled = Math.round(avg);
    return "★".repeat(filled) + "☆".repeat(5 - filled);
  }

  override render() {
    return html`
      <h1>Star Ratings</h1>
      <p class="description">Top-rated content across your Umbraco site.</p>

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
          : this._topRated.length === 0
          ? html`<div class="empty-state">No ratings recorded yet.</div>`
          : html`
              <uui-table>
                <uui-table-head>
                  <uui-table-head-cell>Content Key</uui-table-head-cell>
                  <uui-table-head-cell>Stars</uui-table-head-cell>
                  <uui-table-head-cell>Average</uui-table-head-cell>
                  <uui-table-head-cell>Votes</uui-table-head-cell>
                </uui-table-head>
                ${this._topRated.map(
                  (item) => html`
                    <uui-table-row>
                      <uui-table-cell>${item.contentKey}</uui-table-cell>
                      <uui-table-cell>
                        <span class="stars">${this._renderStars(item.averageRating)}</span>
                      </uui-table-cell>
                      <uui-table-cell>${item.averageRating.toFixed(1)} / 5</uui-table-cell>
                      <uui-table-cell>${item.totalVotes}</uui-table-cell>
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
    "star-ratings-dashboard": StarRatingsDashboardElement;
  }
}
