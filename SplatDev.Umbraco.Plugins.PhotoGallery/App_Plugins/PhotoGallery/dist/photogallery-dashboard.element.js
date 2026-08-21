import { LitElement as y, html as i, css as v, state as p, customElement as _ } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as w } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as x } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as $ } from "@umbraco-cms/backoffice/notification";
function C(e) {
  let t = null, a = null;
  const l = e.consumeContext.bind(e), s = new Promise((r) => {
    l(x, async (o) => {
      var d;
      try {
        t = await ((d = o == null ? void 0 : o.getLatestToken) == null ? void 0 : d.call(o)) ?? null;
      } catch {
        t = null;
      }
      r();
    }), setTimeout(r, 3e3);
  });
  return l($, (r) => {
    a = r;
  }), async (r, o = {}) => {
    await s;
    const d = new Headers(o.headers);
    t && !d.has("Authorization") && d.set("Authorization", `Bearer ${t}`);
    const n = await fetch(r, { ...o, credentials: "same-origin", headers: d });
    if (!n.ok) {
      const m = n.status === 401 || n.status === 403, g = m ? "Not authorised" : "Could not load data", b = m ? `The backoffice token was ${t ? "sent but rejected" : "not available"} (${n.status}). Anything shown below may be empty because the request was refused, not because there is nothing to show.` : `The request failed with ${n.status}. Anything shown below may be incomplete.`;
      console.error(`[SplatDev] ${n.status} from ${String(r)} — ${b}`), a == null || a.peek("danger", { data: { headline: g, message: b } });
    }
    return n;
  };
}
var T = Object.defineProperty, k = Object.getOwnPropertyDescriptor, f = (e) => {
  throw TypeError(e);
}, h = (e, t, a, l) => {
  for (var s = l > 1 ? void 0 : l ? k(t, a) : t, r = e.length - 1, o; r >= 0; r--)
    (o = e[r]) && (s = (l ? o(t, a, s) : o(s)) || s);
  return l && s && T(t, a, s), s;
}, A = (e, t, a) => t.has(e) || f("Cannot " + a), E = (e, t, a) => (A(e, t, "read from private field"), a ? a.call(e) : t.get(e)), P = (e, t, a) => t.has(e) ? f("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, a), c;
let u = class extends w(y) {
  constructor() {
    super(...arguments), P(this, c, C(this)), this._albums = [], this._loading = !0, this._error = "";
  }
  connectedCallback() {
    super.connectedCallback(), this._loadAlbums();
  }
  async _loadAlbums() {
    this._error = "", this._loading = !0;
    try {
      const e = await E(this, c).call(this, "/umbraco/api/photogallery/GetAlbums");
      if (!e.ok) throw new Error(await e.text());
      this._albums = await e.json();
    } catch (e) {
      this._error = e instanceof Error ? e.message : "Failed to load albums.";
    } finally {
      this._loading = !1;
    }
  }
  render() {
    return this._loading ? i`
        <uui-box headline="Photo Gallery">
          <div class="loading-container">
            <uui-loader></uui-loader>
          </div>
        </uui-box>
      ` : this._error ? i`
        <uui-box headline="Photo Gallery">
          <uui-alert look="danger" class="error-banner">${this._error}</uui-alert>
        </uui-box>
      ` : this._albums.length === 0 ? i`
        <uui-box headline="Photo Gallery">
          <div class="empty-state">
            <p>No albums found. Create your first gallery album.</p>
          </div>
        </uui-box>
      ` : i`
      <uui-box headline="Photo Gallery">
        ${this._albums.map(
      (e) => i`
            <uui-box .headline=${e.title} class="album-card">
              ${e.description ? i`<p class="album-description">${e.description}</p>` : ""}
              ${(e.photos ?? []).length > 0 ? i`
                    <div class="photo-grid">
                      ${e.photos.map(
        (t) => i`
                          <div class="photo-thumb">
                            <img
                              src=${t.thumbnailUrl ?? t.imageUrl}
                              alt=${t.title}
                              loading="lazy"
                            />
                            ${t.caption ? i`<div class="photo-caption">${t.caption}</div>` : ""}
                          </div>
                        `
      )}
                    </div>
                  ` : i`<p class="album-description">No photos in this album.</p>`}
            </uui-box>
          `
    )}
      </uui-box>
    `;
  }
};
c = /* @__PURE__ */ new WeakMap();
u.styles = v`
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
h([
  p()
], u.prototype, "_albums", 2);
h([
  p()
], u.prototype, "_loading", 2);
h([
  p()
], u.prototype, "_error", 2);
u = h([
  _("photogallery-dashboard")
], u);
const U = u;
export {
  u as PhotogalleryDashboardElement,
  U as default
};
