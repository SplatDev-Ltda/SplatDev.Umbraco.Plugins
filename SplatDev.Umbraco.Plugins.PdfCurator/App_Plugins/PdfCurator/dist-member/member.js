import { r as m, t as u, i as _, a as d, b as y, f as x, c as a, d as o, e as g, g as k, n as $, h as C, j as I, k as w, l as P, m as z, o as E, p as F, s as S } from "./chunks/reader-CVX3JKbe.js";
var T = Object.defineProperty, R = Object.getOwnPropertyDescriptor, p = (e, r, t, s) => {
  for (var i = s > 1 ? void 0 : s ? R(r, t) : r, n = e.length - 1, c; n >= 0; n--)
    (c = e[n]) && (i = (s ? c(r, t, i) : c(i)) || i);
  return s && i && T(r, t, i), i;
};
let l = class extends y {
  constructor() {
    super(...arguments), this._books = [], this._state = "loading", this._query = "", this._category = "", this._sort = "recent", this._page = 1, this._total = 0, this._pageSize = 12, this._debounceTimer = null, this._categories = [];
  }
  connectedCallback() {
    super.connectedCallback(), this._load();
  }
  _load() {
    this._state = "loading", x({
      query: this._query || void 0,
      category: this._category || void 0,
      sort: this._sort,
      page: this._page
    }).then((e) => {
      this._books = e.items, this._total = e.total, this._pageSize = e.pageSize, this._state = e.items.length === 0 ? "empty" : "loaded";
      const r = new Set(e.items.map((t) => t.category));
      this._categories = [...r].sort();
    }).catch(() => {
      this._state = "error";
    });
  }
  _onSearchInput(e) {
    this._query = e.target.value, this._debounceTimer && clearTimeout(this._debounceTimer), this._debounceTimer = setTimeout(() => {
      this._page = 1, this._load();
    }, 300);
  }
  _onCategoryChange(e) {
    this._category = e.target.value, this._page = 1, this._load();
  }
  _onSortChange(e) {
    this._sort = e.target.value, this._page = 1, this._load();
  }
  _goToPage(e) {
    var r, t;
    this._page = e, this._load(), (t = (r = this.shadowRoot) == null ? void 0 : r.querySelector(".library")) == null || t.scrollIntoView({ behavior: "smooth" });
  }
  _onCardClick(e) {
    this.dispatchEvent(
      new CustomEvent("pdfc-navigate", {
        detail: { route: "book", bookId: e.id },
        bubbles: !0,
        composed: !0
      })
    );
  }
  _onCardKeydown(e, r) {
    (e.key === "Enter" || e.key === " ") && (e.preventDefault(), this._onCardClick(r));
  }
  _totalPages() {
    return Math.max(1, Math.ceil(this._total / this._pageSize));
  }
  _renderToolbar() {
    return o`
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
            .placeholder=${a("library_search_placeholder")}
            .value=${this._query}
            @input=${this._onSearchInput}
            aria-label=${a("library_search_placeholder")}
          />
        </div>
        <select
          class="select"
          .value=${this._category}
          @change=${this._onCategoryChange}
          aria-label="Filter by category"
        >
          <option value="">${a("library_all_categories")}</option>
          ${this._categories.map(
      (e) => o`<option value=${e}>${e}</option>`
    )}
        </select>
        <select
          class="select"
          .value=${this._sort}
          @change=${this._onSortChange}
          aria-label="Sort books"
        >
          <option value="recent">${a("library_sort_recent")}</option>
          <option value="title">${a("library_sort_title")}</option>
          <option value="author">${a("library_sort_author")}</option>
        </select>
      </div>
    `;
  }
  _renderGrid() {
    return o`
      <div class="grid">
        ${this._books.map(
      (e) => o`
            <div
              class="card"
              role="button"
              tabindex="0"
              @click=${() => this._onCardClick(e)}
              @keydown=${(r) => this._onCardKeydown(r, e)}
              aria-label=${`${e.title} by ${e.author}`}
            >
              <img
                class="card-thumb"
                src=${g(e.id)}
                alt=${`Cover of ${e.title}`}
                loading="lazy"
              />
              <div class="card-body">
                <h3 class="card-title">${e.title}</h3>
                <p class="card-author">${e.author}</p>
                <span class="card-category">${e.category}</span>
              </div>
            </div>
          `
    )}
      </div>
    `;
  }
  _renderPagination() {
    const e = this._totalPages();
    return e <= 1 ? null : o`
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
          >${a("library_page")} ${this._page} ${a("library_of")}
          ${e}</span
        >
        <button
          class="page-btn"
          ?disabled=${this._page >= e}
          @click=${() => this._goToPage(this._page + 1)}
          aria-label="Next page"
        >
          &raquo;
        </button>
      </div>
    `;
  }
  _renderEmpty() {
    return this._state === "loading" ? o`
        <div class="state">
          <span class="spinner"></span>
        </div>
      ` : this._state === "error" ? o`<div class="state error-state">${a("library_error")}</div>` : this._state === "empty" && this._query ? o`<div class="state">${a("library_no_results")}</div>` : this._state === "empty" ? o`
        <div class="state">
          <span class="state-icon" aria-hidden="true">&#128218;</span>
          ${a("library_empty")}
        </div>
      ` : null;
  }
  render() {
    return o`
      <div class="library">
        <h2 class="sr-only">${a("library_title")}</h2>
        ${this._renderToolbar()}
        ${this._state === "loaded" ? this._renderGrid() : this._renderEmpty()}
        ${this._renderPagination()}
      </div>
    `;
  }
};
l.styles = [
  m(u),
  _`
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
    `
];
p([
  d()
], l.prototype, "_books", 2);
p([
  d()
], l.prototype, "_state", 2);
p([
  d()
], l.prototype, "_query", 2);
p([
  d()
], l.prototype, "_category", 2);
p([
  d()
], l.prototype, "_sort", 2);
p([
  d()
], l.prototype, "_page", 2);
p([
  d()
], l.prototype, "_total", 2);
p([
  d()
], l.prototype, "_pageSize", 2);
l = p([
  k("pdfc-member-library")
], l);
var B = Object.defineProperty, D = Object.getOwnPropertyDescriptor, f = (e, r, t, s) => {
  for (var i = s > 1 ? void 0 : s ? D(r, t) : r, n = e.length - 1, c; n >= 0; n--)
    (c = e[n]) && (i = (s ? c(r, t, i) : c(i)) || i);
  return s && i && B(r, t, i), i;
};
let b = class extends y {
  constructor() {
    super(...arguments), this.bookId = 0, this._book = null, this._similar = [], this._state = "loading", this._savingFavorite = !1;
  }
  connectedCallback() {
    super.connectedCallback(), this._load();
  }
  async _load() {
    if (this.bookId) {
      this._state = "loading";
      try {
        const [e, r] = await Promise.all([
          C(this.bookId),
          I(this.bookId)
        ]);
        this._book = e, this._similar = r, this._state = "loaded";
      } catch {
        this._state = "error";
      }
    }
  }
  async _toggleFavorite() {
    if (!(!this._book || this._savingFavorite)) {
      this._savingFavorite = !0;
      try {
        this._book.isFavorite ? await w(this.bookId) : await P(this.bookId), this._book = {
          ...this._book,
          isFavorite: !this._book.isFavorite
        };
      } catch {
      } finally {
        this._savingFavorite = !1;
      }
    }
  }
  _openReader() {
    var e;
    this.dispatchEvent(
      new CustomEvent("pdfc-open-reader", {
        detail: { bookId: this.bookId, title: (e = this._book) == null ? void 0 : e.title },
        bubbles: !0,
        composed: !0
      })
    );
  }
  _navigateBack() {
    this.dispatchEvent(
      new CustomEvent("pdfc-navigate", {
        detail: { route: "library" },
        bubbles: !0,
        composed: !0
      })
    );
  }
  _onSimilarClick(e) {
    this.dispatchEvent(
      new CustomEvent("pdfc-navigate", {
        detail: { route: "book", bookId: e.id },
        bubbles: !0,
        composed: !0
      })
    );
  }
  _renderLoading() {
    return o`
      <div class="state"><span class="spinner"></span></div>
    `;
  }
  _renderError() {
    return o`
      <div class="error-state">
        <p>${a("book_error")}</p>
        <button class="btn" @click=${this._load}>Retry</button>
      </div>
    `;
  }
  _formatDate(e) {
    return new Date(e).toLocaleDateString(void 0, {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  }
  _renderContent() {
    if (!this._book) return null;
    const e = this._book, r = e.readingProgress ? Math.round(e.readingProgress.page / e.readingProgress.pageCount * 100) : 0;
    return o`
      <div class="book-page">
        <div class="sidebar">
          <img
            class="cover"
            src=${g(this.bookId)}
            alt=${`Cover of ${e.title}`}
          />
          <div class="actions">
            <a
              class="btn btn-primary"
              href=${z(this.bookId)}
              download
              >${a("book_download")}</a
            >
            ${e.readingProgress ? o`
                  <button class="btn btn-primary" @click=${this._openReader}>
                    ${a("book_continue_reading", {
      page: e.readingProgress.page
    })}
                  </button>
                ` : o`
                  <button class="btn btn-primary" @click=${this._openReader}>
                    ${a("book_start_reading")}
                  </button>
                `}
            <button
              class="btn ${e.isFavorite ? "btn-favorite" : ""}"
              @click=${this._toggleFavorite}
              ?disabled=${this._savingFavorite}
              .aria-label=${e.isFavorite ? a("book_favorite_remove") : a("book_favorite_add")}
            >
              ${e.isFavorite ? "★" : "☆"}
              ${e.isFavorite ? a("book_favorite_remove") : a("book_favorite_add")}
            </button>
          </div>
          ${e.readingProgress ? o`
                <div class="progress-bar" role="progressbar" aria-valuenow=${r} aria-valuemin="0" aria-valuemax="100">
                  <div class="progress-fill" style="width:${r}%"></div>
                </div>
                <p class="progress-text">
                  ${a("book_continue_reading", { page: e.readingProgress.page })}
                </p>
              ` : null}
        </div>
        <div class="main">
          <button class="back-link" @click=${this._navigateBack}>
            &larr; ${a("library_title")}
          </button>
          <div class="header">
            <h1 class="title">${e.title}</h1>
            <div class="meta">
              <span class="meta-item"
                ><span class="meta-label">${a("book_author")}:</span>
                ${e.author}</span
              >
              <span class="meta-item"
                ><span class="meta-label">${a("book_category")}:</span>
                ${e.category}</span
              >
              <span class="meta-item"
                ><span class="meta-label">${a("book_pages")}:</span>
                ${e.pageCount}</span
              >
              <span class="meta-item"
                ><span class="meta-label">${a("book_added")}:</span>
                ${this._formatDate(e.createdAt)}</span
              >
            </div>
          </div>
          ${e.description ? o`<p class="description">${e.description}</p>` : null}
          ${this._renderSimilarSection()}
        </div>
      </div>
    `;
  }
  _renderSimilarSection() {
    return this._similar.length ? o`
      <section>
        <h2 class="section-title">${a("book_similar_title")}</h2>
        <div class="similar-rail">
          ${this._similar.map(
      (e) => o`
              <div
                class="similar-card"
                role="button"
                tabindex="0"
                @click=${() => this._onSimilarClick(e)}
                @keydown=${(r) => {
        (r.key === "Enter" || r.key === " ") && (r.preventDefault(), this._onSimilarClick(e));
      }}
                aria-label=${`${e.title} by ${e.author}`}
              >
                <img
                  class="similar-thumb"
                  src=${g(e.id)}
                  alt=""
                  loading="lazy"
                />
                <div class="similar-body">
                  <p class="similar-title">${e.title}</p>
                  <p class="similar-author">${e.author}</p>
                </div>
              </div>
            `
    )}
        </div>
      </section>
    ` : null;
  }
  render() {
    return this._state === "loading" ? this._renderLoading() : this._state === "error" ? this._renderError() : this._renderContent();
  }
};
b.styles = [
  m(u),
  _`
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
    `
];
f([
  $({ type: Number })
], b.prototype, "bookId", 2);
f([
  d()
], b.prototype, "_book", 2);
f([
  d()
], b.prototype, "_similar", 2);
f([
  d()
], b.prototype, "_state", 2);
f([
  d()
], b.prototype, "_savingFavorite", 2);
b = f([
  k("pdfc-member-book")
], b);
var L = Object.defineProperty, j = Object.getOwnPropertyDescriptor, v = (e, r, t, s) => {
  for (var i = s > 1 ? void 0 : s ? j(r, t) : r, n = e.length - 1, c; n >= 0; n--)
    (c = e[n]) && (i = (s ? c(r, t, i) : c(i)) || i);
  return s && i && L(r, t, i), i;
};
let h = class extends y {
  constructor() {
    super(...arguments), this._favorites = [], this._progress = [], this._state = "loading", this._removingId = null;
  }
  connectedCallback() {
    super.connectedCallback(), this._load();
  }
  async _load() {
    this._state = "loading";
    try {
      const [e, r] = await Promise.all([
        E(),
        F()
      ]);
      this._favorites = e, this._progress = r, this._state = "loaded";
    } catch {
      this._state = "error";
    }
  }
  async _handleRemove(e) {
    this._removingId = e;
    try {
      await w(e), this._favorites = this._favorites.filter((r) => r.bookId !== e);
    } catch {
    } finally {
      this._removingId = null;
    }
  }
  _navigateToBook(e) {
    this.dispatchEvent(
      new CustomEvent("pdfc-navigate", {
        detail: { route: "book", bookId: e },
        bubbles: !0,
        composed: !0
      })
    );
  }
  _openReader(e) {
    const r = this._favorites.find((t) => t.bookId === e);
    this.dispatchEvent(
      new CustomEvent("pdfc-open-reader", {
        detail: { bookId: e, title: r == null ? void 0 : r.bookTitle },
        bubbles: !0,
        composed: !0
      })
    );
  }
  _readingNowFavorites() {
    const e = new Set(this._progress.map((r) => r.bookId));
    return this._favorites.filter((r) => e.has(r.bookId));
  }
  _readingProgressFor(e) {
    return this._progress.find((r) => r.bookId === e);
  }
  _renderReadingNow() {
    const e = this._readingNowFavorites();
    return e.length ? o`
      <div>
        ${e.map((r) => {
      const t = this._readingProgressFor(r.bookId);
      return o`
            <div
              class="reading-item"
              role="button"
              tabindex="0"
              @click=${() => this._openReader(r.bookId)}
              @keydown=${(s) => {
        (s.key === "Enter" || s.key === " ") && (s.preventDefault(), this._openReader(r.bookId));
      }}
              aria-label=${`Continue reading ${r.bookTitle}`}
            >
              <img
                class="reading-thumb"
                src=${g(r.bookId)}
                alt=""
                loading="lazy"
              />
              <div class="reading-info">
                <p class="reading-title">${r.bookTitle}</p>
                <p class="reading-author">${r.bookAuthor}</p>
                ${t ? o`<p class="reading-progress">
                      ${a("reader_page")} ${t.page}
                      ${a("reader_of")} ${t.pageCount}
                    </p>` : null}
              </div>
            </div>
          `;
    })}
      </div>
    ` : o`<div class="state">${a("favorites_no_reading")}</div>`;
  }
  _renderFavoritesGrid() {
    return this._favorites.length ? o`
      <div class="grid">
        ${this._favorites.map(
      (e) => o`
            <div
              class="card"
              role="button"
              tabindex="0"
              @click=${() => this._navigateToBook(e.bookId)}
              @keydown=${(r) => {
        (r.key === "Enter" || r.key === " ") && (r.preventDefault(), this._navigateToBook(e.bookId));
      }}
              aria-label=${e.bookTitle}
            >
              <img
                class="card-thumb"
                src=${g(e.bookId)}
                alt=""
                loading="lazy"
              />
              <div class="card-body">
                <p class="card-title">${e.bookTitle}</p>
                <p class="card-author">${e.bookAuthor}</p>
                <div class="card-actions">
                  <button
                    class="btn-sm"
                    @click=${(r) => {
        r.stopPropagation(), this._handleRemove(e.bookId);
      }}
                    ?disabled=${this._removingId === e.bookId}
                  >
                    ${a("book_favorite_remove")}
                  </button>
                </div>
              </div>
            </div>
          `
    )}
      </div>
    ` : o`<div class="state">${a("favorites_no_favorites")}</div>`;
  }
  render() {
    return this._state === "loading" ? o`<div class="state"><span class="spinner"></span></div>` : this._state === "error" ? o`<div class="error-state">${a("favorites_error")}</div>` : o`
      <div class="favorites-page">
        ${(() => {
      const e = this._renderReadingNow();
      return e ? o`
                <section>
                  <h2 class="section-title">
                    ${a("favorites_reading_now")}
                  </h2>
                  ${e}
                </section>
              ` : null;
    })()}
        <section>
          <h2 class="section-title">${a("favorites_title")}</h2>
          ${this._renderFavoritesGrid()}
        </section>
      </div>
    `;
  }
};
h.styles = [
  m(u),
  _`
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
    `
];
v([
  d()
], h.prototype, "_favorites", 2);
v([
  d()
], h.prototype, "_progress", 2);
v([
  d()
], h.prototype, "_state", 2);
v([
  d()
], h.prototype, "_removingId", 2);
h = v([
  k("pdfc-member-favorites")
], h);
class O {
  constructor() {
    const r = document.getElementById("pdfc-app");
    if (!r) {
      console.warn("pdfc-app container not found");
      return;
    }
    this._host = r;
    const t = r.dataset.lang || "en";
    S(t), this._listen(), this._route();
  }
  _listen() {
    document.addEventListener("pdfc-navigate", (r) => {
      this._handleNavigate(r.detail);
    }), document.addEventListener("pdfc-open-reader", (r) => {
      this._openReader(r.detail);
    }), document.addEventListener("pdfc-close-reader", () => {
      this._closeReader();
    });
  }
  _handleNavigate(r) {
    r.route === "book" && r.bookId ? this._showBook(r.bookId) : this._showLibrary();
  }
  _showLibrary() {
    this._host.innerHTML = "<pdfc-member-library></pdfc-member-library>", window.history.pushState({}, "", window.location.pathname);
  }
  _showBook(r) {
    this._host.innerHTML = `<pdfc-member-book bookId="${r}"></pdfc-member-book>`, window.scrollTo({ top: 0, behavior: "smooth" });
  }
  _openReader(r) {
    const t = document.querySelector("pdfc-reader");
    t && t.remove();
    const s = document.createElement("pdfc-reader");
    s.bookId = r.bookId, s.bookTitle = r.title || "", document.body.appendChild(s);
  }
  _closeReader() {
    const r = document.querySelector("pdfc-reader");
    r && r.remove();
  }
  _route() {
    const r = window.location.hash.replace("#", "");
    if (r.startsWith("book/")) {
      const t = parseInt(r.split("/")[1], 10);
      if (!isNaN(t)) {
        this._showBook(t);
        return;
      }
    }
    if (r === "favorites") {
      this._host.innerHTML = "<pdfc-member-favorites></pdfc-member-favorites>";
      return;
    }
    this._showLibrary();
  }
}
const q = new O();
Object.assign(window, { __pdfCuratorApp: q });
export {
  O as PdfCuratorApp,
  S as setLanguage,
  a as t
};
//# sourceMappingURL=member.js.map
