import { LitElement, html, css, nothing } from "@umbraco-cms/backoffice/external/lit";
import { customElement, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";

import { createAuthFetch } from "./auth-fetch";

interface ForumCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  sortOrder: number;
}

interface ForumThread {
  id: number;
  title: string;
  slug: string;
  authorName: string;
  authorEmail: string;
  createdAt: string;
  isLocked: boolean;
  isPinned: boolean;
  viewCount: number;
  replyCount: number;
  category: ForumCategory | null;
}

@customElement("forums-dashboard")
export class ForumsDashboardElement extends UmbElementMixin(LitElement) {
  readonly #fetch = createAuthFetch(this);

  static override styles = css`
    :host {
      display: block;
      padding: var(--uui-size-layout-1, 24px);
    }

    h1 {
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0 0 var(--uui-size-space-3, 8px);
    }

    p.description {
      color: var(--uui-color-text-alt, #6b7280);
      margin: 0 0 var(--uui-size-space-6, 24px);
    }

    uui-tab-group {
      margin-bottom: var(--uui-size-space-5, 16px);
    }

    .tab-content {
      margin-top: var(--uui-size-space-5, 16px);
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: var(--uui-size-space-4, 12px);
      margin-bottom: var(--uui-size-space-5, 16px);
    }

    .stat-label {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--uui-color-text-alt, #6b7280);
      margin: 0 0 4px;
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0;
    }

    .badge {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .badge.locked { background: #fee2e2; color: #991b1b; }
    .badge.open { background: #d1fae5; color: #065f46; }
    .badge.pinned { background: #dbeafe; color: #1e40af; }

    .category-card {
      border: 1px solid var(--uui-color-border, #e5e7eb);
      border-radius: 6px;
      padding: 16px;
      background: var(--uui-color-surface, #fff);
      cursor: pointer;
      transition: border-color 0.15s;
    }

    .category-card:hover {
      border-color: var(--uui-color-focus, #6366f1);
    }

    .category-card h3 {
      margin: 0 0 4px;
      font-size: 1rem;
      font-weight: 600;
    }

    .category-card p {
      margin: 0;
      font-size: 0.875rem;
      color: var(--uui-color-text-alt, #6b7280);
    }

    .categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 12px;
    }

    uui-table {
      width: 100%;
    }

    .pagination {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 12px;
      font-size: 0.875rem;
    }

    .empty {
      color: var(--uui-color-text-alt, #6b7280);
      padding: 24px 0;
    }

    .breadcrumb {
      font-size: 0.875rem;
      color: var(--uui-color-text-alt, #6b7280);
      margin-bottom: 12px;
    }

    .breadcrumb a {
      cursor: pointer;
      text-decoration: underline;
    }
  `;

  @state() private _activeTab: string = "categories";
  @state() private _categories: ForumCategory[] = [];
  @state() private _selectedCategory: ForumCategory | null = null;
  @state() private _threads: ForumThread[] = [];
  @state() private _totalThreads: number = 0;
  @state() private _page: number = 1;
  @state() private _loading: boolean = false;

  private readonly _pageSize = 20;
  private readonly _apiBase = "/umbraco/api/forums";

  override connectedCallback(): void {
    super.connectedCallback();
    this._loadCategories();
  }

  private async _loadCategories(): Promise<void> {
    this._loading = true;
    try {
      const response = await this.#fetch(`${this._apiBase}/GetCategories`);
      if (response.ok) this._categories = await response.json();
    } catch {
      this._categories = [];
    } finally {
      this._loading = false;
    }
  }

  private async _selectCategory(cat: ForumCategory): Promise<void> {
    this._selectedCategory = cat;
    this._page = 1;
    this._activeTab = "threads";
    await this._loadThreads();
  }

  private async _loadThreads(): Promise<void> {
    if (!this._selectedCategory) return;
    this._loading = true;
    try {
      const response = await this.#fetch(
        `${this._apiBase}/GetThreads?categoryId=${this._selectedCategory.id}&page=${this._page}&pageSize=${this._pageSize}`
      );
      if (response.ok) {
        const data = await response.json();
        this._threads = data.threads ?? [];
        this._totalThreads = data.total ?? 0;
      }
    } catch {
      this._threads = [];
    } finally {
      this._loading = false;
    }
  }

  private async _lockThread(thread: ForumThread): Promise<void> {
    await this.#fetch(`${this._apiBase}/LockThread?threadId=${thread.id}&locked=${!thread.isLocked}`, {
      method: "POST",
    });
    thread.isLocked = !thread.isLocked;
    this.requestUpdate();
  }

  private async _pinThread(thread: ForumThread): Promise<void> {
    await this.#fetch(`${this._apiBase}/PinThread?threadId=${thread.id}&pinned=${!thread.isPinned}`, {
      method: "POST",
    });
    thread.isPinned = !thread.isPinned;
    this.requestUpdate();
  }

  private async _deleteThread(threadId: number): Promise<void> {
    if (!confirm("Delete this thread and all its replies?")) return;
    await this.#fetch(`${this._apiBase}/DeleteThread?threadId=${threadId}`, { method: "DELETE" });
    this._threads = this._threads.filter((t) => t.id !== threadId);
    this._totalThreads--;
    this.requestUpdate();
  }

  private _formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  private async _prevPage(): Promise<void> {
    if (this._page > 1) {
      this._page--;
      await this._loadThreads();
    }
  }

  private async _nextPage(): Promise<void> {
    if (this._page * this._pageSize < this._totalThreads) {
      this._page++;
      await this._loadThreads();
    }
  }

  private _renderCategoriesTab() {
    if (this._loading) return html`<p>Loading categories...</p>`;

    return html`
      <div class="stats-grid">
        <uui-box>
          <p class="stat-label">Categories</p>
          <p class="stat-value">${this._categories.length}</p>
        </uui-box>
      </div>

      <uui-box headline="Forum Categories">
        ${this._categories.length === 0
          ? html`<p class="empty">No categories found.</p>`
          : html`
              <div class="categories-grid">
                ${this._categories.map(
                  (cat) => html`
                    <div class="category-card" @click=${() => this._selectCategory(cat)}>
                      <h3>${cat.name}</h3>
                      <p>${cat.description || "No description"}</p>
                      <small style="color: var(--uui-color-text-alt);">
                        Slug: <code>${cat.slug}</code> &middot; Sort: ${cat.sortOrder}
                      </small>
                    </div>
                  `
                )}
              </div>
            `}
      </uui-box>
    `;
  }

  private _renderThreadsTab() {
    if (this._loading) return html`<p>Loading threads...</p>`;

    return html`
      <div class="breadcrumb">
        <a @click=${() => { this._activeTab = "categories"; }}>Categories</a>
        &rsaquo; ${this._selectedCategory?.name ?? ""}
      </div>

      <div class="stats-grid">
        <uui-box>
          <p class="stat-label">Total Threads</p>
          <p class="stat-value">${this._totalThreads}</p>
        </uui-box>
        <uui-box>
          <p class="stat-label">Pinned</p>
          <p class="stat-value">${this._threads.filter((t) => t.isPinned).length}</p>
        </uui-box>
        <uui-box>
          <p class="stat-label">Locked</p>
          <p class="stat-value">${this._threads.filter((t) => t.isLocked).length}</p>
        </uui-box>
      </div>

      <uui-box headline="Threads in ${this._selectedCategory?.name ?? ""}">
        ${this._threads.length === 0
          ? html`<p class="empty">No threads in this category.</p>`
          : html`
              <uui-table>
                <uui-table-head>
                  <uui-table-head-cell>Title</uui-table-head-cell>
                  <uui-table-head-cell>Author</uui-table-head-cell>
                  <uui-table-head-cell>Replies</uui-table-head-cell>
                  <uui-table-head-cell>Views</uui-table-head-cell>
                  <uui-table-head-cell>Created</uui-table-head-cell>
                  <uui-table-head-cell>Status</uui-table-head-cell>
                  <uui-table-head-cell>Actions</uui-table-head-cell>
                </uui-table-head>
                ${this._threads.map(
                  (thread) => html`
                    <uui-table-row>
                      <uui-table-cell>
                        ${thread.isPinned ? html`<span title="Pinned">&#128204;</span> ` : nothing}
                        <strong>${thread.title}</strong>
                      </uui-table-cell>
                      <uui-table-cell>${thread.authorName}</uui-table-cell>
                      <uui-table-cell>${thread.replyCount}</uui-table-cell>
                      <uui-table-cell>${thread.viewCount}</uui-table-cell>
                      <uui-table-cell>${this._formatDate(thread.createdAt)}</uui-table-cell>
                      <uui-table-cell>
                        <span class="badge ${thread.isLocked ? "locked" : "open"}">
                          ${thread.isLocked ? "Locked" : "Open"}
                        </span>
                      </uui-table-cell>
                      <uui-table-cell>
                        <uui-button
                          look="secondary"
                          label="${thread.isLocked ? "Unlock" : "Lock"}"
                          @click=${() => this._lockThread(thread)}
                        >${thread.isLocked ? "Unlock" : "Lock"}</uui-button>
                        <uui-button
                          look="secondary"
                          label="${thread.isPinned ? "Unpin" : "Pin"}"
                          @click=${() => this._pinThread(thread)}
                        >${thread.isPinned ? "Unpin" : "Pin"}</uui-button>
                        <uui-button
                          look="danger"
                          label="Delete"
                          @click=${() => this._deleteThread(thread.id)}
                        >Delete</uui-button>
                      </uui-table-cell>
                    </uui-table-row>
                  `
                )}
              </uui-table>

              ${this._totalThreads > this._pageSize
                ? html`
                    <div class="pagination">
                      <uui-button
                        look="secondary"
                        label="Previous"
                        ?disabled=${this._page === 1}
                        @click=${this._prevPage}
                      >Previous</uui-button>
                      <span>Page ${this._page}</span>
                      <uui-button
                        look="secondary"
                        label="Next"
                        ?disabled=${this._page * this._pageSize >= this._totalThreads}
                        @click=${this._nextPage}
                      >Next</uui-button>
                    </div>
                  `
                : nothing}
            `}
      </uui-box>
    `;
  }

  override render() {
    return html`
      <h1>Forums Manager</h1>
      <p class="description">
        Manage discussion forum categories, threads, replies and moderation from the Umbraco backoffice.
      </p>

      <uui-tab-group>
        <uui-tab
          label="Categories"
          ?active=${this._activeTab === "categories"}
          @click=${() => (this._activeTab = "categories")}
        >Categories</uui-tab>
        ${this._selectedCategory
          ? html`
              <uui-tab
                label="Threads"
                ?active=${this._activeTab === "threads"}
                @click=${() => (this._activeTab = "threads")}
              >Threads: ${this._selectedCategory.name}</uui-tab>
            `
          : nothing}
      </uui-tab-group>

      <div class="tab-content">
        ${this._activeTab === "categories"
          ? this._renderCategoriesTab()
          : this._renderThreadsTab()}
      </div>
    `;
  }
}

export default ForumsDashboardElement;

declare global {
  interface HTMLElementTagNameMap {
    "forums-dashboard": ForumsDashboardElement;
  }
}
