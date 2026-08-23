import { LitElement, html, css, nothing } from "@umbraco-cms/backoffice/external/lit";
import { customElement, property, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import { UMB_PROPERTY_DATASET_CONTEXT } from "@umbraco-cms/backoffice/property";

import { createAuthFetch } from "./auth-fetch";

interface Rating {
  average?: number;
  averageRating?: number;
  count?: number;
  totalRatings?: number;
}

/**
 * What visitors have rated this page.
 *
 * Deliberately read-only. The ratings belong to visitors, and a control that let an
 * editor type a number would be a control for falsifying them — the average shown to
 * the public would no longer mean what it says. This reports; it does not vote.
 *
 * The plugin only had a dashboard of top-rated content, so the rating for the page you
 * were editing was somewhere else entirely.
 */
@customElement("starratings-property-editor")
export class StarRatingsPropertyEditorElement extends UmbElementMixin(LitElement) {
  readonly #fetch = createAuthFetch(this);

  static override styles = css`
    :host { display: block; }
    .row { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
    .stars { font-size: 1.35rem; letter-spacing: 2px; color: #d8a012; line-height: 1; }
    .stars .off { color: var(--uui-color-border, #d1d5db); }
    .num { font-variant-numeric: tabular-nums; font-weight: 700; }
    .hint { margin: 8px 0 0; font-size: 0.83rem; color: var(--uui-color-text-alt, #6b7280); }
  `;

  @property({ type: String })
  value = "";

  @state() private _node: string | null = null;
  @state() private _rating: Rating | null = null;
  @state() private _loaded = false;

  constructor() {
    super();
    this.consumeContext(UMB_PROPERTY_DATASET_CONTEXT, (context) => {
      const unique = (context as unknown as { getUnique?: () => string | undefined })?.getUnique?.();
      if (unique) this._node = unique;
      void this.#load();
    });
  }

  override connectedCallback(): void {
    super.connectedCallback();
    void this.#load();
  }

  #nodeFromUrl(): string | null {
    const m = window.location.pathname.match(
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i,
    );
    return m ? m[0] : null;
  }

  async #load(): Promise<void> {
    this._node ??= this.#nodeFromUrl();
    if (!this._node) return;
    try {
      const response = await this.#fetch(
        `/umbraco/api/starratings/GetRating?contentKey=${encodeURIComponent(this._node)}`,
      );
      if (response.ok) this._rating = await response.json();
    } catch {
      this._rating = null;
    } finally {
      this._loaded = true;
    }
  }

  override render() {
    if (!this._node) return html`<p class="hint">This page has not been saved yet, so nothing has rated it.</p>`;
    if (!this._loaded) return html`<uui-loader></uui-loader>`;

    const average = this._rating?.average ?? this._rating?.averageRating ?? 0;
    const count = this._rating?.count ?? this._rating?.totalRatings ?? 0;

    if (!count) {
      return html`<p class="hint">No ratings yet for this page.</p>`;
    }

    const filled = Math.round(average);
    return html`
      <div class="row">
        <span class="stars" aria-label="${average.toFixed(1)} out of 5">
          ${[1, 2, 3, 4, 5].map((i) => html`<span class=${i <= filled ? "" : "off"}>★</span>`)}
        </span>
        <span class="num">${average.toFixed(1)}</span>
        <span>from ${count} rating${count === 1 ? "" : "s"}</span>
      </div>
      <p class="hint">
        These come from visitors, so they are shown here rather than edited — changing them
        by hand would make the average say something that is not true.
      </p>
      ${nothing}
    `;
  }
}

export default StarRatingsPropertyEditorElement;

declare global {
  interface HTMLElementTagNameMap {
    "starratings-property-editor": StarRatingsPropertyEditorElement;
  }
}
