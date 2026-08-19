import { LitElement as v, html as l, unsafeHTML as g, css as m, state as c, customElement as x } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as _ } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as f } from "@umbraco-cms/backoffice/auth";
function y(e) {
  let t = null;
  const i = new Promise((r) => {
    e.consumeContext(f, async (a) => {
      var s;
      try {
        t = await ((s = a == null ? void 0 : a.getLatestToken) == null ? void 0 : s.call(a)) ?? null;
      } catch {
        t = null;
      }
      r();
    }), setTimeout(r, 3e3);
  });
  return async (r, a = {}) => {
    await i;
    const s = new Headers(a.headers);
    t && !s.has("Authorization") && s.set("Authorization", `Bearer ${t}`);
    const o = await fetch(r, { ...a, credentials: "same-origin", headers: s });
    return (o.status === 401 || o.status === 403) && console.error(
      `[SplatDev] ${o.status} from ${String(r)} — the backoffice token was ${t ? "sent but rejected" : "not available"}. The dashboard may render as empty.`
    ), o;
  };
}
var w = Object.defineProperty, b = Object.getOwnPropertyDescriptor, h = (e) => {
  throw TypeError(e);
}, u = (e, t, i, r) => {
  for (var a = r > 1 ? void 0 : r ? b(t, i) : t, s = e.length - 1, o; s >= 0; s--)
    (o = e[s]) && (a = (r ? o(t, i, a) : o(a)) || a);
  return r && a && w(t, i, a), a;
}, $ = (e, t, i) => t.has(e) || h("Cannot " + i), p = (e, t, i) => ($(e, t, "read from private field"), i ? i.call(e) : t.get(e)), S = (e, t, i) => t.has(e) ? h("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), d;
let n = class extends _(v) {
  constructor() {
    super(...arguments), S(this, d, y(this)), this._mediaKey = "", this._items = [], this._loading = !1, this._error = "";
  }
  async _loadSingle() {
    this._error = "", this._items = [], this._loading = !0;
    try {
      const e = await p(this, d).call(this, `/umbraco/api/svgviewer/GetSvg?mediaKey=${encodeURIComponent(this._mediaKey)}`);
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
      const e = await p(this, d).call(this, "/umbraco/api/svgviewer/GetAllSvg");
      if (!e.ok) throw new Error(await e.text());
      this._items = await e.json();
    } catch (e) {
      this._error = e instanceof Error ? e.message : String(e);
    } finally {
      this._loading = !1;
    }
  }
  _renderContent() {
    return this._loading ? l`<div style="display:flex;justify-content:center;padding:40px;"><uui-loader></uui-loader></div>` : this._error ? l`<uui-badge color="danger" style="margin-top:12px;">${this._error}</uui-badge>` : this._items.length ? l`
      <div class="svg-grid">
        ${this._items.map(
      (e) => l`
            <div class="svg-card">
              <div class="svg-preview">${g(e.sanitizedContent)}</div>
              <div class="svg-meta">
                <strong>${e.fileName}</strong>
                ${e.width && e.height ? l` &mdash; ${e.width}&times;${e.height}` : ""}
                <br /><small>${e.mediaKey}</small>
              </div>
            </div>
          `
    )}
      </div>
    ` : l`
        <div class="empty-state">
          <uui-icon name="icon-picture"></uui-icon>
          <p>No SVG files found. Load a single SVG by key or scan all media.</p>
        </div>
      `;
  }
  render() {
    return l`
      <uui-box headline="SVG Viewer">
        <div class="controls">
          <uui-form-layout-item>
            <uui-label slot="label">Media Key</uui-label>
            <uui-input
              .value=${this._mediaKey}
              @input=${(e) => this._mediaKey = e.target.value}
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            ></uui-input>
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
d = /* @__PURE__ */ new WeakMap();
n.styles = m`
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
u([
  c()
], n.prototype, "_mediaKey", 2);
u([
  c()
], n.prototype, "_items", 2);
u([
  c()
], n.prototype, "_loading", 2);
u([
  c()
], n.prototype, "_error", 2);
n = u([
  x("svg-viewer-dashboard")
], n);
const E = n;
export {
  n as SvgViewerDashboard,
  E as default
};
//# sourceMappingURL=svg-viewer-dashboard.js.map
