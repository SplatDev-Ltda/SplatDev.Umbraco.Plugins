import { LitElement as v, html as a, nothing as y, css as $, state as p, customElement as x } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as w } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as P } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as T } from "@umbraco-cms/backoffice/notification";
function z(e) {
  let t = null, s = null;
  const n = e.consumeContext.bind(e), u = new Promise((l) => {
    n(P, async (i) => {
      var h;
      try {
        t = await ((h = i == null ? void 0 : i.getLatestToken) == null ? void 0 : h.call(i)) ?? null;
      } catch {
        t = null;
      }
      l();
    }), setTimeout(l, 3e3);
  });
  return n(T, (l) => {
    s = l;
  }), async (l, i = {}) => {
    await u;
    const h = new Headers(i.headers);
    t && !h.has("Authorization") && h.set("Authorization", `Bearer ${t}`);
    const c = await fetch(l, { ...i, credentials: "same-origin", headers: h });
    if (!c.ok) {
      const b = c.status === 401 || c.status === 403, m = b ? "Not authorised" : "Could not load data", _ = b ? `The backoffice token was ${t ? "sent but rejected" : "not available"} (${c.status}). Anything shown below may be empty because the request was refused, not because there is nothing to show.` : `The request failed with ${c.status}. Anything shown below may be incomplete.`;
      console.error(`[SplatDev] ${c.status} from ${String(l)} — ${_}`), s == null || s.peek("danger", { data: { headline: m, message: _ } });
    }
    return c;
  };
}
var C = Object.defineProperty, k = Object.getOwnPropertyDescriptor, f = (e) => {
  throw TypeError(e);
}, r = (e, t, s, n) => {
  for (var u = n > 1 ? void 0 : n ? k(t, s) : t, l = e.length - 1, i; l >= 0; l--)
    (i = e[l]) && (u = (n ? i(t, s, u) : i(u)) || u);
  return n && u && C(t, s, u), u;
}, S = (e, t, s) => t.has(e) || f("Cannot " + s), g = (e, t, s) => (S(e, t, "read from private field"), s ? s.call(e) : t.get(e)), D = (e, t, s) => t.has(e) ? f("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, s), d;
let o = class extends w(v) {
  constructor() {
    super(...arguments), D(this, d, z(this)), this._activeTab = "posts", this._posts = [], this._categories = [], this._tags = [], this._totalPosts = 0, this._page = 1, this._loading = !1, this._pageSize = 10, this._apiBase = "/umbraco/api/blog";
  }
  connectedCallback() {
    super.connectedCallback(), this._loadPosts(), this._loadCategories(), this._loadTags();
  }
  async _loadPosts() {
    this._loading = !0;
    try {
      const e = await g(this, d).call(this, `${this._apiBase}/GetPosts?page=${this._page}&pageSize=${this._pageSize}&publishedOnly=false`);
      if (e.ok) {
        const t = await e.json();
        this._posts = t.posts ?? [], this._totalPosts = t.total ?? 0;
      }
    } catch {
      this._posts = [];
    } finally {
      this._loading = !1;
    }
  }
  async _loadCategories() {
    try {
      const e = await g(this, d).call(this, `${this._apiBase}/GetCategories`);
      e.ok && (this._categories = await e.json());
    } catch {
      this._categories = [];
    }
  }
  async _loadTags() {
    try {
      const e = await g(this, d).call(this, `${this._apiBase}/GetTags`);
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
    return this._loading ? a`<p>Loading posts...</p>` : a`
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
        ${this._posts.length === 0 ? a`<p class="empty">No posts found.</p>` : a`
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
        var t;
        return a`
                    <uui-table-row>
                      <uui-table-cell><strong>${e.title}</strong></uui-table-cell>
                      <uui-table-cell>${e.authorName}</uui-table-cell>
                      <uui-table-cell>${((t = e.category) == null ? void 0 : t.name) ?? "—"}</uui-table-cell>
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

              ${this._totalPosts > this._pageSize ? a`
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
                  ` : y}
            `}
      </uui-box>
    `;
  }
  _renderCategoriesTab() {
    return a`
      <uui-box headline="Categories (${this._categories.length})">
        ${this._categories.length === 0 ? a`<p class="empty">No categories found.</p>` : a`
              <uui-table>
                <uui-table-head>
                  <uui-table-head-cell>Name</uui-table-head-cell>
                  <uui-table-head-cell>Slug</uui-table-head-cell>
                  <uui-table-head-cell>Description</uui-table-head-cell>
                </uui-table-head>
                ${this._categories.map(
      (e) => a`
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
    return a`
      <uui-box headline="Tags (${this._tags.length})">
        ${this._tags.length === 0 ? a`<p class="empty">No tags found.</p>` : a`
              <div class="tag-cloud">
                ${this._tags.map((e) => a`<span class="tag-chip">${e.name}</span>`)}
              </div>
            `}
      </uui-box>
    `;
  }
  render() {
    return a`
      <h1>Blog Manager</h1>
      <p class="description">
        Manage blog posts, categories, tags and comments from the Umbraco backoffice.
      </p>

      <uui-tab-group>
        ${["posts", "categories", "tags"].map(
      (e) => a`
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
d = /* @__PURE__ */ new WeakMap();
o.styles = $`
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
r([
  p()
], o.prototype, "_activeTab", 2);
r([
  p()
], o.prototype, "_posts", 2);
r([
  p()
], o.prototype, "_categories", 2);
r([
  p()
], o.prototype, "_tags", 2);
r([
  p()
], o.prototype, "_totalPosts", 2);
r([
  p()
], o.prototype, "_page", 2);
r([
  p()
], o.prototype, "_loading", 2);
o = r([
  x("blog-dashboard")
], o);
const O = o;
export {
  o as BlogDashboardElement,
  O as default
};
