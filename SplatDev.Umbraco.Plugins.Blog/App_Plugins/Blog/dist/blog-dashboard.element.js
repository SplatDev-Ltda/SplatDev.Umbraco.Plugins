import { LitElement as n, html as t, nothing as h, css as g, state as o, customElement as b } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as d } from "@umbraco-cms/backoffice/element-api";
var _ = Object.defineProperty, f = Object.getOwnPropertyDescriptor, i = (e, s, r, u) => {
  for (var l = u > 1 ? void 0 : u ? f(s, r) : s, p = e.length - 1, c; p >= 0; p--)
    (c = e[p]) && (l = (u ? c(s, r, l) : c(l)) || l);
  return u && l && _(s, r, l), l;
};
let a = class extends d(n) {
  constructor() {
    super(...arguments), this._activeTab = "posts", this._posts = [], this._categories = [], this._tags = [], this._totalPosts = 0, this._page = 1, this._loading = !1, this._pageSize = 10, this._apiBase = "/umbraco/api/blog";
  }
  connectedCallback() {
    super.connectedCallback(), this._loadPosts(), this._loadCategories(), this._loadTags();
  }
  async _loadPosts() {
    this._loading = !0;
    try {
      const e = await fetch(
        `${this._apiBase}/GetPosts?page=${this._page}&pageSize=${this._pageSize}&publishedOnly=false`
      );
      if (e.ok) {
        const s = await e.json();
        this._posts = s.posts ?? [], this._totalPosts = s.total ?? 0;
      }
    } catch {
      this._posts = [];
    } finally {
      this._loading = !1;
    }
  }
  async _loadCategories() {
    try {
      const e = await fetch(`${this._apiBase}/GetCategories`);
      e.ok && (this._categories = await e.json());
    } catch {
      this._categories = [];
    }
  }
  async _loadTags() {
    try {
      const e = await fetch(`${this._apiBase}/GetTags`);
      e.ok && (this._tags = await e.json());
    } catch {
      this._tags = [];
    }
  }
  _formatDate(e) {
    return new Date(e).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  }
  async _prevPage() {
    this._page > 1 && (this._page--, await this._loadPosts());
  }
  async _nextPage() {
    this._page * this._pageSize < this._totalPosts && (this._page++, await this._loadPosts());
  }
  _renderPostsTab() {
    return this._loading ? t`<p>Loading posts...</p>` : t`
      <div class="stats-grid">
        <uui-box>
          <p class="stat-label">Total Posts</p>
          <p class="stat-value">${this._totalPosts}</p>
        </uui-box>
        <uui-box>
          <p class="stat-label">Published</p>
          <p class="stat-value">${this._posts.filter((e) => e.isPublished).length}</p>
        </uui-box>
        <uui-box>
          <p class="stat-label">Drafts</p>
          <p class="stat-value">${this._posts.filter((e) => !e.isPublished).length}</p>
        </uui-box>
      </div>

      <uui-box headline="Blog Posts">
        ${this._posts.length === 0 ? t`<p class="empty">No posts found.</p>` : t`
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
      (e) => {
        var s;
        return t`
                    <uui-table-row>
                      <uui-table-cell><strong>${e.title}</strong></uui-table-cell>
                      <uui-table-cell>${e.authorName}</uui-table-cell>
                      <uui-table-cell>${((s = e.category) == null ? void 0 : s.name) ?? "—"}</uui-table-cell>
                      <uui-table-cell>${this._formatDate(e.publishedAt)}</uui-table-cell>
                      <uui-table-cell>${e.viewCount}</uui-table-cell>
                      <uui-table-cell>
                        <span class="badge ${e.isPublished ? "published" : "draft"}">
                          ${e.isPublished ? "Published" : "Draft"}
                        </span>
                      </uui-table-cell>
                    </uui-table-row>
                  `;
      }
    )}
              </uui-table>

              ${this._totalPosts > this._pageSize ? t`
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
                  ` : h}
            `}
      </uui-box>
    `;
  }
  _renderCategoriesTab() {
    return t`
      <uui-box headline="Categories (${this._categories.length})">
        ${this._categories.length === 0 ? t`<p class="empty">No categories found.</p>` : t`
              <uui-table>
                <uui-table-head>
                  <uui-table-head-cell>Name</uui-table-head-cell>
                  <uui-table-head-cell>Slug</uui-table-head-cell>
                  <uui-table-head-cell>Description</uui-table-head-cell>
                </uui-table-head>
                ${this._categories.map(
      (e) => t`
                    <uui-table-row>
                      <uui-table-cell><strong>${e.name}</strong></uui-table-cell>
                      <uui-table-cell><code>${e.slug}</code></uui-table-cell>
                      <uui-table-cell>${e.description}</uui-table-cell>
                    </uui-table-row>
                  `
    )}
              </uui-table>
            `}
      </uui-box>
    `;
  }
  _renderTagsTab() {
    return t`
      <uui-box headline="Tags (${this._tags.length})">
        ${this._tags.length === 0 ? t`<p class="empty">No tags found.</p>` : t`
              <div class="tag-cloud">
                ${this._tags.map((e) => t`<span class="tag-chip">${e.name}</span>`)}
              </div>
            `}
      </uui-box>
    `;
  }
  render() {
    return t`
      <h1>Blog Manager</h1>
      <p class="description">
        Manage blog posts, categories, tags and comments from the Umbraco backoffice.
      </p>

      <uui-tab-group>
        ${["posts", "categories", "tags"].map(
      (e) => t`
            <uui-tab
              label=${e.charAt(0).toUpperCase() + e.slice(1)}
              ?active=${this._activeTab === e}
              @click=${() => this._activeTab = e}
            >
              ${{ posts: "Posts", categories: "Categories", tags: "Tags" }[e]}
            </uui-tab>
          `
    )}
      </uui-tab-group>

      <div class="tab-content">
        ${this._activeTab === "posts" ? this._renderPostsTab() : this._activeTab === "categories" ? this._renderCategoriesTab() : this._renderTagsTab()}
      </div>
    `;
  }
};
a.styles = g`
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
i([
  o()
], a.prototype, "_activeTab", 2);
i([
  o()
], a.prototype, "_posts", 2);
i([
  o()
], a.prototype, "_categories", 2);
i([
  o()
], a.prototype, "_tags", 2);
i([
  o()
], a.prototype, "_totalPosts", 2);
i([
  o()
], a.prototype, "_page", 2);
i([
  o()
], a.prototype, "_loading", 2);
a = i([
  b("blog-dashboard")
], a);
const v = a;
export {
  a as BlogDashboardElement,
  v as default
};
