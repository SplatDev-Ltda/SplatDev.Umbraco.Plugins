import { LitElement as p, html as a, unsafeHTML as c, css as x, state as l, customElement as g } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as m } from "@umbraco-cms/backoffice/element-api";
var v = Object.defineProperty, h = Object.getOwnPropertyDescriptor, r = (e, s, n, o) => {
  for (var t = o > 1 ? void 0 : o ? h(s, n) : s, u = e.length - 1, d; u >= 0; u--)
    (d = e[u]) && (t = (o ? d(s, n, t) : d(t)) || t);
  return o && t && v(s, n, t), t;
};
let i = class extends m(p) {
  constructor() {
    super(...arguments), this._mediaKey = "", this._items = [], this._loading = !1, this._error = "";
  }
  async _loadSingle() {
    this._error = "", this._items = [], this._loading = !0;
    try {
      const e = await fetch(`/umbraco/api/svgviewer/GetSvg?mediaKey=${encodeURIComponent(this._mediaKey)}`);
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
      const e = await fetch("/umbraco/api/svgviewer/GetAllSvg");
      if (!e.ok) throw new Error(await e.text());
      this._items = await e.json();
    } catch (e) {
      this._error = e instanceof Error ? e.message : String(e);
    } finally {
      this._loading = !1;
    }
  }
  _renderContent() {
    return this._loading ? a`<div style="display:flex;justify-content:center;padding:40px;"><uui-loader></uui-loader></div>` : this._error ? a`<uui-badge color="danger" style="margin-top:12px;">${this._error}</uui-badge>` : this._items.length ? a`
      <div class="svg-grid">
        ${this._items.map(
      (e) => a`
            <div class="svg-card">
              <div class="svg-preview">${c(e.sanitizedContent)}</div>
              <div class="svg-meta">
                <strong>${e.fileName}</strong>
                ${e.width && e.height ? a` &mdash; ${e.width}&times;${e.height}` : ""}
                <br /><small>${e.mediaKey}</small>
              </div>
            </div>
          `
    )}
      </div>
    ` : a`
        <div class="empty-state">
          <uui-icon name="icon-picture"></uui-icon>
          <p>No SVG files found. Load a single SVG by key or scan all media.</p>
        </div>
      `;
  }
  render() {
    return a`
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
i.styles = x`
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
r([
  l()
], i.prototype, "_mediaKey", 2);
r([
  l()
], i.prototype, "_items", 2);
r([
  l()
], i.prototype, "_loading", 2);
r([
  l()
], i.prototype, "_error", 2);
i = r([
  g("svg-viewer-dashboard")
], i);
const y = i;
export {
  i as SvgViewerDashboard,
  y as default
};
//# sourceMappingURL=svg-viewer-dashboard.js.map
