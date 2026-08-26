import { LitElement as _, html as r, css as f, state as n, customElement as y } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as b } from "@umbraco-cms/backoffice/element-api";
import { c as g } from "./auth-fetch-BzMCmNwW.js";
var x = Object.defineProperty, k = Object.getOwnPropertyDescriptor, m = (t) => {
  throw TypeError(t);
}, l = (t, e, a, o) => {
  for (var s = o > 1 ? void 0 : o ? k(e, a) : e, d = t.length - 1, h; d >= 0; d--)
    (h = t[d]) && (s = (o ? h(e, a, s) : h(s)) || s);
  return o && s && x(e, a, s), s;
}, v = (t, e, a) => e.has(t) || m("Cannot " + a), p = (t, e, a) => (v(t, e, "read from private field"), a ? a.call(t) : e.get(t)), w = (t, e, a) => e.has(t) ? m("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, a), u;
const c = [
  { key: "camera", label: "Camera" },
  { key: "lens", label: "Lens" },
  { key: "dateTaken", label: "Date Taken" },
  { key: "exposureTime", label: "Exposure Time" },
  { key: "fNumber", label: "F-Number" },
  { key: "iso", label: "ISO" },
  { key: "width", label: "Width", suffix: " px" },
  { key: "height", label: "Height", suffix: " px" },
  { key: "gpsLatitude", label: "GPS Latitude" },
  { key: "gpsLongitude", label: "GPS Longitude" }
], E = "CC07B313-0843-4AA8-BBDA-871C8DA728C8";
let i = class extends b(_) {
  constructor() {
    super(...arguments), w(this, u, g(this)), this._mediaKey = "", this._contentKey = "", this._contentResults = [], this._data = null, this._error = "", this._loading = !1, this._baseUrl = "/umbraco/api/exif/";
  }
  async _lookupByKey() {
    this._data = null, this._error = "", this._loading = !0;
    try {
      const t = await p(this, u).call(this, `${this._baseUrl}GetByMediaKey?mediaKey=${encodeURIComponent(this._mediaKey)}`);
      if (!t.ok) throw new Error(await t.text());
      this._data = await t.json();
    } catch (t) {
      this._error = t instanceof Error ? t.message : "Not found.";
    } finally {
      this._loading = !1;
    }
  }
  async _lookupByContent() {
    this._data = null, this._contentResults = [], this._error = "", this._loading = !0;
    try {
      const t = await p(this, u).call(this, `${this._baseUrl}GetByContentKey?contentKey=${encodeURIComponent(this._contentKey)}`);
      if (!t.ok) throw new Error(await t.text());
      this._contentResults = await t.json();
    } catch (t) {
      this._error = t instanceof Error ? t.message : "Not found.";
    } finally {
      this._loading = !1;
    }
  }
  _handleMediaKeyInput(t) {
    this._mediaKey = t.target.value;
  }
  _renderRows() {
    return this._data ? c.map(({ key: t, label: e, suffix: a }) => {
      const o = this._data[t];
      return o == null || o === "" ? r`` : r`
        <tr>
          <th>${e}</th>
          <td>${o}${a ?? ""}</td>
        </tr>
      `;
    }) : r``;
  }
  _hasAnyData() {
    return this._data ? c.some(({ key: t }) => {
      const e = this._data[t];
      return e != null && e !== "";
    }) : !1;
  }
  render() {
    return r`
      <uui-box headline="EXIF Metadata Viewer">
        <div class="lookup-grid">
          <div class="lookup-section">
            <h3>Look up by Media Key</h3>
            <div class="lookup-form">
              <uui-form-layout-item>
                <uui-label slot="label">Image</uui-label>
                <umb-input-media
                  .selection=${this._mediaKey ? [this._mediaKey] : []}
                  .allowedContentTypeIds=${[E]}
                  max="1"
                  @change=${(t) => {
      var a;
      const e = t.target;
      this._mediaKey = ((a = e.selection) == null ? void 0 : a[0]) ?? "";
    }}
                ></umb-input-media>
              </uui-form-layout-item>
              <uui-button
                look="primary"
                label="Get EXIF"
                @click=${this._lookupByKey}
                ?disabled=${this._loading}
              >
                ${this._loading ? "Loading..." : "Get EXIF"}
              </uui-button>
            </div>
          </div>

          <div class="lookup-section">
            <h3>Look up by Content Page</h3>
            <div class="lookup-form">
              <uui-form-layout-item>
                <uui-label slot="label">Page</uui-label>
                <umb-input-document
                  .selection=${this._contentKey ? [this._contentKey] : []}
                  max="1"
                  @change=${(t) => {
      var a;
      const e = t.target;
      this._contentKey = ((a = e.selection) == null ? void 0 : a[0]) ?? "";
    }}
                ></umb-input-document>
              </uui-form-layout-item>
              <uui-button
                look="primary"
                label="Get EXIF for page images"
                @click=${this._lookupByContent}
                ?disabled=${this._loading || !this._contentKey}
              >
                ${this._loading ? "Loading..." : "Get EXIF for page images"}
              </uui-button>
            </div>
          </div>
        </div>

        ${this._error ? r`<uui-alert look="danger" class="error-banner">${this._error}</uui-alert>` : ""}

        ${this._hasAnyData() ? r`
              <h4 style="margin-top:20px; font-weight:600;">EXIF Data</h4>
              <table class="exif-table">
                <tbody>
                  ${this._renderRows()}
                </tbody>
              </table>
            ` : this._data ? r`<p style="margin-top:16px; color:var(--uui-color-text-alt,#6b7280);">No EXIF data found for this media item.</p>` : ""}
      
        ${this._contentResults.length > 0 ? r`
              <h4 style="margin-top:20px; font-weight:600;">Images on this page</h4>
              <table class="exif-table">
                <tbody>
                  ${this._contentResults.map(
      (t) => r`
                      <tr>
                        <th>${t.propertyAlias}</th>
                        <td>
                          ${t.exif ? [t.exif.camera, t.exif.dateTaken, t.exif.iso ? `ISO ${t.exif.iso}` : null].filter(Boolean).join(" · ") || "EXIF present" : "no EXIF"}
                        </td>
                      </tr>
                    `
    )}
                </tbody>
              </table>
            ` : ""}
      
      </uui-box>
    `;
  }
};
u = /* @__PURE__ */ new WeakMap();
i.styles = f`
    :host {
      display: block;
      padding: var(--uui-size-layout-1, 24px);
    }

    .lookup-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--uui-size-layout-2, 24px);
    }

    @media (max-width: 768px) {
      .lookup-grid {
        grid-template-columns: 1fr;
      }
    }

    .lookup-section h3 {
      font-size: 1rem;
      font-weight: 600;
      margin: 0 0 12px;
      padding: 0;
    }

    .lookup-form {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .error-banner {
      margin-top: 16px;
    }

    .exif-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 16px;
    }

    .exif-table th,
    .exif-table td {
      border: 1px solid var(--uui-color-border, #e5e7eb);
      padding: 8px 12px;
      text-align: left;
    }

    .exif-table th {
      background: var(--uui-color-surface-emphasis, #f3f4f6);
      width: 160px;
      font-weight: 600;
    }

    .exif-table td {
      word-break: break-word;
    }
  `;
l([
  n()
], i.prototype, "_mediaKey", 2);
l([
  n()
], i.prototype, "_contentKey", 2);
l([
  n()
], i.prototype, "_contentResults", 2);
l([
  n()
], i.prototype, "_data", 2);
l([
  n()
], i.prototype, "_error", 2);
l([
  n()
], i.prototype, "_loading", 2);
i = l([
  y("exif-dashboard")
], i);
const C = i;
export {
  i as ExifDashboardElement,
  C as default
};
