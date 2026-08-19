import { LitElement as c, html as s, css as m, state as p, customElement as b } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as f } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as v } from "@umbraco-cms/backoffice/auth";
function g(e) {
  let t = null;
  const r = new Promise((o) => {
    e.consumeContext(v, async (a) => {
      var i;
      try {
        t = await ((i = a == null ? void 0 : a.getLatestToken) == null ? void 0 : i.call(a)) ?? null;
      } catch {
        t = null;
      }
      o();
    }), setTimeout(o, 3e3);
  });
  return async (o, a = {}) => {
    await r;
    const i = new Headers(a.headers);
    t && !i.has("Authorization") && i.set("Authorization", `Bearer ${t}`);
    const l = await fetch(o, { ...a, credentials: "same-origin", headers: i });
    return (l.status === 401 || l.status === 403) && console.error(
      `[SplatDev] ${l.status} from ${String(o)} — the backoffice token was ${t ? "sent but rejected" : "not available"}. The dashboard may render as empty.`
    ), l;
  };
}
var y = Object.defineProperty, _ = Object.getOwnPropertyDescriptor, h = (e) => {
  throw TypeError(e);
}, u = (e, t, r, o) => {
  for (var a = o > 1 ? void 0 : o ? _(t, r) : t, i = e.length - 1, l; i >= 0; i--)
    (l = e[i]) && (a = (o ? l(t, r, a) : l(a)) || a);
  return o && a && y(t, r, a), a;
}, x = (e, t, r) => t.has(e) || h("Cannot " + r), w = (e, t, r) => (x(e, t, "read from private field"), r ? r.call(e) : t.get(e)), $ = (e, t, r) => t.has(e) ? h("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), d;
let n = class extends f(c) {
  constructor() {
    super(...arguments), $(this, d, g(this)), this._albums = [], this._loading = !0, this._error = "";
  }
  connectedCallback() {
    super.connectedCallback(), this._loadAlbums();
  }
  async _loadAlbums() {
    this._error = "", this._loading = !0;
    try {
      const e = await w(this, d).call(this, "/umbraco/api/photogallery/GetAlbums");
      if (!e.ok) throw new Error(await e.text());
      this._albums = await e.json();
    } catch (e) {
      this._error = e instanceof Error ? e.message : "Failed to load albums.";
    } finally {
      this._loading = !1;
    }
  }
  render() {
    return this._loading ? s`
        <uui-box headline="Photo Gallery">
          <div class="loading-container">
            <uui-loader></uui-loader>
          </div>
        </uui-box>
      ` : this._error ? s`
        <uui-box headline="Photo Gallery">
          <uui-alert look="danger" class="error-banner">${this._error}</uui-alert>
        </uui-box>
      ` : this._albums.length === 0 ? s`
        <uui-box headline="Photo Gallery">
          <div class="empty-state">
            <p>No albums found. Create your first gallery album.</p>
          </div>
        </uui-box>
      ` : s`
      <uui-box headline="Photo Gallery">
        ${this._albums.map(
      (e) => s`
            <uui-box .headline=${e.title} class="album-card">
              ${e.description ? s`<p class="album-description">${e.description}</p>` : ""}
              ${(e.photos ?? []).length > 0 ? s`
                    <div class="photo-grid">
                      ${e.photos.map(
        (t) => s`
                          <div class="photo-thumb">
                            <img
                              src=${t.thumbnailUrl ?? t.imageUrl}
                              alt=${t.title}
                              loading="lazy"
                            />
                            ${t.caption ? s`<div class="photo-caption">${t.caption}</div>` : ""}
                          </div>
                        `
      )}
                    </div>
                  ` : s`<p class="album-description">No photos in this album.</p>`}
            </uui-box>
          `
    )}
      </uui-box>
    `;
  }
};
d = /* @__PURE__ */ new WeakMap();
n.styles = m`
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
u([
  p()
], n.prototype, "_albums", 2);
u([
  p()
], n.prototype, "_loading", 2);
u([
  p()
], n.prototype, "_error", 2);
n = u([
  b("photogallery-dashboard")
], n);
const k = n;
export {
  n as PhotogalleryDashboardElement,
  k as default
};
