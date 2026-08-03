import { LitElement, html, css, unsafeCSS } from "lit";
import { customElement, state } from "lit/decorators.js";
import type { BookEntry, SortOption, ComponentState } from "../types";
import { fetchBooks, bookThumbnailUrl } from "../services/api";
import { t } from "../services/i18n";
import tokensRaw from "../styles/tokens.css?inline";

@customElement("pdfc-member-library")
export class PdfcMemberLibrary extends LitElement {
  static override styles = [
    unsafeCSS(tokensRaw),
    css`
      :host {
        display: block;
      }

      .library {
        display: flex;
        flex-direction: column;
        gap: var(--pdfc-space-lg);
      }

      .toolbar {
        display: flex;
        flex-wrap: wrap;
        gap: var(--pdfc-space-sm);
        align-items: center;
      }

      .search-wrapper {
        flex: 1 1 240px;
        position: relative;
      }

      .search-input {
        width: 100%;
        padding: 0.625rem 0.875rem 0.625rem 2.5rem;
        border: 1px solid var(--pdfc-border);
        border-radius: var(--pdfc-radius);
        font-size: 0.9375rem;
        font-family: inherit;
        background: var(--pdfc-bg);
        color: var(--pdfc-text);
        box-sizing: border-box;
        transition: border-color 0.15s, box-shadow 0.15s;
      }

      .search-input:focus {
        outline: none;
        border-color: var(--pdfc-border-focus);
        box-shadow: var(--pdfc-focus-ring);
      }

      .search-input::placeholder {
        color: var(--pdfc-text-muted);
      }

      .search-icon {
        position: absolute;
        left: 0.75rem;
        top: 50%;
        transform: translateY(-50%);
        width: 1.125rem;
        height: 1.125rem;
        color: var(--pdfc-text-muted);
        pointer-events: none;
      }

      .select {
        padding: 0.625rem 2rem 0.625rem 0.75rem;
        border: 1px solid var(--pdfc-border);
        border-radius: var(--pdfc-radius);
        font-size: 0.875rem;
        font-family: inherit;
        background: var(--pdfc-bg);
        color: var(--pdfc-text);
        appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 0.6rem center;
        cursor: pointer;
      }

      .select:focus {
        outline: none;
        border-color: var(--pdfc-border-focus);
        box-shadow: var(--pdfc-focus-ring);
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: var(--pdfc-space-lg);
      }

      .card {
        border: 1px solid var(--pdfc-border);
        border-radius: var(--pdfc-radius-lg);
        overflow: hidden;
        background: var(--pdfc-bg);
        transition: box-shadow 0.2s, transform 0.2s;
        cursor: pointer;
      }

      .card:hover {
        box-shadow: var(--pdfc-shadow-md);
        transform: translateY(-2px);
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
        font-size: 0.9375rem;
        font-weight: 600;
        line-height: 1.3;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        margin: 0;
      }

      .card-author {
        font-size: 0.8125rem;
        color: var(--pdfc-text-secondary);
        margin-top: var(--pdfc-space-xs);
      }

      .card-category {
        display: inline-block;
        margin-top: var(--pdfc-space-xs);
        font-size: 0.75rem;
        padding: 0.125rem 0.5rem;
        background: var(--pdfc-surface);
        border-radius: 999px;
        color: var(--pdfc-text-secondary);
      }

      .paginator {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: var(--pdfc-space-sm);
        padding-top: var(--pdfc-space-md);
      }

      .page-btn {
        padding: 0.5rem 0.875rem;
        border: 1px solid var(--pdfc-border);
        border-radius: var(--pdfc-radius);
        background: var(--pdfc-bg);
        color: var(--pdfc-text);
        font-size: 0.875rem;
        font-family: inherit;
        cursor: pointer;
        transition: background 0.15s;
      }

      .page-btn:hover:not(:disabled) {
        background: var(--pdfc-surface-hover);
      }

      .page-btn:disabled {
        opacity: 0.4;
        cursor: default;
      }

      .page-btn:focus-visible {
        outline: none;
        box-shadow: var(--pdfc-focus-ring);
      }

      .page-info {
        font-size: 0.875rem;
        color: var(--pdfc-text-secondary);
      }

      .state {
        text-align: center;
        padding: var(--pdfc-space-2xl) var(--pdfc-space-lg);
        color: var(--pdfc-text-secondary);
      }

      .state-icon {
        font-size: 2.5rem;
        margin-bottom: var(--pdfc-space-sm);
        display: block;
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
      }

      @media (max-width: 640px) {
        .toolbar {
          flex-direction: column;
          align-items: stretch;
        }

        .grid {
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: var(--pdfc-space-md);
        }
      }
    `,
  ];

  @state() private _books: BookEntry[] = [];
  @state() private _state: ComponentState = "loading";
  @state() private _query = "";
  @state() private _category = "";
  @state() private _sort: SortOption = "recent";
  @state() private _page = 1;
  @state() private _total = 0;
  @state() private _pageSize = 12;
  private _debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private _categories: string[] = [];

  override connectedCallback(): void {
    super.connectedCallback();
    this._load();
  }

  private _load(): void {
    this._state = "loading";
    fetchBooks({
      query: this._query || undefined,
      category: this._category || undefined,
      sort: this._sort,
      page: this._page,
    })
      .then((res) => {
        this._books = res.items;
        this._total = res.total;
        this._pageSize = res.pageSize;
        this._state = res.items.length === 0 ? "empty" : "loaded";
        const cats = new Set(res.items.map((b) => b.category));
        this._categories = [...cats].sort();
      })
      .catch(() => {
        this._state = "error";
      });
  }

  private _onSearchInput(e: Event): void {
    this._query = (e.target as HTMLInputElement).value;
    if (this._debounceTimer) clearTimeout(this._debounceTimer);
    this._debounceTimer = setTimeout(() => {
      this._page = 1;
      this._load();
    }, 300);
  }

  private _onCategoryChange(e: Event): void {
    this._category = (e.target as HTMLSelectElement).value;
    this._page = 1;
    this._load();
  }

  private _onSortChange(e: Event): void {
    this._sort = (e.target as HTMLSelectElement).value as SortOption;
    this._page = 1;
    this._load();
  }

  private _goToPage(page: number): void {
    this._page = page;
    this._load();
    this.shadowRoot
      ?.querySelector(".library")
      ?.scrollIntoView({ behavior: "smooth" });
  }

  private _onCardClick(book: BookEntry): void {
    this.dispatchEvent(
      new CustomEvent("pdfc-navigate", {
        detail: { route: "book", bookId: book.id },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _onCardKeydown(e: KeyboardEvent, book: BookEntry): void {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      this._onCardClick(book);
    }
  }

  private _totalPages(): number {
    return Math.max(1, Math.ceil(this._total / this._pageSize));
  }

  private _renderToolbar() {
    return html`
      <div class="toolbar">
        <div class="search-wrapper">
          <svg
            class="search-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            class="search-input"
            type="search"
            .placeholder=${t("library_search_placeholder")}
            .value=${this._query}
            @input=${this._onSearchInput}
            aria-label=${t("library_search_placeholder")}
          />
        </div>
        <select
          class="select"
          .value=${this._category}
          @change=${this._onCategoryChange}
          aria-label="Filter by category"
        >
          <option value="">${t("library_all_categories")}</option>
          ${this._categories.map(
            (cat) => html`<option value=${cat}>${cat}</option>`
          )}
        </select>
        <select
          class="select"
          .value=${this._sort}
          @change=${this._onSortChange}
          aria-label="Sort books"
        >
          <option value="recent">${t("library_sort_recent")}</option>
          <option value="title">${t("library_sort_title")}</option>
          <option value="author">${t("library_sort_author")}</option>
        </select>
      </div>
    `;
  }

  private _renderGrid() {
    return html`
      <div class="grid">
        ${this._books.map(
          (book) => html`
            <div
              class="card"
              role="button"
              tabindex="0"
              @click=${() => this._onCardClick(book)}
              @keydown=${(e: KeyboardEvent) => this._onCardKeydown(e, book)}
              aria-label=${`${book.title} by ${book.author}`}
            >
              <img
                class="card-thumb"
                src=${bookThumbnailUrl(book.id)}
                alt=${`Cover of ${book.title}`}
                loading="lazy"
              />
              <div class="card-body">
                <h3 class="card-title">${book.title}</h3>
                <p class="card-author">${book.author}</p>
                <span class="card-category">${book.category}</span>
              </div>
            </div>
          `
        )}
      </div>
    `;
  }

  private _renderPagination() {
    const totalPages = this._totalPages();
    if (totalPages <= 1) return null;
    return html`
      <div class="paginator">
        <button
          class="page-btn"
          ?disabled=${this._page <= 1}
          @click=${() => this._goToPage(this._page - 1)}
          aria-label="Previous page"
        >
          &laquo;
        </button>
        <span class="page-info"
          >${t("library_page")} ${this._page} ${t("library_of")}
          ${totalPages}</span
        >
        <button
          class="page-btn"
          ?disabled=${this._page >= totalPages}
          @click=${() => this._goToPage(this._page + 1)}
          aria-label="Next page"
        >
          &raquo;
        </button>
      </div>
    `;
  }

  private _renderEmpty() {
    if (this._state === "loading") {
      return html`
        <div class="state">
          <span class="spinner"></span>
        </div>
      `;
    }
    if (this._state === "error") {
      return html`<div class="state error-state">${t("library_error")}</div>`;
    }
    if (this._state === "empty" && this._query) {
      return html`<div class="state">${t("library_no_results")}</div>`;
    }
    if (this._state === "empty") {
      return html`
        <div class="state">
          <span class="state-icon" aria-hidden="true">&#128218;</span>
          ${t("library_empty")}
        </div>
      `;
    }
    return null;
  }

  override render() {
    return html`
      <div class="library">
        <h2 class="sr-only">${t("library_title")}</h2>
        ${this._renderToolbar()}
        ${this._state === "loaded" ? this._renderGrid() : this._renderEmpty()}
        ${this._renderPagination()}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pdfc-member-library": PdfcMemberLibrary;
  }
}
