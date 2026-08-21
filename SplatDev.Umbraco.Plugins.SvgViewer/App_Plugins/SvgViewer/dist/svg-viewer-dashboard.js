import { LitElement as f, html as u, unsafeHTML as y, css as w, state as h, customElement as b } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as $ } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as S } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as k } from "@umbraco-cms/backoffice/notification";
function z(e) {
  let t = null, a = null;
  const n = e.consumeContext.bind(e), s = new Promise((r) => {
    n(S, async (i) => {
      var d;
      try {
        t = await ((d = i == null ? void 0 : i.getLatestToken) == null ? void 0 : d.call(i)) ?? null;
      } catch {
        t = null;
      }
      r();
    }), setTimeout(r, 3e3);
  });
  return n(k, (r) => {
    a = r;
  }), async (r, i = {}) => {
    await s;
    const d = new Headers(i.headers);
    t && !d.has("Authorization") && d.set("Authorization", `Bearer ${t}`);
    const l = await fetch(r, { ...i, credentials: "same-origin", headers: d });
    if (!l.ok) {
      const g = l.status === 401 || l.status === 403, _ = g ? "Not authorised" : "Could not load data", m = g ? `The backoffice token was ${t ? "sent but rejected" : "not available"} (${l.status}). Anything shown below may be empty because the request was refused, not because there is nothing to show.` : `The request failed with ${l.status}. Anything shown below may be incomplete.`;
      console.error(`[SplatDev] ${l.status} from ${String(r)} — ${m}`), a == null || a.peek("danger", { data: { headline: _, message: m } });
    }
    return l;
  };
}
var C = Object.defineProperty, T = Object.getOwnPropertyDescriptor, x = (e) => {
  throw TypeError(e);
}, c = (e, t, a, n) => {
  for (var s = n > 1 ? void 0 : n ? T(t, a) : t, r = e.length - 1, i; r >= 0; r--)
    (i = e[r]) && (s = (n ? i(t, a, s) : i(s)) || s);
  return n && s && C(t, a, s), s;
}, A = (e, t, a) => t.has(e) || x("Cannot " + a), v = (e, t, a) => (A(e, t, "read from private field"), a ? a.call(e) : t.get(e)), E = (e, t, a) => t.has(e) ? x("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, a), p;
let o = class extends $(f) {
  constructor() {
    super(...arguments), E(this, p, z(this)), this._mediaKey = "", this._items = [], this._loading = !1, this._error = "";
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
              <div class="svg-preview">${y(e.sanitizedContent)}</div>
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
p = /* @__PURE__ */ new WeakMap();
o.styles = w`
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
  b("svg-viewer-dashboard")
], o);
const N = o;
export {
  o as SvgViewerDashboard,
  N as default
};
//# sourceMappingURL=svg-viewer-dashboard.js.map
