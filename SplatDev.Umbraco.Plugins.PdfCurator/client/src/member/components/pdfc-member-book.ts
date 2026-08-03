import { LitElement, html, css, unsafeCSS } from "lit";
import { customElement, state, property } from "lit/decorators.js";
import type { BookDetail, SimilarBook, ComponentState } from "../types";
import {
  fetchBookDetail,
  fetchSimilarBooks,
  addFavorite,
  removeFavorite,
  bookThumbnailUrl,
  bookFileUrl,
} from "../services/api";
import { t } from "../services/i18n";
import tokensRaw from "../styles/tokens.css?inline";

@customElement("pdfc-member-book")
export class PdfcMemberBook extends LitElement {
  static override styles = [
    unsafeCSS(tokensRaw),
    css`
      :host {
        display: block;
      }

      .book-page {
        display: grid;
        grid-template-columns: 1fr;
        gap: var(--pdfc-space-xl);
      }

      @media (min-width: 768px) {
        .book-page {
          grid-template-columns: 280px 1fr;
        }
      }

      .sidebar {
        display: flex;
        flex-direction: column;
        gap: var(--pdfc-space-md);
      }

      .cover {
        width: 100%;
        border-radius: var(--pdfc-radius-lg);
        box-shadow: var(--pdfc-shadow-md);
        display: block;
      }

      .main {
        display: flex;
        flex-direction: column;
        gap: var(--pdfc-space-lg);
      }

      .header {
        display: flex;
        flex-direction: column;
        gap: var(--pdfc-space-sm);
      }

      .title {
        font-size: 1.75rem;
        font-weight: 700;
        margin: 0;
        line-height: 1.2;
      }

      .meta {
        display: flex;
        flex-wrap: wrap;
        gap: var(--pdfc-space-md);
        font-size: 0.875rem;
        color: var(--pdfc-text-secondary);
      }

      .meta-item {
        display: flex;
        align-items: center;
        gap: 0.25rem;
      }

      .meta-label {
        font-weight: 500;
        color: var(--pdfc-text);
      }

      .description {
        line-height: 1.7;
        color: var(--pdfc-text-secondary);
        margin: 0;
      }

      .actions {
        display: flex;
        flex-wrap: wrap;
        gap: var(--pdfc-space-sm);
      }

      .btn {
        display: inline-flex;
        align-items: center;
        gap: 0.375rem;
        padding: 0.625rem 1.25rem;
        border: 1px solid var(--pdfc-border);
        border-radius: var(--pdfc-radius);
        font-size: 0.9375rem;
        font-family: inherit;
        font-weight: 500;
        cursor: pointer;
        background: var(--pdfc-bg);
        color: var(--pdfc-text);
        transition: background 0.15s, border-color 0.15s;
        text-decoration: none;
      }

      .btn:hover {
        background: var(--pdfc-surface-hover);
      }

      .btn:focus-visible {
        outline: none;
        box-shadow: var(--pdfc-focus-ring);
      }

      .btn-primary {
        background: var(--pdfc-primary);
        border-color: var(--pdfc-primary);
        color: var(--pdfc-primary-foreground);
      }

      .btn-primary:hover {
        background: var(--pdfc-primary-hover);
      }

      .btn-favorite {
        color: #eab308;
        border-color: #eab308;
      }

      .btn-favorite:hover {
        background: #fef9c3;
      }

      .progress-bar {
        width: 100%;
        height: 0.5rem;
        background: var(--pdfc-surface);
        border-radius: 999px;
        overflow: hidden;
      }

      .progress-fill {
        height: 100%;
        background: var(--pdfc-primary);
        border-radius: 999px;
        transition: width 0.3s;
      }

      .progress-text {
        font-size: 0.8125rem;
        color: var(--pdfc-text-secondary);
        margin-top: var(--pdfc-space-xs);
      }

      .section-title {
        font-size: 1.25rem;
        font-weight: 600;
        margin: 0 0 var(--pdfc-space-md);
      }

      .similar-rail {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: var(--pdfc-space-md);
      }

      .similar-card {
        border: 1px solid var(--pdfc-border);
        border-radius: var(--pdfc-radius);
        overflow: hidden;
        cursor: pointer;
        transition: box-shadow 0.2s;
        background: var(--pdfc-bg);
      }

      .similar-card:hover {
        box-shadow: var(--pdfc-shadow-md);
      }

      .similar-card:focus-visible {
        outline: none;
        box-shadow: var(--pdfc-focus-ring);
      }

      .similar-thumb {
        width: 100%;
        aspect-ratio: 3 / 4;
        object-fit: cover;
        background: var(--pdfc-surface);
        display: block;
      }

      .similar-body {
        padding: var(--pdfc-space-sm);
      }

      .similar-title {
        font-size: 0.8125rem;
        font-weight: 500;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        margin: 0;
      }

      .similar-author {
        font-size: 0.75rem;
        color: var(--pdfc-text-secondary);
        margin-top: 0.125rem;
      }

      .state {
        text-align: center;
        padding: var(--pdfc-space-2xl);
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

      .back-link {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        font-size: 0.875rem;
        color: var(--pdfc-primary);
        cursor: pointer;
        border: none;
        background: none;
        font-family: inherit;
        padding: 0;
      }

      .back-link:hover {
        text-decoration: underline;
      }

      .back-link:focus-visible {
        outline: none;
        box-shadow: var(--pdfc-focus-ring);
        border-radius: var(--pdfc-radius-sm);
      }
    `,
  ];

  @property({ type: Number }) bookId = 0;

  @state() private _book: BookDetail | null = null;
  @state() private _similar: SimilarBook[] = [];
  @state() private _state: ComponentState = "loading";
  @state() private _savingFavorite = false;

  override connectedCallback(): void {
    super.connectedCallback();
    this._load();
  }

  private async _load(): Promise<void> {
    if (!this.bookId) return;
    this._state = "loading";
    try {
      const [book, similar] = await Promise.all([
        fetchBookDetail(this.bookId),
        fetchSimilarBooks(this.bookId),
      ]);
      this._book = book;
      this._similar = similar;
      this._state = "loaded";
    } catch {
      this._state = "error";
    }
  }

  private async _toggleFavorite(): Promise<void> {
    if (!this._book || this._savingFavorite) return;
    this._savingFavorite = true;
    try {
      if (this._book.isFavorite) {
        await removeFavorite(this.bookId);
      } else {
        await addFavorite(this.bookId);
      }
      this._book = {
        ...this._book,
        isFavorite: !this._book.isFavorite,
      };
    } catch {
      // silently fail, UI state unchanged
    } finally {
      this._savingFavorite = false;
    }
  }

  private _openReader(): void {
    this.dispatchEvent(
      new CustomEvent("pdfc-open-reader", {
        detail: { bookId: this.bookId, title: this._book?.title },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _navigateBack(): void {
    this.dispatchEvent(
      new CustomEvent("pdfc-navigate", {
        detail: { route: "library" },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _onSimilarClick(book: SimilarBook): void {
    this.dispatchEvent(
      new CustomEvent("pdfc-navigate", {
        detail: { route: "book", bookId: book.id },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _renderLoading() {
    return html`
      <div class="state"><span class="spinner"></span></div>
    `;
  }

  private _renderError() {
    return html`
      <div class="error-state">
        <p>${t("book_error")}</p>
        <button class="btn" @click=${this._load}>Retry</button>
      </div>
    `;
  }

  private _formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  private _renderContent() {
    if (!this._book) return null;
    const b = this._book;
    const progressPct = b.readingProgress
      ? Math.round((b.readingProgress.page / b.readingProgress.pageCount) * 100)
      : 0;

    return html`
      <div class="book-page">
        <div class="sidebar">
          <img
            class="cover"
            src=${bookThumbnailUrl(this.bookId)}
            alt=${`Cover of ${b.title}`}
          />
          <div class="actions">
            <a
              class="btn btn-primary"
              href=${bookFileUrl(this.bookId)}
              download
              >${t("book_download")}</a
            >
            ${b.readingProgress
              ? html`
                  <button class="btn btn-primary" @click=${this._openReader}>
                    ${t("book_continue_reading", {
                      page: b.readingProgress.page,
                    })}
                  </button>
                `
              : html`
                  <button class="btn btn-primary" @click=${this._openReader}>
                    ${t("book_start_reading")}
                  </button>
                `}
            <button
              class="btn ${b.isFavorite ? "btn-favorite" : ""}"
              @click=${this._toggleFavorite}
              ?disabled=${this._savingFavorite}
              .aria-label=${b.isFavorite
                ? t("book_favorite_remove")
                : t("book_favorite_add")}
            >
              ${b.isFavorite ? "\u2605" : "\u2606"}
              ${b.isFavorite
                ? t("book_favorite_remove")
                : t("book_favorite_add")}
            </button>
          </div>
          ${b.readingProgress
            ? html`
                <div class="progress-bar" role="progressbar" aria-valuenow=${progressPct} aria-valuemin="0" aria-valuemax="100">
                  <div class="progress-fill" style="width:${progressPct}%"></div>
                </div>
                <p class="progress-text">
                  ${t("book_continue_reading", { page: b.readingProgress.page })}
                </p>
              `
            : null}
        </div>
        <div class="main">
          <button class="back-link" @click=${this._navigateBack}>
            &larr; ${t("library_title")}
          </button>
          <div class="header">
            <h1 class="title">${b.title}</h1>
            <div class="meta">
              <span class="meta-item"
                ><span class="meta-label">${t("book_author")}:</span>
                ${b.author}</span
              >
              <span class="meta-item"
                ><span class="meta-label">${t("book_category")}:</span>
                ${b.category}</span
              >
              <span class="meta-item"
                ><span class="meta-label">${t("book_pages")}:</span>
                ${b.pageCount}</span
              >
              <span class="meta-item"
                ><span class="meta-label">${t("book_added")}:</span>
                ${this._formatDate(b.createdAt)}</span
              >
            </div>
          </div>
          ${b.description
            ? html`<p class="description">${b.description}</p>`
            : null}
          ${this._renderSimilarSection()}
        </div>
      </div>
    `;
  }

  private _renderSimilarSection() {
    if (!this._similar.length) return null;
    return html`
      <section>
        <h2 class="section-title">${t("book_similar_title")}</h2>
        <div class="similar-rail">
          ${this._similar.map(
            (s) => html`
              <div
                class="similar-card"
                role="button"
                tabindex="0"
                @click=${() => this._onSimilarClick(s)}
                @keydown=${(e: KeyboardEvent) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    this._onSimilarClick(s);
                  }
                }}
                aria-label=${`${s.title} by ${s.author}`}
              >
                <img
                  class="similar-thumb"
                  src=${bookThumbnailUrl(s.id)}
                  alt=""
                  loading="lazy"
                />
                <div class="similar-body">
                  <p class="similar-title">${s.title}</p>
                  <p class="similar-author">${s.author}</p>
                </div>
              </div>
            `
          )}
        </div>
      </section>
    `;
  }

  override render() {
    if (this._state === "loading") return this._renderLoading();
    if (this._state === "error") return this._renderError();
    return this._renderContent();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pdfc-member-book": PdfcMemberBook;
  }
}
