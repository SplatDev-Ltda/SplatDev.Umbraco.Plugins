import { LitElement, html, css, unsafeCSS } from "lit";
import { customElement, state } from "lit/decorators.js";
import type { FavoriteEntry, ReadingProgress, ComponentState } from "../types";
import {
  fetchFavorites,
  fetchProgress,
  removeFavorite,
  bookThumbnailUrl,
} from "../services/api";
import { t } from "../services/i18n";
import tokensRaw from "../styles/tokens.css?inline";

@customElement("pdfc-member-favorites")
export class PdfcMemberFavorites extends LitElement {
  static override styles = [
    unsafeCSS(tokensRaw),
    css`
      :host {
        display: block;
      }

      .favorites-page {
        display: flex;
        flex-direction: column;
        gap: var(--pdfc-space-xl);
      }

      .section-title {
        font-size: 1.25rem;
        font-weight: 600;
        margin: 0 0 var(--pdfc-space-md);
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        gap: var(--pdfc-space-md);
      }

      .card {
        border: 1px solid var(--pdfc-border);
        border-radius: var(--pdfc-radius-lg);
        overflow: hidden;
        background: var(--pdfc-bg);
        transition: box-shadow 0.2s;
        cursor: pointer;
      }

      .card:hover {
        box-shadow: var(--pdfc-shadow-md);
      }

      .card:focus-visible {
        outline: none;
        box-shadow: var(--pdfc-focus-ring);
      }

      .card-thumb {
        width: 100%;
        aspect-ratio: 3 / 4;
        object-fit: cover;
        background: var(--pdfc-surface);
        display: block;
      }

      .card-body {
        padding: var(--pdfc-space-sm) var(--pdfc-space-md) var(--pdfc-space-md);
      }

      .card-title {
        font-size: 0.875rem;
        font-weight: 500;
        line-height: 1.3;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        margin: 0;
      }

      .card-author {
        font-size: 0.75rem;
        color: var(--pdfc-text-secondary);
        margin-top: 0.125rem;
      }

      .card-actions {
        margin-top: var(--pdfc-space-sm);
      }

      .btn-sm {
        padding: 0.25rem 0.625rem;
        font-size: 0.75rem;
        border: 1px solid var(--pdfc-border);
        border-radius: var(--pdfc-radius-sm);
        background: var(--pdfc-bg);
        color: var(--pdfc-text);
        cursor: pointer;
        font-family: inherit;
      }

      .btn-sm:hover {
        background: var(--pdfc-surface-hover);
      }

      .btn-sm:focus-visible {
        outline: none;
        box-shadow: var(--pdfc-focus-ring);
      }

      .reading-item {
        display: flex;
        align-items: center;
        gap: var(--pdfc-space-md);
        padding: var(--pdfc-space-md);
        border: 1px solid var(--pdfc-border);
        border-radius: var(--pdfc-radius);
        cursor: pointer;
        transition: box-shadow 0.2s;
      }

      .reading-item:hover {
        box-shadow: var(--pdfc-shadow-sm);
      }

      .reading-item:focus-visible {
        outline: none;
        box-shadow: var(--pdfc-focus-ring);
      }

      .reading-item:hover {
        box-shadow: var(--pdfc-shadow);
      }

      .reading-thumb {
        width: 3rem;
        height: 4rem;
        object-fit: cover;
        border-radius: var(--pdfc-radius-sm);
        flex-shrink: 0;
        background: var(--pdfc-surface);
      }

      .reading-info {
        flex: 1;
        min-width: 0;
      }

      .reading-title {
        font-size: 0.9375rem;
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin: 0;
      }

      .reading-author {
        font-size: 0.75rem;
        color: var(--pdfc-text-secondary);
      }

      .reading-progress {
        font-size: 0.75rem;
        color: var(--pdfc-primary);
        margin-top: 0.125rem;
      }

      .state {
        text-align: center;
        padding: var(--pdfc-space-2xl);
        color: var(--pdfc-text-secondary);
      }

      .spinner {
        display: inline-block;
        width: 2rem;
        height: 2rem;
        border: 3px solid var(--pdfc-border);
        border-top-color: var(--pdfc-primary);
        border-radius: 50%;
        animation: spin 0.7s linear infinite;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      .error-state {
        color: #dc2626;
        text-align: center;
        padding: var(--pdfc-space-2xl);
      }

      @media (max-width: 640px) {
        .grid {
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        }
      }
    `,
  ];

  @state() private _favorites: FavoriteEntry[] = [];
  @state() private _progress: ReadingProgress[] = [];
  @state() private _state: ComponentState = "loading";
  @state() private _removingId: number | null = null;

  override connectedCallback(): void {
    super.connectedCallback();
    this._load();
  }

  private async _load(): Promise<void> {
    this._state = "loading";
    try {
      const [favorites, progress] = await Promise.all([
        fetchFavorites(),
        fetchProgress(),
      ]);
      this._favorites = favorites;
      this._progress = progress;
      this._state = "loaded";
    } catch {
      this._state = "error";
    }
  }

  private async _handleRemove(bookId: number): Promise<void> {
    this._removingId = bookId;
    try {
      await removeFavorite(bookId);
      this._favorites = this._favorites.filter((f) => f.bookId !== bookId);
    } catch {
      // silently fail
    } finally {
      this._removingId = null;
    }
  }

  private _navigateToBook(bookId: number): void {
    this.dispatchEvent(
      new CustomEvent("pdfc-navigate", {
        detail: { route: "book", bookId },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _openReader(bookId: number): void {
    const fav = this._favorites.find((f) => f.bookId === bookId);
    this.dispatchEvent(
      new CustomEvent("pdfc-open-reader", {
        detail: { bookId, title: fav?.bookTitle },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _readingNowFavorites(): FavoriteEntry[] {
    const progressIds = new Set(this._progress.map((p) => p.bookId));
    return this._favorites.filter((f) => progressIds.has(f.bookId));
  }

  private _readingProgressFor(bookId: number): ReadingProgress | undefined {
    return this._progress.find((p) => p.bookId === bookId);
  }

  private _renderReadingNow() {
    const items = this._readingNowFavorites();
    if (!items.length) {
      return html`<div class="state">${t("favorites_no_reading")}</div>`;
    }

    return html`
      <div>
        ${items.map((fav) => {
          const progress = this._readingProgressFor(fav.bookId);
          return html`
            <div
              class="reading-item"
              role="button"
              tabindex="0"
              @click=${() => this._openReader(fav.bookId)}
              @keydown=${(e: KeyboardEvent) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  this._openReader(fav.bookId);
                }
              }}
              aria-label=${`Continue reading ${fav.bookTitle}`}
            >
              <img
                class="reading-thumb"
                src=${bookThumbnailUrl(fav.bookId)}
                alt=""
                loading="lazy"
              />
              <div class="reading-info">
                <p class="reading-title">${fav.bookTitle}</p>
                <p class="reading-author">${fav.bookAuthor}</p>
                ${progress
                  ? html`<p class="reading-progress">
                      ${t("reader_page")} ${progress.page}
                      ${t("reader_of")} ${progress.pageCount}
                    </p>`
                  : null}
              </div>
            </div>
          `;
        })}
      </div>
    `;
  }

  private _renderFavoritesGrid() {
    if (!this._favorites.length) {
      return html`<div class="state">${t("favorites_no_favorites")}</div>`;
    }

    return html`
      <div class="grid">
        ${this._favorites.map(
          (fav) => html`
            <div
              class="card"
              role="button"
              tabindex="0"
              @click=${() => this._navigateToBook(fav.bookId)}
              @keydown=${(e: KeyboardEvent) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  this._navigateToBook(fav.bookId);
                }
              }}
              aria-label=${fav.bookTitle}
            >
              <img
                class="card-thumb"
                src=${bookThumbnailUrl(fav.bookId)}
                alt=""
                loading="lazy"
              />
              <div class="card-body">
                <p class="card-title">${fav.bookTitle}</p>
                <p class="card-author">${fav.bookAuthor}</p>
                <div class="card-actions">
                  <button
                    class="btn-sm"
                    @click=${(e: Event) => {
                      e.stopPropagation();
                      this._handleRemove(fav.bookId);
                    }}
                    ?disabled=${this._removingId === fav.bookId}
                  >
                    ${t("book_favorite_remove")}
                  </button>
                </div>
              </div>
            </div>
          `
        )}
      </div>
    `;
  }

  override render() {
    if (this._state === "loading") {
      return html`<div class="state"><span class="spinner"></span></div>`;
    }
    if (this._state === "error") {
      return html`<div class="error-state">${t("favorites_error")}</div>`;
    }

    return html`
      <div class="favorites-page">
        ${(() => {
          const readingNow = this._renderReadingNow();
          return readingNow
            ? html`
                <section>
                  <h2 class="section-title">
                    ${t("favorites_reading_now")}
                  </h2>
                  ${readingNow}
                </section>
              `
            : null;
        })()}
        <section>
          <h2 class="section-title">${t("favorites_title")}</h2>
          ${this._renderFavoritesGrid()}
        </section>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pdfc-member-favorites": PdfcMemberFavorites;
  }
}
