import { LitElement, html, css, nothing } from "@umbraco-cms/backoffice/external/lit";
import { customElement, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";

import { createAuthFetch } from "./auth-fetch";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  authorName: string;
  publishedAt: string;
  isPublished: boolean;
  viewCount: number;
  category: { name: string; slug: string } | null;
}

interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
}

interface BlogTag {
  id: number;
  name: string;
  slug: string;
}

@customElement("blog-dashboard")
export class BlogDashboardElement extends UmbElementMixin(LitElement) {
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
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
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

    .badge.published { background: #d1fae5; color: #065f46; }
    .badge.draft { background: #fef3c7; color: #92400e; }

    .tag-cloud {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .tag-chip {
      background: var(--uui-color-surface-alt, #f3f4f6);
      padding: 3px 12px;
      border-radius: 9999px;
      font-size: 0.8rem;
      color: var(--uui-color-text, #374151);
    }

    uui-table {
      width: 100%;
    }

    .toolbar {
      display: flex;
      justify-content: flex-end;
      margin-bottom: var(--uui-size-space-3, 8px);
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
  `;

  @state() private _activeTab: string = "posts";
  @state() private _posts: BlogPost[] = [];
  @state() private _categories: BlogCategory[] = [];
  @state() private _tags: BlogTag[] = [];
  @state() private _totalPosts: number = 0;
  @state() private _page: number = 1;
  @state() private _loading: boolean = false;

  private readonly _pageSize = 10;
  private readonly _apiBase = "/umbraco/api/blog";

  override connectedCallback(): void {
    super.connectedCallback();
    this._loadPosts();
    this._loadCategories();
    this._loadTags();
  }

  private async _loadPosts(): Promise<void> {
    this._loading = true;
    try {
      const response = await this.#fetch(
        `${this._apiBase}/GetPosts?page=${this._page}&pageSize=${this._pageSize}&publishedOnly=false`
      );
      if (response.ok) {
        const data = await response.json();
        this._posts = data.posts ?? [];
        this._totalPosts = data.total ?? 0;
      }
    } catch {
      this._posts = [];
    } finally {
      this._loading = false;
    }
  }

  private async _loadCategories(): Promise<void> {
    try {
      const response = await this.#fetch(`${this._apiBase}/GetCategories`);
      if (response.ok) this._categories = await response.json();
    } catch {
      this._categories = [];
    }
  }

  private async _loadTags(): Promise<void> {
    try {
      const response = await this.#fetch(`${this._apiBase}/GetTags`);
      if (response.ok) this._tags = await response.json();
    } catch {
      this._tags = [];
    }
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
      await this._loadPosts();
    }
  }

  private async _nextPage(): Promise<void> {
    if (this._page * this._pageSize < this._totalPosts) {
      this._page++;
      await this._loadPosts();
    }
  }

  private _renderPostsTab() {
    if (this._loading) {
      return html`<p>Loading posts...</p>`;
    }

    return html`
      <div class="stats-grid">
        <uui-box>
          <p class="stat-label">Total Posts</p>
          <p class="stat-value">${this._totalPosts}</p>
        </uui-box>
        <uui-box>
          <p class="stat-label">Published</p>
          <p class="stat-value">${this._posts.filter((p) => p.isPublished).length}</p>
        </uui-box>
        <uui-box>
          <p class="stat-label">Drafts</p>
          <p class="stat-value">${this._posts.filter((p) => !p.isPublished).length}</p>
        </uui-box>
      </div>

      <uui-box headline="Blog Posts">
        ${this._posts.length === 0
          ? html`<p class="empty">No posts found.</p>`
          : html`
              <uui-table>
                <uui-table-head>
                  <uui-table-head-cell>Title</uui-table-head-cell>
                  <uui-table-head-cell>Author</uui-table-head-cell>
                  <uui-table-head-cell>Category</uui-table-head-cell>
                  <uui-table-head-cell>Published</uui-table-head-cell>
                  <uui-table-head-cell>Views</uui-table-head-cell>
                  <uui-table-head-cell>Status</uui-table-head-cell>
                </uui-table-head>
                ${this._posts.map(
                  (post) => html`
                    <uui-table-row>
                      <uui-table-cell><strong>${post.title}</strong></uui-table-cell>
                      <uui-table-cell>${post.authorName}</uui-table-cell>
                      <uui-table-cell>${post.category?.name ?? "—"}</uui-table-cell>
                      <uui-table-cell>${this._formatDate(post.publishedAt)}</uui-table-cell>
                      <uui-table-cell>${post.viewCount}</uui-table-cell>
                      <uui-table-cell>
                        <span class="badge ${post.isPublished ? "published" : "draft"}">
                          ${post.isPublished ? "Published" : "Draft"}
                        </span>
                      </uui-table-cell>
                    </uui-table-row>
                  `
                )}
              </uui-table>

              ${this._totalPosts > this._pageSize
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
                        ?disabled=${this._page * this._pageSize >= this._totalPosts}
                        @click=${this._nextPage}
                      >Next</uui-button>
                    </div>
                  `
                : nothing}
            `}
      </uui-box>
    `;
  }

  private _renderCategoriesTab() {
    return html`
      <uui-box headline="Categories (${this._categories.length})">
        ${this._categories.length === 0
          ? html`<p class="empty">No categories found.</p>`
          : html`
              <uui-table>
                <uui-table-head>
                  <uui-table-head-cell>Name</uui-table-head-cell>
                  <uui-table-head-cell>Slug</uui-table-head-cell>
                  <uui-table-head-cell>Description</uui-table-head-cell>
                </uui-table-head>
                ${this._categories.map(
                  (cat) => html`
                    <uui-table-row>
                      <uui-table-cell><strong>${cat.name}</strong></uui-table-cell>
                      <uui-table-cell><code>${cat.slug}</code></uui-table-cell>
                      <uui-table-cell>${cat.description}</uui-table-cell>
                    </uui-table-row>
                  `
                )}
              </uui-table>
            `}
      </uui-box>
    `;
  }

  private _renderTagsTab() {
    return html`
      <uui-box headline="Tags (${this._tags.length})">
        ${this._tags.length === 0
          ? html`<p class="empty">No tags found.</p>`
          : html`
              <div class="tag-cloud">
                ${this._tags.map((tag) => html`<span class="tag-chip">${tag.name}</span>`)}
              </div>
            `}
      </uui-box>
    `;
  }

  override render() {
    return html`
      <h1>Blog Manager</h1>
      <p class="description">
        Manage blog posts, categories, tags and comments from the Umbraco backoffice.
      </p>

      <uui-tab-group>
        ${(["posts", "categories", "tags"] as const).map(
          (tab) => html`
            <uui-tab
              label=${tab.charAt(0).toUpperCase() + tab.slice(1)}
              ?active=${this._activeTab === tab}
              @click=${() => (this._activeTab = tab)}
            >
              ${{ posts: "Posts", categories: "Categories", tags: "Tags" }[tab]}
            </uui-tab>
          `
        )}
      </uui-tab-group>

      <div class="tab-content">
        ${this._activeTab === "posts"
          ? this._renderPostsTab()
          : this._activeTab === "categories"
          ? this._renderCategoriesTab()
          : this._renderTagsTab()}
      </div>
    `;
  }
}

export default BlogDashboardElement;

declare global {
  interface HTMLElementTagNameMap {
    "blog-dashboard": BlogDashboardElement;
  }
}
