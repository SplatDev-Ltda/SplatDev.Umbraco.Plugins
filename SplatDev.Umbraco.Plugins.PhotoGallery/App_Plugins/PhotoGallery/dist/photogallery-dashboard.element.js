import { LitElement as d, html as e, css as c, state as p, customElement as h } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as m } from "@umbraco-cms/backoffice/element-api";
var b = Object.defineProperty, g = Object.getOwnPropertyDescriptor, l = (t, o, s, r) => {
  for (var a = r > 1 ? void 0 : r ? g(o, s) : o, u = t.length - 1, n; u >= 0; u--)
    (n = t[u]) && (a = (r ? n(o, s, a) : n(a)) || a);
  return r && a && b(o, s, a), a;
};
let i = class extends m(d) {
  constructor() {
    super(...arguments), this._albums = [], this._loading = !0, this._error = "";
  }
  connectedCallback() {
    super.connectedCallback(), this._loadAlbums();
  }
  async _loadAlbums() {
    this._error = "", this._loading = !0;
    try {
      const t = await fetch("/umbraco/api/photogallery/GetAlbums");
      if (!t.ok) throw new Error(await t.text());
      this._albums = await t.json();
    } catch (t) {
      this._error = t instanceof Error ? t.message : "Failed to load albums.";
    } finally {
      this._loading = !1;
    }
  }
  render() {
    return this._loading ? e`
        <uui-box headline="Photo Gallery">
          <div class="loading-container">
            <uui-loader></uui-loader>
          </div>
        </uui-box>
      ` : this._error ? e`
        <uui-box headline="Photo Gallery">
          <uui-alert look="danger" class="error-banner">${this._error}</uui-alert>
        </uui-box>
      ` : this._albums.length === 0 ? e`
        <uui-box headline="Photo Gallery">
          <div class="empty-state">
            <p>No albums found. Create your first gallery album.</p>
          </div>
        </uui-box>
      ` : e`
      <uui-box headline="Photo Gallery">
        ${this._albums.map(
      (t) => e`
            <uui-box .headline=${t.title} class="album-card">
              ${t.description ? e`<p class="album-description">${t.description}</p>` : ""}
              ${(t.photos ?? []).length > 0 ? e`
                    <div class="photo-grid">
                      ${t.photos.map(
        (o) => e`
                          <div class="photo-thumb">
                            <img
                              src=${o.thumbnailUrl ?? o.imageUrl}
                              alt=${o.title}
                              loading="lazy"
                            />
                            ${o.caption ? e`<div class="photo-caption">${o.caption}</div>` : ""}
                          </div>
                        `
      )}
                    </div>
                  ` : e`<p class="album-description">No photos in this album.</p>`}
            </uui-box>
          `
    )}
      </uui-box>
    `;
  }
};
i.styles = c`
    :host {
      display: block;
      padding: var(--uui-size-layout-1, 24px);
    }

    .loading-container {
      display: flex;
      justify-content: center;
      padding: var(--uui-size-layout-3, 48px);
    }

    .empty-state {
      text-align: center;
      padding: var(--uui-size-layout-3, 48px);
      color: var(--uui-color-text-alt, #6b7280);
    }

    .album-card {
      margin-bottom: var(--uui-size-layout-2, 24px);
    }

    .album-description {
      margin: 0 0 12px;
      color: var(--uui-color-text-alt, #6b7280);
      line-height: 1.6;
    }

    .photo-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: var(--uui-size-layout-1, 12px);
    }

    .photo-thumb {
      border-radius: 6px;
      overflow: hidden;
      background: var(--uui-color-surface-emphasis, #f3f4f6);
    }

    .photo-thumb img {
      width: 100%;
      height: 100px;
      object-fit: cover;
      display: block;
    }

    .photo-caption {
      padding: 6px 8px;
      font-size: 0.8rem;
      color: var(--uui-color-text-alt, #6b7280);
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }

    .error-banner {
      margin-bottom: var(--uui-size-layout-2, 24px);
    }
  `;
l([
  p()
], i.prototype, "_albums", 2);
l([
  p()
], i.prototype, "_loading", 2);
l([
  p()
], i.prototype, "_error", 2);
i = l([
  h("photogallery-dashboard")
], i);
const v = i;
export {
  i as PhotogalleryDashboardElement,
  v as default
};
