import { LitElement as v, html as o, nothing as w, css as y, state as d, customElement as E } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as x } from "@umbraco-cms/backoffice/element-api";
import { UMB_MEDIA_WORKSPACE_CONTEXT as b } from "@umbraco-cms/backoffice/media";
import { c as C } from "./auth-fetch-BzMCmNwW.js";
var $ = Object.defineProperty, S = Object.getOwnPropertyDescriptor, g = (e) => {
  throw TypeError(e);
}, l = (e, t, r, s) => {
  for (var a = s > 1 ? void 0 : s ? S(t, r) : t, h = e.length - 1, p; h >= 0; h--)
    (p = e[h]) && (a = (s ? p(t, r, a) : p(a)) || a);
  return s && a && $(t, r, a), a;
}, m = (e, t, r) => t.has(e) || g("Cannot " + r), c = (e, t, r) => (m(e, t, "read from private field"), t.get(e)), _ = (e, t, r) => t.has(e) ? g("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), f = (e, t, r, s) => (m(e, t, "write to private field"), t.set(e, r), r), u, n;
const k = [
  ["camera", "Camera"],
  ["lens", "Lens"],
  ["dateTaken", "Date taken"],
  ["exposureTime", "Exposure"],
  ["fNumber", "Aperture"],
  ["iso", "ISO"]
];
let i = class extends x(v) {
  constructor() {
    super(...arguments), this._data = null, this._loading = !1, this._error = null, this._loaded = !1, _(this, u, C(this)), _(this, n, null);
  }
  connectedCallback() {
    super.connectedCallback(), this.consumeContext(b, (e) => {
      var r;
      if (!e) return;
      const t = e;
      if (t.unique)
        this.observe(t.unique, (s) => {
          const a = typeof s == "string" ? s : null;
          a && a !== c(this, n) && (f(this, n, a), this._load(a));
        });
      else {
        const s = ((r = t.getUnique) == null ? void 0 : r.call(t)) ?? null;
        s && (f(this, n, s), this._load(s));
      }
    });
  }
  async _load(e) {
    this._loading = !0, this._error = null;
    try {
      const t = await c(this, u).call(this, `/umbraco/api/exif/GetByMediaKey?mediaKey=${encodeURIComponent(e)}`);
      t.ok ? this._data = await t.json() : (this._error = t.status === 404 ? null : t.status === 401 || t.status === 403 ? `The request was refused (${t.status}).` : `Reading EXIF failed with ${t.status}.`, this._data = null);
    } catch (t) {
      this._error = `Could not read EXIF: ${String(t)}`, this._data = null;
    } finally {
      this._loading = !1, this._loaded = !0;
    }
  }
  _rows() {
    const e = this._data;
    if (!e) return [];
    const t = [];
    for (const [r, s] of k) {
      const a = e[r];
      a != null && String(a).trim() !== "" && t.push([s, String(a)]);
    }
    return e.width && e.height && t.push(["Dimensions", `${e.width} × ${e.height}`]), e.gpsLatitude && e.gpsLongitude && t.push(["Location", `${e.gpsLatitude}, ${e.gpsLongitude}`]), t;
  }
  render() {
    if (this._loading) return o`<p class="state">Reading EXIF…</p>`;
    if (this._error) return o`<p class="state error">${this._error}</p>`;
    const e = this._rows();
    return this._loaded && e.length === 0 ? o`<p class="state">
        This item carries no EXIF metadata. That is normal for SVGs, PDFs, and images
        re-encoded by an editor that strips it.
      </p>` : this._loaded ? o`
      <table>
        ${e.map(([t, r]) => o`<tr><th>${t}</th><td>${r}</td></tr>`)}
      </table>
    ` : w;
  }
};
u = /* @__PURE__ */ new WeakMap();
n = /* @__PURE__ */ new WeakMap();
i.styles = y`
    :host { display: block; padding: var(--uui-size-layout-1, 24px); }
    table { width: 100%; border-collapse: collapse; }
    th, td { text-align: left; padding: 6px 8px; border-bottom: 1px solid var(--uui-color-divider, #e9e9eb); }
    th { width: 32%; font-weight: 600; }
    h4 { margin: 20px 0 6px; font-size: 0.95rem; }
    .state { color: var(--uui-color-text-alt, #68676a); }
    .error { color: #991b1b; }
  `;
l([
  d()
], i.prototype, "_data", 2);
l([
  d()
], i.prototype, "_loading", 2);
l([
  d()
], i.prototype, "_error", 2);
l([
  d()
], i.prototype, "_loaded", 2);
i = l([
  E("exif-media-view")
], i);
const D = i;
export {
  i as ExifMediaViewElement,
  D as default
};
