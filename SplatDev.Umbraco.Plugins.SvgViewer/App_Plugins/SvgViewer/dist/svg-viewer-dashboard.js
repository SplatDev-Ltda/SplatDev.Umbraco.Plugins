import { LitElement as y, html as u, unsafeHTML as w, css as b, state as h, customElement as x } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as $ } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as C } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as S } from "@umbraco-cms/backoffice/notification";
function A(e) {
  let t = null, a = null;
  const n = e.consumeContext.bind(e), r = new Promise((s) => {
    n(C, async (i) => {
      var d;
      try {
        t = await ((d = i == null ? void 0 : i.getLatestToken) == null ? void 0 : d.call(i)) ?? null;
      } catch {
        t = null;
      }
      s();
    }), setTimeout(s, 3e3);
  });
  return n(S, (s) => {
    a = s;
  }), async (s, i = {}) => {
    await r;
    const d = new Headers(i.headers);
    t && !d.has("Authorization") && d.set("Authorization", `Bearer ${t}`);
    const l = await fetch(s, { ...i, credentials: "same-origin", headers: d });
    if (!l.ok) {
      const m = l.status === 401 || l.status === 403, f = m ? "Not authorised" : "Could not load data", g = m ? `The backoffice token was ${t ? "sent but rejected" : "not available"} (${l.status}). Anything shown below may be empty because the request was refused, not because there is nothing to show.` : `The request failed with ${l.status}. Anything shown below may be incomplete.`;
      console.error(`[SplatDev] ${l.status} from ${String(s)} — ${g}`), a == null || a.peek("danger", { data: { headline: f, message: g } });
    }
    return l;
  };
}
var E = Object.defineProperty, T = Object.getOwnPropertyDescriptor, _ = (e) => {
  throw TypeError(e);
}, c = (e, t, a, n) => {
  for (var r = n > 1 ? void 0 : n ? T(t, a) : t, s = e.length - 1, i; s >= 0; s--)
    (i = e[s]) && (r = (n ? i(t, a, r) : i(r)) || r);
  return n && r && E(t, a, r), r;
}, k = (e, t, a) => t.has(e) || _("Cannot " + a), v = (e, t, a) => (k(e, t, "read from private field"), a ? a.call(e) : t.get(e)), z = (e, t, a) => t.has(e) ? _("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, a), p;
const G = "C4B1EFCF-A9D5-41C4-9621-E9D273B52A9C";
let o = class extends $(y) {
  constructor() {
    super(...arguments), z(this, p, A(this)), this._mediaKey = "", this._items = [], this._loading = !1, this._error = "";
  }
  async _loadSingle() {
    this._error = "", this._items = [], this._loading = !0;
    try {
      const e = await v(this, p).call(this, `/umbraco/api/svgviewer/GetSvg?mediaKey=${encodeURIComponent(this._mediaKey)}`);
      if (!e.ok) throw new Error(await e.text());
      this._items = [await e.json()];
    } catch (e) {
      this._error = e instanceof Error ? e.message : String(e);
    } finally {
      this._loading = !1;
    }
  }
  async _loadAll() {
    this._error = "", this._items = [], this._loading = !0;
    try {
      const e = await v(this, p).call(this, "/umbraco/api/svgviewer/GetAllSvg");
      if (!e.ok) throw new Error(await e.text());
      this._items = await e.json();
    } catch (e) {
      this._error = e instanceof Error ? e.message : String(e);
    } finally {
      this._loading = !1;
    }
  }
  _renderContent() {
    return this._loading ? u`<div style="display:flex;justify-content:center;padding:40px;"><uui-loader></uui-loader></div>` : this._error ? u`<uui-badge color="danger" style="margin-top:12px;">${this._error}</uui-badge>` : this._items.length ? u`
      <div class="svg-grid">
        ${this._items.map(
      (e) => u`
            <div class="svg-card">
              <div class="svg-preview">${w(e.sanitizedContent)}</div>
              <div class="svg-meta">
                <strong>${e.fileName}</strong>
                ${e.width && e.height ? u` &mdash; ${e.width}&times;${e.height}` : ""}
                <br /><small>${e.mediaKey}</small>
              </div>
            </div>
          `
    )}
      </div>
    ` : u`
        <div class="empty-state">
          <uui-icon name="icon-picture"></uui-icon>
          <p>No SVG files found. Load a single SVG by key or scan all media.</p>
        </div>
      `;
  }
  render() {
    return u`
      <uui-box headline="SVG Viewer">
        <div class="controls">
          <uui-form-layout-item>
            <uui-label slot="label">SVG</uui-label>
            <umb-input-media
              .selection=${this._mediaKey ? [this._mediaKey] : []}
              .allowedContentTypeIds=${[G]}
              max="1"
              @change=${(e) => {
      var a;
      const t = e.target;
      this._mediaKey = ((a = t.selection) == null ? void 0 : a[0]) ?? "";
    }}
            ></umb-input-media>
          </uui-form-layout-item>
          <uui-button look="primary" label="Load" @click=${this._loadSingle} ?disabled=${this._loading}
            >Load</uui-button
          >
          <uui-button look="secondary" label="Scan all media" @click=${this._loadAll} ?disabled=${this._loading}
            >Load All SVGs</uui-button
          >
        </div>
        ${this._renderContent()}
      </uui-box>
    `;
  }
};
p = /* @__PURE__ */ new WeakMap();
o.styles = b`
    :host {
      display: block;
      padding: var(--uui-size-space-5, 20px);
    }
    .controls {
      display: flex;
      gap: var(--uui-size-space-3, 12px);
      align-items: flex-end;
      margin-bottom: var(--uui-size-space-4, 16px);
      flex-wrap: wrap;
    }
    .controls uui-input {
      min-width: 280px;
    }
    .svg-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: var(--uui-size-space-4, 16px);
      margin-top: var(--uui-size-space-4, 16px);
    }
    .svg-card {
      border: 1px solid var(--uui-color-border);
      border-radius: var(--uui-border-radius, 8px);
      padding: var(--uui-size-space-3, 12px);
      text-align: center;
      background: var(--uui-color-surface);
    }
    .svg-preview {
      width: 100%;
      height: 150px;
      margin: 0 auto var(--uui-size-space-2, 8px);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .svg-preview svg {
      max-width: 100%;
      max-height: 100%;
    }
    .svg-meta {
      font-size: 11px;
      color: var(--uui-color-text-alt);
      word-break: break-all;
    }
    .empty-state {
      text-align: center;
      padding: var(--uui-size-space-10, 40px);
      color: var(--uui-color-text-alt);
    }
    .empty-state uui-icon {
      font-size: 48px;
      margin-bottom: var(--uui-size-space-3, 12px);
      opacity: 0.4;
    }
  `;
c([
  h()
], o.prototype, "_mediaKey", 2);
c([
  h()
], o.prototype, "_items", 2);
c([
  h()
], o.prototype, "_loading", 2);
c([
  h()
], o.prototype, "_error", 2);
o = c([
  x("svg-viewer-dashboard")
], o);
const I = o;
export {
  o as SvgViewerDashboard,
  I as default
};
//# sourceMappingURL=svg-viewer-dashboard.js.map
